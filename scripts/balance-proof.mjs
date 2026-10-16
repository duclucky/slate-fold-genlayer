/** Source debit is exact; recipient balance may also include separately proved fee refunds. */
import {parseUnits,formatUnits} from 'viem';
import {address,hash,receiptState} from './receipt.mjs';
export function feeRefundProof(tx,record){
 const f=tx?.data?.fee_accounting,finalized=tx?.consensus_history?.current_monitoring?.FINALIZED;
 const before=Date.parse(record.snapshotPreparedAt)/1000,after=Date.parse(record.checkedAt)/1000;
 if(!receiptState(tx).successful||!hash(tx.hash)||!address(record.recipient)||address(tx.from_address)!==address(record.recipient)||address(f?.sender)!==address(record.recipient)||!Number.isFinite(before)||!Number.isFinite(after)||!Number.isFinite(finalized)||finalized<before||finalized>after)throw Error('OverlappingFeeRefundNotProven');
 const paid=BigInt(f.paid_fee_value),refunded=BigInt(f.total_refunded);
 if(paid<=0n||paid>=10n**18n||refunded<=0n||refunded>paid)throw Error('OverlappingFeeRefundOutsideBound');
 return {hash:tx.hash,recipient:record.recipient,paidFeeGEN:formatUnits(paid,18),refundedGEN:formatUnits(refunded,18),finalizedAt:new Date(finalized*1000).toISOString()};
}
export function balanceProof(record,refunds=[]){
 const units=value=>parseUnits(value,18),amount=units(record.expectedTransferGEN),increase=units(record.recipientNetIncreaseGEN);
 if(new Set(refunds.map(x=>x.hash)).size!==refunds.length)return false;
 const extra=refunds.reduce((sum,x)=>sum+units(x.refundedGEN),0n);
 return units(record.contractBeforeGEN)-units(record.contractAfterGEN)===amount&&record.creditAfterGEN==='0'&&increase>=amount-units(record.feeDepositGEN)&&increase<=amount+extra;
}
