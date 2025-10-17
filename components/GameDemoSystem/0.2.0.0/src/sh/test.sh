#!/bin/sh
# npm test → test.sh → gamedemosystem test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run gamedemosystem test (handles vitest execution, recursion prevention, and promotion)
./gamedemosystem test

