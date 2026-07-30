# Build an optional-null-schema MCP server

Implement user_note. It requires user_id (string) and accepts optional note, which may be a string or null. An omitted note and a null note both mean no note. Return JSON text with user_id and note. Mark the field nullable in the schema, reject non-string non-null notes, extra fields, and unknown tools. Run the tests.
