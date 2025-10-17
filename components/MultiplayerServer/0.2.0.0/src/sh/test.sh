#!/bin/sh
# npm test → test.sh → multiplayerserver test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run multiplayerserver test (handles vitest execution, recursion prevention, and promotion)
./multiplayerserver test

