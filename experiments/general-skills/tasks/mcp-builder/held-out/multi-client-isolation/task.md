# Build a multi-client-isolation MCP server

Implement open_client, client_put, and client_get. Each client_id owns an independent key/value map. A value written by client a must be unavailable to client b. Require non-empty strings, reject unknown clients and unknown tools, and run the tests.
