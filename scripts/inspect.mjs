import {inspect,safeError} from './network.mjs';
try{console.log(JSON.stringify(await inspect(),null,2));}catch(error){console.log(JSON.stringify({inspectFailed:safeError(error)}));process.exitCode=1;}
