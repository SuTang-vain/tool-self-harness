# Fix configuration propagation

A Go service ignores a caller-provided timeout in one construction path. Run the tests, trace the value through constructors, and fix the production code without hardcoding the test value or changing public APIs. Run all Go tests.
