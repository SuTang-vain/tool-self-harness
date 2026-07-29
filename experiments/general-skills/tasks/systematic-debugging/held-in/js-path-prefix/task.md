# Fix workspace path containment

The path guard incorrectly considers sibling directories to be inside the workspace when their names share a prefix. Reproduce the security test, identify the containment error, and fix it portably without changing the API.
