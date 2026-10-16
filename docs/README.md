# SlateFold product specification

## Identity

- Idea: IDEA-046; category: Projects; status: BUILDING (specification admission verified; execution pending).
- Independent child repository: slate-fold. Public source: https://github.com/duclucky/slate-fold-genlayer.
- Target: Studio Dev61997; IC RPC follows verified workspace D1.
- Runtime: GenVM v0.3 with verified5jyc runner. Current upstream9b8 runner failed
  isolated schema/constructor controls with and without a pragma; this is recorded
  rather than treated as a compatible upgrade.

## Product hook

Fund the motion your council supports, even when members describe the same commitment differently.

SlateFold is an agreed ballot rule for a fixed three-wallet council. A sponsor
locks2GEN. Each named member accepts the exact configuration by submitting one
immutable motion, then casts one ballot for one exact motion. Validators decide
only which motions have materially the same meaning. Contract code pools each
ballot once, elects a unique majority meaning class, and credits the full2GEN to
that class's first registered representative. A tie or expiry returns2GEN to the
actual sponsor. Representative priority is explicit before assent; it is not a
claim of equal compensation among equivalent authors.

## Scope

V1 covers public fixed-wallet councils, signed constitutive motions/ballots,
neutral meaning review, deterministic majority selection, retry, cancellation,
expiry recovery, native GEN credits and own-wallet withdrawal. It does not prove
delivery, external identity, legal governance, secret voting, Sybil resistance,
formal clone independence, strategy-proofness, Safe execution or adoption.
All membership is explicit and fixed. No model ranks motions or chooses money.

## Provisional capability sketch

Sponsor: fund/create2GEN; inspect participation; cancel only before any member
motion; recover unresolved value after the immutable deadline. Named members:
submit exact motion with configuration digest; cast one immutable ballot with
slate digest. Anyone: request eligible review and read public canonical state.
Credit owner: withdraw exact earned/refunded GEN. Every write waits for successful
finalization and reloads canonical views. Missing contract/RPC/wallet configuration
is a real unavailable state, never a successful demo.

Expected states: COLLECTING, BALLOT_OPEN, READY_FOR_REVIEW, RETRYABLE, ELECTED,
REFUNDED, CANCELLED; transaction states submitted, accepted/decided, finalized,
failed and unresolved/retry. Canonical phase and timestamp remain separate.
Creation, submission, ballot, review and recovery must each enforce their own
specified transaction-time interval; final specification locks those intervals.

Minimum views: configuration/roles/deadlines/digests; motion and ballot per slot;
current attempt and history; semantic groups; elected representative or refund
reason; own GEN credit; liability/accounting. The product must never infer a
winning result from submission or an unfinalized transaction.

## Human users and journeys

| Role | Job | Complete journey |
|---|---|---|
| Sponsor | Open and fund a clear council decision | Discover -> create round -> share exact round -> follow participation -> see elected result/refund -> withdraw own refund if due |
| Member | State a commitment and express one choice | Find round -> inspect rules/roles/priority -> submit motion/assent -> read complete slate -> sign ballot -> revisit result |
| Credit owner | Receive the actual vested amount | Account -> read canonical credit -> withdraw -> wait for finalization -> reload credit/result |

## Information architecture and named route map

Persistent header: Home, Rounds, History, Help; primary New round CTA; wallet
button opens selection or connected-account menu with Account and Disconnect.
On mobile the navigation wraps into an accessible second row; no hidden route.
Every deep page includes a descriptive heading and back-to-rounds link.

| Route | User purpose | Primary action | Required states | Mobile |
|---|---|---|---|---|
| / | Understand pooled intent voting and its limits | Explore rounds | Honest network/config availability, explanation; no fake telemetry | Stacked hero and process |
| /rounds | Find current council decisions | Search/filter and open a round | Loading, no rounds, no search results, RPC error/retry, canonical list | Single column cards |
| /rounds/new | Define members and time windows before funding | Create2GEN round | Wallet/network missing, labels/validation, submitted/finalized/error; no premature success | Grouped fieldsets, full width inputs |
| /rounds/:id | See participation and legal next action | Open current step | Canonical role/state, deadlines, loading/notfound/error, outcome | Summary then step navigation |
| /rounds/:id/motions | Read rules and author one commitment | Submit immutable motion | Own slot empty/filled, wrong role, phase closed, transaction stages | Stacked readable motion cards |
| /rounds/:id/ballot | Compare the complete slate and choose | Cast one ballot | Timing/role restriction, already voted, incomplete slate, finality/error | Radio choices with full text |
| /rounds/:id/result | Request review or understand final outcome | Review when eligible | Ready, in progress, retryable, elected, refunded; recovery/cancel only when legal | Groups and tally have textual labels |
| /history | Revisit terminal round outcomes | Filter/open result | Loading/empty/error and real finalized results only | Search plus stacked list |
| /account | Inspect selected wallet and receive vested GEN | Withdraw available credit | Disconnected, loading, zero credit, positive credit, write states/error | Wrapping address, no clipped amounts |
| /help | Learn the actual rule, risks and recovery | Context links to rounds/account | Static factual guidance and useful links | Readable prose |

## Visibility matrix

| Group | Visibility | Eligibility | Need |
|---|---|---|---|
| Purpose, member motions, deadlines, next action, outcome | USER_PRIMARY | Everyone reading the round | Make an informed council decision |
| Motion submission and ballot | USER_CONTEXTUAL | Named member in its legal interval and unfilled slot | Complete own participation |
| Review/retry | USER_CONTEXTUAL | Exact complete slate/ballots, live review interval | Obtain neutral grouping |
| Cancel/recover | USER_CONTEXTUAL | Actual sponsor and exact safe state/time | Recover funded value without overriding member interest |
| Own credit/withdraw | USER_PRIMARY | Connected credit owner | Receive actual vested GEN |
| Transaction hash, raw digests, Explorer | USER_CONTEXTUAL | Expand verification details | Verify one action independently |
| Validator configuration, raw storage, reviewer/submission material | SYSTEM_ONLY | No primary product control | Not a council member task |

## Provisional UI action matrix

| Control | Capability | Role | Legal state | Input/value | Finality | Recovery |
|---|---|---|---|---|---|---|
| Create round | create_round | Sponsor | New ID, future ordered deadlines | Title/objective/3distinct members/deadlines;2GEN | Success plus FINALIZED | Retain form and show error; reconcile hash before retry |
| Submit motion | submit_motion | Exact member | Empty own slot before proposal cutoff | Round/config digest/text;0GEN | Success plus FINALIZED | Retain draft; re-read slot before retry |
| Cast ballot | cast_ballot | Exact member | Complete slate, own ballot absent, ballot window | Choice/slate digest;0GEN | Success plus FINALIZED | Re-read own ballot; do not auto-resend |
| Review / retry | review_round | Anyone | Complete ballots and active review interval; unsettled | Round;0GEN | Distinguish accepted from final | Reload current attempt/state; retain unresolved tx |
| Cancel | cancel_round | Sponsor | No proposals/ballots, before proposal cutoff | Round;0GEN | Success plus FINALIZED | Reload sponsor credit |
| Recover | recover_round | Sponsor | Unsettled, at/after review expiry | Round;0GEN | Success plus FINALIZED | Reload status/credit |
| Withdraw | withdraw_credit | Credit owner | Positive own credit | No arbitrary payee/amount;0GEN input | Success plus FINALIZED | Refresh credit; never infer transfer from signature |

## User-facing language

COLLECTING: Collecting motions. BALLOT_OPEN: Voting window. READY_FOR_REVIEW:
Ready to group votes. RETRYABLE: Review needs another attempt. ELECTED: Motion
funded. REFUNDED: Budget returned. CANCELLED: Round cancelled. SAME: Same
commitment. DIFFERENT: Separate commitments. UNCLEAR: Meaning needs clarification.
Never turn UNCLEAR/UNDETERMINED into a funded result. All amounts display GEN.

## Design source and preservation

The project-local ui-ux-pro-max engine was invoked before frontend code.
First query (community governance council workspace calm medium-density) returned
off-topic Cyberpunk/real-estate typography; rejected and not persisted. One
narrower retry, `collaboration SaaS professional`, returned Soft UI Evolution,
appropriate for a collaborative decision workspace; verified Plus Jakarta Sans,
calm indigo/success-green palette, soft surfaces, visible focus and low motion.
Operations-landing guidance is used only for a value-first explanation and CTA;
no telemetry/demo statistics are fabricated. UX query `keyboard focus modal`
and separate React query `forms routing async state` returned applicable results.

Tokens: primary#6366F1/on-primary#000000, secondary#818CF8/on-secondary#0F172A,
CTA#059669/on-CTA#000000, background#F5F3FF, foreground#312E81, white cards,
muted#EBEFF9/on-muted#475569, border#E0E7FF, danger#DC2626/white, ring#6366F1.
Use 4/8px rhythm, readable text, restrained shadows and 200ms feedback. Native
buttons/inputs, explicit labels, skip link, route focus, keyboard modal trap and
return focus, reduced motion, no horizontal overflow, 375/768/1024/1440 checks.
Do not rely on color alone for status. No animation library is needed.

FE-PRESERVE freezes this language, route arrangement, tokens and component style
after Phase3B. Integration may correct minimum labels/controls/visibility/state,
not regenerate the frontend. FE-HONEST, FE-SURFACE and FE-PRODUCT apply throughout.

## Wallet and adapter boundary

Discover EIP6963 providers plus injected Ethereum/OKX/Rabby/MetaMask/Coinbase/Brave
fallbacks. A centered modal lists detected providers; request accounts only from
the selected provider. Explicit switch/add the verified Studio Dev chain before
writes. IC reads use same-origin /genlayer-rpc; wallet traffic uses selected EVM
provider. Clickable address opens account menu; disconnect clears provider/client
and disables all writes. No keys, burner wallets or canonical localStorage.
Use typed adapter read/write methods; before Phase7 it reports unavailable rather
than inventing fixtures, funds, successful signatures or canonical results.

## Current evidence boundary

Admission and unsigned feasibility12/12 are recorded; local implementation and
Studio Dev lifecycle are now verified below. Browser-wallet writes, public CI,
hosting and submission remain pending. Gate13 is PASS_ADMISSION and requires
the separate browser execution proof before Projects completion.

## Adoption path and milestone headroom

Proposed consumers: DAOhaus motion intake, Safe budget-planning UI, LangGraph
operator council. No consumer is claimed as an adopter. After accepted V1, a
substantial milestone may add weighted multi-seat councils and an authenticated
consumer that enforces the elected mandate at its actual write boundary.

## Phase 3B baseline verification

Before contract authoring, `npm run check` completed with61 frontend cases,
zero skipped, TypeScript and Vite production build passing. Tests cover all10
named routes, every proposed write control, canonical reload after adapter
finality, selected-provider connection, disconnect, chain switching, validation,
role/time gating and honest absent-configuration states. These are local mocked
adapter tests, not SDK or network/browser-signature evidence.
Actual local-browser observations cover landing, create form, rounds/history/help,
375/768/1024/1440 widths without horizontal overflow, and a centered picker listing
OKX and MetaMask. Duplicate injected wrappers were reproduced RED, fixed and
verified GREEN in both tests and browser. No accounts or signatures were requested.
Baseline CSS SHA256:326df247220f963e7c3974c84e6e9bd77c17a841257d149d806d906ffb88ee0a.
Design and route structure are frozen; integration changes remain functional.

## Fingerprint

1. Trust problem: chair/nominee must not privately decide which member motions
   have the same commitment before an agreed funding ballot settles.
2. Actors/adversary: a2GEN sponsor and three named member/nominees; nominees want
   favorable pooling/separation; the sponsor may prefer a refund.
3. Evidence class + authenticity: exact transaction-authored configuration,
   immutable member motions and ballots; runtime sender/role, contract/chain,
   configuration/slate digests and transaction-time windows bind each choice.
4. Consensus question: complete pair12/13/23 materially SAME, DIFFERENT or UNCLEAR
   permission/prohibition/beneficiary/duty commitments; not which proposal is best.
5. State machine: funded collection -> immutable complete slate -> member ballot
   window -> review/retry -> unique majority grant or sponsor refund -> withdrawal.
6. Direct consequence: every ballot contributes once to its meaning class; code
   elects one deterministic representative with fixed2GEN credit or refunds2GEN.
7. Reuse surface: council/motion/ballot/attempt/result/credit/accounting public API
   for independent governance/planning interfaces; no mirror-only consumer.

## Mandatory gate matrix

| Gate | Admission | Evidence/reason |
|---|---|---|
| Replacement | PASS | Ordinary counter cannot derive agreed prose classes; chair/backend makes interpretation unilateral |
| Judgment | PASS | Material sameness includes implicit duties, prohibitions and beneficiary meaning |
| Evidence availability | PASS | Complete bounded canonical records plus successful source/model target probe12/12 |
| Evidence authenticity | PASS | Complete authority rows below; choices are constitutive, never external performance facts |
| Equivalence | PASS | Independent semantic replay; exact3pair relation; rationale excluded |
| Consequence | PASS | Unique majority elects a representative and opens2GEN grant; tie refunds sponsor |
| Adversarial | PASS | Competing nominees and refund-interested sponsor cannot write verdict/tally |
| State model | PASS | Isolated immutable records, append-only attempts, entrypoint clocks, complete recovery/value matrix |
| Reuse | PASS | Generic seven-write/seven-view interface and three named proposed consumers |
| Contract count | PASS | One independent owner of ballots, semantic result and native accounting |
| Differentiation | PASS | Tallying signed member choices differs from model ranking, pricing and selective consent; comparison below |
| Claim-to-code | PASS | All core claims mapped below to interface/state/view/test/evidence plan |
| Full lifecycle | PASS_ADMISSION | All executable acceptance cases specified; PENDING_EXECUTION until actual finalized/browser/native-exit proof |
| Scope honesty | PASS | Public fixed-wallet protocol only; no delivery, legal identity, external execution, adoption or formal clone-independence guarantee |

## Actors and trust boundary

| Actor | Permissions | Value at risk | Incentive |
|---|---|---|---|
| Sponsor/first member | Create/fund, own motion/vote, safe cancel/recover, own credit exit | Exactly2GEN | Prefer funded motion or refund |
| Second/third member | Own immutable motion/assent, one own ballot, own credit exit | No stake; opportunity for fixed grant | Prefer own representative or favorable pooling |
| Any direct wallet | Eligible review, canonical reads | Network fees if applicable | Cannot choose an output or payout |
| Independent validators | Fetch pinned reference and independently judge complete authenticated slate | Consensus responsibility | Cannot set membership, ballot count, amount or destination |

Only direct EOAs may write (sender equals origin). Configuration fixes member order,
objective, rule version and deadlines. Members assent by signing a motion with the
exact configuration digest; votes bind the full exact slate digest. These signatures
do not authenticate offchain work or a human identity. Runtime/consensus itself is
the trust anchor; the hosted development network is not a mainnet security claim.

## Structured storage and isolation

One project-specific `SlateFoldContract(gl.contract.Contract)` with explicit
constructor. Persistent collections are class annotations, never reassigned.
`TreeMap[str, RoundState] rounds`, `TreeMap[str, MotionState] motions`,
`TreeMap[str, BallotState] ballots`, `TreeMap[str, AttemptState] attempts`,
`TreeMap[str, bigint] credits`, and `DynArray[str] round_ids`.
All structs are storage-allowed dataclasses with scalar fields (no nested generic
allocation ambiguity). Money/counters/times use bigint or sized integers, not
bare stored int. Public methods return bounded JSON views assembled from these
structured fields; JSON is a transport representation, not canonical raw storage.

RoundState: ID, title3..80, objective10..500, sponsor, member1/2/3, config_digest,
slate_digest, proposal_deadline/vote_deadline/review_deadline, status, motion_count,
ballot_count, attempt_count, exact relation12/13/23, winner_slot, recipient, escrow,
created_at, settled_at and reason. MotionState: round_id, slot, actor, text<=1200,
config_digest, text_digest and submitted_at. BallotState: round_id, voter_slot,
actor, choice1..3, slate_digest and cast_at. AttemptState: round/slate/attempt ID,
time, source status and exact pair classes. Attempts are append-only.

ID regex `[a-z0-9][a-z0-9-]{0,47}` excludes the composite-key delimiter. Keys are
`round:slot` and `round:attempt`, preventing cross-entity collision. At most100
rounds per instance; paginated listing limit1..20. A fresh instance is the scale
boundary in V1. Existing records, membership, source/rule version and motions have
no overwrite method. Config digest binds version, chain ID, contract address,
round ID, sponsor/member order, objective/title, deadlines and fixed2GEN amount.
Slate digest additionally binds the ordered three authenticated motion digests.

## State machine and temporal policy

`create -> COLLECTING -> BALLOT_OPEN -> READY_FOR_REVIEW -> ELECTED | REFUNDED`.
`review -> RETRYABLE -> review` remains bounded by review expiry. An unparticipated
round may become CANCELLED. Any unresolved state may become REFUNDED through
sponsor recovery at review expiry. No terminal state returns to a live state.
Public status is stored; clocks never silently advance storage. Every write
independently checks its own interval regardless of that stored phase.

Canonical clock: `gl.message.raw['datetime']`, parsed as a timezone-aware ISO
transaction timestamp into integer seconds. This exact v0.3 API is verified in
the pinned runner's official SDK artifact (`genlayer/message.py`), not by copying
the legacy gl.message_raw alias. Missing/naive/malformed time rejects.
Default equality rule: opening includes equality, closing excludes equality.
Creation requires `now < proposal < vote < review` and each window at most86400s.
All subsequent guards refer to those immutable timestamps, never browser time.
Withdrawal is non-temporal because a vested credit must remain receivable.

## Write-method safety matrix

| Method | Caller | Allowed states | Forbidden states | Temporal/expiry gate | Idempotency | Value/accounting effect | Views affected | Negative tests |
|---|---|---|---|---|---|---|---|---|
| create_round(id,title,objective,member2,member3,proposal,vote,review) | Direct sponsor EOA, also member1 | Unused bounded ID, capacity available | Existing ID; invalid/duplicate/zero members; invalid text/windows | now<proposal<vote<review; each interval<=86400s | Duplicate rejects without consuming another purse | Requires exactly2GEN; received and escrow each+2GEN | list_rounds,get_round,get_accounting | Wrong value, existing ID, forwarded caller, invalid config, proposal-1/equality/+1, unchanged accounting on reject |
| submit_motion(id,config_digest,text) | Exact registered member | COLLECTING, empty own slot | Wrong actor/digest; duplicate slot; any terminal or already-complete slate | now<proposal_deadline; equality late, stale phase irrelevant | Duplicate rejects; signed text immutable | Zero input; no GEN movement; locks slate digest only after all3 | get_round,get_motion | Wrong caller/round/actor/version/digest, duplicate, closed, boundary-1/equality/+1; unchanged escrow/credit |
| cast_ballot(id,slate_digest,choice) | Exact registered member | Complete slate; BALLOT_OPEN; own ballot absent | Missing motion; wrong slate; invalid choice; duplicate; terminal | proposal_deadline<=now<vote_deadline | One immutable ballot/member; duplicate rejects | Zero input; no GEN movement | get_round,get_ballot | Wrong caller/round/slate/version, invalid choice, before opening and both deadline boundaries, stale phase, duplicate, closed, unchanged accounting |
| review_round(id) | Any direct EOA | All3 motions and ballots; READY_FOR_REVIEW or RETRYABLE | Incomplete, terminal, invalid provenance or settlement output | vote_deadline<=now<review_deadline | New append-only attempt for valid retry only; terminal duplicate rejects | UNCLEAR/source failure moves no GEN; complete valid result moves full escrow2GEN into one deterministic credit | get_round,get_attempt,get_credit,get_accounting | Wrong state, forwarded caller, time boundaries/stale phase, malformed/extra/missing/duplicate IDs, invalid enums, non-transitive SAME, malicious replay, injection; invariant rejection unchanged |
| cancel_round(id) | Actual sponsor only | COLLECTING with zero motions and ballots | Any participant commitment/ballot; terminal | now<proposal_deadline; equality late | Second cancel rejects without second credit | Full2GEN escrow -> actual sponsor credit once | get_round,get_credit,get_accounting | Wrong caller, any motion, wrong phase, boundary-1/equality/+1, duplicate, finalized; no double-credit |
| recover_round(id) | Actual sponsor only | Any nonterminal unresolved round | ELECTED, REFUNDED, CANCELLED | now>=review_deadline; equality expired even if phase stale | Second recovery rejects | Full2GEN escrow -> actual sponsor credit once; member terms/votes retained | get_round,get_credit,get_accounting | Wrong caller, deadline-1/equality/+1, missing-member and retry states, duplicate/finalized; unchanged on rejection |
| withdraw_credit() | Direct owner of positive credit | Positive own credit; any round phase | Zero credit; arbitrary recipient; forwarded caller | N/A: vested credit persists after expiry/closure | Debit before message; second call cannot reuse debit | Entire own credit -> same EOA via gl.evm.contract_interface; credits down, requested-withdrawn up | get_credit,get_accounting | Wrong owner/forwarded caller, zero/duplicate, rejection unchanged, exact native outgoing message/value and balance proof |

All non-funding entrypoints reject attached value. Payability metadata and direct
value tests must agree. There is no owner override, arbitrary payout method,
callback, signature parser, external provider receipt or administrative settle.

## Evidence policy and Evidence Authority Matrix

Canonical objective, expected member/slot/pair IDs, rule, payee priority and amount
come only from locked contract state. Party prose is untrusted semantic material
and cannot redefine those authorities. Maximum input is3motions*1200chars plus
bounded objective. Public source is fixed HTTPS dated W3C ODRL2018:
https://www.w3.org/TR/2018/REC-odrl-model-20180215/.
Fresh ordinary HTTP probe returned200,181875bytes, raw-body SHA256
`af187a2c26b2429a579039403f34d9a5d5f29a1e01019662043068fa1ca2beaa`.
Before production judgment, validators independently fetch<=300000bytes and
recompute that exact raw-body hash. Source failure or mismatch is RETRYABLE,
never a payment/penalty. Source text is a fixed vocabulary reference, not evidence
of nominee identity, authorization outside this protocol or completed work.
No arbitrary URL, mirror, claimant-hosted file, screenshot or claimed signature
string is admitted. Freshness for constitutive records is transaction time within
the exact slot window; immutable dated source freshness is exact version/hash.

| Consequential claim/fact | Evidence/artifact | Data controller | Authoritative source/issuer | Deterministic verification | Canonical objective/entity/actor binding | Freshness/anti-replay | Semantic role after verification | Non-penalizing failure state | Consequence blocked | Required negative test |
|---|---|---|---|---|---|---|---|---|---|---|
| Sponsor creates this2GEN round under exact rules | Signed payable create and canonical configuration | Sponsor | Runtime authenticated direct sender and received value | Distinct nonzero members; exact2GEN; bounds; ordered future windows; unused ID | Chain/contract/round/sponsor/members/objective/rule/source version included in config digest | Unique ID; signed transaction nonce; tx time before proposal cutoff | Defines agreed objective only, never verdict | Revert before mutation/value acceptance | All grant/refund/election/tally | Matching bytes/digest with wrong roles/value, replay or stale deadlines unchanged |
| Member authors and assents to this motion | Signed submit and exact canonical motion | Named member | Runtime sender equals locked member slot | Config digest equal; slot absent; text bounds; direct caller | Round/member/slot/objective/rule/version through config digest; exact text digest | One slot submission; tx time before proposal cutoff; runtime chain/contract domain | Compare commitment only after authentication | Revert, no hard consequence | Ballot/election/credit | Valid-digest wrong-round/actor/slot/version/replayed/late motion; injection cannot rewrite authority or GEN |
| Member makes one choice for exact complete slate | Signed ballot and canonical3motion slate | Named member | Runtime sender equals locked member slot | Complete authenticated slate; exact slate digest; choice1..3; no prior ballot | Round/member/choice/slate/config/version | One ballot/member; proposal<=tx time<vote cutoff | Deterministic vote input, not model-inferred popularity | Revert before ballot/accounting mutation | Election/credit/settlement | Forged/wrong-round/slate/version, replay, stale and premature choices unchanged |
| Pinned policy vocabulary reference is exactly the reviewed body | Validator HTTPS raw response | W3C publication origin; no nominee controls it | Fixed dated www.w3.org URL and pinned raw hash | Status200; bounded bytes; SHA256 equality before prompt | Source URL/version/hash locked in contract/config; no actor-supplied substitution | Immutable2018version; refetch each attempt; never accept a changed hash as same version | Narrow reference vocabulary, never independent payout authority | RETRYABLE | All election, grant/refund settlement and credit from review | Valid but claimant-controlled hash/body, wrong URL/version and stored-digest mismatch cannot reach judgment/credit |
| Semantic result represents this exact slate | Independent leader/validator runs over locked inputs | No single member supplies trusted output | GenLayer consensus and deterministic normalized-result checks | Exact12/13/23 coverage/enums; transitivity; full coverage; no unsolicited winner/amount | Round/slate/config/attempt captured before nondet; no storage reads in nondet | Append-only attempt before review expiry; terminal review forbidden | Pair meaning only; code derives groups,tally,representative and2GEN | Valid uncertainty records RETRYABLE; malformed output reverts | Every election/settlement/credit/value change | Malicious valid-shape wrong class, extra/missing/duplicate ID, unsupported root/downstream fields, inconsistent group; no accounting mutation |

Every provenance-tripwire keeps bytes/digest stable but changes an applicable
actor/entity/slot/version/time/replay binding, asserts rejection or an explicit
non-penalizing retry record, and proves votes, grant status, escrow, credits and
accounting unchanged. No real-world attestation path is claimed or implemented;
forged signer strings inside a motion are data and cannot replace the real sender.

## Consensus design and settlement invariants

Leader captures all canonical inputs before nondet, fetches/checks the pinned
source, and invokes an LLM over the exact3pairs. Prompt separates locked authority
from UNTRUSTED motion text, forbids instruction/payout/authority overrides, and
requires ONLY `{"12":"SAME|DIFFERENT|UNCLEAR","13":"...","23":"..."}`.
No score, winner, recipient, amount, external performance or truth assertion.
Use `response_format="text"` with a strict JSON-only prompt: the pinned SDK's
JSON convenience decoder discards duplicate object keys before application
validation. Manual `object_pairs_hook` parsing preserves and rejects duplicates.
Text output is bounded to4096characters. One complete optional JSON markdown
fence is transport-normalized before the same strict parser; surrounding prose,
duplicate keys, invalid classes, extra fields and invalid partitions still reject.
Decode deferred SDK results via `.get()` only when needed; normalize JSON strings
or mappings, reject duplicate semantic keys, exact expected IDs and locked enums.
No schema aliases or inferred missing fields. Non-critical rationale, if retained,
cannot affect comparison or consequence; production output has no rationale field.

Custom sandboxed `gl.vm.run_nondet_default`: reject non-Return leader; independently
repeat fetch/verification/classification; compare source status and all3 normalized
semantic classes exactly. JSON shape alone never establishes agreement.
An error or UNDETERMINED transaction does not create a canonical attempt/result.
Valid all/partial UNCLEAR or source-unavailable output records RETRYABLE only.

Deterministic invariants before any settlement:
1. Source OK and all3 expected pair IDs exactly once, no extras or invalid enums.
2. No UNCLEAR pair may settle. Every member slot1/2/3 occurs in exactly one group.
3. SAME is an equivalence relation: three pair classes must not imply one connected
   group while another edge in that group is DIFFERENT. Invalid transitivity reverts.
4. Every ballot is an existing authenticated member choice1..3 and counted once;
   group scores sum exactly3. Group representative is its minimum registered slot.
5. Elect only one unique maximum group score>=2. Otherwise refund sponsor.
6. Derive recipient from locked member/sponsor state, and amount from escrow2GEN.
   Reject any model-provided winner/payee/amount/root/downstream field or class.
7. Root-cause/downstream/dependency classes are N/A: this is symmetric equivalence,
   not a fault graph. Unsupported relation types are rejected, never invented.
8. Exactly2GEN moves escrow->one credit, once. No fee/split/residual/rounding exists.

## Consequence and value-destination matrix

| Branch/value | Source/payer | Locked state | Destination | Terminal/retry/duplicate behavior | Canonical proof |
|---|---|---|---|---|---|
| Round2GEN | Actual sponsor payable create | Live unresolved round escrow | First registered representative of sole majority group | ELECTED once; duplicate review rejects | round recipient, group scores, own credit, accounting |
| Tie2GEN | Actual sponsor | Complete reviewed round escrow | Actual sponsor | REFUNDED once; not split among nominees | round reason/recipient and sponsor credit |
| Empty cancellation2GEN | Actual sponsor | No member has submitted | Actual sponsor only | CANCELLED once before proposal cutoff; participation blocks cancel | motion/ballot count, status/credit/accounting |
| Incomplete, missing ballot, expired or retry recovery2GEN | Actual sponsor | Any unresolved round including RETRYABLE | Actual sponsor only after review expiry | REFUNDED once, no member penalty; duplicate rejects | immutable deadline,status,credit/accounting |
| UNCLEAR/source outage/digest mismatch | No new payer | Same original2GEN escrow | No destination yet; original sponsor retains timed recovery | Only retry/attempt record changes; no election/credit | prior and after accounting identical |
| Vested credit exit | Named credit owner | Own credit ledger | Same direct EOA, no supplied destination | Debit before native message; duplicate cannot repeat | outgoing child+exact contract decrease+recipient balance, zero credit |
| Superseded diagnostic revision | No application deposits permitted before smoke | Should hold0GEN | Existing liabilities recovered by original design before rollover | Broken-contract abandonment exception must be explicitly documented if invoked | source identity, native balance and liabilities per revision |

Global invariant: `received = total_escrow + total_credit + requested_withdrawn`;
no negative term. On verified completed exits, actual native balance must equal
remaining escrow+credit. Accounting records transfer requests; only child receipt
and exact native decrease prove delivery. Studio currently attaches the external
EVM execution/value-delivery receipt to the parent and exposes no separate child
hash for this native transfer. Require executionRecorded, the matching delivered
finalized value effect, exact native contract decrease and recipient evidence;
do not invent an independent child transaction. External EOA transfer uses a private
`@gl.evm.contract_interface` recipient, never gl.chain.Account or the IC boundary.
If an unexpected child fails, stop and reconcile; no blind retry or invented refund.
No platform fee, third-party custody, split rounding or unallocated residual.
Internal consequences are consensus-controlled; frontend waits for successful
FINALIZED reads before displaying a completed election/withdrawal.

## Public reusable interface

Seven writes are exactly the safety rows above. Seven canonical JSON views:
`list_rounds(offset,limit)`, `get_round(id)`, `get_motion(id,slot)`,
`get_ballot(id,slot)`, `get_attempt(id,attempt_number)`, `get_credit(address)`,
`get_accounting()`. Views expose GEN-formatted monetary strings, not raw amounts.
get_round includes the3motions/ballots, immutable digests/windows, derived groups,
scores, current attempt and result; UI never supplies a calculated verdict.
get_attempt is append-only history and tooling reads the current attempt count.
No callback exists; authentication/idempotency/failure for callbacks is N/A because
there is no independent consumer enforcement boundary in V1. Reuse is pull views
plus typed writes, not a claimed Safe integration or pass-through second contract.

## Frontend lifecycle coverage matrix

| Canonical state | User action | Contract write | UI component/route | Frontend test | Evidence status |
|---|---|---|---|---|---|
| No round | Fund council | create_round | CreateRound /rounds/new | exact members/value; deployed input bounds; real SDK2GEN envelope | UI/SDK PASS; script network PASS; browser write pending |
| COLLECTING own slot empty | Author and assent | submit_motion | RoundWorkspace motions | exact motion/config digest, role/cutoff gating | UI/SDK PASS; script network PASS; browser write pending |
| BALLOT_OPEN own ballot absent | Cast one choice | cast_ballot | RoundWorkspace ballot | exact slate/choice, duplicate/time gating | UI/SDK PASS; script network PASS; browser write pending |
| READY_FOR_REVIEW | Group votes and resolve | review_round | RoundWorkspace result | wrapper/control/reload and interval test | UI/SDK PASS; two real semantic outcomes PASS; browser write pending |
| RETRYABLE | Request another review | review_round | RoundWorkspace result | explicit retry label and newly finalized canonical outcome reload | Local direct/UI PASS; real source-uncertainty retry not observed |
| Unparticipated live round | Safe cancellation | cancel_round | RoundWorkspace result | legal cancel control; participant blocks cancel | UI/SDK PASS; script network PASS; browser write pending |
| Unresolved expired round | Recover own funding | recover_round | RoundWorkspace result | equality/role/terminal gating plus wrapper/reload | UI/SDK PASS; timed script network PASS; browser write pending |
| Positive own credit | Withdraw to own wallet | withdraw_credit | Account /account | selected provider, accepted!=finalized, duplicate disabled, canonical reload | UI/SDK PASS; five active2GEN native exits PASS; browser write pending |

All writes use real adapter/SDK at Phase7, account at createClient, no raw-string
per-write account override. Real-SDK intercepted-I/O adapter regression (including
exact2GEN) is mandatory in the final npm check. Tests with a fake Adapter above
prove components only and cannot substitute for that boundary. Wallet discovery,
selected provider, logout, chain switch/add, separate wallet/IC read endpoints,
same-origin proxy CORS and successful canonical reload are separate acceptance
requirements. No key enters browser env or an uploaded hosting source tree.

## Threat model and executable test plan

| Threat | Attack | Mitigation | Required named test family |
|---|---|---|---|
| Role forgery | Other wallet submits same bytes/digest, fake signer text, forwarded call | Exact direct sender, registered immutable slot and config/slate binding | test_authentication_binding; canonical/accounting unchanged |
| Replay/version substitution | Reuse old motion, duplicate ballot, wrong round or source version | Unique keys, digests with chain/contract/version, immutable slot writes | test_provenance_tripwires with stable digest |
| Stale phase/time | Late proposal/vote/review or premature recovery | Independent entrypoint timestamp guards | test_temporal_boundaries at-1/equality/+1 with stale phase |
| Semantic manipulation | Prompt injection, leader chooses payee/labels with right JSON shape | Untrusted-data boundary, independent replay, no payout fields | test_validator_replay, test_injection and malformed-output tests |
| Invalid partition | Extra/missing/duplicate ID, wrong enum, non-transitive SAME, invented root/downstream | Exact normalized relation and deterministic graph/tally invariants | test_settlement_invariants; no mutation/credit on reject |
| Source substitution/outage | Matching claimant bytes or changed official representation | Exact built-in URL/raw hash and bounded fetch; retry without penalty | test_source_provenance; all hard state/accounting unchanged |
| Value theft/double exit | Wrong amount, arbitrary recipient, repeated settle/withdraw/recovery | Exact2GEN, deterministic beneficiary, own credit and debit before EVM message | test_value_and_recovery_safety plus native metadata/receipt checks |
| UI false success | Signature/submission called finalized; stale browser data | Track independent execution+finality then canonical reload | adapter/UI finality/error/retry and real browser lifecycle |

Test-first contract batches: establish failing cases for each planned public method
before its body is completed, especially recovery/value writes; no code stub can
be reported as successful behavior. Direct tests use repository Python3.12,
controlled transaction clock and mocked nondet I/O; captured validator closures
are invoked separately because direct mode normally executes only the leader.
Every value/recovery write covers wrong caller/state, duplicate, terminal/closed,
accounting, no double-credit/withdraw/settle. Every temporal entrypoint covers both
opening and closing boundaries with stale phase and unchanged rejected state.
Metadata/AST tests cover ASCII, coherent Depends/API, exactly one recognized class,
storage types and payability. Receipt tests cover raw Studio leader_receipt and SDK
normalized shapes, including finalized execution ERROR and absent execution data.
gltest configuration installs sim_installMocks with bare-dict params before any
mocked nondet transaction; real network tests are clearly separated and authorized.

## Claim-to-code matrix

| Product claim | Contract method/state | View/read | Direct/frontend test | Network evidence plan |
|---|---|---|---|---|
| Only named members author immutable commitments | submit_motion; keyed MotionState/config digest | get_motion/get_round | authentication, stable-digest wrong-binding, duplicate and phase tests; exact control args | Finalized three distinct role writes and exact canonical texts |
| Every member casts one exact-slate ballot | cast_ballot; keyed BallotState | get_ballot/get_round | wrong caller/digest/choice/replay/time; UI exact-slate test | Three finalized ballots, canonical choices, rejected duplicate unchanged |
| Neutral meaning controls pooled support | review_round; relation/AttemptState | get_attempt/get_round | independent replay and settlement-invariant negatives | Successful multi-validator finalized review; exact relation and scores |
| Majority result controls fixed2GEN grant | review_round; winner_slot/recipient/credit | round,get_credit,get_accounting | pooled AB votes2 versus C1; all distinct/tie refund; no LLM amount | Finalized elected result and2GEN native withdrawal with child/balance delta |
| Uncertainty never pays a nominee | review_round RETRYABLE; unchanged escrow | attempt,round,accounting | UNCLEAR/source failure/hash mismatch/injection/provenance cases | Canonical real retry if obtained; otherwise explicitly local-only |
| Missing participants cannot orphan sponsor funding | recover_round/cancel_round | round,credit,accounting | all recovery callers/states/boundaries/duplicates/terminal cases | Real unparticipated cancel and incomplete/expired refund with2GEN exit |
| Product uses a real selected wallet and canonical state | frontend typed adapter and all seven controls | finalized SDK reads via same-origin proxy | real-SDK adapter tests; UI finality/role/logout/error/retry | Actual extension-wallet primary journey; script peers explicitly labeled |

No above claim may be called publicly complete merely from this design table.

## Analogue and differentiation matrix

| Analogue | Material overlap | Structural difference | Decision |
|---|---|---|---|
| CohortRate | Constitutive evidence; pairwise meaning equivalence (2/7) | Paid order repricing/minimum-price refunds versus member ballot windows, vote pooling, majority election and one grant | New ballot/tally state and consequence; not a tariff rename |
| ConsentDelta | General governance and canonical commitments (at most2/7) | Affected-member veto/adopted revision versus motion equivalence and fixed electorate tally | Different consensus/state/consequence |
| TenderSeal | Competing proposals and funded outcome (at most2/7) | Model quality-ranking sealed bids/bonds versus humans selecting one ballot and validators only grouping meaning | No model-ranked winner |
| DisclosureDividend | Overlap reasoning and reward consequence (at most2/7) | Research attribution/proportional reward versus constitutive motion ballot/majority representative | Different authority, state and selection rule |
| SemanticNonce | Canonical text and semantic comparison (at most2/7) | Sequential authorization novelty/tickets versus closed electorate ballot pooling | No historical nonce/permit mechanism |
| Generic SubjectiveVoteResolver | Multiple proposed texts | Jury never selects persuasive winner; authenticated member ballots and deterministic tally select recipient | Not a generic debate/jury verdict wrapper |

Comparison is a conservative design assessment, not worldwide novelty or market
adoption proof. Stop and redesign if the actual implementation converges on an
existing4/7fingerprint or if a backend/model chooses the elected recipient.

## Deployment and evidence plan

Use verified Studio Dev61997 and matched SDK2.0.0-rc.1; no relabeled Studionet.
Resumable inspect-first scripts bind network/source commit/runner/API/address and
keep all accepted/finalized action hashes. Read canonical state before signing,
recover current attempt dynamically, and never replay an ambiguous transfer.
Use the authorized sponsor and two separately approved demo EOAs stored only in
ignored local configuration. Each demo EOA received1GEN on Studio Dev. All three
are controlled by one demo operator; distinct real people are not claimed.
Check actual GEN balances and use authorized same-network funding only when needed. All application deposits
are2GEN; any native actor funding uses1GEN or2GEN. No faucet.

After lint/direct/metadata/receipt/SDK/browser-CORS checks, deploy an exact-source
bounded zero-application-value smoke and verify source/schema/Result:SUCCESS.
Then lifecycle cases: pooled winning class and2GEN withdrawal; all-distinct tie
refund and2GEN withdrawal; empty cancellation; incomplete or retry expiry recovery.
Each proof projects only network, actor, transaction hash, result/finality/time,
round/attempt IDs, explicit canonical views and GEN-formatted native balances.
Never dump full RPC receipts, traces, validator configs, node_config or stdout.
Evidence lives in docs/evidence/studio-dev; each superseded revision is archived
with status/reason/attempts/recovery, one active deployment.json. Signed transaction
hash must be saved before broadcast so reconciliation does not double-send.

Publish only project deliverables after exact staged/history/secret/allowlist
audit. Audit Vercel's actual upload source manifest separately: ignored local
secrets may otherwise be included in hosting uploads. No bulk parent upload.
Current source commit, deployed source commit and evidence/CI commit are distinct.

## Definition of Done and kill criteria

Complete only after recognized semantic lint; all intended tests including actual
validator replay, metadata and raw/normalized receipts; full npm check and gltest;
every browser lifecycle row implemented/tested; browser-local RPC/CORS proof;
successful finalized real semantic judgment and consequential native exits with
exact balance proof; public history hygiene; current public CI; live Vercel HTTP200
plus app name/React root; exact counts/URLs; clean unchanged full Projects grading
command with no BLOCKER; honest self-contained Portal packet and final master
reread/checklist. Gate13 must become PASS_EXECUTION from current proof.
Retain the frontend's verified visual language. No fake wallet/GEN/finality,
canonical fixtures/localStorage, undocumented payment authority or hidden skips.

Kill/redesign on unilateral interpretation, shape-only validator, unbounded or
unauthenticated consequential evidence, no real vote-controlled payout, invalid
partition reaching credit, unguarded time/recovery, duplicate settlement, orphaned
escrow, frontend canonical-state gap,4/7duplicate or a core untraceable claim.

## Evidence status

Local checkpoint2026-10-16:104 Python tests,20 Node tests and98 frontend
tests PASS, no skips; recognized contract lint, TypeScript and production build
PASS. Unsigned viability vectors were12/12. These are separate from CI.
Studio Dev revision1 at `0xA78E771B40C017ff88520ff2fc632cF37cf60A88` is
SUPERSEDED_RECOVERED after one failed real review. Both2GEN budgets were recovered
and delivered; native balance/escrow/credit are0GEN. A0GEN normalization control
finalized SUCCESS. Active revision2 is0xFB0943A725499C65D49254168Dce37AFdb949a81.
Its majority election and three-way tie finalized SUCCESS; five terminal cases
returned or granted all10GEN, with five exact2GEN native exits. Current native,
escrow and credit are0GEN. The canonical lifecycle audit passed. Browser-wallet
writes remain PENDING_REAL_EVIDENCE and are distinct from script signatures.
Studionet/localnet/other networks: no SlateFold evidence or deployment claimed.
Browser: local rendering/navigation/discovery and a real selected OKX account
connection observed; no browser signature, transaction or external adopter claimed. Public CI/app/Portal:
pending. These limits remain until replaced by fresh evidence, not by a plan.
