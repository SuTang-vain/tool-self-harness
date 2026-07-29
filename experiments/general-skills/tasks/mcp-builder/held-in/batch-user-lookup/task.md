# Build a batch user lookup MCP server

Implement a `users_get_many` tool. It requires `user_ids`, a non-empty array of unique strings with at most 5 entries. Return one line per requested id in request order, marking missing users without failing the entire batch. Reject duplicate ids, invalid arrays, extra fields, and unknown tools. Run all tests.
