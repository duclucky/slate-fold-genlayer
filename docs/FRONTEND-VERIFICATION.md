# Frontend integration checkpoint

2026-10-15, before deployment: `npm run check` passed93 Python tests,6 receipt
tests and76 frontend tests, plus TypeScript and the production build. The11
adapter tests use the real genlayer-js2.0.0-rc.1/viem2.56.5 with intercepted
RPC/provider I/O. They assert selected sender, exact IC destination,2GEN payable
calldata, zero-value writes, invalid/missing account/address rejection, account
switch rejection, accepted versus finalized, failed execution and rechecking an
ambiguous transaction without rebroadcast. These are offline tests, not signatures.

The common SDK canary was attempted unchanged. It stopped at unexpected new
eth_getTransactionReceipt/eth_blockNumber calls because its fixture covers the
older SDK. No real network was contacted by that canary. The project-owned
adapter regression supplies the current wire fixtures and passes all11 cases.

The actual IAB browser at http://127.0.0.1:5177/rounds displayed an honest missing
contract-address message. A browser-origin fetch through CDP executed
`POST /genlayer-rpc` with `eth_chainId`; actual output was
`{http:200,chainId:"0xf22d"}`. This proves the local same-origin proxy reaches
Studio Dev from a browser without Failed-to-fetch/CORS on that read. It does not
yet prove a deployed SlateFold view, browser signature or finality.

The wallet modal detected exactly one OKX Wallet and one MetaMask. Choosing
MetaMask requested that provider's account; account permission/signing remains
separate evidence. No private key was entered into the browser.

FE-PRESERVE CSS SHA256 remains
`326df247220f963e7c3974c84e6e9bd77c17a841257d149d806d906ffb88ee0a`.
All original routes, primary controls, typography, layout and palette remain.
The read proxy fixes its upstream origin, bounds requests, rejects broadcasts and
write-mode gen_call, and strips validator configurations/traces from receipts and
arbitrary upstream errors. Wallet signing stays inside the selected provider.

Deployed-address reads, live-host proxy and browser-wallet writes are
PENDING_REAL_EVIDENCE until the later lifecycle/live verification checkpoint.

## Fee correction during deployment smoke

The first zero-value deployment envelope was explicitly reverted with
FeeValueMustBeNonZero. No contract was created and the sponsor balance did not
change. RPC gas estimation had succeeded, so gas estimation alone is not protocol
fee admission proof. The failed hash is archived separately.

The actual adapter now measures a fee quote with the installed SDK, funds its
distribution and feeValue, and preserves exactly2GEN as the application userValue.
The wallet total includes the protocol fee deposit as well as the purse; UI copy
and the signing state display that distinction in GEN. A failing regression
observed the previous2GEN-only envelope, then passed with the quoted fee included.
The CSS design remains unchanged. Current deployed/browser fee behavior still
needs live evidence and is not inferred from the regression.

Official fee-estimation reference:
https://docs.genlayer.com/api-references/genlayer-js

## Current local transport checkpoint

2026-10-16: full `npm run check` passed93 Python,12 receipt/journal and82 frontend
tests, plus recognized lint, TypeScript and production build. The CSS hash above
is unchanged. Additional regressions cover clocked fee simulation, filtering
unexpected fee metadata, exact synthetic quorum-control projection, and a clear
fee-error recovery message without SDK diagnostic copy in the product surface.

Actual IAB request from http://127.0.0.1:5178 to `/genlayer-rpc` returned HTTP200,
no RPC error and a funded quote of0.000378535200010352GEN for an unsigned2GEN
create simulation. No transaction was broadcast. This proves the corrected fee
proxy path works from a browser without CORS failure. It does not prove wallet
signing, deployed-address rendering or live-host behavior; those remain separate.

## Deployed-address local checkpoint

The ignored frontend configuration now selects revision2 at
0xFB0943A725499C65D49254168Dce37AFdb949a81. `cd frontend; npm run build` exited0.
Actual Chrome rendered all five canonical rounds, including the funded majority,
empty cancellation and three refunded cases. This establishes browser-origin
deployed reads through `/genlayer-rpc`, without a CORS/Failed-to-fetch failure.
An existing OKX wallet was selected and connected; its clickable address opens
the account/disconnect menu. No browser transaction is inferred from connection.

The English audit inspected42 source/README files:0 non-English alphabetic lines;
the extracted UI copy was reviewed. Review also caught provisional ID/objective
bounds that differed from the deployed contract. Six focused cases first failed,
then passed with lowercase1..48-character IDs and10..500-character objectives.
A minimum-motion test first failed, then passed at10characters. Text bounds count
trimmed Unicode code points, matching the Python boundary. The complete check
passed104 Python,20 Node and98 frontend tests, TypeScript and production build.
CSS remains exactly the established baseline. Browser signing remains pending.

## Production checkpoint

https://slate-fold-genlayer.vercel.app returned HTTP200 and its real React root.
Chrome rendered all five canonical rounds through the production same-origin
proxy. The wallet picker discovered OKX Wallet and MetaMask. The initial
production permission exposed no account; the owner subsequently connected OKX
and signed the primary journey described below.
Earlier pending deployed-read and hosting notes above are historical checkpoints;
they are superseded by the execution checkpoint below. See
[hosting verification](HOSTING-VERIFICATION.md) for the exact source manifest.

## Completed production browser journey

Actual Chrome/OKX wallet0xc495ef51618d03267a1f227afe5b27b38c748272 signed:
create2GEN, own motion, ballot for motion1, semantic review and own withdrawal.
All five transactions finalized SUCCESS and the UI reloaded canonical state.
The two peer wallets signed their two motions and two ballots through scripts;
those four actions are explicitly not browser proof. The exact hashes, source
commit and per-action before/after views are in
[browser-lifecycle-audit.json](evidence/studio-dev/browser-lifecycle-audit.json).

The browser review grouped motions1/2 with scores[2,1] and vested2GEN to the
browser wallet. The withdrawal proves external execution/delivered value2GEN,
native contract2GEN ->0GEN, credit0GEN and recipient net increase
1.999873694749999177GEN. Active cumulative accounting is12GEN received and12GEN
withdrawn, escrow/credit0GEN. No fabricated child hash is used.

The actual UI showed an initial declined-signature error and a successful retry.
Later, Account encountered a temporary read failure; Try loading again recovered
the real2GEN credit without signing or changing state. HTTP503 also interrupted
read-only post-withdraw reconciliation; the existing finalized hash was read
again, never sent again. The service's precise internal failure is not inferred.

Those five browser writes ran on frontend4e03472. A narrow follow-up at32bddef
converts SDK read diagnostics into actionable recovery copy. Its regression first
failed on the SDK/version message, then passed with an actual-SDK failed-read to
successful-credit retry and zero wallet writes. Full local check and Linux
CI38872338701 passed223 tests (104 Python,20 Node,99 frontend), no skips/xfails.
The actual-SDK selected-account/value preflight passed again after this adapter
change. Successful reads and all write code are unchanged; CSS hash is unchanged.

Production deployment dpl_71HgMGXRWH3k2pPPZevKuAnkQt3U is READY at the same
verified URL and serves index-Cu05VXCP.js. Actual Chrome on that revision read
Account0GEN and all six canonical rounds in History. Passive restoration used
live wallet permission. The clickable account menu exposed Disconnect; after
logout, the address cleared and New round required connection before any write.
No new purse was created during this check. Cancellation/recovery browser controls
are tested, with actual script-signed network cases; their browser execution and
a real-network semantic RETRYABLE outcome are not claimed.
