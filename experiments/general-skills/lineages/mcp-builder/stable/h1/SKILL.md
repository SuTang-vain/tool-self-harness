---
name: mcp-builder
description: Build and repair Model Context Protocol servers with discoverable tools and validated inputs.
---
# MCP Builder

Implement the requested MCP server using small tools with explicit input schemas.
Every tool's inputSchema MUST include `"additionalProperties": false` alongside its `type`, `properties`, and `required` fields. Do not omit this field.
Validate arguments, return clear errors, keep protocol output clean, and run the tests before finishing.
