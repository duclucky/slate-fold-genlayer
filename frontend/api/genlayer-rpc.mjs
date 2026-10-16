/** Fixed-origin, bounded read proxy. Wallet signing never passes through here. */
const RPC='https://studio-next.genlayer.com/api';
const methods=new Set(['eth_chainId','gen_call','eth_getTransactionByHash','eth_getTransactionCount','eth_estimateGas','eth_gasPrice','eth_getTransactionReceipt','eth_blockNumber','sim_getFeeConfig']);
const fields=(object,keys)=>Object.fromEntries(keys.filter(key=>object&&Object.hasOwn(object,key)).map(key=>[key,object[key]]));
function project(method,result){
 if(method==='gen_call'&&result&&typeof result==='object')return {...fields(result,['data','result','execution_result']),...result.status?{status:{code:result.status.code,message:result.status.code===0?'OK':'Contract read failed'}}:{}};
 if(method==='eth_getTransactionByHash'&&result){
  const safe=fields(result,['hash','from','to','sender','recipient','from_address','to_address','status','statusName','execution_result','txExecutionResult','txExecutionResultName','nonce','value','blockHash','blockNumber','transactionIndex','gas','gasPrice','type','input','v','r','s']);
  const leaders=result.consensus_data?.leader_receipt;
  if(leaders)safe.consensus_data={leader_receipt:(Array.isArray(leaders)?leaders:[leaders]).map(x=>fields(x,['execution_result']))};
  return safe;
 }
 if(method==='eth_getTransactionReceipt'&&result)return fields(result,['transactionHash','transactionIndex','blockHash','blockNumber','from','to','contractAddress','cumulativeGasUsed','gasUsed','effectiveGasPrice','logs','logsBloom','status','type','root']);
 if(method==='sim_getFeeConfig'&&result)return {enabled:result.enabled,policy:fields(result.policy,['genPerTimeUnit','storageUnitPrice','receiptGasPrice','timeUnitOverlayBps','intrinsicGas','bootloaderOverhead','gasPerChangedSlot','calldataGasPerByte','fixedProposeReceiptGas','fixedMessageRevealGas','messageFeeParamsBudgetFloor'])};
 return result;
}
export async function forwardRpc(body){
 const id=Number.isSafeInteger(body?.id)?body.id:1;
 const fail=(code,message)=>({jsonrpc:'2.0',id,error:{code,message}});
 if(!body||!methods.has(body.method)||!Array.isArray(body.params))return fail(-32601,'This proxy accepts only the configured read methods.');
 if(body.method==='gen_call'&&(body.params.length!==1||body.params[0]?.type!=='read'))return fail(-32602,'Only contract reads are accepted.');
 try{
  const response=await fetch(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id,method:body.method,params:body.params}),signal:AbortSignal.timeout(25000)});
  if(!response.ok)return fail(-32000,'Studio Dev read is temporarily unavailable.');
  const text=await response.text();if(text.length>2000000)return fail(-32000,'RPC response exceeded the configured bound.');
  const rpc=JSON.parse(text);
  if(rpc.error)return fail(Number.isInteger(rpc.error.code)?rpc.error.code:-32000,'Studio Dev could not complete this read.');
  return {jsonrpc:'2.0',id,result:project(body.method,rpc.result)};
 }catch{return fail(-32000,'Studio Dev read is temporarily unavailable.');}
}
export default async function handler(request,response){
 response.setHeader('content-type','application/json');response.setHeader('cache-control','no-store');
 if(request.method!=='POST'){response.statusCode=405;response.end(JSON.stringify({error:'Use POST for configured RPC reads.'}));return;}
 try{
  let body=request.body;
  if(!body){let text='';for await(const chunk of request){text+=chunk;if(text.length>65536){response.statusCode=413;response.end(JSON.stringify({error:'Request too large.'}));return;}}body=JSON.parse(text);}
  if(typeof body==='string')body=JSON.parse(body);
  if(JSON.stringify(body).length>65536){response.statusCode=413;response.end(JSON.stringify({error:'Request too large.'}));return;}
  response.end(JSON.stringify(await forwardRpc(body)));
 }catch{response.statusCode=400;response.end(JSON.stringify({error:'Invalid JSON request.'}));}
}
