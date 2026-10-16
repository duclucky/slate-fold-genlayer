/** Read-only reconciliation of public hashes, then safe timestamp projection. */
import {readdir,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {evidence,rpc,save,EXPLORER,verifyNetwork,SafeError,safeError} from './network.mjs';
import {hash,receiptState} from './receipt.mjs';
import {loadJournal} from './journal.mjs';
const stages=['PENDING','ACTIVATED','PROPOSING','COMMITTING','REVEALING','ACCEPTED','FINALIZED'];
const iso=x=>typeof x==='number'&&Number.isFinite(x)&&x>1500000000&&x<5000000000?new Date(x*1000).toISOString():null;
async function main(){
 const network=await verifyNetwork();const deployment=await loadJournal('deployment.json');if(!deployment?.address)throw new SafeError('ActiveDeploymentRequired');const records=new Map();
 for(const file of await readdir(evidence)){
  if(!/^(deployment(?:-attempt)?|caller-spoof-smoke|lifecycle-[a-z0-9-]+)\.json$/.test(file))continue;
  const record=JSON.parse(await readFile(resolve(evidence,file),'utf8'));if(!hash(record.hash))continue;
  if(record.target&&record.target.toLowerCase()!==deployment.address.toLowerCase())continue;
  if(file.startsWith('deployment')&&record.hash!==deployment.hash)continue;
  if(!records.has(record.hash))records.set(record.hash,{record,files:[]});records.get(record.hash).files.push(file);
 }
 const rows=[];
 for(const [txHash,{record,files}]of records){
  const tx=await rpc('eth_getTransactionByHash',[txHash]);const state=receiptState(tx);if(state.status!=='FINALIZED')throw new SafeError('EvidenceTransactionNotFinalized');
  const timestamps={};const history=tx.consensus_history;
  for(const item of [...(history?.consensus_results??[]),{monitoring:history?.current_monitoring}])for(const stage of stages){const time=iso(item?.monitoring?.[stage]);if(time)timestamps[stage]=time;}
  const accepted= timestamps.ACCEPTED??iso(tx.timestamp_awaiting_finalization);
  const finalized=timestamps.FINALIZED;
  if(!accepted||!finalized)throw new SafeError('AcceptedFinalizedTimestampEvidenceMissing');
  rows.push({hash:txHash,operation:record.operation??'deployment',actor:record.actor??record.actualSigner??null,applicationValueGEN:record.valueGEN??'0',...state,createdAt:tx.created_at,acceptedAt:accepted,finalizedAt:finalized,observedStages:timestamps,explorer:EXPLORER+'/tx/'+txHash,canonicalRecords:files,expectedRejection:record.publicReason==='motion time closed'||record.operation==='zero-value caller-spoof tripwire'});
 }
 const result={...network,command:'node scripts/evidence-timeline.mjs',checkedAt:new Date().toISOString(),transactions:rows,successful:rows.filter(x=>x.successful).length,expectedRejections:rows.filter(x=>x.execution==='ERROR'&&x.expectedRejection).length,unexpectedFailures:rows.filter(x=>!x.successful&&!x.expectedRejection).length};
 await save('lifecycle-timeline.json',result);console.log(JSON.stringify({transactions:rows.length,successful:result.successful,expectedRejections:result.expectedRejections,unexpectedFailures:result.unexpectedFailures,allHaveAcceptedFinalizedTimestamps:true}));
 if(result.unexpectedFailures)process.exitCode=1;
}
try{await main();}catch(error){console.log(JSON.stringify({evidenceStopped:safeError(error)}));process.exitCode=1;}
