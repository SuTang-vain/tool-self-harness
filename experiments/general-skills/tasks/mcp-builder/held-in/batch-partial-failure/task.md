# Build a batch-partial-failure MCP server

Implement batch_lookup requiring ids, a non-empty array of strings. Return one result per id in input order: known ids have ok true and a value, missing ids have ok false and an error string. Do not abort the whole batch for one missing id. Reject invalid/extra arguments and unknown tools. Run the tests.
