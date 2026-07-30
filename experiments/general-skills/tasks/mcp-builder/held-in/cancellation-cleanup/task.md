# Build a cancellation-cleanup MCP server

Implement start_job and cancel_job. start_job requires job_id and returns running status, rejecting duplicate active jobs. cancel_job requires job_id, changes an active job to cancelled, and rejects missing jobs or repeated cancellation. Keep state in memory and do not leave timers running. Run the tests.
