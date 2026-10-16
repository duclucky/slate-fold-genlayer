import {test} from 'node:test';
import assert from 'node:assert/strict';
import {feeRefundProof,balanceProof} from './balance-proof.mjs';
const account='0x'+'11'.repeat(20),hash='0x'+'22'.repeat(32);
const tx=()=>({hash,from_address:account,status:'FINALIZED',execution_result:'SUCCESS',consensus_history:{current_monitoring:{FINALIZED:1792117066}},data:{fee_accounting:{sender:account,paid_fee_value:'378511200010352',total_refunded:'299878700009529'}}});
const record=()=>({recipient:account,expectedTransferGEN:'2',contractBeforeGEN:'4',contractAfterGEN:'2',recipientNetIncreaseGEN:'2.000173573450008706',feeDepositGEN:'0.000759798000010352',creditAfterGEN:'0',snapshotPreparedAt:'2026-10-16T02:17:29.542Z',checkedAt:'2026-10-16T02:22:51.739Z'});
test('overlapping fee refunds explain a bounded aggregate wallet delta without changing the exact contract debit',()=>{
 const r=record();assert.equal(balanceProof(r),false);const refund=feeRefundProof(tx(),r);assert.equal(refund.refundedGEN,'0.000299878700009529');assert.equal(balanceProof(r,[refund]),true);
 for(const patch of [{contractAfterGEN:'3'},{creditAfterGEN:'2'},{recipientNetIncreaseGEN:'2.001'},{recipientNetIncreaseGEN:'1.99'}])assert.equal(balanceProof({...r,...patch},[refund]),false);
});
test('unrelated, unfinalized, out-of-window or excessive fee refunds cannot enlarge the recipient delta bound',()=>{
 const mutations=[x=>x.from_address='0x'+'33'.repeat(20),x=>x.data.fee_accounting.sender='0x'+'33'.repeat(20),x=>x.status='ACCEPTED',x=>x.consensus_history.current_monitoring.FINALIZED=1792117000,x=>x.consensus_history.current_monitoring.FINALIZED=1792118000,x=>x.data.fee_accounting.total_refunded='999999999999999999'];
 for(const mutate of mutations){const x=tx();mutate(x);assert.throws(()=>feeRefundProof(x,record()));}
});
