#!/bin/bash

# File Integrity Verification Script
# This script checks that all critical files are present and not empty

echo "🔍 Verifying repository integrity..."

# Define critical files that must exist and not be empty
CRITICAL_FILES=(
    "package.json"
    "server/package.json"
    "server/tsconfig.json"
    "jsconfig.json"
    "vite.config.js"
    "tailwind.config.js"
    "src/main.jsx"
    "src/App.jsx"
    "server/index.ts"
    "server/src/context.ts"
    "server/src/trpc.ts"
    "prisma/schema.prisma"
    "README.md"
)

# Define files that can be empty (but must exist)
OPTIONAL_FILES=(
    ".env"
    ".env.local"
    ".gitignore"
)

errors=0
warnings=0

# Check critical files
echo "Checking critical files..."
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ ERROR: $file is missing"
        ((errors++))
    elif [ ! -s "$file" ]; then
        echo "❌ ERROR: $file is empty"
        ((errors++))
    else
        echo "✅ $file - OK"
    fi
done

# Check optional files
echo -e "\nChecking optional files..."
for file in "${OPTIONAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "⚠️  WARNING: $file is missing (optional)"
        ((warnings++))
    else
        echo "✅ $file - OK"
    fi
done

# Check TypeScript configuration
echo -e "\nChecking TypeScript configuration..."
if [ -f "server/tsconfig.json" ]; then
    if (cd server && npm run build) > /dev/null 2>&1; then
        echo "✅ Server TypeScript compilation - OK"
    else
        echo "❌ ERROR: Server TypeScript compilation failed"
        ((errors++))
    fi
else
    echo "❌ ERROR: server/tsconfig.json is missing"
    ((errors++))
fi

# Check build capability
echo -e "\nChecking build capability..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend build - OK"
else
    echo "❌ ERROR: Frontend build failed"
    ((errors++))
fi

# Check for empty directories that might cause issues
echo -e "\nChecking for empty directories..."
EMPTY_DIRS=$(find . -type d -empty -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null)
if [ -n "$EMPTY_DIRS" ]; then
    echo "⚠️  WARNING: Found empty directories:"
    echo "$EMPTY_DIRS"
    ((warnings++))
fi

# Summary
echo -e "\n📊 VERIFICATION SUMMARY"
echo "======================="
echo "Critical files checked: ${#CRITICAL_FILES[@]}"
echo "Optional files checked: ${#OPTIONAL_FILES[@]}"
echo "Errors found: $errors"
echo "Warnings found: $warnings"

if [ $errors -eq 0 ]; then
    echo -e "\n🎉 SUCCESS: Repository is ready for VPS deployment!"
    echo "All critical files are present and valid."
    exit 0
else
    echo -e "\n❌ FAILURE: Repository has $errors critical issues that must be fixed before deployment."
    exit 1
fi
