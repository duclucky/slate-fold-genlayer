export function receiptState(receipt:unknown):{status:string;execution:string;successful:boolean};
export function safeReceipt(receipt:unknown):Record<string,unknown>;
export function address(value:unknown):string|null;
export function hash(value:unknown):string|null;
