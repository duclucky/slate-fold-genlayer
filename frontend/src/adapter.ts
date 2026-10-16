import {createClient} from 'genlayer-js';
import {studioDevnet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
import {formatUnits} from 'viem';
import {receiptState} from '../../scripts/receipt.mjs';
import {ensureChain,validAddress,type Provider} from './wallet';
import {labels,type Adapter,type Round,type Action,type TxStage} from './model';

interface Options {address?:string;account?:string;provider?:Provider;endpoint?:string;pollIntervalMs?:number;maxPolls?:number}
const pending=new Map<string,`0x${string}`>(); // Transaction references only, never canonical state.
const txHash=(x:unknown):x is `0x${string}`=>typeof x==='string'&&/^0x[0-9a-fA-F]{64}$/.test(x);
const sleep=(n:number)=>new Promise(resolve=>setTimeout(resolve,n));
function roundResult(raw:unknown,id:string):Round{
 const r=typeof raw==='string'?JSON.parse(raw):raw;
 if(!r||typeof r!=='object'||r.id!==id||!Object.hasOwn(labels,r.status)||typeof r.title!=='string'||typeof r.objective!=='string'||!validAddress(r.sponsor)||!Array.isArray(r.members)||r.members.length!==3||!r.members.every(validAddress)||!Array.isArray(r.motions)||r.motions.length!==3||!r.motions.every((x:unknown)=>typeof x==='string')||!Array.isArray(r.ballots)||r.ballots.length!==3||!r.ballots.every((x:unknown)=>Number.isInteger(x)&&Number(x)>=0&&Number(x)<=3)||!['proposalDeadline','voteDeadline','reviewDeadline','attemptCount'].every(key=>Number.isSafeInteger(r[key]))||!Array.isArray(r.groups)||!Array.isArray(r.scores)||typeof r.configDigest!=='string'||typeof r.slateDigest!=='string'||typeof r.reason!=='string'||typeof r.recipient!=='string')throw Error('The contract returned an invalid council record. Actions remain unavailable.');
 return r as Round;
}
export function createSlateAdapter(options:Options):Adapter{
 const endpoint=options.endpoint??'/genlayer-rpc';
 const chain={...studioDevnet,rpcUrls:{default:{http:[endpoint]}}};
 const client=createClient({chain,...options.provider?{provider:options.provider}:{},...validAddress(options.account)?{account:options.account}:{}});
 const configured=()=>{if(!validAddress(options.address))throw Error('A verified contract address is not configured. No transaction was submitted.');if(!validAddress(chain.consensusMainContract?.address))throw Error('The Studio Dev system contract address is invalid.');return options.address;};
 async function read(name:string,args:(string|number)[]){return client.readContract({address:configured(),functionName:name,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL});}
 async function poll(hash:`0x${string}`,stage:(s:TxStage,h?:string)=>void){
  let accepted=false;
  for(let i=0;i<(options.maxPolls??120);i++){
   const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_getTransactionByHash',params:[hash]})});
   if(!response.ok)throw Error('Receipt connection failed. Check the existing transaction before retrying.');
   const rpc=await response.json();if(rpc.error)throw Error('Receipt is unavailable. Check the existing transaction before retrying.');
   const state=receiptState(rpc.result);
   if(state.successful){stage('finalized',hash);return;}
   if(state.status==='FINALIZED'&&state.execution!=='SUCCESS')throw Error('Finalized execution was not successful. Review the existing transaction; no success is recorded.');
   if(['UNDETERMINED','CANCELED','LEADER_TIMEOUT','VALIDATORS_TIMEOUT'].includes(state.status))throw Error('The existing transaction needs review before another attempt.');
   if(state.status==='ACCEPTED'&&!accepted){stage('accepted',hash);accepted=true;}
   await sleep(options.pollIntervalMs??3000);
  }
  stage('retry',hash);throw Error('Still waiting for finality. Recheck the existing transaction; this action will not be broadcast again.');
 }
 const adapter:Adapter={
  async list(){
   const rounds:Round[]=[];
   for(let offset=0;offset<100;offset+=20){
    const raw=await read('list_rounds',[offset,20]);const ids=typeof raw==='string'?JSON.parse(raw):raw;
    if(!Array.isArray(ids)||ids.length>20||!ids.every((x:unknown)=>typeof x==='string'&&/^[a-z0-9][a-z0-9-]{0,47}$/.test(x)))throw Error('The contract returned an invalid round list.');
    rounds.push(...await Promise.all(ids.map(id=>adapter.round(id))));if(ids.length<20)break;
   }
   return rounds;
  },
  async round(id){return roundResult(await read('get_round',[id]),id);},
  async credit(address){if(!validAddress(address))throw Error('A valid wallet address is required.');const value=await read('get_credit',[address]);if(typeof value!=='string'||!/^\d+(\.\d{1,18})?$/.test(value))throw Error('The contract returned an invalid GEN credit.');return value;},
  async write(action:Action,args,valueGEN,onStage){
   const address=configured();
   if(!options.provider||!validAddress(options.account))throw Error('Connect your selected wallet before signing.');
   if((action==='create_round'&&valueGEN!=='2')||(action!=='create_round'&&valueGEN!=='0'))throw Error('This action has an invalid GEN amount.');
   if(args.some(x=>typeof x!=='string'&&typeof x!=='number'))throw Error('Invalid transaction input.');
   const key=JSON.stringify([chain.id,address.toLowerCase(),options.account.toLowerCase(),action,args]);
   const existing=pending.get(key);
   if(existing){await poll(existing,onStage);pending.delete(key);return;}
   await ensureChain(options.provider);
   const accounts=await options.provider.request({method:'eth_accounts'});
   if(!Array.isArray(accounts)||!validAddress(accounts[0])||accounts[0].toLowerCase()!==options.account.toLowerCase())throw Error('Your selected wallet account changed. Disconnect and reconnect before signing.');
   const selected=options.provider;
   const provider:Provider={async request(request){const result=await selected.request(request);if(request.method==='eth_sendTransaction'&&txHash(result)){pending.set(key,result);onStage('submitted',result);}return result;}};
   const writer=createClient({chain,account:options.account,provider});
   onStage('estimating');
   const value=valueGEN==='2'?2n*10n**18n:0n;
   const call={address,functionName:action,args:args as Parameters<typeof writer.writeContract>[0]['args'],value};
   const quote=await writer.estimateTransactionFeesForWrite({...call,transactionHashVariant:TransactionHashVariant.LATEST_FINAL}).catch(()=>{throw Error('The network could not quote this action. Refresh the round and check its timing before trying again. No transaction was submitted.');});
   if(quote.policy.enabled&&quote.feeValue<=0n)throw Error('The network did not provide a funded fee quote. No transaction was submitted.');
   onStage('signing',undefined,formatUnits(quote.feeValue,18));
   let hash:`0x${string}`;
   try{
    hash=await writer.writeContract({...call,fees:{distribution:quote.distribution,feeValue:quote.feeValue,messageAllocations:quote.messageAllocations}});
   }catch(error){
    if(pending.has(key))throw Error('The wallet submitted a transaction. Check the existing transaction before retrying.');
    if((error as {code?:number}).code===4001)throw Error('Signing was declined in your wallet.');
    throw Error('The wallet transaction could not be submitted. Check your network, available GEN and wallet message.');
   }
   if(!txHash(hash))throw Error('The wallet returned an invalid transaction reference.');
   pending.set(key,hash);await poll(hash,onStage);pending.delete(key);
  }
 };
 return adapter;
}
