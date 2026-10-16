/** Read-only acceptance audit for the active revision and its complete demo cases. */
import {readFile} from 'node:fs/promises';
import {read,balance,gen,verifyNetwork,identity,save,root,SafeError,safeError} from './network.mjs';
import {loadJournal} from './journal.mjs';
import {resolve} from 'node:path';
const requireProof=(condition,kind)=>{if(!condition)throw new SafeError(kind);};
async function main(){
 const network=await verifyNetwork(),deployment=await loadJournal('deployment.json'),source=await identity();
 requireProof(deployment?.status==='FINALIZED'&&deployment.executionResult==='SUCCESS','SuccessfulActiveDeploymentRequired');
 requireProof(source.sourceSha256===deployment.sourceSha256,'ActiveSourceMismatch');
 const check=JSON.parse(await readFile(resolve(root,'.codex/last-check.json'),'utf8'));
 requireProof(check.exitCode===0&&check.sourceSha256===source.sourceSha256,'CurrentLocalCheckRequired');
 const target=deployment.address,rounds=[];
 for(const [id,status]of [['council-permissions-v3','ELECTED'],['cancel-before-participation-v3','CANCELLED'],['expired-incomplete-v3','REFUNDED'],['council-distinct-v3','REFUNDED'],['council-distinct-v4','REFUNDED']]){
  const round=JSON.parse(await read(target,'get_round',[id]));requireProof(round.id===id&&round.status===status&&round.escrowGEN==='0','DemoCaseNotTerminal');rounds.push(round);
 }
 const elected=rounds[0],tie=rounds[4];
 requireProof(elected.winnerSlot===2&&JSON.stringify(elected.groups)==='[[1],[2,3]]'&&JSON.stringify(elected.scores)==='[1,2]'&&elected.recipient===elected.members[1],'ElectedConsequenceMismatch');
 requireProof(JSON.stringify(tie.groups)==='[[1],[2],[3]]'&&JSON.stringify(tie.scores)==='[1,1,1]'&&tie.recipient===tie.sponsor,'TieConsequenceMismatch');
 const authority=[];
 for(const round of [elected,tie]){
  const motions=[],ballots=[];
  for(let slot=1;slot<=3;slot++){
   const motion=JSON.parse(await read(target,'get_motion',[round.id,slot]));
   const ballot=JSON.parse(await read(target,'get_ballot',[round.id,slot]));
   requireProof(motion.round===round.id&&motion.slot===slot&&motion.actor===round.members[slot-1]&&motion.configDigest===round.configDigest&&motion.digest===round.motionDigests[slot-1]&&motion.text===round.motions[slot-1]&&motion.submittedAt>=round.createdAt&&motion.submittedAt<round.proposalDeadline,'MotionAuthorityMismatch');
   requireProof(ballot.round===round.id&&ballot.slot===slot&&ballot.actor===round.members[slot-1]&&ballot.slateDigest===round.slateDigest&&ballot.choice===round.ballots[slot-1]&&ballot.castAt>=round.proposalDeadline&&ballot.castAt<round.voteDeadline,'BallotAuthorityMismatch');
   motions.push(motion);ballots.push(ballot);
  }
  const attempt=JSON.parse(await read(target,'get_attempt',[round.id,round.attemptCount]));
  requireProof(attempt.sourceStatus==='OK'&&attempt.slateDigest===round.slateDigest&&attempt.round===round.id,'SemanticAttemptMismatch');
  authority.push({round,attempt,motions,ballots});
 }
 const accounting=JSON.parse(await read(target,'get_accounting')),nativeContractGEN=gen(await balance(target));
 const creditsGEN=await Promise.all(elected.members.map(member=>read(target,'get_credit',[member])));
 requireProof(accounting.escrowGEN==='0'&&accounting.creditGEN==='0'&&BigInt(accounting.receivedGEN)>=10n&&accounting.receivedGEN===accounting.withdrawnGEN&&nativeContractGEN==='0'&&creditsGEN.every(x=>x==='0'),'ActiveValueNotFullyRecovered');
 const deliveries=[];
 for(const name of ['run3-election','run3-cancel','run3-expiry','run3-expired-tie','run4-tie']){
  const delivery=await loadJournal('lifecycle-'+name+'-delivery.json'),withdrawal=await loadJournal('lifecycle-'+name+'-withdraw.json');
  requireProof(delivery?.deliveryProven&&delivery.balanceProven&&withdrawal?.verified&&withdrawal.target.toLowerCase()===target.toLowerCase()&&withdrawal.hash===delivery.parentHash,'NativeDeliveryProofMissing');
  deliveries.push({file:'lifecycle-'+name+'-delivery.json',parentHash:delivery.parentHash,recipient:delivery.recipient,valueGEN:delivery.expectedTransferGEN,contractBeforeGEN:delivery.contractBeforeGEN,contractAfterGEN:delivery.contractAfterGEN,recipientDeltaNote:delivery.recipientDeltaNote??'Isolated recipient delta within the funded protocol-fee bound.'});
 }
 const archived=await loadJournal('revision-001-deployment.json');
 const archivedAccounting=JSON.parse(await read(archived.address,'get_accounting')),archivedNativeGEN=gen(await balance(archived.address));
 requireProof(archivedAccounting.escrowGEN==='0'&&archivedAccounting.creditGEN==='0'&&archivedAccounting.receivedGEN===archivedAccounting.withdrawnGEN&&archivedNativeGEN==='0','SupersededValueNotRecovered');
 const result={...network,command:'node scripts/lifecycle-audit.mjs',checkedAt:new Date().toISOString(),target,deployedSourceCommit:deployment.sourceCommit,sourceSha256:source.sourceSha256,rounds:authority,terminalCases:rounds.map(r=>({id:r.id,status:r.status,escrowGEN:r.escrowGEN,recipient:r.recipient,reason:r.reason})),accounting,nativeContractGEN,creditsGEN,deliveries,superseded:{target:archived.address,accounting:archivedAccounting,nativeContractGEN:archivedNativeGEN},browserWriteProven:false,passed:true};
 await save('lifecycle-audit.json',result);
 console.log(JSON.stringify({passed:true,network:network.network,target,terminalDemoCases:rounds.length,authenticatedMotions:6,authenticatedBallots:6,semanticConsequences:2,nativeDeliveries:deliveries.length,accounting,nativeContractGEN,supersededNativeGEN:archivedNativeGEN,browserWriteProven:false}));
}
try{await main();}catch(error){console.log(JSON.stringify({lifecycleAuditStopped:safeError(error)}));process.exitCode=1;}
