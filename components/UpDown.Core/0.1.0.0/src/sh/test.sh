#!/bin/sh
# npm test → test.sh → updown.core test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run updown.core test (handles vitest execution, recursion prevention, and promotion)
./updown.core test

