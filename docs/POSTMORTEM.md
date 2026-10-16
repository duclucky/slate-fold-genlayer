# SlateFold delivery postmortem

2026-10-16. Projects V1 is technically verified and submitted to Portal, pending
steward review. Submission91cf547f-d1fd-4647-a7df-c734840c9f83 is not acceptance.

## What was validated

One reusable SlateFoldContract owns authenticated constitutive motions/ballots,
independent semantic equivalence, deterministic majority allocation and native
accounting. Three real semantic outcomes and six terminal cases delivered six
separate2GEN exits on Studio Dev. Active accounting is12GEN received and12GEN
withdrawn; native balance, escrow and credits are0GEN. Revision1 was separately
recovered to0GEN. No separate consumer contract was required by this boundary.

The complete React/Vite app was built in this run after local design-skill
guidance. Actual Chrome/OKX signed the primary create/motion/ballot/review/
withdraw journey; two peer motions and two peer ballots used script signatures.
The223-case local and Linux CI checks passed with no skips/xfails. The unchanged
full Projects precheck reported0BLOCKER and1 reviewed lexical warning, exit1.
Its17/20 estimate is not an official score.

## Lessons and prevented failures

1. **Keep runtime and API together.** An upstream runner hash failed isolated
   schema/constructor controls. Retaining the verified5jyc/v0.3 unit was safer
   than mechanically renaming imports against an incompatible runtime.
2. **Normalize transport without repairing meaning.** Plain/fenced model JSON
   initially disagreed. Bounded complete-fence removal fixed transport variance;
   duplicate keys, extra payout fields and non-transitive relations still reject
   before mutation. The failed revision's purses were recovered before replacement.
3. **Quote the actual protocol fee.** Successful gas estimation did not imply
   fee admission. The value envelope now keeps exactly2GEN application value
   plus a separately quoted protocol fee. Actual-SDK adapter tests guard it.
4. **Parent finality is not native delivery.** Every exit requires an exact
   contract native decrease and matching external execution/delivered-value
   evidence. An overlapping fee refund enlarged one recipient observation;
   the original isolated check remains false and the bounded overlap is explicit.
5. **Time windows must tolerate real signing latency.** RPC admission limits
   caused one round to miss voting. It expired and recovered safely. No script
   advanced a stale phase to bypass entrypoint clocks; a new wider-window round
   supplied the actual tie result.
6. **Reconcile before retry.** Read failures after withdrawal never caused a
   second send. The same finalized hash and canonical native/accounting state
   established completion. A narrow UI correction now gives actionable read
   recovery text; all write logic and the established CSS remained unchanged.
7. **Test the actual delivery environments.** A Linux CI install caught an
   unconditional Windows-only dependency. A platform marker fixed it. Vercel
   upload manifests were compared against reviewed Git bytes so local controls,
   secrets and dependencies never entered the17-file upload.
8. **Admission is not execution.** Design PASS preceded code. Gate13 became
   PASS_EXECUTION only after actual wallet signatures, finality, canonical reads
   and delivered native value. Browser cancellation/recovery and a network
   RETRYABLE semantic outcome remain unclaimed.

## Evidence authority and limits

Wallet authors are authoritative only for their own protocol choices. A digest
does not authenticate offchain work, legal authority or human identity. The
independently fetched W3C reference supplies vocabulary; it cannot authorize a
payout. Objective, membership, rule version, destinations and2GEN amount come
from immutable state. Models only compare complete motion-pair meanings.

The demo wallets share one operator. No independent adoption, Sybil protection,
secret voting, formal clone independence, strategy-proofness, guaranteed model
correctness or Safe/agent execution is claimed. Intermittent503/timeouts were
observed; their service-side root cause was not established. The Portal review
and any official points remain external pending outcomes.

## Next substantial milestone

After V1 is accepted, weighted multi-seat councils plus an authenticated Safe or
agent execution gateway could extend the accepted version. The gateway must
enforce the finalized elected mandate at its actual execution boundary, with
sender authentication, replay protection, destination/value limits and live
delivery proof. Weighted tally fairness, partial overlaps and recovery need
their own admission/specification and tests. This is planned functionality,
not a present integration or a cosmetic resubmission.
