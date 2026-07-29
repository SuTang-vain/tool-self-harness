# Fix snapshot aliasing

A Go snapshot method is documented to return an immutable point-in-time copy, but later mutations change earlier snapshots. Reproduce the test and fix the ownership bug without changing the API.
