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
