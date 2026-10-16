# SlateFold submission packet

Status: NOT_SUBMITTED. This is copy-ready field text, not a submission confirmation.
The authenticated Portal form was inspected on2026-10-16; it exposes a180-character
one-liner,1000-character description and500-character verification outcome.

Recommended category: **Projects**. Project name/title: **SlateFold**.
Primary tag: **Governance**. Specific focus: **Treasury Allocation**.
Demo video: leave blank; no published video is claimed.

## One-liner

SlateFold pools votes for equivalent council motions through GenLayer semantic consensus, then allocates a fixed 2 GEN grant under immutable rules.

## Description

Use the exact paragraph in [SUBMISSION-NOTES.md](SUBMISSION-NOTES.md).
It is below the observed1000-character limit. Its exact character count is
recorded in [pre-submission audit](PRE-SUBMISSION-AUDIT.md).

## How-to

1. **Inspect a completed council.** Open the website, choose Rounds, then open
   the archive permissions council. Read its motions, public ballots and result.
   Equivalent motions2/3 pooled two votes; member2 is the fixed representative.
2. **Compare the tie.** Open the distinct-motions council. Its three meaning
   classes each have one vote, so the sponsor received the refund credit.
3. **Inspect real settlement.** Follow the Explorer/evidence links below for
   finalized reviews and delivered2GEN withdrawals. The canonical accounting
   records12GEN received,12GEN withdrawn and0GEN escrow/credit/native balance.
4. **Use the product.** Select a detected EVM wallet, switch it to Studio Dev,
   and use New round to register two other wallets and lock2GEN. All three
   members submit motions, then cast ballots in their displayed windows. After
   voting closes, request review and withdraw the resulting own credit. This
   browser primary journey was verified with five actual Chrome/OKX signatures.
   Two peer motions and two peer ballots were explicitly script-signed. Each
   human member of a new council must use its own registered wallet.

## Expected verification outcome

History shows six finalized councils. The browser council groups [[1,2],[3]] with scores [2,1] and credits 2 GEN to its first member; its actual OKX withdrawal finalized. Six active-revision exits each delivered 2 GEN. Current native balance, escrow and credits are 0 GEN, with 12 GEN received and 12 GEN withdrawn. Browser proof separates five wallet-signed actions from four script-signed peer actions.

## Evidence and project links

- Website: https://slate-fold-genlayer.vercel.app
- GitHub: https://github.com/duclucky/slate-fold-genlayer
- Primary contract: https://explorer-studio-dev.genlayer.com/address/0xFB0943A725499C65D49254168Dce37AFdb949a81
- Consumer/integration explorer: N/A; no separate consumer contract.
- Lifecycle: https://github.com/duclucky/slate-fold-genlayer/blob/main/docs/NETWORK-VERIFICATION.md
- Majority review: https://explorer-studio-dev.genlayer.com/tx/0x9e4a5c16338f67095a9b1896d4a1d6eabd7af106af41d2d402eb72dfb46571b6
- Tie review: https://explorer-studio-dev.genlayer.com/tx/0x4caea369c7f6827acc1fbd9f278a616de49659fb568781a5157c26a8855a68b0
- Successful code/hosting-source CI: https://github.com/duclucky/slate-fold-genlayer/actions/runs/38872338701
- Current main workflow: https://github.com/duclucky/slate-fold-genlayer/actions/workflows/check.yml?query=branch%3Amain
- Frontend read/write scope: [FRONTEND-VERIFICATION.md](FRONTEND-VERIFICATION.md).

The fixed CI run belongs to source commit32bddef. Later documentation commits
require their own successful CI before final submission; the workflow link is
not itself a claim that its latest run has passed.

## Verified facts and limits

One product contract source: SlateFoldContract, seven writes and seven views.
Two deployed product revisions are retained; revision1 is superseded and fully
recovered. One separate zero-application-value diagnostic is not a product or
consumer contract. Current check:223 cases (100 direct,4 tooling,20 Node,
99 frontend), no skips/xfails; lint, TypeScript and production build pass.
Network: Studio Dev61997 only. Three real semantic consequences, six terminal
cases, six2GEN native exits on the active revision. The three scripted demo EOAs
and the existing browser wallet are under one operator; no independent users
or adoption are claimed.

The primary browser journey is verified. No external adoption, real-world work
verification, identity guarantee, Sybil protection, private ballots, formal clone
independence or guaranteed model correctness is claimed. Runtime infrastructure
is Studio Dev, not mainnet. A retryable semantic/source case is proven locally;
no successful real-network RETRYABLE lifecycle is claimed. Portal submission is
pending; no confirmation ID exists. Cancellation/recovery browser execution is
not claimed; those branches have UI/SDK tests and real script-signed network cases.

## Why Projects

The contribution includes a complete multi-view council product and a reusable
Intelligent Contract. The frontend reads its deployed state, exposes the member
journey and uses a selected EVM provider for writes. It belongs in Projects;
its primary browser journey and real native exits have been verified.

After an accepted V1, weighted multi-seat councils plus an authenticated Safe
or agent execution gateway would be a substantial new milestone. That gateway
and external adoption are roadmap items, not present integrations.
