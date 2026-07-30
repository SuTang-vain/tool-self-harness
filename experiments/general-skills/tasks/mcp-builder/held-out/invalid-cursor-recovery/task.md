# Build an invalid-cursor-recovery MCP server

Implement page over rows.json with required limit 1..2 and optional cursor. Return rows and next_cursor; invalid or stale cursors must throw an Error with code INVALID_CURSOR, not silently restart. Reject other invalid arguments and unknown tools. Run the tests.
