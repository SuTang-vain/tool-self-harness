# Build a transport-framing MCP server

Implement an echo tool requiring a string message. The existing protocol adapter must remain able to process multiple JSON-RPC requests sent as separate lines, emit exactly one valid JSON response line per request, and never print diagnostics to stdout. Reject invalid arguments and unknown tools. Run the tests.
