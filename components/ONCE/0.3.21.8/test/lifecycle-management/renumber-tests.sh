#!/bin/bash
# Renumber ONCE Lifecycle Tests Script
# This script renumbers test files and updates their internal references

cd /Users/Shared/Workspaces/2cuGitHub/UpDown/components/ONCE/0.3.21.8/test/lifecycle-management

echo "🔄 Renumbering ONCE Lifecycle Tests to Logical Order..."
echo ""

# The correct logical order:
# 01: Path Authority (Foundation - must be first!)
# 02: Component Descriptor (Metadata)
# 03: Environment Detection (Configuration)
# 04: CLI Help (Usability)
# 05: Server Start (Lifecycle begins)
# 06: Demo Message (Basic functionality)
# 07: Component Loading (Dynamic import)
# 08: Scenario Hibernation (State persistence)
# 09: Multi-Peer (Distributed communication)
# 10: Server Shutdown (Lifecycle ends)
# 11: UUID Persistence (Identity across restarts)
# 12: Timestamp Accuracy (Temporal consistency)
# 13: Concurrent Handling (Thread safety)
# 14: Error Handling (Resilience)
# 15: Complete Integration (Full circle)

# Create mapping array (old_num:new_num:name)
declare -a mapping=(
  "14:01:PathAuthorityAndProjectRootDetection"
  "12:02:ComponentDescriptorValidation"
  "11:03:EnvironmentDetectionAndConfiguration"
  "13:04:CLICommandAvailabilityAndHelp"
  "01:05:ServerStartAndBootstrap"
  "02:06:DemoMessageBroadcast"
  "03:07:ComponentLoadingAndImport"
  "04:08:ScenarioHibernationAndPersistence"
  "05:09:MultiPeerMessageExchange"
  "06:10:ServerShutdownAndCleanup"
  "07:11:ScenarioUUIDUniquenessAndPersistence"
  "08:12:ScenarioTimestampAccuracyAndOrdering"
  "09:13:ConcurrentMessageHandlingAndRaceConditions"
  "10:14:ErrorHandlingAndRecovery"
  "15:15:CompleteLifecycleIntegrationFullCircle"
)

# Step 1: Rename files to temp names to avoid conflicts
echo "Step 1: Renaming files to temporary names..."
for item in "${mapping[@]}"; do
  IFS=':' read -r old_num new_num name <<< "$item"
  old_file="Test${old_num}_${name}.ts"
  temp_file="TEMP${new_num}_${name}.ts"
  
  if [ -f "$old_file" ]; then
    mv "$old_file" "$temp_file"
    echo "  Renamed: $old_file -> $temp_file"
  fi
done

echo ""
echo "Step 2: Renaming temp files to final names and updating content..."

# Step 2: Rename temp files to final names and update content
for item in "${mapping[@]}"; do
  IFS=':' read -r old_num new_num name <<< "$item"
  temp_file="TEMP${new_num}_${name}.ts"
  final_file="Test${new_num}_${name}.ts"
  
  if [ -f "$temp_file" ]; then
    # Update internal references
    sed -i '' "s/Test ${old_num}:/Test ${new_num}:/g" "$temp_file"
    sed -i '' "s/Test${old_num}_/Test${new_num}_/g" "$temp_file"
    sed -i '' "s/createTest${old_num}Scenario/createTest${new_num}Scenario/g" "$temp_file"
    sed -i '' "s/test:uuid:once-lifecycle-${old_num}-/test:uuid:once-lifecycle-${new_num}-/g" "$temp_file"
    
    # Rename to final name
    mv "$temp_file" "$final_file"
    echo "  ✅ $final_file (updated from Test ${old_num})"
  fi
done

echo ""
echo "Step 3: Listing final test order..."
ls -1 Test*.ts | nl

echo ""
echo "✨ Test renumbering complete!"
echo ""
echo "📋 Final Logical Order:"
echo "  01: Path Authority (FOUNDATION)"
echo "  02: Component Descriptor"
echo "  03: Environment Detection"
echo "  04: CLI Help"
echo "  05: Server Start"
echo "  06: Demo Message"
echo "  07: Component Loading"
echo "  08: Scenario Hibernation"
echo "  09: Multi-Peer"
echo "  10: Server Shutdown"
echo "  11: UUID Persistence"
echo "  12: Timestamp Accuracy"
echo "  13: Concurrent Handling"
echo "  14: Error Handling"
echo "  15: Complete Integration"

