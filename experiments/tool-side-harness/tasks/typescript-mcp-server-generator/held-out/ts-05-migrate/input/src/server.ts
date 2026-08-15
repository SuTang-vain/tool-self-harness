import { McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
try { throw new Error('boom'); } catch (error) {
  if (error instanceof McpError) console.log(error.code);
}
console.log(SSEServerTransport);
