#!/bin/sh
# npm test → test.sh → updown.ui test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run updown.ui test (handles vitest execution, recursion prevention, and promotion)
./updown.ui test

