/** Resumable zero-value deployment. Default is read-only. */
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {keccak256} from 'viem';
import {root,evidence,sourcePath,identity,sponsor,client,rpc,read,balance,gen,save,wait,verifyNetwork,SafeError,safeError,EXPLORER} from './network.mjs';
import {hash,address,safeReceipt} from './receipt.mjs';

async function load(name){try{return JSON.parse(await readFile(resolve(evidence,name),'utf8'));}catch(error){if(error.code==='ENOENT')return null;throw new SafeError('EvidenceReadFailed');}}
async function deploy(){
 const network=await verifyNetwork();const id=await identity();const actor=await sponsor();
 const existing=await load('deployment.json');
 if(existing){
  if(existing.sourceSha256!==id.sourceSha256||existing.chainId!==network.chainId)throw new SafeError('ExistingDeploymentIdentityMismatch');
  console.log(JSON.stringify({recoveredExistingDeployment:true,address:existing.address,hash:existing.hash,status:existing.status,accounting:JSON.parse(await read(existing.address,'get_accounting'))}));return;
 }
 let attempt=await load('deployment-attempt.json');
 if(!process.argv.includes('--execute')){
  console.log(JSON.stringify({mode:'inspect',network,id,actor:actor.address,balanceGEN:gen(await balance(actor.address)),attempt:attempt?{hash:attempt.hash,status:attempt.status}:null}));return;
 }
 if(!id.sourceCommit)throw new SafeError('CommittedSourceRequired');
 const dirty=spawnSync('git',['diff','HEAD','--','contracts/slate_fold.py'],{cwd:root,encoding:'utf8'});
 if(dirty.status!==0||dirty.stdout.trim())throw new SafeError('SourceDiffersFromCommit');
 const smoke=await load('runtime-probe.json');
 if(!smoke?.passed||smoke.identity.sourceSha256!==id.sourceSha256)throw new SafeError('ExactSourceRuntimeSmokeRequired');
 const check=JSON.parse(await readFile(resolve(root,'.codex/last-check.json'),'utf8'));
 if(check.exitCode!==0||check.sourceSha256!==id.sourceSha256)throw new SafeError('CurrentLocalCheckRequired');
 if(attempt&&attempt.sourceSha256!==id.sourceSha256)throw new SafeError('PriorAttemptNeedsReconciliation');
 if(!attempt){
  attempt={...id,at:new Date().toISOString(),actor:actor.address,valueGEN:'0',status:'PREPARED',hash:null};
  await save('deployment-attempt.json',attempt);
  const originalFetch=globalThis.fetch;
  globalThis.fetch=async(url,options)=>{
   let body;try{body=JSON.parse(options?.body??'{}');}catch{}
   if(body?.method==='eth_sendRawTransaction'){
    const predicted=keccak256(body.params[0]);
    attempt.hash=predicted;attempt.status='SENDING';await save('deployment-attempt.json',attempt);
    const response=await originalFetch(url,options);const result=await response.clone().json();
    if(hash(result.result)){attempt.hash=result.result;attempt.status='SUBMITTED';await save('deployment-attempt.json',attempt);console.log(JSON.stringify({stage:'submitted',hash:attempt.hash}));}
    return response;
   }
   return originalFetch(url,options);
  };
  try{const returned=await client(actor).deployContract({code:await readFile(sourcePath,'utf8'),args:[]});if(!hash(returned))throw new SafeError('InvalidDeploymentHash');attempt.hash=returned;attempt.status='SUBMITTED';await save('deployment-attempt.json',attempt);}
  finally{globalThis.fetch=originalFetch;}
 }
 if(!hash(attempt.hash))throw new SafeError('PriorAttemptNeedsInspection');
 const receipt=await wait(attempt.hash,state=>console.log(JSON.stringify({hash:attempt.hash,...state})));
 const candidates=[receipt.contract_address,receipt.contractAddress,receipt.data?.contract_address,receipt.to_address,receipt.recipient,receipt.to];
 let deployed=null;
 for(const candidate of candidates){if(address(candidate)&&candidate.toLowerCase()!==actor.address.toLowerCase()){
  try{const schema=await rpc('gen_getContractSchema',[candidate]);if(schema?.methods?.get_accounting){deployed=candidate;break;}}catch{}
 }}
 if(!deployed)throw new SafeError('SuccessfulDeploymentAddressNeedsInspection');
 const schema=await rpc('gen_getContractSchema',[deployed]);
 const code=await client().getContractCode(deployed);
 if(code!==await readFile(sourcePath,'utf8')||Object.keys(schema.methods??{}).length!==14)throw new SafeError('DeployedSourceOrSchemaMismatch');
 const accounting=JSON.parse(await read(deployed,'get_accounting'));
 const native=await balance(deployed);
 if(Object.values(accounting).some(x=>x!=='0')||native!==0n)throw new SafeError('DeploymentNotZeroLiability');
 const deployment={...attempt,address:deployed,status:'FINALIZED',executionResult:'SUCCESS',finalizedObservedAt:new Date().toISOString(),explorer:EXPLORER+'/address/'+deployed,transactionExplorer:EXPLORER+'/transactions/'+attempt.hash,methods:Object.keys(schema.methods).sort(),accounting,nativeBalanceGEN:gen(native),receipt:safeReceipt(receipt)};
 await save('deployment.json',deployment);attempt.status='FINALIZED';await save('deployment-attempt.json',attempt);console.log(JSON.stringify(deployment));
}
try{await deploy();}catch(error){console.log(JSON.stringify({deployStopped:safeError(error)}));process.exitCode=1;}
