# Build a stdout-cleanliness MCP server

Implement emit_log with message and level (info or error). It must return a normal text result and never write logs to stdout; diagnostic logs may go to stderr. The stdio protocol must produce valid JSON-RPC lines for initialize, tools/list, and tools/call. Reject invalid/extra arguments and unknown tools. Run the tests.
