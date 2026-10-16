# SlateFold

SlateFold lets three named council members fund shared policy intent: GenLayer
validators group equivalent motions, and deterministic ballots allocate a fixed
2 GEN grant or return it to the sponsor.

**Category: Projects. Local build and Studio Dev lifecycle verified; browser-wallet write verification is pending.**

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
Copy-Item frontend/.env.example frontend/.env
npm run dev
```

Linux uses `.venv/bin/python` for installation. The check command chooses the
platform-specific environment automatically. Set the public
`VITE_CONTRACT_ADDRESS` to the address below before starting the frontend.
No wallet or network is required for local tests. Missing configuration is
displayed honestly. Wallet keys never belong in frontend configuration.

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

## Live App

Production hosting is pending verification. No live URL is claimed yet.

## Deployed Contract

Studio Dev, chain61997: **`0xFB0943A725499C65D49254168Dce37AFdb949a81`**.
[Contract Explorer](https://explorer-studio-dev.genlayer.com/address/0xFB0943A725499C65D49254168Dce37AFdb949a81)
and [successful deployment](https://explorer-studio-dev.genlayer.com/tx/0xc9feec56c54c9a72d56274753000b644234e9114f4c8220cbdd4e73d2ad310a2).
RPC: https://studio-next.genlayer.com/api.
The deployed source commit is `e2338e86604a09227c34989f535d16baa040659a`;
[deployment identity](docs/evidence/studio-dev/deployment.json) binds the exact
source hash, pinned runner, API family, SDK, address and transaction.

The [finalized majority review](https://explorer-studio-dev.genlayer.com/tx/0x9e4a5c16338f67095a9b1896d4a1d6eabd7af106af41d2d402eb72dfb46571b6)
grouped motions2/3, pooled two votes and vested2GEN to member2. The
[three-way tie review](https://explorer-studio-dev.genlayer.com/tx/0x4caea369c7f6827acc1fbd9f278a616de49659fb568781a5157c26a8855a68b0)
refunded the sponsor. Five terminal demo cases received and withdrew10GEN in
five separate2GEN exits. Current native balance, escrow and credits are0GEN.
[Canonical audit](docs/evidence/studio-dev/lifecycle-audit.json),
[transaction timeline](docs/evidence/studio-dev/lifecycle-timeline.json) and
[network verification](docs/NETWORK-VERIFICATION.md) contain receipts, timestamps,
authoritative motion/ballot reads and exact native balance evidence. Two older
revision1 exits were also fully recovered. Script signatures are distinct from
browser-wallet signatures; the latter remain pending at this checkpoint.

## Verify and deploy on Studio Dev

Use three distinct existing EOAs in an ignored project `.env`, following
`.env.example`. The sponsor pays test GEN and network fees. The scripts use
Studio Dev explicitly; legacy variable names do not select another network.
Run the local checks and commit the contract source before deployment:

```powershell
npm run check
node scripts/inspect.mjs
node scripts/runtime-probe.mjs
node scripts/envelope-preflight.mjs
node scripts/deploy.mjs
node scripts/deploy.mjs --execute
node scripts/network-smoke.mjs --execute
```

These commands recover the recorded deployment when its identity matches;
they do not blindly redeploy. A new revision needs its own reviewed identity
and recovery/archive record. The exact-source unsigned probes precede signing,
and the zero-application-value authority smoke precedes any purse funding.
The documented consequential demos use:

```powershell
node scripts/lifecycle.mjs --execute --case=election --run=3
node scripts/lifecycle.mjs --execute --case=cancel --run=3
node scripts/lifecycle.mjs --execute --case=expiry --run=3
node scripts/lifecycle.mjs --execute --case=expired-tie --run=3
node scripts/lifecycle.mjs --execute --case=tie --run=4
node scripts/verify-deliveries.mjs
node scripts/lifecycle-audit.mjs
node scripts/evidence-timeline.mjs
```

Existing finalized hashes are reconciled, not sent again. Each purse is2GEN.
Unsigned fee quotations and reads honor bounded server retry advice. A missing
hash or unresolved execution requires inspection before another send.

## Verification

`npm run check` passed222 tests:100 direct contract cases,4 tooling/metadata,
20 Node receipt/journal/balance/backoff cases and98 frontend cases; no skips or
xfails. GenVM lint recognizes one `SlateFoldContract`,7 writes and7 views.
TypeScript and production build pass. The separate `gltest tests/` run covers
the same104 Python tests and is not added again to the total. Public CI is
pending its first pushed commit. Local browser reads render the five canonical
rounds through the same-origin proxy; wallet connection/menu is observed.

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
