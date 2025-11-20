#!/bin/bash
# PDCA Reorganization Script
# Reorganizes 2025-11-19-UTC-1745.component-refactor-final.pdca.md to match CMM3 template

set -e  # Exit on error

SOURCE="2025-11-19-UTC-1745.component-refactor-final.pdca.md"
BACKUP="${SOURCE}.backup-$(date +%Y%m%d-%H%M%S)"
OUTPUT="${SOURCE}.reorganized"

echo "=== PDCA Reorganization Script ==="
echo "Source: $SOURCE"
echo "Backup: $BACKUP"
echo "Output: $OUTPUT"
echo ""

# Backup original
cp "$SOURCE" "$BACKUP"
echo "✅ Backup created: $BACKUP"

# Extract sections
echo "📋 Extracting sections..."

# Header (1-11)
sed -n '1,11p' "$SOURCE" > "$OUTPUT"
echo "" >> "$OUTPUT"

# Add SUMMARY section
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## **📊 SUMMARY**" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# OBJECTIVE (361-377)
sed -n '361,377p' "$SOURCE" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# TRON Feedback (378-1343)
sed -n '378,1343p' "$SOURCE" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Summary content (4179-4394) 
sed -n '4179,4394p' "$SOURCE" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add horizontal separator
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# PLAN section - combine multiple parts
echo "## **📋 PLAN**" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Implementation Strategy (12-43) - skip the header
sed -n '14,43p' "$SOURCE" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Web4 Principles Checklist (44-103) - skip the header
sed -n '46,103p' "$SOURCE" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# NEW Architecture (104-360) - skip the header  
sed -n '106,360p' "$SOURCE" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Current PLAN content (1344-4178) - skip the header
sed -n '1346,4178p' "$SOURCE" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add horizontal separator
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# DO (4395-4484)
sed -n '4395,4484p' "$SOURCE" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add horizontal separator
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# CHECK (4485-4559)
sed -n '4485,4559p' "$SOURCE" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Add horizontal separator
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# ACT (4560-4681)
sed -n '4560,4681p' "$SOURCE" >> "$OUTPUT"

echo "✅ Reorganization complete: $OUTPUT"
echo ""

# Verify line counts
ORIGINAL_LINES=$(wc -l < "$SOURCE")
OUTPUT_LINES=$(wc -l < "$OUTPUT")

echo "📊 Line Count Verification:"
echo "  Original: $ORIGINAL_LINES lines"
echo "  Output:   $OUTPUT_LINES lines"
echo ""

# Check if within reasonable range (may have added separators)
if [ $OUTPUT_LINES -ge $ORIGINAL_LINES ]; then
  echo "✅ Line count acceptable (added separators/headers)"
else
  echo "⚠️  Line count mismatch - manual review needed"
fi

echo ""
echo "=== Next Steps ==="
echo "1. Review: $OUTPUT"
echo "2. If correct: mv $OUTPUT $SOURCE"
echo "3. If incorrect: Restore from $BACKUP"
echo "4. Git commit when satisfied"

