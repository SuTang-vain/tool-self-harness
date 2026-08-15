import { McpServer } from '@modelcontextprotocol/server';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/node';

const server = new McpServer({ name: 'demo', version: '1.0.0' });
console.log(StreamableHTTPServerTransport);
