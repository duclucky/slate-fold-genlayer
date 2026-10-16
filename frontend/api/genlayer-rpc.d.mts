import type {IncomingMessage,ServerResponse} from 'node:http';
export function forwardRpc(body:unknown):Promise<unknown>;
export default function handler(request:IncomingMessage,response:ServerResponse):Promise<void>;
