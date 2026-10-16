import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {keccak256} from 'viem';
import {root,save} from './network.mjs';
import {sendJournal,loadJournal,nativeReceipt} from './journal.mjs';
await mkdir(resolve(root,'.codex'),{recursive:true});
let sequence=0;
const filename=()=> '../../../.codex/journal-test-'+process.pid+'-'+(++sequence)+'.json';
const clean=name=>unlink(resolve(root,'docs/evidence/studio-dev',name)).catch(()=>{});
test('hash is durable before signed bytes reach transport; recovery never resubmits',async()=>{
 const name=filename(),original=globalThis.fetch;const signed='0x01',expected=keccak256(signed);let broadcasts=0;
 try{
  globalThis.fetch=async()=>{broadcasts++;assert.equal((await loadJournal(name)).hash,expected);return Response.json({result:expected});};
  const first=await sendJournal(name,{operation:'test'},()=>fetch('https://example.invalid',{body:JSON.stringify({method:'eth_sendRawTransaction',params:[signed]})}));
  assert.equal(first.hash,expected);assert.equal(first.status,'SUBMITTED');
  const recovered=await sendJournal(name,{},()=>{throw Error('must not submit twice');});assert.equal(recovered.hash,expected);assert.equal(broadcasts,1);
 }finally{globalThis.fetch=original;await clean(name);}
});
test('ambiguous transport preserves predicted hash and cannot trigger another broadcast',async()=>{
 const name=filename(),original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>{throw Error('connection interrupted');};
  const result=await sendJournal(name,{operation:'test'},()=>fetch('https://example.invalid',{body:JSON.stringify({method:'eth_sendRawTransaction',params:['0x02']})}));
  assert.equal(result.hash,keccak256('0x02'));assert.equal(result.status,'SENDING');
  await sendJournal(name,{},()=>{throw Error('must not submit twice');});
 }finally{globalThis.fetch=original;await clean(name);}
});
test('prepared operation without a hash requires inspection instead of blind signing',async()=>{
 const name=filename();try{await save(name,{status:'PREPARED',hash:null});await assert.rejects(sendJournal(name,{},()=>assert.fail()),/PreparedOperationNeedsInspection/);}finally{await clean(name);}
});
test('failure before broadcast cannot be presented as a submitted transaction',async()=>{
 const name=filename();try{await assert.rejects(sendJournal(name,{},()=>{throw Error('local signing failed');}),/SubmissionStoppedBeforeBroadcast/);assert.equal((await loadJournal(name)).hash,null);}finally{await clean(name);}
});
test('native receipt rejects reverted envelopes and distinguishes native confirmation',async()=>{
 const original=globalThis.fetch;try{
  globalThis.fetch=async()=>Response.json({result:{status:'0x0'}});await assert.rejects(nativeReceipt('0x'+'1'.repeat(64)),/NativeEnvelopeReverted/);
  globalThis.fetch=async()=>Response.json({result:{status:'0x1',transactionHash:'0x'+'2'.repeat(64)}});assert.equal((await nativeReceipt('0x'+'2'.repeat(64))).status,'0x1');
 }finally{globalThis.fetch=original;}
});
