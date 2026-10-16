export type RoundStatus = 'COLLECTING'|'BALLOT_OPEN'|'READY_FOR_REVIEW'|'RETRYABLE'|'ELECTED'|'REFUNDED'|'CANCELLED';
export interface Round {
 id:string; title:string; objective:string; sponsor:string; members:string[]; status:RoundStatus;
 configDigest:string; slateDigest:string; motions:string[]; motionDigests:string[]; ballots:number[];
 proposalDeadline:number; voteDeadline:number; reviewDeadline:number; attemptCount:number;
 groups:number[][]; scores:number[]; recipient:string; reason:string;
}
export interface NewRound {id:string;title:string;objective:string;members:string[];proposalDeadline:number;voteDeadline:number;reviewDeadline:number}
export type Action='create_round'|'submit_motion'|'cast_ballot'|'review_round'|'cancel_round'|'recover_round'|'withdraw_credit';
export type TxStage='estimating'|'signing'|'submitted'|'accepted'|'finalized'|'failed'|'retry';
export interface Adapter {
 list():Promise<Round[]>; round(id:string):Promise<Round>; credit(address:string):Promise<string>;
 write(action:Action,args:unknown[],valueGEN:'0'|'2',onStage:(stage:TxStage,hash?:string,feeGEN?:string)=>void):Promise<void>;
}
export const unavailable:Adapter={
 async list(){throw new Error('Contract connection is not configured yet. You can explore the guide; council records will appear when a verified deployment is connected.');},
 async round(){throw new Error('Contract connection is not configured yet. No council record has been loaded.');},
 async credit(){throw new Error('Contract connection is not configured yet. Your GEN credit has not been read.');},
 async write(){throw new Error('Contract connection is not configured. No transaction was submitted.');}
};
export const terminal=(r:Round)=>['ELECTED','REFUNDED','CANCELLED'].includes(r.status);
export const labels:Record<RoundStatus,string>={COLLECTING:'Collecting motions',BALLOT_OPEN:'Voting window',READY_FOR_REVIEW:'Ready to group votes',RETRYABLE:'Review needs another attempt',ELECTED:'Motion funded',REFUNDED:'Budget returned',CANCELLED:'Round cancelled'};
export function actionsFor(r:Round,address:string|undefined,now:number){
 const member=r.members.findIndex(x=>x.toLowerCase()===address?.toLowerCase());const sponsor=!!address&&r.sponsor.toLowerCase()===address.toLowerCase();const live=!terminal(r);
 return {
 submit:live&&member>=0&&!r.motions[member]&&now<r.proposalDeadline,
 vote:live&&member>=0&&r.motions.every(Boolean)&&!r.ballots[member]&&now>=r.proposalDeadline&&now<r.voteDeadline,
 review:live&&!!address&&r.motions.every(Boolean)&&r.ballots.every(x=>x>0)&&now>=r.voteDeadline&&now<r.reviewDeadline,
 cancel:live&&sponsor&&r.motions.every(x=>!x)&&now<r.proposalDeadline,
 recover:live&&sponsor&&now>=r.reviewDeadline
 };
}
export const short=(s:string)=>s.length>16?s.slice(0,6)+'…'+s.slice(-4):s;
export const date=(n:number)=>new Date(n*1000).toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'});
