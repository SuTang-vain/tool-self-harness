# Build a customer-directory MCP server

Complete `server.mjs` for the provided zero-dependency MCP stdio adapter. Expose a discoverable `customer_lookup` tool that accepts exactly one required string field, `customer_id`, and returns a text content result for known customers. Unknown customers, invalid arguments, and unknown tools must return clear errors. Keep stdout protocol-clean. Run `npm test` before finishing.
