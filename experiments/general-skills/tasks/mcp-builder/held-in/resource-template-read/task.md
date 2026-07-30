# Build a resource-template-read MCP server

Implement listResources and readResource in server.mjs. Advertise a resource template for users/{user_id}/profile with text/plain MIME type. readResource must return the matching URI and a text body for u1 and u2, and reject unknown URI patterns or users. Run the tests.
