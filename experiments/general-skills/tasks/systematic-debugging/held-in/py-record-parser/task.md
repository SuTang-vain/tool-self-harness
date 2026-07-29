# Fix record parsing at blank lines

The parser silently drops records after a blank line. Reproduce the failure and trace how line iteration terminates. Preserve the API, ignore blank lines, reject malformed nonblank rows, and run the full suite.
