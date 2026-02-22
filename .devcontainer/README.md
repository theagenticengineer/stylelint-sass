# Dev Container

A sandboxed development environment for stylelint-sass. Pre-installs Node 22, pnpm, gh CLI,
Graphite CLI, and Claude Code so contributors can start working immediately.

## Why a Dev Container?

The Dev Container provides an **isolated environment** where you can safely run Claude Code with
full permissions (`--dangerously-skip-permissions`). This lets subagents work autonomously without
risking your host machine. Outside a sandbox, every tool call requires manual approval, which
defeats the purpose of agentic workflows.

## Opening the project

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

## What's included

| Tool            | Purpose                                  |
| --------------- | ---------------------------------------- |
| Node 22 + pnpm  | Runtime and package manager              |
| gh CLI          | GitHub issue/PR management               |
| Graphite CLI    | Stacked PRs and branch workflow          |
| Claude Code     | AI-powered development assistant         |
| ESLint          | Linting (via VS Code extension)          |
| Prettier        | Formatting (via VS Code extension)       |
| markdownlint    | Markdown linting (via VS Code extension) |
| Vitest Explorer | Test runner (via VS Code extension)      |
