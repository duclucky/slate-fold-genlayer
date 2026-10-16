import {afterEach,expect,it,vi} from 'vitest';
import {abi} from 'genlayer-js';
import {decodeFunctionData,toHex} from 'viem';
import {studioDevnet} from 'genlayer-js/chains';
import {createSlateAdapter} from './adapter';
import type {Provider} from './wallet';

const sender='0x1111111111111111111111111111111111111111';
const recipient='0x2222222222222222222222222222222222222222';
const tx='0x'+'33'.repeat(32);
const endpoint='https://offline-slatefold.invalid/genlayer-rpc';
const quotedFee=10n**15n;
const distribution={leaderTimeunitsAllocation:'100',validatorTimeunitsAllocation:'100',appealRounds:'0',executionBudgetPerRound:'100000000000000',executionConsumed:'0',totalMessageFees:'0',rotations:['0'],maxPriceGenPerTimeUnit:'1',storageFeeMaxGasPrice:'1',receiptFeeMaxGasPrice:'1'};
const receipt={transactionHash:tx,transactionIndex:'0x0',blockHash:'0x'+'44'.repeat(32),blockNumber:'0x10',from:sender,to:recipient,cumulativeGasUsed:'0x1',gasUsed:'0x1',contractAddress:null,logs:[],logsBloom:'0x'+'00'.repeat(256),status:'0x1',effectiveGasPrice:'0x0',type:'0x0'};
afterEach(()=>vi.unstubAllGlobals());
function io(finalExecution='SUCCESS'){
 const sends:{method:string;params?:unknown[]}[]=[];const reads:string[]=[];let polls=0;
 const provider:Provider={async request(request){sends.push(request);if(request.method==='eth_chainId')return '0xf22d';if(request.method==='eth_accounts')return [sender];if(request.method==='eth_sendTransaction')return tx;throw Error('Unexpected wallet method '+request.method);}};
 vi.stubGlobal('fetch',vi.fn(async(url:unknown,options:RequestInit)=>{
  expect(String(url)).toBe(endpoint);const body=JSON.parse(String(options.body));reads.push(body.method);
  let result:unknown;
  switch(body.method){
   case 'eth_getTransactionCount':result='0x0';break;
   case 'sim_getFeeConfig':result={enabled:true,policy:{genPerTimeUnit:'1',storageUnitPrice:'1',receiptGasPrice:'1'}};break;
   case 'sim_estimateTransactionFees':result={recommendedPreset:{distribution,feeValue:quotedFee.toString()}};break;
   case 'eth_estimateGas':result='0x30d40';break;
   case 'eth_gasPrice':result='0x0';break;
   case 'eth_blockNumber':result='0x10';break;
   case 'eth_getTransactionReceipt':result=receipt;break;
   case 'eth_getTransactionByHash':result={hash:tx,status:polls++===0?'ACCEPTED':'FINALIZED',consensus_data:{leader_receipt:[{execution_result:finalExecution}]}};break;
   case 'gen_call':result=toHex(abi.calldata.encode('[]'));break;
   default:throw Error('Unexpected IC RPC method '+body.method);
  }
  return new Response(JSON.stringify({jsonrpc:'2.0',id:body.id,result}),{headers:{'content-type':'application/json'}});
 }));
 return {provider,sends,reads};
}
it('actual adapter + real SDK encode selected caller, IC destination and exact2GEN, no account override',async()=>{
 const {provider,sends,reads}=io();const stages:string[]=[];
 const adapter=createSlateAdapter({address:recipient,account:sender,provider,endpoint,pollIntervalMs:0,maxPolls:3});
 await adapter.write('create_round',['unique-round','Archive council','Choose archive permission.',sender,recipient,1900000100,1900000200,1900000300],'2',s=>stages.push(s));
 const requests=sends.filter(x=>x.method==='eth_sendTransaction');expect(requests).toHaveLength(1);
 const request=requests[0].params![0] as {from:string;to:string;value:string;data:`0x${string}`};
 expect(request.from.toLowerCase()).toBe(sender);expect(request.to.toLowerCase()).toBe(studioDevnet.consensusMainContract!.address.toLowerCase());
 expect(BigInt(request.value)).toBe(2n*10n**18n+quotedFee);
 const decoded=decodeFunctionData({abi:studioDevnet.consensusMainContract!.abi,data:request.data});
 expect(decoded.functionName).toBe('addTransaction');
 const params=(decoded.args as unknown as [{sender:string;recipient:string;userValue:bigint}])[0];
 expect(params.sender.toLowerCase()).toBe(sender);expect(params.recipient.toLowerCase()).toBe(recipient);expect(params.userValue).toBe(2n*10n**18n);
 expect(stages).toEqual(['estimating','signing','submitted','accepted','finalized']);expect(reads).toContain('eth_getTransactionByHash');
 expect(sends.every(x=>['eth_chainId','eth_accounts','eth_sendTransaction'].includes(x.method))).toBe(true);
});
it('zero-value write uses SDK contract call and selected wallet',async()=>{
 const {provider,sends}=io();await createSlateAdapter({address:recipient,account:sender,provider,endpoint,pollIntervalMs:0}).write('cancel_round',['cancel-fixture'],'0',()=>{});
 expect(BigInt((sends.find(x=>x.method==='eth_sendTransaction')!.params![0] as {value:string}).value)).toBe(quotedFee);
});
it('live fee quote must be funded separately from the exact2GEN purse',async()=>{
 const {provider,sends}=io();await createSlateAdapter({address:recipient,account:sender,provider,endpoint,pollIntervalMs:0}).write('create_round',['fee-regression','Archive council','Choose archive permission.',sender,recipient,1900000100,1900000200,1900000300],'2',()=>{});
 const request=sends.find(x=>x.method==='eth_sendTransaction')!.params![0] as {value:string;data:`0x${string}`};
 const decoded=decodeFunctionData({abi:studioDevnet.consensusMainContract!.abi,data:request.data});
 const params=(decoded.args as unknown as [{userValue:bigint;feesDistribution:{executionBudgetPerRound:bigint}}])[0];
 expect(params.userValue).toBe(2n*10n**18n);expect(BigInt(request.value)).toBeGreaterThan(params.userValue);expect(params.feesDistribution.executionBudgetPerRound).toBeGreaterThan(0n);
});
it('failed fee estimation gives a recovery message without RPC payloads or a wallet broadcast',async()=>{
 const {provider,sends}=io();const original=fetch;
 vi.stubGlobal('fetch',vi.fn(async(url:unknown,options:RequestInit)=>JSON.parse(String(options.body)).method==='sim_estimateTransactionFees'?Response.json({jsonrpc:'2.0',id:1,error:{code:-32000,message:'Internal RPC diagnostic payload'}}):original(url as RequestInfo,options)));
 await expect(createSlateAdapter({address:recipient,account:sender,provider,endpoint}).write('cancel_round',['quote-failure-fixture'],'0',()=>{})).rejects.toThrow('The network could not quote this action. Refresh the round and check its timing before trying again. No transaction was submitted.');
 expect(sends.some(x=>x.method==='eth_sendTransaction')).toBe(false);
});
it.each([undefined,'undefined','0x0','0x'+'00'.repeat(20)])('invalid contract %s fails before wallet or RPC',async address=>{
 const {provider,sends}=io();const a=createSlateAdapter({address,account:sender,provider,endpoint});
 await expect(a.write('cancel_round',['bad-fixture'],'0',()=>{})).rejects.toThrow(/contract address/i);expect(sends).toHaveLength(0);expect(fetch).not.toHaveBeenCalled();
});
it('disconnected wallet disables writes before any I/O',async()=>{
 io();await expect(createSlateAdapter({address:recipient,endpoint}).write('cancel_round',['disconnected-fixture'],'0',()=>{})).rejects.toThrow(/connect/i);expect(fetch).not.toHaveBeenCalled();
});
it('current selected account must still match before signing',async()=>{
 const {provider,sends}=io();const changed={...provider,async request(request:{method:string;params?:unknown[]}){if(request.method==='eth_accounts')return [recipient];return provider.request(request);}};
 await expect(createSlateAdapter({address:recipient,account:sender,provider:changed,endpoint}).write('cancel_round',['changed-fixture'],'0',()=>{})).rejects.toThrow(/account changed/i);expect(sends.some(x=>x.method==='eth_sendTransaction')).toBe(false);
});
it('canonical list reads use IC proxy and real SDK decoding',async()=>{
 const {sends,reads}=io();expect(await createSlateAdapter({address:recipient,endpoint}).list()).toEqual([]);expect(reads).toEqual(['gen_call']);expect(sends).toHaveLength(0);
});
it('finalized failed execution cannot produce successful finality',async()=>{
 const {provider}=io('ERROR');const stages:string[]=[];
 await expect(createSlateAdapter({address:recipient,account:sender,provider,endpoint,pollIntervalMs:0}).write('cancel_round',['failed-fixture'],'0',s=>stages.push(s))).rejects.toThrow(/execution/i);expect(stages).not.toContain('finalized');
});
it('ambiguous timeout rechecks existing hash and never rebroadcasts the action',async()=>{
 const {provider,sends}=io();const a=createSlateAdapter({address:recipient,account:sender,provider,endpoint,pollIntervalMs:0,maxPolls:1});
 await expect(a.write('cancel_round',['pending-fixture'],'0',()=>{})).rejects.toThrow(/existing transaction/i);
 await a.write('cancel_round',['pending-fixture'],'0',()=>{});expect(sends.filter(x=>x.method==='eth_sendTransaction')).toHaveLength(1);
});
it('ambiguous create retry keeps the original hash even when regenerated deadlines change',async()=>{
 const {provider,sends}=io();const a=createSlateAdapter({address:recipient,account:sender,provider,endpoint,pollIntervalMs:0,maxPolls:1});
 const args=['pending-create-fixture','Archive council','Choose archive permission.',sender,recipient,1900000100,1900000200,1900000300];
 await expect(a.write('create_round',args,'2',()=>{})).rejects.toThrow(/existing transaction/i);
 await a.write('create_round',[...args.slice(0,5),1900000110,1900000210,1900000310],'2',()=>{});
 expect(sends.filter(x=>x.method==='eth_sendTransaction')).toHaveLength(1);
});
