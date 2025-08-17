#!/bin/bash

# Auto-commit script for oxide plugins indexer
# This script commits changes to output files if there are any

cd "$(dirname "$0")/.."

# Check if there are changes in output files
if git diff --quiet output/; then
    echo "No changes in output files"
    exit 0
fi

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Get count of plugins from JSON
PLUGIN_COUNT=$(jq '.count' output/oxide_plugins.json 2>/dev/null || echo "unknown")

# Commit changes
git add output/
git commit -m "Update plugins index: $PLUGIN_COUNT plugins at $TIMESTAMP"

echo "Committed changes: $PLUGIN_COUNT plugins at $TIMESTAMP"
