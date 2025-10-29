#!/bin/bash
# remove-js-extensions.sh
# Remove .js extensions from all TypeScript imports

echo "🔧 Removing .js extensions from TypeScript imports..."

# Function to process files
remove_js_ext() {
  local dir=$1
  echo "Processing $dir..."
  
  # Remove .js from relative imports
  find "$dir" -type f -name "*.ts" -o -name "*.tsx" | while read file; do
    sed -i "s/from '\([.][^']*\)\.js'/from '\1'/g" "$file"
    sed -i 's/from "\([.][^"]*\)\.js"/from "\1"/g' "$file"
  done
}

# Process all service directories
remove_js_ext "../analyzer/src"
remove_js_ext "../mailchain-service/src"
remove_js_ext "../reputation-engine/src"
remove_js_ext "../client/src"
remove_js_ext "./src"

echo "✅ All .js extensions removed from imports!"