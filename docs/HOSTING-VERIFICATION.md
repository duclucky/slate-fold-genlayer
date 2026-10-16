# Production hosting verification

Live application: https://slate-fold-genlayer.vercel.app.
Production deployment: dpl_FRQ587yv2XFL6kCoV4bafSTXvxBB, state READY.
Frontend source commit:4e03472bf7a18b3a7279884793b911fb5f4079c9.

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
React root div, index-q_OV7r6f.js and index-BNMDLvwr.css.
Actual Chrome rendered all five canonical rounds through /genlayer-rpc.
No browser Failed-to-fetch/CORS error was observed on that successful read path.

The Windows-only pywin32 lock entry initially failed on Ubuntu. Adding its
sys_platform marker preserved the pinned version; marker evaluation is true on
Windows and false on Linux. Local pip check and the complete222-test check pass.
[Linux CI38845148997](https://github.com/duclucky/slate-fold-genlayer/actions/runs/38845148997)
then passed lint,104 Python,20 Node,98 frontend tests, TypeScript and build.

Browser write status is PENDING_REAL_EVIDENCE. OKX was discovered and selected
on the production origin, but eth_accounts returned an empty array and the
connection request did not complete. The prepared2GEN form has not been signed
or broadcast. No scripted signature is presented as a browser signature.
