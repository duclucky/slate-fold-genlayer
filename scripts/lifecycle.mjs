/** Resumable real-consensus demo. Default is read-only inspection. */
import {actors,client,read,balance,gen,save,verifyNetwork,identity,wait,SafeError,safeError,EXPLORER,rpc} from './network.mjs';
import {sendJournal,loadJournal} from './journal.mjs';
import {quoteWrite} from './fees.mjs';
import {safeReceipt,hash} from './receipt.mjs';
import {externalDeliveryProof} from './external-delivery.mjs';
const GEN=10n**18n;
const run=process.argv.find(x=>x.startsWith('--run='))?.slice(6)??'1';
if(!/^[1-9][0-9]?$/.test(run))throw new SafeError('InvalidDemoRun');
const prefix=run==='1'?'':'run'+run+'-';
const roundIds={election:'council-permissions-v'+run,cancel:'cancel-before-participation-v'+run,expiry:'expired-incomplete-v'+run};
async function main(){
 const deployment=await loadJournal('deployment.json');if(deployment?.status!=='FINALIZED')throw new SafeError('FinalizedDeploymentRequired');
 const network=await verifyNetwork();const accounts=await actors();const target=deployment.address;
 const list=()=>read(target,'list_rounds',[0,20]).then(JSON.parse);
 const round=id=>read(target,'get_round',[id]).then(JSON.parse);
 async function snapshot(id){const ids=await list();return {round:id&&ids.includes(id)?await round(id):null,accounting:JSON.parse(await read(target,'get_accounting')),nativeContractGEN:gen(await balance(target)),creditsGEN:await Promise.all(accounts.map(a=>read(target,'get_credit',[a.address]))),actorBalancesGEN:await Promise.all(accounts.map(a=>balance(a.address).then(gen)))};}
 if(!process.argv.includes('--execute')){console.log(JSON.stringify({mode:'inspect',...network,target,roundIds,rounds:await list(),state:await snapshot()}));return;}
 const smoke=await loadJournal('caller-spoof-smoke.json');if(!smoke?.passed||smoke.target?.toLowerCase()!==target.toLowerCase())throw new SafeError('CallerAuthoritySmokeRequired');
 async function write(key,actor,functionName,args,value=0n,id){
  const name='lifecycle-'+prefix+key+'.json';let record=await loadJournal(name);
  if(record?.target?.toLowerCase()!==undefined&&record.target.toLowerCase()!==target.toLowerCase())throw new SafeError('JournalDeploymentMismatch');
  if(record?.verified){console.log(JSON.stringify({recovered:true,operation:record.operation,hash:record.hash}));return record;}
  if(!record){const before=await snapshot(id);const fees=await quoteWrite(actor,target,functionName,args,value);record=await sendJournal(name,{...network,identity:await identity(),target,operation:functionName,actor:actor.address,args,valueGEN:gen(value),feeDepositGEN:gen(fees.feeValue),before},()=>client(actor).writeContract({address:target,functionName,args,value,fees}));}
  const tx=await wait(record.hash,state=>console.log(JSON.stringify({operation:functionName,...state,hash:record.hash})),240);
  record.status='FINALIZED';record.executionResult='SUCCESS';record.finalizedObservedAt=new Date().toISOString();record.receipt=safeReceipt(tx);record.explorer=EXPLORER+'/transactions/'+record.hash;
  record.after=await snapshot(id);record.verified=true;await save(name,record);
  console.log(JSON.stringify({operation:functionName,hash:record.hash,status:record.status,execution:record.executionResult,round:record.after.round?.status,accounting:record.after.accounting}));return record;
 }
 async function until(deadline,label){while(Date.now()<deadline*1000){const seconds=Math.ceil((deadline*1000-Date.now())/1000);console.log(JSON.stringify({waitingFor:label,seconds}));await new Promise(r=>setTimeout(r,Math.min(30000,seconds*1000)));}}
 async function create(kind,windows){
  const id=roundIds[kind];let record=await loadJournal('lifecycle-'+prefix+kind+'-create.json');
  let args=record?.args;
  if(!args){const now=Math.floor(Date.now()/1000);args=[id,kind==='election'?'Council archive permissions':kind==='cancel'?'Cancelled council budget':'Expired council budget','Choose the council archive policy: compare the same permission, prohibition, beneficiary and attribution duty.',accounts[1].address,accounts[2].address,...windows.map(s=>now+s)];}
  await write(kind+'-create',accounts[0],'create_round',args,2n*GEN,id);return round(id);
 }
 async function withdraw(kind,actor,id){
  const record=await write(kind+'-withdraw',actor,'withdraw_credit',[],0n,id);
  const expected=BigInt(record.before.nativeContractGEN)*GEN-2n*GEN;
  for(let i=0;i<40&&await balance(target)!==expected;i++)await new Promise(r=>setTimeout(r,3000));
  const after=await snapshot(id);const actorIndex=accounts.findIndex(a=>a.address===actor.address);
  const parse=s=>{const [a,b='']=s.split('.');return BigInt(a)*GEN+BigInt(b.padEnd(18,'0'));};
  const increase=parse(after.actorBalancesGEN[actorIndex])-parse(record.before.actorBalancesGEN[actorIndex]);
  const parent=await rpc('eth_getTransactionByHash',[record.hash]);
  const children=(parent?.triggered_transactions??[]).map(x=>hash(typeof x==='string'?x:x?.hash??x?.tx_id)).filter(Boolean);
  const childReceipts=[];for(const child of children){const tx=await rpc('eth_getTransactionByHash',[child]);const receipt=await rpc('eth_getTransactionReceipt',[child]);childReceipts.push({hash:child,receipt:safeReceipt(tx),evmStatus:receipt?.status??null,from:receipt?.from??null,to:receipt?.to??null});}
  const proof={parentHash:record.hash,recipient:actor.address,expectedTransferGEN:'2',contractBeforeGEN:record.before.nativeContractGEN,contractAfterGEN:after.nativeContractGEN,recipientNetIncreaseGEN:gen(increase),feeDepositGEN:record.feeDepositGEN,creditAfterGEN:after.creditsGEN[actorIndex],childReceipts,externalReceipt:externalDeliveryProof(parent,actor.address,'2'),after,checkedAt:new Date().toISOString()};
  proof.balanceProven=await balance(target)===expected&&increase>=2n*GEN-parse(record.feeDepositGEN)&&increase<=2n*GEN&&after.creditsGEN[actorIndex]==='0';
  await save('lifecycle-'+prefix+kind+'-delivery.json',proof);console.log(JSON.stringify({delivery:kind,balanceProven:proof.balanceProven,contractAfterGEN:proof.contractAfterGEN,recipientNetIncreaseGEN:proof.recipientNetIncreaseGEN,childCount:children.length}));
  if(!proof.balanceProven)throw new SafeError('NativeDeliveryBalanceProofFailed');
 }
 const mode=process.argv.find(x=>x.startsWith('--case='))?.slice(7)??'election';
 if(mode==='election'){
  let r=await create('election',[420,660,1260]);
  const texts=[
   'Permit every council member to read the council archive and to redistribute archive copies to the public, provided the original author is credited.',
   'Permit council members to read the council archive. Prohibit redistribution of archive copies to anyone outside the council. Require attribution to the original author.',
   'Every member of the council may read its archive, must credit the original author, and must not share copies with people who are not council members.'
  ];
  for(let i=0;i<3;i++)await write('motion'+(i+1),accounts[i],'submit_motion',[r.id,r.configDigest,texts[i]],0n,r.id);
  r=await round(r.id);await until(r.proposalDeadline,'ballot opening');
  for(let i=0;i<3;i++)await write('ballot'+(i+1),accounts[i],'cast_ballot',[r.id,r.slateDigest,i+1],0n,r.id);
  r=await round(r.id);await until(r.voteDeadline,'review opening');
  await write('election-review',accounts[0],'review_round',[r.id],0n,r.id);r=await round(r.id);
  const attempt=JSON.parse(await read(target,'get_attempt',[r.id,r.attemptCount]));await save('lifecycle-'+prefix+'current-verdict.json',{round:r,attempt,checkedAt:new Date().toISOString()});
  if(r.status!=='ELECTED'||r.winnerSlot!==2||r.recipient.toLowerCase()!==accounts[1].address.toLowerCase()||JSON.stringify(r.groups)!=='[[1],[2,3]]'||JSON.stringify(r.scores)!=='[1,2]')throw new SafeError('ConsequentialVerdictNeedsInspection');
  await withdraw('election',accounts[1],r.id);
 }else if(mode==='cancel'){
  const r=await create('cancel',[300,600,900]);await write('cancel',accounts[0],'cancel_round',[r.id],0n,r.id);await withdraw('cancel',accounts[0],r.id);
 }else if(mode==='expiry'){
  const r=await create('expiry',[60,90,120]);await until(r.reviewDeadline,'safe recovery opening');await write('recover',accounts[0],'recover_round',[r.id],0n,r.id);await withdraw('expiry',accounts[0],r.id);
 }else if(mode==='expired-election'){
  const r=await round(roundIds.election);await until(r.reviewDeadline,'original round recovery opening');await write('expired-election-recover',accounts[0],'recover_round',[r.id],0n,r.id);await withdraw('expired-election',accounts[0],r.id);
 }else throw new SafeError('UnknownLifecycleCase');
 const final=await snapshot();await save('lifecycle-final-state.json',{...network,target,checkedAt:new Date().toISOString(),...final});
 console.log(JSON.stringify({case:mode,completed:true,...final}));
}
try{await main();}catch(error){console.log(JSON.stringify({lifecycleStopped:safeError(error)}));process.exitCode=1;}
