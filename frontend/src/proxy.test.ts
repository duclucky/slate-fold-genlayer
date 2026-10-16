import {afterEach,expect,it,vi} from 'vitest';
import {forwardRpc} from '../api/genlayer-rpc.mjs';
afterEach(()=>vi.unstubAllGlobals());
it('proxy never forwards broadcasts or arbitrary URLs',async()=>{
 vi.stubGlobal('fetch',vi.fn());
 for(const method of ['eth_sendRawTransaction','eth_sendTransaction','sim_call','sim_installMocks','arbitrary']){
  expect(await forwardRpc({id:1,method,params:[]})).toHaveProperty('error.code',-32601);
 }
 expect(fetch).not.toHaveBeenCalled();
});
it('proxy rejects writes disguised as gen_call',async()=>{
 vi.stubGlobal('fetch',vi.fn());expect(await forwardRpc({method:'gen_call',params:[{type:'write'}]})).toHaveProperty('error.code',-32602);expect(fetch).not.toHaveBeenCalled();
});
it('receipt proxy omits private validator configuration and traces',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({result:{status:'FINALIZED',node_config:{secret:'private'},stdout:'private',consensus_data:{leader_receipt:[{execution_result:'SUCCESS',node_config:{private:true},genvm_result:{trace:'private'}}]}}}))));
 const result=await forwardRpc({method:'eth_getTransactionByHash',params:['0x'+'ab'.repeat(32)]});expect(JSON.stringify(result)).not.toContain('private');expect(result).toHaveProperty('result.consensus_data.leader_receipt.0.execution_result','SUCCESS');
});
it('proxy suppresses arbitrary upstream error details',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({error:{code:-32000,message:'private validator configuration',data:{secret:'private'}}}))));
 expect(JSON.stringify(await forwardRpc({method:'eth_chainId',params:[]}))).not.toContain('private');
});
it('fee simulation uses current server time without accepting caller simulation overrides',async()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-16T01:00:00Z'));
 try{
  vi.stubGlobal('fetch',vi.fn(async(_url,options:RequestInit)=>{const body=JSON.parse(String(options.body));expect(body.params[0].sim_config).toEqual({genvm_datetime:'2026-10-16T01:00:00.000Z'});return Response.json({result:{recommendedPreset:{distribution:{},feeValue:'1'}}});}));
  const response=await forwardRpc({method:'sim_estimateTransactionFees',params:[{type:'write',to:'0x'+'11'.repeat(20),sim_config:{genvm_datetime:'2000-01-01',validators:[{secret:'private'}]}}]});
  expect(response).toHaveProperty('result.recommendedPreset.feeValue','1');
 }finally{vi.useRealTimers();}
});
it('fee projection excludes unexpected preset and allocation metadata',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({result:{recommendedPreset:{feeValue:'1',distribution:{executionBudgetPerRound:'1',node_config:'private'},node_config:'private',messageAllocations:[{messageType:1,budget:'1',node_config:'private'}]},feeAccounting:{node_config:'private'}}})));
 const response=await forwardRpc({method:'sim_estimateTransactionFees',params:[{type:'write',to:'0x'+'11'.repeat(20)}]});expect(JSON.stringify(response)).not.toContain('private');expect(response).toHaveProperty('result.recommendedPreset.feeValue','1');
});
it('receipt projection retains only the exact quorum control signal needed by the parser',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({result:{status:'FINALIZED',txExecutionResultName:'FINISHED_WITH_RETURN',consensus_data:{leader_receipt:[{mode:'leader',execution_result:'SUCCESS'},{mode:'validator',vote:'idle',execution_result:'ERROR',genvm_result:{error_code:'CONSENSUS_VALIDATOR_QUORUM_REACHED',node_config:'private'}}]}}})));
 const result=await forwardRpc({method:'eth_getTransactionByHash',params:['0x'+'ab'.repeat(32)]});expect(result).toHaveProperty('result.consensus_data.leader_receipt.1.controlCode','CONSENSUS_VALIDATOR_QUORUM_REACHED');expect(JSON.stringify(result)).not.toContain('private');
});
