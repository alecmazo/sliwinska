#!/usr/bin/env bash
# Mirror apps/sliw-agent code from the DGA monorepo worktree into this Sliwinska repo.
#
# Production CRM + media live in ONE Railway Postgres (DATABASE_URL on
# web + sliw services). This script never copies local CRM JSON dumps into
# git — those files are gitignored and are not the source of truth.
#
# Usage (from anywhere):
#   ./scripts/sync-sliw-agent-from-dga.sh
#   DGA_SLIW=/path/to/monorepo/apps/sliw-agent ./scripts/sync-sliw-agent-from-dga.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/apps/sliw-agent"

# Default: sibling Grok worktree used for DGA / Railway deploys
DEFAULT_DGA="${HOME}/.grok/worktrees/desktop-claude-research-analyst/2026-07-13-3a2bb445/apps/sliw-agent"
SRC="${DGA_SLIW:-$DEFAULT_DGA}"

if [[ ! -d "$SRC/sliw_agent" ]]; then
  echo "error: DGA sliw-agent not found at: $SRC" >&2
  echo "set DGA_SLIW=/path/to/apps/sliw-agent" >&2
  exit 1
fi

if [[ ! -d "$DEST" ]]; then
  echo "error: Sliwinska apps/sliw-agent missing at: $DEST" >&2
  exit 1
fi

echo "Sync (code only) → $DEST"
echo "  from: $SRC"
echo "  skip: data/**/*.json, __pycache__, .env (CRM lives in Railway Postgres)"
echo ""

rsync -a \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.env' \
  --exclude '.env.*' \
  --exclude 'data/*.json' \
  --exclude 'data/**/*.json' \
  --exclude 'docs/node_modules' \
  "$SRC/" "$DEST/"

echo "Done. Remaining non-json diffs (should be empty):"
diff -rq --exclude='__pycache__' --exclude='*.pyc' --exclude='*.json' "$SRC" "$DEST" 2>/dev/null || true

cat <<'EOF'

Data safety
  • Live leads/payments/media config: Railway Postgres only
  • Do not import a second DATABASE_URL for Sliw while this DB is production
  • Local data/*.json (if present) are offline fallbacks — never overwrite Postgres from them casually

After sync
  • Review: git -C Sliwinska status
  • Live wedding/desk still deploys from DGA monorepo → Railway until cutover
  • Marketing: Sliwinska public/ → Vercel
EOF
