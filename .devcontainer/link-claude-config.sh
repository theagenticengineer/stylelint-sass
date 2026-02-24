#!/usr/bin/env bash
# link-claude-config.sh
#
# Symlinks Claude Code auth, config, and session files from the container-local
# ~/.claude to the host staging mount at ~/.claude-host. This provides:
#
#   - Auth persistence across rebuilds (credentials survive installer overwrites)
#   - Bidirectional session sync (host <-> container /resume works)
#   - Host MCP config available in container
#   - Installer isolation (claude install writes to container-local dir only)
#
# Runs via postStartCommand on every container start (including the first start
# after postCreateCommand installs Claude Code).

set -euo pipefail

STAGING="/home/node/.claude-host"
STAGING_JSON="/home/node/.claude-host.json"
CLAUDE_DIR="${HOME}/.claude"
CLAUDE_JSON="${HOME}/.claude.json"

# --- Helper: create a symlink from $target -> $source ---
# If the container has a real file but host staging doesn't, seeds the host first.
# Always creates the symlink (even dangling) so future writes go to the host.
link_file() {
  local target="$1"   # container-local path (will become symlink)
  local source="$2"   # staging mount path (host file)

  # Already correctly linked — nothing to do
  if [[ -L "$target" ]] && [[ "$(readlink "$target")" == "$source" ]]; then
    return 0
  fi

  mkdir -p "$(dirname "$target")"
  mkdir -p "$(dirname "$source")"

  # If container has a real file but host doesn't, seed host from container
  # (first-build case: user authenticated in container, tokens need to reach host)
  if [[ -e "$target" ]] && [[ ! -L "$target" ]] && [[ ! -e "$source" ]]; then
    cp -a "$target" "$source"
  fi

  # Remove existing file/dir/symlink at target
  rm -rf "$target"

  # Create symlink (may be dangling if source doesn't exist yet — that's OK;
  # when Claude writes the file, it goes through to the staging mount)
  ln -s "$source" "$target"
}

# --- 1. Top-level config (OAuth session, project settings) ---
link_file "$CLAUDE_JSON" "$STAGING_JSON"
echo "link-claude-config: ~/.claude.json -> staging"

# --- 2. Auth credentials ---
link_file "$CLAUDE_DIR/.credentials.json" "$STAGING/.credentials.json"
echo "link-claude-config: .credentials.json -> staging"

# --- 3. MCP server config ---
link_file "$CLAUDE_DIR/.mcp.json" "$STAGING/.mcp.json"
echo "link-claude-config: .mcp.json -> staging"

# --- 3b. Register MCP servers from .mcp.json into ~/.claude.json ---
# Claude Code CLI stores user-scope MCP servers at the top-level "mcpServers"
# key in ~/.claude.json — NOT in the .mcp.json file. The .mcp.json file is
# treated as an external config needing per-project approval. To make servers
# available automatically, we copy definitions from .mcp.json into the
# ~/.claude.json top-level mcpServers (the same place `claude mcp add` writes).
MCP_JSON="$CLAUDE_DIR/.mcp.json"
CONTAINER_PATH_FOR_MCP="${CONTAINER_WORKSPACE_FOLDER:-$PWD}"
if [[ -f "$MCP_JSON" ]] && [[ -f "$CLAUDE_JSON" ]]; then
  python3 -c "
import json, sys

mcp_path = '$MCP_JSON'
claude_json_path = '$CLAUDE_JSON'
container_path = '$CONTAINER_PATH_FOR_MCP'

try:
    with open(mcp_path) as f:
        mcp = json.load(f)
    servers = mcp.get('mcpServers', {})
    if not servers:
        sys.exit(0)

    with open(claude_json_path) as f:
        cj = json.load(f)

    # Merge .mcp.json servers into top-level mcpServers (user scope).
    # Existing entries are preserved; new ones are added.
    top_servers = cj.setdefault('mcpServers', {})
    added = []
    for name, config in servers.items():
        if name not in top_servers:
            # Add 'type' field expected by Claude Code CLI
            entry = dict(config)
            entry.setdefault('type', 'stdio')
            top_servers[name] = entry
            added.append(name)

    # Also ensure project trust flags are set so Claude doesn't block
    # on first-run dialogs for this project path.
    projects = cj.setdefault('projects', {})
    proj = projects.setdefault(container_path, {})
    proj['hasTrustDialogAccepted'] = True
    proj['hasCompletedProjectOnboarding'] = True

    if added:
        with open(claude_json_path, 'w') as f:
            json.dump(cj, f, indent=2)
            f.write('\n')
        print(f'link-claude-config: registered MCP servers: {added}')
    else:
        # Still write trust flags if they changed
        with open(claude_json_path, 'w') as f:
            json.dump(cj, f, indent=2)
            f.write('\n')
        print(f'link-claude-config: MCP servers already registered: {list(servers.keys())}')
except Exception as e:
    print(f'link-claude-config: MCP registration failed: {e}', file=sys.stderr)
" 2>&1 || echo "link-claude-config: MCP registration skipped (python3 unavailable)"
fi

# --- 4. User permission settings ---
link_file "$CLAUDE_DIR/settings.local.json" "$STAGING/settings.local.json"
echo "link-claude-config: settings.local.json -> staging"

# --- 5. Session project directories ---
# Claude Code discovers sessions by scanning ~/.claude/projects/ directories
# whose names match encoded project paths. Since the repo lives at different
# absolute paths on host vs container (e.g., ~/workspace/sass-lint vs
# /workspaces/sass-lint), session files are hard-linked between both
# encoded directories. Both dirs live on the same bind mount, so hard links
# share inodes — reads/writes through either path update the same file.

HOST_PATH="${HOST_PROJECT_PATH:-}"
CONTAINER_PATH="${CONTAINER_WORKSPACE_FOLDER:-$PWD}"
PROJECTS_DIR="${CLAUDE_DIR}/projects"

if [[ -n "$HOST_PATH" ]]; then
  # Claude Code encodes project paths by replacing / and . with -
  encode_path() {
    echo "$1" | tr '/.' '--'
  }

  HOST_ENCODED="$(encode_path "$HOST_PATH")"
  CONTAINER_ENCODED="$(encode_path "$CONTAINER_PATH")"

  HOST_SESSION_DIR="${PROJECTS_DIR}/${HOST_ENCODED}"
  CONTAINER_SESSION_DIR="${PROJECTS_DIR}/${CONTAINER_ENCODED}"

  mkdir -p "$HOST_SESSION_DIR"
  mkdir -p "$CONTAINER_SESSION_DIR"

  # Hard-link session files between directories (bidirectional).
  sync_sessions() {
    local src="$1" dst="$2"
    for item in "$src"/*; do
      [[ -e "$item" ]] || continue
      local base
      base=$(basename "$item")
      local target="$dst/$base"
      if [[ -f "$item" ]] && [[ ! -L "$item" ]]; then
        if [[ ! -e "$target" ]]; then
          ln "$item" "$target" 2>/dev/null || cp "$item" "$target"
        fi
      elif [[ -d "$item" ]] && [[ ! -L "$item" ]]; then
        mkdir -p "$target"
        sync_sessions "$item" "$target"
      fi
    done
  }

  if [[ "$HOST_ENCODED" != "$CONTAINER_ENCODED" ]]; then
    sync_sessions "$HOST_SESSION_DIR" "$CONTAINER_SESSION_DIR"
    sync_sessions "$CONTAINER_SESSION_DIR" "$HOST_SESSION_DIR"
    echo "link-claude-config: ${CONTAINER_ENCODED} <-> ${HOST_ENCODED} (hard-linked)"
  else
    echo "link-claude-config: ${CONTAINER_ENCODED} (same encoding, no sync needed)"
  fi

  # --- 6. Prompt history (history.jsonl) ---
  # Claude Code uses ~/.claude/history.jsonl for prompt search/autocomplete.
  # The host's history.jsonl (on the staging mount) contains entries with host
  # project paths. We extract entries matching this repo and append them to
  # the container's history.jsonl with the project field rewritten.
  HOST_HISTORY="${STAGING}/history.jsonl"
  CONTAINER_HISTORY="${CLAUDE_DIR}/history.jsonl"

  # Extract host entries for this repo, rewrite project path, and append new ones.
  # Single Python script handles dedup and writing to avoid brittle shell→Python piping.
  python3 -c "
import json, sys

container_path = '$CONTAINER_PATH'
host_path = '$HOST_PATH'
host_history = '$HOST_HISTORY'
container_history = '$CONTAINER_HISTORY'

# 1. Collect session IDs already in the container's history to avoid duplicates.
existing = set()
try:
    with open(container_history) as f:
        for line in f:
            try:
                entry = json.loads(line)
                sid = entry.get('sessionId', '')
                ts = entry.get('timestamp', 0)
                if sid and ts:
                    existing.add(f'{sid}:{ts}')
            except json.JSONDecodeError:
                pass
except FileNotFoundError:
    pass

# 2. Find relevant entries in host history, rewrite project path, append if new.
match_paths = {host_path}

added = 0
try:
    with open(host_history) as src, open(container_history, 'a') as dst:
        for line in src:
            try:
                entry = json.loads(line)
                proj = entry.get('project', '')
                if proj not in match_paths:
                    continue
                sid = entry.get('sessionId', '')
                ts = entry.get('timestamp', 0)
                key = f'{sid}:{ts}'
                if key not in existing:
                    existing.add(key)
                    entry['project'] = container_path
                    dst.write(json.dumps(entry, separators=(',', ':')) + '\n')
                    added += 1
            except json.JSONDecodeError:
                pass
    print(f'link-claude-config: history.jsonl += {added} entries from host')
except FileNotFoundError:
    print('link-claude-config: no host history.jsonl found, skipping index sync')
except Exception as e:
    print(f'link-claude-config: history.jsonl sync failed: {e}', file=sys.stderr)
" 2>/dev/null || echo "link-claude-config: history.jsonl sync skipped (python3 unavailable)"

fi
