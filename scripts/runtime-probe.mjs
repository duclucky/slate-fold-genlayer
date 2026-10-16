/** Unsigned exact-source constructor/schema check. No wallet or broadcast. */
import {readFile} from 'node:fs/promises';
import {abi} from 'genlayer-js';
import {toHex} from 'viem';
import {sourcePath,rpc,save,identity,verifyNetwork,safeError} from './network.mjs';
const result={at:new Date().toISOString(),command:'node scripts/runtime-probe.mjs',scope:'Unsigned exact-source simulation and schema only; no finalized consensus or value.',network:await verifyNetwork(),identity:await identity(),checks:[]};
const source=await readFile(sourcePath,'utf8');
try{
 const schema=await rpc('gen_getContractSchemaForCode',[toHex(source)]);
 const names=Object.keys(schema?.methods??{}).sort();
 result.checks.push({name:'schema',hasConstructor:!!schema?.ctor,methods:names,passed:!!schema?.ctor&&names.length===14});
}catch(error){result.checks.push({name:'schema',passed:false,error:safeError(error)});}
try{
 const data=abi.transactions.serialize([source,abi.calldata.encode(abi.calldata.makeCalldataObject(undefined,[])),false]);
 const receipt=await rpc('sim_call',[{type:'deploy',from:'0x0000000000000000000000000000000000000001',to:'0x0000000000000000000000000000000000000000',data}]);
 result.checks.push({name:'constructor',executionResult:['SUCCESS','ERROR'].includes(receipt?.execution_result)?receipt.execution_result:'UNKNOWN',passed:receipt?.execution_result==='SUCCESS'});
}catch(error){result.checks.push({name:'constructor',passed:false,error:safeError(error)});}
result.passed=result.checks.every(x=>x.passed);await save('runtime-probe.json',result);console.log(JSON.stringify(result));process.exitCode=result.passed?0:1;
