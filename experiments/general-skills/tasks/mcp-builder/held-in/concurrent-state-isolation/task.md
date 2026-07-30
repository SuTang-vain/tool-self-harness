# Build a concurrent-state-isolation MCP server

Implement begin_session, put_value, and get_value. Values must be isolated by session_id: writes in s1 cannot be read from s2. Require non-empty string session_id and key; put also requires string value. Reject missing sessions, invalid/extra arguments, and unknown tools. Run the tests.
