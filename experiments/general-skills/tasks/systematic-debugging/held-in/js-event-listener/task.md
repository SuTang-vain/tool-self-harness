# Fix duplicate event delivery

The Node.js subscription helper starts delivering every event multiple times after reconnecting. Reproduce with `npm test`, trace listener lifecycle, and fix production code without changing tests. Verify reconnect and cleanup behavior.
