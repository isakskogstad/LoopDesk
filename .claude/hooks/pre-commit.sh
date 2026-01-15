#!/bin/bash
# Pre-commit hook - Kodgranskning med Claude Code
# Installera: ln -sf $(pwd)/.claude/hooks/pre-commit.sh .git/hooks/pre-commit

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$')

if [ -z "$STAGED_FILES" ]; then
  exit 0
fi

echo "🔍 Kör kodgranskning på staged files..."

# Skapa temporär fil med ändringar
DIFF=$(git diff --cached)

# Kör Claude Code i print mode för snabb granskning
REVIEW=$(claude -p "Granska följande kod-ändringar kort. Lista ENDAST kritiska problem (säkerhet, buggar, typfel). Max 5 punkter. Om inga problem, svara 'OK'.

$DIFF" 2>/dev/null)

if [ $? -ne 0 ]; then
  echo "⚠️  Kunde inte köra kodgranskning, fortsätter ändå..."
  exit 0
fi

if [[ "$REVIEW" == *"OK"* ]] || [ ${#REVIEW} -lt 20 ]; then
  echo "✅ Kodgranskning: Inga kritiska problem"
  exit 0
fi

echo ""
echo "📋 Kodgranskning hittade följande:"
echo "─────────────────────────────────"
echo "$REVIEW"
echo "─────────────────────────────────"
echo ""
read -p "Fortsätt med commit? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Commit avbruten"
  exit 1
fi

exit 0
