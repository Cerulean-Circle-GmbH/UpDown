#!/usr/bin/env sh
# npm test → test.sh → vitest (with recursion prevention)
# When called via Web4TSComponent delegation, just run vitest directly

MODE=${1:-silent}

if [ "$MODE" = "verbose" ]; then
    # Verbose build (npm test / npm run build)
    ./src/sh/build.sh verbose
else
    # Silent build (implicit builds)
    ./src/sh/build.sh
fi

# 🚨 RECURSION PREVENTION: If called from npm test (via Web4TSComponent delegation),
# just run vitest directly. Don't call ./web4tscomponent test again!
# Web4TSComponent.test() already handles context and runs: execSync('npm test', { cwd: componentPath })
# So this script should just run the actual tests.
npx vitest run --bail=false
