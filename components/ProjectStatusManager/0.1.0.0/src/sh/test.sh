#!/bin/sh
# npm test → test.sh → projectstatusmanager test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run projectstatusmanager test (handles vitest execution, recursion prevention, and promotion)
./projectstatusmanager test

