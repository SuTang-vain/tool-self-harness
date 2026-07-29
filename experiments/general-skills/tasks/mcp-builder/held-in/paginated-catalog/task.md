# Build a paginated catalog MCP server

Implement `catalog_search` in `server.mjs`. The tool requires a string `query` and accepts optional integer `offset` (default 0) and `limit` (default 2, range 1–5). Search names case-insensitively, return matching rows plus the next offset when more results exist, and reject invalid/extra inputs or unknown tools. Run all tests.
