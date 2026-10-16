# Pre-submission audit

2026-10-16 checkpoint. Status: **TECHNICAL_ACCEPTANCE_PASS**.
Static no-BLOCKER and passing tests do not establish browser signing or full
submission readiness. The completed Portal contribution is now Pending review;
its exact ID and inspected evidence links are recorded in portal-submission.json.

## Four-source cross-check

| Claim | Contract source and canonical view | Executed tests | Actual network evidence | Public/product claim |
|---|---|---|---|---|
| Only a named member authors one immutable motion | submit_motion, _caller, _config, _authenticated_inputs; get_motion/get_round | test_authority.py: test_forwarded_actor_rejected_before_any_state, test_wrong_member_and_version_and_replay_do_not_change_motion; test_judgment.py: test_hash_valid_motion_wrong_authority_binding_cannot_settle | lifecycle-audit.json verifies6 canonical signed motions and exact actor/slot/config/time bindings | Constitutive commitments only; no external identity or work attestation |
| One authenticated ballot per member for the exact slate | cast_ballot and _authenticated_inputs; get_ballot | test_ballot_wrong_slate_and_duplicate, test_ballot_wrong_canonical_binding_before_judgment, test_ballot_own_clock_stale_phase | lifecycle-audit.json verifies6 canonical ballots across two reviewed rounds | Public ballots by three registered wallets, not proof of distinct humans |
| Independent semantic agreement controls grouping | review_round leader/validator -> _judge -> _review_result/_groups; get_attempt | test_validator_replay_rejects_different_meaning_and_invalid_leader, test_validator_reruns_source_and_model_after_leader, test_validator_compares_meaning_across_plain_and_fenced_json | Successful majority and tie review receipts, source-bound active deployment | Validator comparison covers all normalized pair meanings; not just output shape |
| Reference authority is fixed before semantic use | _judge fixed HTTPS source,300000-byte bound and raw SHA256 check before exec_prompt | test_source_failure_and_valid_actor_hash_cannot_credit has no LLM mock; reaching judgment on a bad source fails | Active get_round source/sourceHash and successful canonical attempts; runtime fetched source is the pinned W3C body | Reference vocabulary only; source does not authorize arbitrary payments |
| Invalid output cannot credit | _relations exact keys/enums/duplicate rejection; _groups transitivity; deterministic tally before mutation | test_invalid_settlement_meaning_reverts_before_mutation, test_transport_normalization_never_repairs_invalid_settlement_meaning | Consequences derive from valid real groups/scores; malicious variants are direct-test evidence | No model winner/payee/amount; root/downstream are unsupported and rejected |
| Fixed2GEN grant or sponsor refund | review_round -> _credit; get_round/get_credit/get_accounting | test_review_derives_group_majority_and_credit_once, test_majority_recipient_derived_from_locked_slot_not_sponsor | Majority slot2/group23 and all-distinct tie, both finalized SUCCESS | Earliest representative priority is disclosed before participation |
| Recovery cannot duplicate or orphan a committed purse | cancel_round/recover_round -> _credit; get_accounting/get_credit | test_recovery_wrong_caller_unchanged, test_recovery_credit_once_and_reject_terminal, test_cancel_after_participation_rejects, temporal tests | Empty cancel, incomplete expiry and missed-window recovery all completed with own2GEN exits | Exact cutoffs and sponsor-only recovery; no keeper dependency |
| Withdrawal is a real delivered native exit | withdraw_credit debits own ledger before _Recipient EVM emit_transfer; get_credit/get_accounting | test_withdraw_other_owner_and_duplicate_cannot_debit, metadata and external-delivery/balance tests |5 active and2 recovered historical deliveries; exact2GEN native decreases plus external execution/delivered-value receipts | Parent finality alone is insufficient; Studio supplies no separate native child hash |
| Product uses canonical state and selected provider | Actual SDK adapter createClient selected account/provider, read proxy and finality poll |99 frontend cases, including real-SDK value envelope, role/time gating, selected provider, logout, pending duplicate, failure/retry and canonical reload | Five primary Chrome/OKX writes finalized, real read-error recovery, current production Account0GEN/History6 and logout observed; browser-lifecycle-audit.json | Browser primary journey PASS; four peer actions explicitly script-signed |

Test names resolve to tests/direct/test_authority.py, test_judgment.py and
test_lifecycle.py. Public metadata checks are in tests/tooling/test_metadata.py.
Frontend tests are in frontend/src/{App,adapter,model,proxy,wallet}.test.*.
The specification's threat matrix now links implemented cases rather than
unimplemented design-family names.

## Entry points and accounting

Exactly one ASCII product source class, SlateFoldContract, is recognized by lint.
Its pinned5jyc runner and v0.3 API remain unchanged from the verified deployment.
Seven public writes and seven views are present. Only create_round is payable.
All public writes reject forwarded actor spoofing. New creation has no prior
owner: its authenticated payer becomes sponsor, so arbitrary caller creation is
intentional. Review is callable by any direct caller only with the full slate,
all ballots, a legal state and its own time window. Withdrawal has no temporal
gate because an already vested own credit does not expire.

Create, submit, ballot, cancel, review and recovery each have their own boundary
tests at-1, equality and+1; rejected cases assert unchanged round/accounting.
Recovery and withdrawal prove role restrictions, one-time credit/debit and
terminal/empty-credit rejection. Root-cause/downstream graphs are N/A for this
symmetric equivalence protocol; extra fields and invalid classes are rejected.
No split or rounding residual exists: the entire2GEN goes to one locked owner.

Latest full local command `npm run check` passed104 Python (100 direct,4 tooling),
20 Node and99 frontend tests,223 total,0 skips/xfails, lint, TypeScript and production build.
The separate `gltest tests/` run passes the same104 Python cases; do not add them
again. Native receipt checks are supplementary Node cases, not extra contracts.

## Unmodified full precheck

The Projects precheck ran without SkipDynamic or grader edits against this child,
with its public repository and Studio Dev contract Explorer URLs. Output:
`Summary: 0 BLOCKER, 1 WARN, 7 auto-verified OK`, `npm run check: PASS`,
`gltest: PASS`, all five rubric gate items PASS, estimate17/20. Exit code1 retains
the warning/missing/manual-review status; it is not presented as a clean exit0
or an official steward score. The command/output and sanitized report are kept
as evidence. The three automatic MISSING labels are reviewed as follows:

The final run includes the current223-test source and the972-character notes
file. npm check and gltest both PASS; the one WARN and three heuristic MISSING
labels remain intact. All original grader-file SHA256 hashes match the initial
run. The current browser proof separately satisfies the manual primary-wallet
criterion; it does not change or inflate the grader's17/20 estimate.

[Sanitized full-check result](evidence/studio-dev/pre-submission-check.json)
binds the command, source commit/hash, all three unchanged tool hashes, static
counts, dynamic outcomes and original warning/manual status. The checker counts
972 characters including the description file's final newline; the copy-ready
paragraph itself contains971. Both are within1000.

- The custom validator is `gl.vm.run_nondet_default(leader, validator)`, not the
  older spelling the heuristic looks for. Validator replays demonstrate rejection
  of different meanings and acceptance across equivalent transport formatting.
- Simulation fixtures are test-only; the production adapter uses actual SDK and
  selected wallet I/O. Five primary browser signatures now also have actual UI
  and finalized canonical/native-exit proof; peer script signatures stay separate.
- Production localStorage contains only slatefold.wallet-choice (a wallet name).
  Accounts, balances, rounds and finality are always read live; logout removes
  that preference. It is not canonical wallet/finance storage.

The static warning points to gl.nondet in _judge, outside the lexical inner
leader body. The actual chain is review_round -> run_nondet_default -> leader ->
_judge; validator independently calls leader. No deterministic entrypoint calls
_judge outside that sandbox. Semantic lint, captured validator replay and three
actual successful network reviews support this review. The warning is preserved.
The grader's generic Studionet reminder does not change the selected Studio Dev
network or permit mixed evidence.

## Remaining acceptance

The exact submitted-description draft is971 characters after trimming its final
newline (972 including newline), within the observed1000-character Portal limit.
Its title/one-liner/outcome and all links
are in SUBMISSION.md; the actual submitted paragraph was inspected in Portal.

The production-origin account was connected and the user signed all five
primary actions. browser-lifecycle-audit.json returned passed=true with exact
native2GEN ->0GEN delivery and global12GEN received/12GEN withdrawn. Gate13
is PASS_EXECUTION from those receipts, canonical views and native proof, not
from design. The baseline script-only audit's browserWriteProven=false is scoped
to that witness; it does not override the separate actual browser audit.

The browser actions ran on4e03472. The current32bddef frontend changes only
read-error presentation after a real temporary failure. Its new regression
observed RED on SDK/version diagnostic leakage, then GREEN on actionable
guidance and a successful canonical retry with no wallet write. All write code
and successful read behavior are preserved. Fresh actual-SDK account/value
preflight,223 local/CI cases, new production Account0GEN/History6 and logout
passed. Both source manifests and the superseded host identity are retained.

Read-only verification observed intermittent HTTP503/timeouts. It never
rebroadcast the finalized withdrawal. Native receipt/balance proof subsequently
passed from that same hash. Timestamp harvesting preserves the previously
verified33 immutable finalized receipts and explicitly dates the9 new browser-
council records; it does not relabel earlier observations as fresh RPC reads.

CI38874072324 for submitted public commit1f0ec53 completed SUCCESS. Portal now
shows SlateFold, Builder/Projects, Pending review, four evidence items and ID
91cf547f-d1fd-4647-a7df-c734840c9f83. The post-submission documentation checkpoint,
final master reread and39-item proof are recorded in FINAL-ACCEPTANCE.md.
Actual browser cancellation/recovery, real-network semantic RETRYABLE and
external adoption are not claimed. Steward acceptance remains pending.
