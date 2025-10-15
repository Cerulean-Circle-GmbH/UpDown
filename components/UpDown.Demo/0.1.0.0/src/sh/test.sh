#!/bin/sh
# npm test → test.sh → updown.demo test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run updown.demo test (handles vitest execution, recursion prevention, and promotion)
./updown.demo test

