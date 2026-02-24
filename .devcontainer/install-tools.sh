#!/usr/bin/env bash
# install-tools.sh
#
# Runs once via postCreateCommand when the container is first created (or rebuilt).
# Installs project dependencies and global CLI tools.
#
# Host Claude config is mounted at /home/node/.claude-host (staging path),
# NOT at ~/.claude. The installer writes to container-local ~/.claude safely.
# Auth/config symlinking happens later in link-claude-config.sh (postStartCommand).

set -euo pipefail

# --- Project dependencies ---
CI=1 pnpm install

# --- Global CLIs ---
npm i -g @withgraphite/graphite-cli

# --- Claude Code (writes to container-local ~/.claude — no host interference) ---
# The ~/.claude/projects bind mount causes Docker to create ~/.claude as root.
# Fix ownership so the installer (and Claude Code itself) can write to it.
sudo chown "$(id -u):$(id -g)" "$HOME/.claude"
curl -fsSL https://claude.ai/install.sh | bash

# --- uv/uvx (for PAL MCP server) ---
curl -LsSf https://astral.sh/uv/install.sh | sh

# --- Shell config ---
grep -q 'alias claude!' ~/.bashrc 2>/dev/null || \
  echo "alias claude!='claude --dangerously-skip-permissions'" >> ~/.bashrc
grep -q '.local/bin' ~/.bashrc 2>/dev/null || \
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
