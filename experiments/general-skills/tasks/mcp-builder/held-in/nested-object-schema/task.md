# Build a nested-object-schema MCP server

Complete server.mjs. Expose a profile_patch tool with one required object argument, profile. The profile object accepts name (string) and labels (object of string values); reject unknown fields at both levels. Return the normalized profile as JSON text. Every object schema must be strict. Reject invalid arguments and unknown tools. Run the tests.
