# Dev Container

A sandboxed development environment for stylelint-sass. Pre-installs Node 22, pnpm, gh CLI,
Graphite CLI, and Claude Code so contributors can start working immediately. Host authentication
and context persist across container rebuilds via bind mounts.

## Why a Dev Container?

The Dev Container provides an **isolated environment** where you can safely run Claude Code with
full permissions (`--dangerously-skip-permissions`). This lets subagents work autonomously without
risking your host machine. Outside a sandbox, every tool call requires manual approval, which
defeats the purpose of agentic workflows.

## Opening the project

Open the **main repo folder** in your editor. The CLAUDE.md workflow orchestrates worktree creation
inside the container via skills (`/worktree`, `/add-rule`, `/review-pr`), so the main tree stays on
`main` and branches live in `.worktrees/`. Worktrees persist across rebuilds because they live on
the bind-mounted host filesystem.

### VS Code

1. Install the
   [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   extension
2. Open the repo folder in VS Code
3. When prompted "Reopen in Container", click it — or run **Dev Containers: Reopen in Container**
   from the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
4. Wait for the container to build (first time takes a few minutes)

### Cursor

1. Install the
   [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   extension (Cursor supports VS Code extensions)
2. Open the repo folder in Cursor
3. Run **Dev Containers: Reopen in Container** from the Command Palette (`Cmd+Shift+P` /
   `Ctrl+Shift+P`)
4. Wait for the container to build

### GitHub Codespaces

1. Go to the repo on GitHub
2. Click **Code > Codespaces > Create codespace on main**
3. The environment builds automatically with all tools pre-installed

## Using Claude Code

Inside the container, a `claude!` alias is available that starts Claude Code with full permissions:

```bash
claude!
```

This is equivalent to `claude --dangerously-skip-permissions`. It is safe to use because the
container is isolated from your host machine.

## Host state persistence

Host directories are bind-mounted into the container. CLI auth (`gh`, `gt`) and session data
(`~/.claude/projects`) are mounted directly. Claude config (`~/.claude`, `~/.claude.json`) uses
**staging paths** so the installer writes to a container-local copy first, then
`link-claude-config.sh` symlinks specific files back to the host mount.

<!-- markdownlint-disable MD013 -->

| Host path             | Container path                 | What persists                                               |
| --------------------- | ------------------------------ | ----------------------------------------------------------- |
| `~/.claude/`          | `/home/node/.claude-host/`     | Source for credentials, MCP config, settings (via symlinks) |
| `~/.claude/projects/` | `/home/node/.claude/projects/` | Sessions and auto-memory (direct mount)                     |
| `~/.claude.json`      | `/home/node/.claude-host.json` | OAuth session, project settings                             |
| `~/.config/gh/`       | `/home/node/.config/gh/`       | GitHub CLI auth (`gh auth login`)                           |
| `~/.config/graphite/` | `/home/node/.config/graphite/` | Graphite CLI auth                                           |

<!-- markdownlint-enable MD013 -->

After `claude install`, `link-claude-config.sh` symlinks these container-local files to the staging
mount:

- `~/.claude.json` -> `~/.claude-host.json`
- `~/.claude/.credentials.json` -> `~/.claude-host/.credentials.json`
- `~/.claude/.mcp.json` -> `~/.claude-host/.mcp.json` (also registered into `~/.claude.json`)
- `~/.claude/settings.local.json` -> `~/.claude-host/settings.local.json`
- `~/.claude/projects/` — session files hard-linked between host and container encoded dirs
- `~/.claude/history.jsonl` — host entries merged with rewritten project paths

Git config (`~/.gitconfig`) and SSH agent are forwarded automatically by VS Code — no mount needed.

### Cross-environment `/resume`

Claude Code stores sessions as `.jsonl` files in `~/.claude/projects/<encoded-path>/` and discovers
resumable sessions by scanning directories that match the encoded project path. Since the repo lives
at different absolute paths on host vs container (e.g., `~/workspace/sass-lint` vs
`/workspaces/sass-lint`), session files created on one side aren't found by the other.

`link-claude-config.sh` fixes this by hard-linking session files between host-encoded and
container-encoded project directories. Both directories live on the same bind mount
(`~/.claude/projects`), so hard links share inodes — reads and writes through either path update the
same underlying file.

This means:

- **Host -> container**: start a session on the host, `/resume` it inside the container
- **Container -> host**: start a session in the container, `/resume` it on the host

### Using worktrees on the host (optional)

Worktrees created inside the container have container-absolute paths in their `.git` files (e.g.,
`gitdir: /workspaces/sass-lint/.git/worktrees/feature`). These don't resolve on the host because
`/workspaces/sass-lint/` only exists inside the container.

To make them work on the host, run once:

```bash
.devcontainer/fix-host-worktrees.sh
```

This creates a symlink on the host (`/workspaces/<repo> → <actual-repo-path>`) so container paths
resolve transparently. Requires `sudo` for creating `/workspaces/`. The devcontainer is not affected
— it continues to use its native paths.

**First-time setup**: authenticate each tool once on your host. After that, every container rebuild
picks up existing auth automatically.

```bash
# On your host (one-time)
gh auth login
gt auth              # if using Graphite
claude               # completes OAuth login
```

## PAL MCP Server (recommended)

[PAL MCP Server](https://github.com/BeehiveInnovations/pal-mcp-server) enables local AI code
review via the `/review-pr` skill (Phase 1: `mcp__pal__codereview`). Local review catches issues
before CI, saving a full push-and-wait round-trip.

**How it works**: `link-claude-config.sh` symlinks `~/.claude/.mcp.json` to the host staging mount
AND registers the server definitions into `~/.claude.json` (the same place `claude mcp add` writes).
This is necessary because Claude Code requires servers to be registered at the top-level `mcpServers`
key in `~/.claude.json` — merely having a `.mcp.json` file is not enough. If you have PAL configured
on your host, it's available inside the container with no extra setup.

**First-time setup** (on your host, not inside the container):

1. Install PAL following the
   [instructions](https://github.com/BeehiveInnovations/pal-mcp-server#installation)
2. Ensure API keys (e.g. `GEMINI_API_KEY`) are available — for Codespaces, add them as
   [encrypted secrets](https://docs.github.com/en/codespaces/managing-your-codespaces/managing-encrypted-secrets-for-your-codespaces)
3. Verify PAL works: inside the container, run `/mcp` in Claude Code — PAL tools should appear

## What's included

| Tool            | Purpose                                  |
| --------------- | ---------------------------------------- |
| Node 22 + pnpm  | Runtime and package manager              |
| gh CLI          | GitHub issue/PR management               |
| Graphite CLI    | Stacked PRs and branch workflow          |
| Claude Code     | AI-powered development assistant         |
| uv + uvx        | Python package runner (required by PAL)  |
| ESLint          | Linting (via VS Code extension)          |
| Prettier        | Formatting (via VS Code extension)       |
| markdownlint    | Markdown linting (via VS Code extension) |
| Vitest Explorer | Test runner (via VS Code extension)      |
