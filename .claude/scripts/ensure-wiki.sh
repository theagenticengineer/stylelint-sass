#!/usr/bin/env bash
set -euo pipefail
WIKI_PATH="${1:-/workspaces/sass-lint/.wiki}"
WIKI_REPO="https://github.com/theagenticengineer/stylelint-sass.wiki.git"
if [ ! -d "$WIKI_PATH" ]; then
  git clone "$WIKI_REPO" "$WIKI_PATH"
else
  git -C "$WIKI_PATH" pull --ff-only 2>/dev/null || true
fi
echo "$WIKI_PATH"
