#!/bin/bash
# cleanup.sh - Remove compiled JS files and caches

echo "🧹 Cleaning up compiled files and caches..."

# Remove all compiled .js files from TypeScript source directories
echo "Removing compiled .js files from source directories..."
find ../analyzer/src -name "*.js" -type f -delete
find ../analyzer/src -name "*.js.map" -type f -delete
find ../mailchain-service/src -name "*.js" -type f -delete
find ../mailchain-service/src -name "*.js.map" -type f -delete
find ../reputation-engine/src -name "*.js" -type f -delete
find ../reputation-engine/src -name "*.js.map" -type f -delete
find ../client/src -name "*.js" -type f -delete
find ../client/src -name "*.js.map" -type f -delete

# Remove dashboard caches
echo "Removing dashboard caches..."
rm -rf node_modules/.cache
rm -rf build
rm -rf .cache

# Remove service build directories
echo "Removing service build directories..."
rm -rf ../analyzer/dist
rm -rf ../analyzer/build
rm -rf ../mailchain-service/dist
rm -rf ../mailchain-service/build
rm -rf ../reputation-engine/dist
rm -rf ../reputation-engine/build
rm -rf ../client/dist
rm -rf ../client/build

echo "✅ Cleanup complete!"
echo ""
echo "📦 Next steps:"
echo "  1. Verify keywords.ts exists: ls ../analyzer/src/keywords.ts"
echo "  2. Install Solana deps: cd ../reputation-engine && npm install @solana/web3.js"
echo "  3. Return to dashboard: cd ../dashboard"
echo "  4. Start dev server: npm start"