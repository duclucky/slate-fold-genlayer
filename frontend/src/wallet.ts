export interface Provider {request(args:{method:string;params?:unknown[]}):Promise<unknown>;on?(event:string,handler:(value:unknown)=>void):void;removeListener?(event:string,handler:(value:unknown)=>void):void;isMetaMask?:boolean;isRabby?:boolean;isCoinbaseWallet?:boolean;isBraveWallet?:boolean;providers?:Provider[]}
export interface WalletChoice {id:string;name:string;provider:Provider}
declare global {interface Window {ethereum?:Provider;okxwallet?:Provider;rabby?:Provider;coinbaseWalletExtension?:Provider}}
export const validAddress=(x:unknown):x is `0x${string}`=>typeof x==='string'&&/^0x[0-9a-fA-F]{40}$/.test(x)&&!/^0x0{40}$/i.test(x);
export async function discoverWallets():Promise<WalletChoice[]>{
 const choices:WalletChoice[]=[];const seen=new Set<Provider>();
 const add=(name:string,provider:Provider,id=name)=>{if(provider&&typeof provider.request==='function'&&!seen.has(provider)){seen.add(provider);choices.push({name,provider,id});}};
 const listener=(event:Event)=>{const d=(event as CustomEvent<{info:{name:string;uuid:string};provider:Provider}>).detail;if(d?.info&&d.provider)add(d.info.name,d.provider,d.info.uuid);};
 window.addEventListener('eip6963:announceProvider',listener);window.dispatchEvent(new Event('eip6963:requestProvider'));
 await new Promise(resolve=>setTimeout(resolve,250));window.removeEventListener('eip6963:announceProvider',listener);
 const injected=(name:string,provider:Provider)=>{if(!choices.some(choice=>choice.name.toLowerCase().replace(/\s/g,'')===name.toLowerCase().replace(/\s/g,'')))add(name,provider);};
 const name=(p:Provider)=>p.isRabby?'Rabby':p.isCoinbaseWallet?'Coinbase Wallet':p.isBraveWallet?'Brave Wallet':p.isMetaMask?'MetaMask':'Browser wallet';
 if(window.okxwallet)injected('OKX Wallet',window.okxwallet);if(window.rabby)injected('Rabby',window.rabby);if(window.coinbaseWalletExtension)injected('Coinbase Wallet',window.coinbaseWalletExtension);
 if(window.ethereum){for(const p of window.ethereum.providers??[window.ethereum])injected(name(p),p);}
 return choices;
}
export async function ensureChain(provider:Provider){
 const current=await provider.request({method:'eth_chainId'});if(current==='0xf22d'||current==='0xF22D')return;
 try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xf22d'}]});}
 catch(error){const code=(error as {code?:number}).code;if(code!==4902&&code!==-32603)throw error;
 await provider.request({method:'wallet_addEthereumChain',params:[{chainId:'0xf22d',chainName:'GenLayer Studio Dev',nativeCurrency:{name:'GEN',symbol:'GEN',decimals:18},rpcUrls:['https://studio-next.genlayer.com/api'],blockExplorerUrls:['https://explorer-studio-dev.genlayer.com']}]});
 await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xf22d'}]});}
 if(await provider.request({method:'eth_chainId'})!=='0xf22d')throw new Error('Switch your selected wallet to Studio Dev before continuing.');
}
export async function connectWallet(choice:WalletChoice){
 const accounts=await choice.provider.request({method:'eth_requestAccounts'});if(!Array.isArray(accounts)||!validAddress(accounts[0]))throw new Error('The selected wallet did not provide a valid account.');
 await ensureChain(choice.provider);return {choice,address:accounts[0]};
}
export function rememberWallet(choice:WalletChoice){try{localStorage.setItem('slatefold.wallet-choice',choice.name);}catch{}}
export function forgetWallet(){try{localStorage.removeItem('slatefold.wallet-choice');}catch{}}
export async function restoreWallet(){
 let name:string|null;try{name=localStorage.getItem('slatefold.wallet-choice');}catch{return;}
 if(!name)return;
 const choice=(await discoverWallets()).find(wallet=>wallet.name===name);if(!choice)return;
 try{
  const accounts=await choice.provider.request({method:'eth_accounts'});
  if(!Array.isArray(accounts)||!validAddress(accounts[0]))return;
  const chain=await choice.provider.request({method:'eth_chainId'});if(typeof chain!=='string'||chain.toLowerCase()!=='0xf22d')return;
  return {choice,address:accounts[0]};
 }catch{return;}
}
