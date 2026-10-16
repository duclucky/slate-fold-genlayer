import {spawnSync} from 'node:child_process';
import {existsSync,readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const windows=process.platform==='win32';
const python=windows?'.venv/Scripts/python.exe':'.venv/bin/python';
if(!existsSync(python))throw new Error('Create the project Python 3.12 .venv and install requirements.lock first.');
const steps=[
 [python,['scripts/genvm_lint_rc.py','check','contracts/slate_fold.py']],
 [python,['-m','pytest','tests/direct','tests/tooling','-q','--tb=short']],
 [process.execPath,['--test',...readdirSync('scripts').filter(name=>name.endsWith('.test.mjs')).map(name=>'scripts/'+name)]],
 [windows?'npm.cmd':'npm',['run','check','--workspace','frontend']],
];
for(const file of readdirSync('scripts').filter(name=>name.endsWith('.mjs'))){
 const result=spawnSync(process.execPath,['--check','scripts/'+file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status??1);
}
for(const [command,args] of steps){
 const result=spawnSync(command,args,{stdio:'inherit',env:{...process.env,PYTHONUTF8:'1'},shell:windows&&command==='npm.cmd'});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status??1);
}
mkdirSync('.codex',{recursive:true});
writeFileSync('.codex/last-check.json',JSON.stringify({at:new Date().toISOString(),command:'npm run check',exitCode:0,sourceSha256:createHash('sha256').update(readFileSync('contracts/slate_fold.py')).digest('hex')},null,2)+'\n');
console.log('SLATEFOLD_CHECK_PASS: contract lint + direct/tooling + receipt parser + frontend tests/typecheck/build.');
