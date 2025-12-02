#!/bin/bash
# Batch Migration: Convert ALL tests to external scenarios
# Radical OOP: Scenarios are THINGS (files), not functions!

cd "$(dirname "$0")"

echo "🚀 Batch Scenario Migration"
echo "=============================="
echo ""

# Test03
echo "📝 Test03: Removing functional factory..."
sed -i.bak '/^\/\*\*$/,/^export function createTest11Scenario/{ /^export function createTest11Scenario/,/^}$/d; }' Test03_EnvironmentDetectionAndConfiguration.ts
sed -i.bak '/^export function createTest11Scenario/,/^}$/d' Test03_EnvironmentDetectionAndConfiguration.ts

# Test04  
echo "📝 Test04: Removing functional factory..."
sed -i.bak '/^export function createTest13Scenario/,/^}$/d' Test04_CLICommandAvailabilityAndHelp.ts

# Test05
echo "📝 Test05: Removing functional factory..."
sed -i.bak '/^export function createTest01Scenario/,/^}$/d' Test05_ServerStartAndBootstrap.ts

# Test06
echo "📝 Test06: Removing functional factory..."
sed -i.bak '/^export function createTest02Scenario/,/^}$/d' Test06_DemoMessageBroadcast.ts

# Test07
echo "📝 Test07: Removing functional factory..."
sed -i.bak '/^export function createTest03Scenario/,/^}$/d' Test07_ComponentLoadingAndImport.ts

# Test08
echo "📝 Test08: Removing functional factory..."
sed -i.bak '/^export function createTest04Scenario/,/^}$/d' Test08_ScenarioHibernationAndPersistence.ts

# Test09
echo "📝 Test09: Removing functional factory..."
sed -i.bak '/^export function createTest05Scenario/,/^}$/d' Test09_MultiPeerMessageExchange.ts

# Test10
echo "📝 Test10: Removing functional factory..."
sed -i.bak '/^export function createTest06Scenario/,/^}$/d' Test10_ServerShutdownAndCleanup.ts

# Clean up backup files
rm -f *.bak

echo ""
echo "✅ Batch migration complete!"
echo ""
echo "Next: Add loadTestScenario() method to each test"

