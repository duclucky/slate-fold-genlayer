# Local verification

Run `npm ci`, create a Python3.12 `.venv`, then install `requirements.lock` with
that environment's Python. Run `npm run check` from the project root.

Observed 2026-10-15: one recognized SlateFoldContract, seven public writes and
seven views;93 Python tests,6 receipt-parser tests and61 frontend tests passed.
No skip/xfail was reported. TypeScript and the Vite production build passed.
These counts describe this checkpoint; later adapter tests may increase them.
They are local evidence, not CI, finalized consensus or browser-wallet proof.

The runtime unit is the verified5jyc Depends hash, GenVMv0.6.0-rc5 and v0.3 API.
The newer boilerplate hash failed isolated hosted controls, so it was not adopted.
The linter wrapper adds only the missing v0.3 sandbox entrypoint and recognizes
the exact v0.3 storage decorator; undecorated storage still fails a regression.
The real runtime validator executes the unchanged application source.

Pinned direct-test tooling needs bounded compatibility adapters: delayed Windows
stdin-file cleanup, resetting its single-contract module registry per deployment,
preserving the v0.3 LLM text wire format, and synchronizing raw transaction time
when warping. These adapt the test transport, not authorization or accounting.
Tests call actual contract code and persist actual direct-mode storage. Direct
mode does not itself establish consensus; explicit captured-validator replays
exercise agreement and malicious leader outputs, and live evidence is separate.

Synthetic reference bytes and their substituted hash exist only in direct-test
processes. Production locks the dated W3C URL and its observed raw-body hash.
Source digest mismatch prevents the LLM call and leaves escrow untouched.
No fixture is imported into the production frontend or used as canonical state.

Withdrawal unit tests capture the EVM external boundary and assert debit-before-
message, exact recipient/value and duplicate rejection. They do not prove native
delivery. Before claiming an exit, network evidence must prove the outgoing child
and an exact contract native-balance decrease, with recipient balance evidence.

Fresh checkpoint2026-10-16: `npm run check` exit0;93 Python,12 receipt/journal
and80 frontend tests PASS, zero skips. The journal suite covers hash persistence
before broadcast, ambiguous transport, recovery without resubmission, a prepared
operation needing inspection, and reverted native envelopes.

Two observed Studio transport differences have explicit regressions. Unsigned
write simulation needs current `sim_config.genvm_datetime` for temporal guards;
the proxy supplies only its own clock for fee simulation. Signed writes contain
no simulation override. Studio can append a synthetic idle validator ERROR after
quorum; it is ignored only with mode=validator, vote=idle, the exact documented
quorum control code, an actual successful leader, and an explicit normalized
successful transaction result. Every other error still rejects success.

Latest checkpoint:93 Python +12 receipt/journal +82 frontend tests,187 total,
all passed. `.venv/Scripts/gltest.exe tests/ -q --tb=short` separately returned
`93 passed in 9.44s`; these are the same Python cases, not93 additional tests.

Replacement-source checkpoint:104 Python (100 direct,4 tooling),14 Node receipt/
journal/delivery and82 frontend tests,200 total, all passed. New tests first
observed4 failures for plain-versus-fenced JSON, then passed after bounded fence
normalization. Duplicate keys, surrounding prose, extra payout fields, invalid
partitions and oversized output remain rejected with unchanged accounting.
Native-delivery tests reject parent-only success, wrong recipient/amount,
premature phase, unrecorded external execution and undelivered value effects.
