#!/bin/sh
# npm test → test.sh → componentmigrator test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run componentmigrator test (handles vitest execution, recursion prevention, and promotion)
./componentmigrator test

