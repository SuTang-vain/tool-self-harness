# Build a tool-error-code-mapping MCP server

Implement lookup_invoice for invoice_id inv-1. Success returns JSON text. Missing/invalid input throws an error with code INVALID_ARGUMENT, an unknown invoice throws NOT_FOUND, and unknown tools throw UNKNOWN_TOOL. Keep error codes on the Error object. Run the tests.
