#!/bin/sh
# npm test → test.sh → updown.server test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run updown.server test (handles vitest execution, recursion prevention, and promotion)
./updown.server test

