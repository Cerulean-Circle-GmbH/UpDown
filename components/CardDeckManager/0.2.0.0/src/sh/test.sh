#!/bin/sh
# npm test → test.sh → carddeckmanager test → vitest (with recursion prevention & promotion)

# Smart build before testing
./src/sh/build.sh

# Run carddeckmanager test (handles vitest execution, recursion prevention, and promotion)
./carddeckmanager test

