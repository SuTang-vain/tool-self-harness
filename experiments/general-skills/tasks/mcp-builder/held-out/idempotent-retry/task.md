# Build an idempotent-retry MCP server

Implement charge requiring request_id and integer cents > 0. The first request creates one charge and returns charged true with charge_id ch1; repeating the same request_id must return the same charge without incrementing the charge count. Different request ids create separate charges. Reject invalid/extra arguments and unknown tools. Run the tests.
