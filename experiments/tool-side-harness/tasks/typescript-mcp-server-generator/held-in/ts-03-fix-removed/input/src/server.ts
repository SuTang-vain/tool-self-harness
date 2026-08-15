import { McpServer } from '@modelcontextprotocol/server';
import { SSEServerTransport } from '@modelcontextprotocol/server/sse.js';
const server = new McpServer({ name: 'demo', version: '1.0.0' });
console.log(SSEServerTransport);
