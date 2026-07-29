---
name: mcp-builder
summary: Build reliable Model Context Protocol servers with clear tools, strict schemas, and testable behavior.
---

# MCP Builder

When building an MCP server:

1. Inspect the requested resources and operations.
2. Define small, discoverable tools with explicit JSON schemas.
3. Validate required inputs and return structured errors.
4. Keep protocol messages on stdout and diagnostics on stderr.
5. Add tests for tool listing, valid calls, invalid inputs, and unknown tools.
