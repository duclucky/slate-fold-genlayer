# Production hosting verification

Live application: https://slate-fold-genlayer.vercel.app.
Production deployment: dpl_71HgMGXRWH3k2pPPZevKuAnkQt3U, state READY.
Frontend source commit:32bddef40beecec832adeb6971abe6ad20c336a5.

`vercel deploy --dry --format=json --project
prj_fi9JlG6Ytzb0KP14IPsklJKFnrYw --yes` reported Vite and17 files.
Each uploaded SHA1 and exported SHA256 matched the reviewed Git bytes.
The upload contained no environment files, wallet material, local controls,
tests, caches or build outputs. The only shared runtime dependency outside
frontend/ is the receipt parser and its declaration file.

Cloud settings are framework Vite, root frontend/, build npm run build,
install npm ci --prefix .., output dist, Node24, outside-root sources enabled.
The production public VITE_CONTRACT_ADDRESS selects the verified active
Studio Dev contract. The source manifest and identity are in
[hosting-verification.json](evidence/studio-dev/hosting-verification.json).

`curl.exe -I https://slate-fold-genlayer.vercel.app` returned HTTP/1.1 200 OK.
`curl.exe -s https://slate-fold-genlayer.vercel.app` returned the SlateFold title,
React root div, index-Cu05VXCP.js and index-BNMDLvwr.css.
Actual Chrome rendered all six canonical rounds through /genlayer-rpc and
read Account0GEN after the completed withdrawal.
No browser Failed-to-fetch/CORS error was observed on that successful read path.

The Windows-only pywin32 lock entry initially failed on Ubuntu. Adding its
sys_platform marker preserved the pinned version; marker evaluation is true on
Windows and false on Linux. Local pip check and the complete223-test check pass.
[Linux CI38872338701](https://github.com/duclucky/slate-fold-genlayer/actions/runs/38872338701)
passed lint,104 Python,20 Node,99 frontend tests, TypeScript and build.

Five actual Chrome/OKX primary writes finalized on frontend4e03472 at the same
production origin: create, own motion, own ballot, review and2GEN withdrawal.
Their proof is browser-lifecycle-audit.json. The two peer motions/ballots used
scripts, never presented as browser signatures. The original deployment is
archived in hosting-revision-001.json with its source/upload manifest.

The current32bddef revision changes only read-error presentation after a real
temporary failure exposed SDK diagnostics. Its real-SDK regression proves a
failed read can recover to canonical credit with zero wallet writes; selected-
account/value regressions passed again. Successful reads and all write logic
are preserved. Actual current-production Account0GEN, six-round History,
passive wallet restoration and logout were rechecked after deploy. Both17-file
uploads came from reviewed Git bytes, not the full local working directory.
