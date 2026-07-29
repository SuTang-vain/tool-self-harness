# Build an event pagination MCP server

Implement `events_list` with optional string `cursor` and optional integer `page_size` from 1 to 3 (default 2). Return events in source order and an opaque next cursor when more remain. Reject unknown cursors, invalid inputs, extra fields, and unknown tools. Run all tests.
