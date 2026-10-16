/** Capture an unsigned SDK envelope, then estimate it. Never broadcast. */
import {readFile} from 'node:fs/promises';
import {createClient} from 'genlayer-js';
import {chain,sourcePath,sponsor,rpc,save,gen,verifyNetwork,safeError} from './network.mjs';
import {quoteDeploy} from './fees.mjs';
const actor=await sponsor();const network=await verifyNetwork();const code=await readFile(sourcePath,'utf8');
const checks=[];
for(const withFees of [true]){
 let request;
 const provider={async request(input){if(input.method==='eth_sendTransaction'){request=input.params[0];throw Error('CAPTURE_ONLY_NO_BROADCAST');}throw Error('Unexpected signing request');}};
 const fees=await quoteDeploy(actor);
 try{await createClient({chain:{...chain},account:actor.address,provider}).deployContract({code,args:[],...fees?{fees}:{}});}catch{}
 if(!request){checks.push({withFees,captured:false});continue;}
 const transaction={from:request.from,to:request.to,data:request.data,value:request.value};
 try{const gas=await rpc('eth_estimateGas',[transaction]);checks.push({withFees,captured:true,feeDepositGEN:gen(fees?.feeValue??0n),estimatedGasIsPositive:BigInt(gas)>0n,passed:true});}
 catch(error){checks.push({withFees,captured:true,feeDepositGEN:gen(fees?.feeValue??0n),passed:false,error:safeError(error)});}
 if(checks.at(-1).passed)break;
}
const result={at:new Date().toISOString(),command:'node scripts/envelope-preflight.mjs',scope:'Unsigned SDK capture and read-only gas estimation; no signature/broadcast.',network,checks,passed:checks.some(c=>c.passed)};
await save('envelope-preflight.json',result);console.log(JSON.stringify(result));process.exitCode=result.passed?0:1;
