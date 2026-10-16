import {test} from 'node:test';
import assert from 'node:assert/strict';
import {externalDeliveryProof} from './external-delivery.mjs';
const recipient='0x'+'11'.repeat(20),id='0x'+'22'.repeat(32);
const fixture=()=>({status:'FINALIZED',txExecutionResultName:'FINISHED_WITH_RETURN',messages:[{messageType:'0',recipient,value:'2000000000000000000',onAcceptance:false}],data:{fee_accounting:{external_message_events:[{recipient,executionRecorded:true}],message_value_effects:{[id]:{phase:'finalized',include:true,value:'2000000000000000000'}},message_effect_delivered:{[id]:true}}}});
test('delivery requires the matching external execution and delivered 2 GEN effect',()=>{
 assert.deepEqual(externalDeliveryProof(fixture(),recipient,'2'),{kind:'parent-attached external EVM execution receipt',recipient,valueGEN:'2',executionRecorded:true,messageValueDelivered:true,effectId:id,separateChildHashAvailable:false});
});
test('parent success cannot substitute for wrong recipient, amount, phase or undelivered external value',()=>{
 const mutations=[x=>{x.txExecutionResultName='FINISHED_WITH_ERROR';},x=>{x.messages[0].recipient='0x'+'33'.repeat(20);},x=>{x.messages[0].value='1000000000000000000';},x=>{x.data.fee_accounting.message_effect_delivered[id]=false;},x=>{x.data.fee_accounting.external_message_events[0].executionRecorded=false;},x=>{x.data.fee_accounting.message_value_effects[id].phase='accepted';}];
 for(const mutate of mutations){const tx=fixture();mutate(tx);assert.throws(()=>externalDeliveryProof(tx,recipient,'2'),/ExternalDeliveryNotProven/);}
});
