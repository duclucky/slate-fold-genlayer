// Synthetic fixtures for tests only. Never imported by the production app.
import type {Round} from './model';
export const members=['0x1111111111111111111111111111111111111111','0x2222222222222222222222222222222222222222','0x3333333333333333333333333333333333333333'];
export const roundFixture:Round={id:'test-round',title:'Research archive council',objective:'Choose the archive access commitment the council will fund.',sponsor:members[0],members,status:'COLLECTING',configDigest:'c'.repeat(64),slateDigest:'s'.repeat(64),motions:['','',''],motionDigests:['','',''],ballots:[0,0,0],proposalDeadline:100,voteDeadline:200,reviewDeadline:300,attemptCount:0,groups:[],scores:[],recipient:'',reason:''};
