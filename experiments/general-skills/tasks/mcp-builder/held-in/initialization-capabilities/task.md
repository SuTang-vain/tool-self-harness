# Build an initialization-capabilities MCP server

Implement getCapabilities and listTools. Advertise tools listChanged false and resources subscribe false, and make the advertised capability match the returned tool list containing health_check. health_check returns ok text. Reject unknown tools. Run the tests.
