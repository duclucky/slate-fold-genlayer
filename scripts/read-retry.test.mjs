import {test} from 'node:test';
import assert from 'node:assert/strict';
import {retryRead} from './read-retry.mjs';
test('canonical reads back off only for an explicit rate-limit or capacity code',async()=>{
 for(const code of [-32029,-32005,-32006,429]){
  let calls=0;const pauses=[];const result=await retryRead(async()=>{if(++calls===1)throw {cause:{code}};return 'canonical';},{pause:async n=>pauses.push(n)});
  assert.equal(result,'canonical');assert.equal(calls,2);assert.deepEqual(pauses,[10000]);
 }
});
test('persistent rate limiting is bounded and never becomes successful evidence',async()=>{
 let calls=0;const error={code:-32029};await assert.rejects(retryRead(async()=>{calls++;throw error;},{pause:async()=>{}}),e=>e===error);assert.equal(calls,4);
});
test('read backoff honors bounded server retry advice instead of retrying early',async()=>{
 for(const [error,expected]of [[{cause:{code:-32029,data:{retry_after_seconds:19}}},19000],[{code:429,retryAfterSeconds:600},60000]]){
  let calls=0;const pauses=[];await retryRead(async()=>{if(++calls===1)throw error;return true;},{pause:async n=>pauses.push(n)});assert.deepEqual(pauses,[expected]);
 }
});
test('execution, authorization and malformed-response errors are not retried',async()=>{
 for(const error of [{code:-32000},{code:-32602},new SyntaxError('malformed'),new Error('execution failed')]){
  let calls=0;await assert.rejects(retryRead(async()=>{calls++;throw error;},{pause:async()=>assert.fail('unexpected retry')}),e=>e===error);assert.equal(calls,1);
 }
});
