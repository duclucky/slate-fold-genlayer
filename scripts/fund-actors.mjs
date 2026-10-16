/** The two approved 1 GEN funding transfers. Default is inspect only. */
import {actors,balance,gen,client,verifyNetwork,save,SafeError,safeError,rpc} from './network.mjs';
import {sendJournal,loadJournal,nativeReceipt} from './journal.mjs';
const GEN=10n**18n;
async function fund(){
 const network=await verifyNetwork();const accounts=await actors();
 if(!process.argv.includes('--execute')){
  const balances=[];for(const account of accounts)balances.push({address:account.address,balanceGEN:gen(await balance(account.address))});
  console.log(JSON.stringify({mode:'inspect',network,plan:'1 GEN from sponsor to each of two demo EOAs; retain purse and fee reserve.',balances}));return;
 }
 const source=accounts[0];
 const outstanding=[];
 for(let i=1;i<=2;i++)if(!(await loadJournal('funding-member'+(i+1)+'.json'))?.hash)outstanding.push(i);
 if(outstanding.length&&await balance(source.address)<(2n+BigInt(outstanding.length))*GEN+10n**16n)throw new SafeError('PurseAndFundingReserveRequired');
 for(let i=1;i<=2;i++){
  const recipient=accounts[i];const name='funding-member'+(i+1)+'.json';
  const before={sourceGEN:gen(await balance(source.address)),recipientGEN:gen(await balance(recipient.address))};
  const record=await sendJournal(name,{...network,operation:'fund member'+(i+1),from:source.address,to:recipient.address,valueGEN:'1',before},()=>client(source).transfer({to:recipient.address,value:GEN}));
  if(record.status==='CONFIRMED_NATIVE'){console.log(JSON.stringify({recoveredFunding:true,hash:record.hash,to:recipient.address,valueGEN:'1'}));continue;}
  const receipt=await nativeReceipt(record.hash);const tx=await rpc('eth_getTransactionByHash',[record.hash]);
  if(receipt.from?.toLowerCase()!==source.address.toLowerCase()||receipt.to?.toLowerCase()!==recipient.address.toLowerCase()||BigInt(tx.value)!==GEN)throw new SafeError('NativeFundingIdentityMismatch');
  const after={sourceGEN:gen(await balance(source.address)),recipientGEN:gen(await balance(recipient.address))};
  const sourceBefore=BigInt(record.before.sourceGEN.split('.')[0])*GEN+BigInt((record.before.sourceGEN.split('.')[1]??'').padEnd(18,'0'));
  const recipientBefore=BigInt(record.before.recipientGEN.split('.')[0])*GEN+BigInt((record.before.recipientGEN.split('.')[1]??'').padEnd(18,'0'));
  if(await balance(recipient.address)!==recipientBefore+GEN||await balance(source.address)>sourceBefore-GEN)throw new SafeError('NativeFundingBalanceProofMismatch');
  Object.assign(record,{status:'CONFIRMED_NATIVE',confirmedObservedAt:new Date().toISOString(),after,receipt:{status:receipt.status,transactionHash:receipt.transactionHash,blockNumber:receipt.blockNumber,from:receipt.from,to:receipt.to},recipientIncreaseGEN:'1'});
  await save(name,record);console.log(JSON.stringify(record));
 }
}
try{await fund();}catch(error){console.log(JSON.stringify({fundingStopped:safeError(error)}));process.exitCode=1;}
