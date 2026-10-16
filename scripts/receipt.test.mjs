import {test} from 'node:test';
import assert from 'node:assert/strict';
import {receiptState,safeReceipt} from './receipt.mjs';
test('raw Studio receipt needs finalized plus successful leader execution',()=>{
 assert.deepEqual(receiptState({status:'FINALIZED',consensus_data:{leader_receipt:[{execution_result:'SUCCESS'}]}}),{status:'FINALIZED',execution:'SUCCESS',successful:true});
});
test('normalized SDK preserves explicit successful execution',()=>{
 assert.equal(receiptState({statusName:'FINALIZED',txExecutionResultName:'FINISHED_WITH_RETURN'}).successful,true);
 assert.equal(receiptState({status:7,txExecutionResult:1}).successful,true);
});
test('accepted is not finalized, missing execution is not success',()=>{
 assert.equal(receiptState({status:'ACCEPTED',execution_result:'SUCCESS'}).successful,false);
 assert.equal(receiptState({status:'FINALIZED'}).successful,false);
});
test('failed and contradictory executions are never successful',()=>{
 for(const r of [{status:'FINALIZED',execution_result:'ERROR'},{statusName:'FINALIZED',txExecutionResult:2},{status:'UNDETERMINED',execution_result:'SUCCESS'},{status:'FINALIZED',execution_result:'SUCCESS',consensus_data:{leader_receipt:[{execution_result:'ERROR'}]}}])assert.equal(receiptState(r).successful,false);
});
test('safe projection drops validator configuration and arbitrary strings',()=>{
 const r=safeReceipt({status:'FINALIZED',execution_result:'SUCCESS',hash:'0x'+'ab'.repeat(32),sender:'0x'+'cd'.repeat(20),node_config:{secret:'must never escape'},stdout:'private'});
 assert.deepEqual(Object.keys(r).sort(),['execution','from','hash','status','successful','to']);
 assert.ok(!JSON.stringify(r).includes('secret'));
});
test('malformed receipt fails closed',()=>{
 for(const r of [null,{},'SUCCESS',{status:'invented',execution_result:'SUCCESS'}])assert.equal(receiptState(r).successful,false);
});
test('idle validator quorum cancellation is not the successful leader execution',()=>{
 const idle={mode:'validator',vote:'idle',execution_result:'ERROR',genvm_result:{error_code:'CONSENSUS_VALIDATOR_QUORUM_REACHED'}};
 const receipt={status:'FINALIZED',txExecutionResultName:'FINISHED_WITH_RETURN',consensus_data:{leader_receipt:[{mode:'leader',execution_result:'SUCCESS'},idle]}};
 assert.equal(receiptState(receipt).successful,true);
 for(const patch of [{mode:'leader'},{vote:'disagree'},{genvm_result:{error_code:'OTHER_ERROR'}}])assert.equal(receiptState({...receipt,consensus_data:{leader_receipt:[{mode:'leader',execution_result:'SUCCESS'},{...idle,...patch}]}}).successful,false);
 assert.equal(receiptState({...receipt,txExecutionResultName:'FINISHED_WITH_ERROR'}).successful,false);
});
