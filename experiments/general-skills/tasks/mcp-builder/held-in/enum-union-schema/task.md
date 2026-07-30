# Build an enum-union-schema MCP server

Implement format_value. It requires value (string) and kind, where kind is exactly text or integer. Text returns the original value uppercased; integer parses a base-10 integer and returns its numeric text. Advertise the enum in the schema, reject other kinds, extra fields, malformed integers, and unknown tools. Run the tests.
