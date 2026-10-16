/** Owner-approved two-wallet setup; never prints key material. */
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {generatePrivateKey,privateKeyToAccount} from 'viem/accounts';
import {root,configuration,SafeError,safeError,save} from './network.mjs';
try{
 const ignored=spawnSync('git',['check-ignore','.env'],{cwd:root,encoding:'utf8'});
 if(ignored.status!==0)throw new SafeError('IgnoredEnvironmentRequired');
 const config=await configuration();let current='';
 try{current=await readFile(resolve(root,'.env'),'utf8');}catch(error){if(error.code!=='ENOENT')throw new SafeError('EnvironmentReadFailed');}
 const additions=[];const publicActors=[];
 for(const [role,name]of [['member2','SLATEFOLD_MEMBER2_PRIVATE_KEY'],['member3','SLATEFOLD_MEMBER3_PRIVATE_KEY']]){
  const key=config[name]??generatePrivateKey();
  if(!config[name])additions.push(name+'='+key);
  publicActors.push({role,address:privateKeyToAccount(key).address});
 }
 if(additions.length)await writeFile(resolve(root,'.env'),current+(current&&!current.endsWith('\n')?'\n':'')+additions.join('\n')+'\n',{mode:0o600});
 await save('demo-actors.json',{at:new Date().toISOString(),scope:'Distinct demo EOAs controlled by one demo operator; not independent people/adoption.',actors:publicActors});
 console.log(JSON.stringify({createdOrRecovered:publicActors,environmentIgnored:true,newWalletCount:additions.length}));
}catch(error){console.log(JSON.stringify({actorSetupStopped:safeError(error)}));process.exitCode=1;}
