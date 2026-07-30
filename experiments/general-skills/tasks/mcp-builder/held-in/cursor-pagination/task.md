# Build a cursor-pagination MCP server

Implement audit_page over the supplied records.json. Expose required limit (integer 1..3) and optional opaque cursor. Return JSON text with records and next_cursor, using c0 for the first page and cN for later pages. Reject unknown or malformed cursors, invalid limits, extra fields, and unknown tools. Run the tests.
