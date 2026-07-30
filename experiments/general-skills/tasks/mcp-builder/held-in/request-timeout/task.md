# Build a request-timeout MCP server

Implement slow_operation with required request_id and optional delay_ms. Delay values 0..50 return completed; values above 50 reject promptly with error code TIMEOUT. Reject negative/non-integer delays, missing fields, extra fields, and unknown tools. Run the tests.
