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
