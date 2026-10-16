/** Reconcile external receipts against recorded actual native balance deltas. */
import {readdir,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {parseUnits} from 'viem';
import {evidence,rpc,save,safeError,SafeError} from './network.mjs';
import {externalDeliveryProof} from './external-delivery.mjs';
async function main(){let count=0;
 for(const file of await readdir(evidence)){
  if(!/^lifecycle-[a-z0-9-]+-delivery\.json$/.test(file))continue;
  const record=JSON.parse(await readFile(resolve(evidence,file),'utf8'));
  const amount=parseUnits(record.expectedTransferGEN,18),increase=parseUnits(record.recipientNetIncreaseGEN,18);
  if(!record.balanceProven||parseUnits(record.contractBeforeGEN,18)-parseUnits(record.contractAfterGEN,18)!==amount||record.creditAfterGEN!=='0'||increase<amount-parseUnits(record.feeDepositGEN,18)||increase>amount)throw new SafeError('RecordedBalanceDeltaNotProven');
  record.externalReceipt=externalDeliveryProof(await rpc('eth_getTransactionByHash',[record.parentHash]),record.recipient,record.expectedTransferGEN);
  record.deliveryProven=true;record.receiptReconciledAt=new Date().toISOString();await save(file,record);count++;
 }
 console.log(JSON.stringify({deliveryRecordsVerified:count,basis:'Successful parent plus external execution/value-delivery receipt and exact recorded native contract decrease; no invented child hash.'}));
 if(!count)throw new SafeError('NoDeliveryEvidenceFound');
}
try{await main();}catch(error){console.log(JSON.stringify({deliveryAuditStopped:safeError(error)}));process.exitCode=1;}
