# SlateFold

SlateFold lets three named council members fund shared policy intent: GenLayer
validators group equivalent motions, and deterministic ballots allocate a fixed
2 GEN grant or return it to the sponsor.

**Category: Projects. Status: local build verified; network lifecycle pending.**

## Why it exists

Two differently worded motions can express the same promise and split a council's
support. Neither the chair nor a nominee should decide which votes can be pooled.
Members sign the same immutable rules, submit their own commitments and cast one
public ballot each. Validators independently compare the complete permission,
prohibition, beneficiary and duty of every pair. The model cannot choose a winner,
recipient or amount. Contract code validates the equivalence relation and counts
each registered member's vote once.

A unique majority group receives the fixed grant through its earliest registered
representative. A tie refunds the sponsor. Uncertainty keeps the purse locked for
retry until a fixed recovery deadline. Every vested grant/refund can be withdrawn
to its owner's wallet. Cancellation is available only before any participation.

## Run locally

Use Node24 and Python3.12. From this repository:

```powershell
npm ci
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.lock
npm run check
npm run dev
```

Linux uses `.venv/bin/python` for installation. The check command chooses the
platform-specific environment automatically. No wallet or network is required
for the local tests. A missing deployed address is displayed honestly.

## Product and contract

The React/Vite product includes a landing page, searchable rounds, creation,
motion signing, ballots, results, history, account withdrawals and help, connected
through persistent navigation. It discovers EVM wallets, lets the user choose,
switches the chosen provider to Studio Dev, and separates wallet writes from
same-origin Intelligent Contract reads. There are no browser private keys,
simulated signatures or local-storage contract records.

There is one reusable Intelligent Contract, `SlateFoldContract`, with seven public
writes and seven views. Structured state isolates every round and binds each
motion and ballot to its authenticated sender and exact configuration/slate.
The fixed dated W3C ODRL reference is fetched and its raw digest checked before
semantic judgment. Validators independently rerun source checks and classification;
exact pair coverage, valid labels, transitivity and deterministic tally invariants
must pass before any credit. GEN accounting uses exact integers internally and
GEN strings in public views. Demo purses are exactly 2 GEN.

See [specification](docs/README.md), [local checks](docs/LOCAL-VERIFICATION.md)
and [frontend verification](docs/FRONTEND-VERIFICATION.md).

## Live app and deployed contract

PENDING_REAL_EVIDENCE. No live URL, address or finalized lifecycle is claimed yet.
Selected deployment identity: Studio Dev, chain61997, locked RPC
https://studio-next.genlayer.com/api. Network evidence will remain separate from
local tests under `docs/evidence/studio-dev/`.

## Honest limits and reuse

This is a fixed three-wallet, public-ballot protocol. It does not authenticate
real-world work, identity or delivery, prevent Sybils, guarantee model correctness,
provide formal clone independence, or claim external adoption. Earliest-slot
priority is an explicit rule accepted before participation, not equal payment
among equivalent authors. Studio Dev is temporary development infrastructure.

DAOhaus proposal intake, Safe budget-planning interfaces and LangGraph operator
councils are proposed consumers of the create/submit/vote/review/view interface;
they are not claimed deployments. After V1 acceptance, a substantial next
milestone could add weighted multi-seat councils and an authenticated execution
gateway that enforces the elected mandate at the Safe or agent boundary.
