/** Current prices and representative GenVM measurements; never supplies verdicts. */
import {readFile} from 'node:fs/promises';
import {abi,createFeesDistribution} from 'genlayer-js';
import {sourcePath,rpc,client,SafeError} from './network.mjs';
export function rpcFees(quote){return JSON.parse(JSON.stringify({distribution:quote.distribution,messageAllocations:quote.messageAllocations??[],feeValue:quote.feeValue},(_key,value)=>typeof value==='bigint'?value.toString():value));}
export async function quoteDeploy(account){
 const baseline=await client(account).estimateTransactionFees();
 const code=await readFile(sourcePath,'utf8');
 const data=abi.transactions.serialize([code,abi.calldata.encode(abi.calldata.makeCalldataObject(undefined,[])),false]);
 const estimate=await rpc('sim_estimateTransactionFees',[{type:'deploy',from:account.address,to:'0x0000000000000000000000000000000000000000',data,fees:rpcFees(baseline)}]);
 const preset=estimate?.recommendedPreset;
 if(!preset?.distribution||!preset.feeValue)throw new SafeError('MeasuredDeploymentFeeQuoteRequired');
 const feeValue=BigInt(preset.feeValue);
 if(feeValue<=0n||feeValue>=10n**18n)throw new SafeError('DeploymentFeeQuoteOutsideBound');
 return {distribution:createFeesDistribution(preset.distribution),feeValue,messageAllocations:preset.messageAllocations??[]};
}
export async function quoteWrite(account,address,functionName,args,value=0n){
 const estimate=await client(account).estimateTransactionFeesForWrite({address,functionName,args,value});
 if(estimate.policy.enabled&&estimate.feeValue<=0n)throw new SafeError('FundedFeeQuoteRequired');
 if(estimate.feeValue>=10n**18n)throw new SafeError('WriteFeeQuoteOutsideBound');
 return {distribution:estimate.distribution,feeValue:estimate.feeValue,messageAllocations:estimate.messageAllocations};
}
