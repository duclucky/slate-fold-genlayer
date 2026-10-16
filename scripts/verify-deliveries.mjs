/** Reconcile external receipts against recorded actual native balance deltas. */
import {readdir,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {evidence,transaction,save,safeError,SafeError} from './network.mjs';
import {externalDeliveryProof} from './external-delivery.mjs';
import {feeRefundProof,balanceProof} from './balance-proof.mjs';
import {loadJournal} from './journal.mjs';
async function main(){let count=0;
 const selected=process.argv.find(x=>x.startsWith('--delivery='))?.slice(11);
 const feeHash=process.argv.find(x=>x.startsWith('--fee-refund='))?.slice(13);
 if((selected||feeHash)&&(!/^lifecycle-[a-z0-9-]+-delivery\.json$/.test(selected??'')||!/^0x[a-f0-9]{64}$/i.test(feeHash??'')))throw new SafeError('InvalidFeeReconciliationArguments');
 for(const file of await readdir(evidence)){
  if(!/^lifecycle-[a-z0-9-]+-delivery\.json$/.test(file))continue;
  const record=JSON.parse(await readFile(resolve(evidence,file),'utf8'));
  if(file===selected){
   const parent=await loadJournal(file.replace('-delivery.json','-withdraw.json'));
   if(parent?.hash!==record.parentHash)throw new SafeError('DeliveryJournalMismatch');
   record.snapshotPreparedAt=parent.preparedAt;
   record.isolatedRecipientDeltaPassed=balanceProof(record);
   record.overlappingFeeRefunds=[feeRefundProof(await transaction(feeHash),record)];
   record.recipientDeltaNote='Aggregate wallet increase includes overlapping protocol fee activity. Payout amount is proven independently by the exact contract decrease and matching external execution receipt; no exact fee split is attributed.';
  }
  const refunds=[];for(const refund of record.overlappingFeeRefunds??[])refunds.push(feeRefundProof(await transaction(refund.hash),record));
  record.balanceProven=balanceProof(record,refunds);
  if(!record.balanceProven)throw new SafeError('RecordedBalanceDeltaNotProven');
  if(refunds.length)record.overlappingFeeRefunds=refunds;
  record.externalReceipt=externalDeliveryProof(await transaction(record.parentHash),record.recipient,record.expectedTransferGEN);
  record.deliveryProven=true;record.receiptReconciledAt=new Date().toISOString();await save(file,record);count++;
 }
 console.log(JSON.stringify({deliveryRecordsVerified:count,basis:'Successful parent plus external execution/value-delivery receipt and exact recorded native contract decrease; no invented child hash.'}));
 if(!count)throw new SafeError('NoDeliveryEvidenceFound');
}
try{await main();}catch(error){console.log(JSON.stringify({deliveryAuditStopped:safeError(error)}));process.exitCode=1;}
