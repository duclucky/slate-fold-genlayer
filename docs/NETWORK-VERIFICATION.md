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
