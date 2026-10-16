# Studio Dev verification

Revision1 is SUPERSEDED_RECOVERED. Both2GEN round budgets were refunded and
withdrawn; final native balance, escrow and credit were0GEN. Its immutable
identity, unsuccessful review and all accepted/finalized receipts remain in
revision-001.json and its referenced evidence. It is not the active product.
The replacement source changes only bounded transport normalization. It still
requires a fresh exact-source deployment and consequential lifecycle.

Network identity:61997; IC and wallet RPC https://studio-next.genlayer.com/api;
Explorer https://explorer-studio-dev.genlayer.com. No network migration occurred.

`node scripts/deploy.mjs --execute` recovered source-bound deployment
`0xA78E771B40C017ff88520ff2fc632cF37cf60A88`, transaction
`0x3275a16da79952af5b50f33015139a84f35cd078f7d70acd59390dce03f3d3fe`.
Observed PENDING -> ACCEPTED -> FINALIZED, execution SUCCESS; deployed code and
14-method schema matched disk. Initial liabilities and native balance were0GEN.
The Explorer GenVM Execution section separately showed SUCCESS/Return.
The first rejected EVM envelope is archived as deployment-archive-001.json;
it created no contract and is never counted as deployment success.

`node scripts/fund-actors.mjs --execute`: two native transfers of exactly1GEN,
receipts0x1 and exact recipient balance increases. Both files are per-network
public projections; keys stay in ignored local configuration. These native
confirmations are not Intelligent Contract consensus receipts.

`node scripts/network-smoke.mjs --execute`: a member2-signed zero-application-
value call claimed the sponsor as ABI sender. The current network retained
member2 as both caller and origin. Execution rejected the empty withdrawal;
accounting and contract native balance remained0GEN. This bounded target check
addresses the historical sender-spoof report, not every possible network flaw.
Reference: https://github.com/genlayerlabs/genlayer-studio/issues/1768.

Fee simulation initially failed the temporal-window guard while the identical
request with current simulation time returned SUCCESS. The official implementation
passes an absent write timestamp through unchanged unless sim_config supplies it:
https://github.com/genlayerlabs/genlayer-studio/blob/main/backend/protocol_rpc/endpoints.py
and https://github.com/genlayerlabs/genlayer-studio/blob/main/backend/node/base.py.
Only unsigned fee simulation supplies current time; actual signed writes retain
network transaction time. The change does not grant a caller a clock override.

Current Studio consensus can append synthetic idle receipts with execution ERROR
after quorum. The exact control signal is documented in
https://github.com/genlayerlabs/genlayer-studio/blob/main/backend/consensus/base.py
(`_build_synthetic_idle_receipt`). The parser requires a successful actual leader
and normalized FINISHED_WITH_RETURN, then excludes only validator/idle receipts
with CONSENSUS_VALIDATOR_QUORUM_REACHED. Direct failure and unknown errors remain
failures. The first round creation was reconciled from its existing hash and
canonical2GEN escrow instead of being signed again.

`node scripts/lifecycle.mjs` is read-only inspection. `--execute --case=election`,
`--case=cancel` and `--case=expiry` are resumable real writes. Each operation saves
its predicted hash before transport, observes finality, and reads canonical views.
Full real review, native-delivery and browser-wallet evidence are pending until
their corresponding records and balance checks complete. Script signatures do
not establish browser-wallet proof. No CI or public hosting is claimed here yet.

The initial council round's third motion arrived six seconds after its immutable
proposal cutoff and finalized with the expected `motion time closed` error.
Its canonical round and2GEN escrow were unchanged. The second round uses a wider
proposal window; the first round's budget must still be recovered after expiry.
Neither an expected rejection nor a synthetic idle validator is counted as a
successful product consequence.

`node scripts/evidence-timeline.mjs` reconciled13 current IC hashes:11 successful,
2 expected rejections,0 unexpected failures. Each has accepted and finalized UTC
timestamps projected from official monitoring fields, plus references to its
canonical before/after records. This checkpoint predates the semantic review
and is not the final lifecycle count.

The unsuccessful review had the same leader classes (12/13 DIFFERENT,23 SAME)
in three rotations, while several validators rejected nondet block0; a later
leader failed strict semantic JSON parsing. A zero-application-value control
with complete-fence normalization finalized SUCCESS and matched independently
derived semantic classes. This supports transport formatting as the repair
target; it does not prove every provider's exact rejected raw text. No raw model
outputs, node configurations or private traces are included in public evidence.

Revision1's final timeline contains18 transactions:15 successful,2 expected
rejections and1 unsuccessful consensus review. That review is not counted as a
settled outcome. Both purse exits additionally have parent-attached external EVM
execution receipts with executionRecorded=true and matching delivered finalized
2GEN value effects; each exact native contract decrease is2GEN. Studio exposes
no separate child hash for these native exits. The diagnostic control held0GEN.

## Active revision2 checkpoint

The active contract is `0xFB0943A725499C65D49254168Dce37AFdb949a81`, deployed by
`0xc9feec56c54c9a72d56274753000b644234e9114f4c8220cbdd4e73d2ad310a2`.
Its exact source SHA256 is
`2182b042117cf8a0cc7f6c0e4c2eb95a5bc7244cf50b6d9b65e2bc0c4e1cd51e`;
deployment/source commit is `e2338e86604a09227c34989f535d16baa040659a`.
Deployment, exact deployed code,14-method schema and caller-authority smoke pass.
Revision1 is archived as SUPERSEDED_RECOVERED, not the active product identity.

`node scripts/lifecycle.mjs --execute --case=election --run=3` completed:
the actual independent semantic review finalized SUCCESS with pair12/13 DIFFERENT
and pair23 SAME. Groups[[1],[2,3]] scored[1,2]; code elected slot2 and vested2GEN
to member2. Review transaction:
https://explorer-studio-dev.genlayer.com/tx/0x9e4a5c16338f67095a9b1896d4a1d6eabd7af106af41d2d402eb72dfb46571b6.
Member2's withdrawal finalized SUCCESS, exact native decrease2GEN ->0GEN,
credit/escrow0GEN and recipient net increase1.999873694749999177GEN.
The external execution receipt independently proves delivered value2GEN.

The empty cancellation case also completed on revision2: sponsor refund/withdrawal,
native2GEN ->0GEN and zero credit/escrow, cumulative received/withdrawn4GEN.
The incomplete-expiry case recovered2GEN while another round's2GEN stayed in
escrow. Its exact contract decrease was4GEN ->2GEN and its external receipt proves
delivery2GEN. The recipient's aggregate delta additionally includes an overlapping
ballot's protocol fee refund. The delivery record retains that distinction and
the original failed isolated-delta check; no extra payout or exact fee split is
claimed. `node scripts/verify-deliveries.mjs` rechecks the external and balance
proofs, including the separately finalized same-recipient refund receipt.

Studio returned HTTP429/RPC-32029 during repeated reads. Read-only backoff is
bounded to four attempts for explicit rate/capacity codes; execution/authentication
errors are not retried, and signing/broadcast is never automatically repeated.
Upstream admission/rate-limit reference:
https://github.com/genlayerlabs/genlayer-studio/blob/main/backend/protocol_rpc/endpoints.py.
The hosted limits are not inferred from upstream defaults. A missed tie window
requires recovery; its replacement tie case and final ledger reconciliation are
still in progress at this checkpoint. Browser writes are separately pending.

## Completed revision2 network acceptance

`node scripts/lifecycle-audit.mjs` exit0 returned passed=true,5 terminal demo
cases,6 authenticated motions,6 authenticated ballots,2 semantic consequences
and5 native delivery proofs. The pooled majority elected slot2; the three-way
meaning-class tie refunded the sponsor. Empty cancellation, incomplete expiry
and the earlier missed-window round each returned their own2GEN. The active
contract received10GEN and withdrew10GEN; native balance, escrow, total credit
and all three demo-wallet credits are0GEN. The superseded revision's current
native balance and liabilities are also0GEN.

`node scripts/verify-deliveries.mjs` exit0 verified7 delivery records:5 from the
active revision and2 historical recovered exits. Every payout is2GEN, backed by
an external execution/delivered-value receipt and an exact2GEN native contract
decrease. The one non-isolated recipient delta retains its separate fee-refund
receipt and explicit bound; every other delta is isolated within its fee bound.

Hosted rate responses supplied limit500 and Retry-After advice. The precise
hosted bucket/window is not claimed. Reads and unsigned fee quotations honor
bounded retry advice; transaction broadcasting is not automatically retried.
Polling now waits6seconds. Browser signing is not established by these script
signatures; the canonical audit explicitly records browserWriteProven=false.
