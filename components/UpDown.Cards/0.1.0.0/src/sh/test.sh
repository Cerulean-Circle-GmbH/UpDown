#!/bin/sh
# npm test → test.sh → updown.cards test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run updown.cards test (handles vitest execution, recursion prevention, and promotion)
./updown.cards test

