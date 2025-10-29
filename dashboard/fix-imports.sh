#!/bin/bash
# fix-imports.sh
# Script to fix TypeScript imports for proper ES module resolution

echo "🔧 Fixing TypeScript imports for ES modules..."

# Function to fix imports in a directory
fix_imports() {
  local dir=$1
  echo "Processing $dir..."
  
  # Fix relative imports to use .js extensions (TypeScript ES module requirement)
  find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
    "s|from '\(\.\.*/[^']*\)'|from '\1.js'|g; s|from \"\(\.\.*/[^\"]*\)\"|from \"\1.js\"|g" {} +
  
  # Remove duplicate .js.js extensions (in case script runs twice)
  find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
    "s|\.js\.js|.js|g" {} +
  
  # Ensure .js extension is added to local imports without path
  find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
    "s|from '\(\./[a-zA-Z0-9_-]*\)'|from '\1.js'|g; s|from \"\(\./[a-zA-Z0-9_-]*\)\"|from \"\1.js\"|g" {} +
  
  # Clean up any .js.js again
  find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
    "s|\.js\.js|.js|g" {} +
}

# Fix all service directories
fix_imports "../analyzer/src"
fix_imports "../mailchain-service/src"
fix_imports "../reputation-engine/src"
fix_imports "../client/src"

echo ""
echo "✅ All imports fixed with .js extensions!"
echo ""
echo "🔧 Now fixing dashboard import paths to use aliases..."

# Fix dashboard to use path aliases (NO .js extension for aliased imports)
find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ['\''"]\.\.\/\.\.\/\.\.\/analyzer\/src\/\([^'\''"]*.js\)|from '\''@analyzer/\1|g' {} +

find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ['\''"]\.\.\/\.\.\/\.\.\/mailchain-service\/src\/\([^'\''"]*.js\)|from '\''@mailchain-service/\1|g' {} +

find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ['\''"]\.\.\/\.\.\/\.\.\/reputation-engine\/src\/\([^'\''"]*.js\)|from '\''@reputation-engine/\1|g' {} +

find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  's|from ['\''"]\.\.\/\.\.\/\.\.\/client\/src\/\([^'\''"]*.js\)|from '\''@client/\1|g' {} +

# Remove .js from aliased imports (aliases don't need extensions)
find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  "s|from '@analyzer/\(.*\)\.js'|from '@analyzer/\1'|g" {} +

find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  "s|from '@mailchain-service/\(.*\)\.js'|from '@mailchain-service/\1'|g" {} +

find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  "s|from '@reputation-engine/\(.*\)\.js'|from '@reputation-engine/\1'|g" {} +

find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  "s|from '@client/\(.*\)\.js'|from '@client/\1'|g" {} +

echo "✅ Dashboard import paths fixed!"
echo ""
echo "📋 Summary:"
echo "  - Service files: Use .js extensions for relative imports"
echo "  - Dashboard files: Use path aliases WITHOUT .js extensions"
echo ""
echo "🔄 Clear cache and restart: rm -rf node_modules/.cache && npm start"