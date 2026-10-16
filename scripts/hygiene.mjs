/** Read-only audit of index, paths, secrets and every reachable historical blob. */
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {root,configuration} from './network.mjs';
const run=args=>{const r=spawnSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});if(r.status!==0)throw Error('Git audit command failed: '+args[0]);return r.stdout.trim();};
const top=resolve(run(['rev-parse','--show-toplevel']));
if(top.toLowerCase()!==root.toLowerCase())throw Error('Wrong Git root');
const files=run(['ls-files']).split('\n').filter(Boolean);
const staged=run(['diff','--cached','--name-only']).split('\n').filter(Boolean);
const allowedTop=new Set(['.gitignore','.gitattributes','.env.example','README.md','package.json','package-lock.json','pytest.ini','gltest.config.yaml','requirements.txt','requirements.lock']);
const allowed=path=>allowedTop.has(path)||/^\.github\/workflows\/[a-z-]+\.ya?ml$/.test(path)||/^contracts\/[a-z_]+\.py$/.test(path)||/^tests\/(direct\/|tooling\/)?[a-z_]+\.py$/.test(path)||/^scripts\/[a-z0-9_.-]+\.(mjs|mts|py)$/.test(path)||/^docs\/(?:[A-Z0-9-]+\.md|evidence\/studio-dev\/[a-z0-9-]+\.json)$/.test(path)||/^frontend\/(?:\.env\.example|index\.html|package\.json|tsconfig\.json|vercel\.json|vite\.config\.ts|src\/[a-zA-Z0-9_.-]+\.(ts|tsx|css)|api\/[a-z0-9.-]+\.(mjs|mts))$/.test(path);
const forbidden=/(^|\/)(?:\.env(?:\..*)?|AGENTS\.md|CLAUDE\.md|\.codex|source-notes|research|references|templates|node_modules|\.venv|\.vercel)(?:\/|$)/i;
const issues=[];
const history=spawnSync('git',['log','--all','--format=','--name-only'],{cwd:root,encoding:'utf8'}).stdout.split('\n').filter(Boolean);
for(const path of new Set([...files,...history]))if(!allowed(path)||(forbidden.test(path)&&!path.endsWith('.env.example')))issues.push({kind:'NonPublicPath',path});
const config=await configuration();const secrets=Object.entries(config).filter(([k,v])=>/PRIVATE_KEY$/.test(k)&&/^0x[a-fA-F0-9]{64}$/.test(v)).map(([,v])=>v.slice(2).toLowerCase());
function scan(text,path,scope){
 if(secrets.some(secret=>text.toLowerCase().includes(secret)))issues.push({kind:'SecretMatch',path,scope});
 if(/(?:PRIVATE_KEY|API_KEY|TOKEN|PASSWORD)\s*=\s*["']?0x[0-9a-f]{64}/i.test(text))issues.push({kind:'SecretAssignment',path,scope});
}
for(const path of files)scan(run(['show',':'+path]),path,'index');
let historicalBlobCount=0;
for(const row of run(['rev-list','--objects','--all']).split('\n')){
 const object=row.slice(0,40),path=row.slice(41);
 if(!/^[a-f0-9]{40}$/.test(object)||run(['cat-file','-t',object])!=='blob')continue;
 scan(run(['cat-file','-p',object]),path,'history');historicalBlobCount++;
}
for(const path of ['.env','.venv','node_modules','.codex']){
 if(!existsSync(resolve(root,path)))issues.push({kind:'MissingLocalControl',path});
 if(spawnSync('git',['check-ignore',path],{cwd:root,encoding:'utf8'}).status!==0)issues.push({kind:'MissingIgnoreRule',path});
}
run(['diff','--check']);run(['diff','--cached','--check']);
console.log(JSON.stringify({gitRoot:top,trackedFileCount:files.length,stagedFiles:staged,historicalPathCount:new Set(history).size,historicalBlobCount,ignoredLocalControls:!issues.some(x=>x.kind==='MissingLocalControl'||x.kind==='MissingIgnoreRule'),issues,passed:issues.length===0},null,2));
if(issues.length)process.exitCode=1;
