#!/bin/sh
# npm test → test.sh → gameuserinterface test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run gameuserinterface test (handles vitest execution, recursion prevention, and promotion)
./gameuserinterface test

