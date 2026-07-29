# Fix cross-test state pollution

The full Python test suite is order-dependent: tests pass alone but fail together. Reproduce the full-suite failure, locate the shared mutable state, and make the smallest production fix without modifying tests. Verify individual tests and the complete suite.
