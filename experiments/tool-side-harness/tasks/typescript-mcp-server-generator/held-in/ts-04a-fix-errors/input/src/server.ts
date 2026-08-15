import { McpServer } from '@modelcontextprotocol/server';
try { throw new Error('boom'); } catch (error) {
  if (error instanceof McpError) console.log(error.code);
}
