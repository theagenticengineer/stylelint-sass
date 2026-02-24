#!/usr/bin/env bash
# fix-host-worktrees.sh
#
# Optional host-side script that makes worktrees created inside the devcontainer
# usable from the host. Run once on your host machine.
#
# Problem: Worktrees created inside the container have container-absolute paths
# in their .git files (e.g., gitdir: /workspaces/sass-lint/.git/worktrees/feature).
# On the host, /workspaces/sass-lint/ doesn't exist, so git operations fail.
#
# Solution: Create a symlink on the host so container paths resolve:
#   /workspaces/sass-lint → ~/workspace/sass-lint
#
# This does NOT modify anything inside the devcontainer. The container continues
# to use its native paths. The host follows the symlink transparently.
#
# Usage (from repo root on host):
#   .devcontainer/fix-host-worktrees.sh

set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPO_NAME="$(basename "$REPO_DIR")"
CONTAINER_PATH="/workspaces/$REPO_NAME"

if [ -L "$CONTAINER_PATH" ]; then
  EXISTING="$(readlink "$CONTAINER_PATH")"
  if [ "$EXISTING" = "$REPO_DIR" ]; then
    echo "fix-host-worktrees: $CONTAINER_PATH → $REPO_DIR (already set)"
    exit 0
  fi
  echo "fix-host-worktrees: $CONTAINER_PATH exists but points to $EXISTING (expected $REPO_DIR)" >&2
  exit 1
fi

if [ -e "$CONTAINER_PATH" ]; then
  echo "fix-host-worktrees: $CONTAINER_PATH already exists (not a symlink), skipping" >&2
  exit 1
fi

sudo mkdir -p /workspaces
sudo ln -sfn "$REPO_DIR" "$CONTAINER_PATH"
echo "fix-host-worktrees: $CONTAINER_PATH → $REPO_DIR"
echo "Worktrees created inside the devcontainer will now work on the host."
