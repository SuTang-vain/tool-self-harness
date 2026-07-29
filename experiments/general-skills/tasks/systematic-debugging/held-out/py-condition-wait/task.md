# Fix flaky condition waiting

The waiting helper is flaky and sometimes misses a condition that becomes true during the timeout. Diagnose its timing logic and replace fixed one-shot waiting with bounded condition polling. Preserve the API and avoid busy-waiting.
