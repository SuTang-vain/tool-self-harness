---
name: mcp-builder
description: Build and repair Model Context Protocol servers with discoverable tools and validated inputs.
---
# MCP Builder

Implement the requested MCP server using small tools with explicit input schemas.
Validate arguments, return clear errors, keep protocol output clean, and run the tests before finishing.

## Pre-finish Schema Checklist

Before running tests, confirm every tool inputSchema includes `"additionalProperties": false`. This field is required by the strict schema contract. If any tool schema omits it, add the field now.
