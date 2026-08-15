import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/server';
import { SSEServerTransport } from '@modelcontextprotocol/server/sse.js';
const server = new McpServer({ name: 'demo', version: '1.0.0' });
createServer((req, res) => { res.end('ok'); }).listen(3000);
console.log(SSEServerTransport);
