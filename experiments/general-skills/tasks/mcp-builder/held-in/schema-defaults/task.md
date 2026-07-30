# Build a schema-defaults MCP server

Implement search_records over records.json. Require query (string) and accept optional limit (integer 1..4, default 2). Advertise the default in the schema and return at most limit matching records by case-insensitive name. Reject invalid/extra arguments and unknown tools. Run the tests.
