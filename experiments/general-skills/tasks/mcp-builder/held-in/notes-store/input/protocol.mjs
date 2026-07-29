import readline from 'node:readline';
import { listTools, callTool } from './server.mjs';
const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
for await (const line of rl) {
  if (!line.trim()) continue;
  const req=JSON.parse(line); let result;
  try {
    if(req.method==='initialize') result={protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'pilot-server',version:'1.0.0'}};
    else if(req.method==='tools/list') result={tools:await listTools()};
    else if(req.method==='tools/call') result=await callTool(req.params.name,req.params.arguments||{});
    else throw new Error('Method not found');
    process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:req.id,result})+'\n');
  } catch(error) { process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:req.id,error:{code:-32602,message:error.message}})+'\n'); }
}
