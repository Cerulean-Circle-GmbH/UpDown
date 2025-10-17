#!/bin/sh
# npm test → test.sh → gamelogicengine test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run gamelogicengine test (handles vitest execution, recursion prevention, and promotion)
./gamelogicengine test

