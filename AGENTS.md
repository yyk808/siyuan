# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Development Commands

### Frontend (app/)
```bash
# Install dependencies
cd app && pnpm install

# Development builds
pnpm run dev                # General development build
pnpm run dev:mobile        # Mobile development build
pnpm run dev:desktop       # Desktop development build
pnpm run dev:export        # Export development build

# Production builds
pnpm run build             # Build all targets
pnpm run build:app         # Build app
pnpm run build:mobile      # Build mobile
pnpm run build:desktop     # Build desktop
pnpm run build:export      # Build export

# Linting
pnpm run lint              # ESLint with auto-fix

# Development server
pnpm start                 # Start Electron in development mode

# Distribution builds
pnpm run dist              # General distribution build
pnpm run dist-arm64        # ARM64 distribution build
pnpm run dist-darwin       # macOS distribution build
pnpm run dist-darwin-arm64 # macOS ARM64 distribution build
pnpm run dist-linux        # Linux distribution build
pnpm run dist-linux-arm64  # Linux ARM64 distribution build
```

### Backend (kernel/)
```bash
cd kernel

# Build kernel (requires Go 1.24.4+)
go build --tags fts5 -v -o "SiYuan-Kernel" -ldflags "-s -w" .

# Run tests
go test ./...

# Lint and format
go fmt ./...
go vet ./...
```

### Platform-specific builds
```bash
# macOS (ARM64)
./scripts/darwin-build.sh

# Linux
./scripts/linux-build.sh

# Windows
scripts/win-build.bat
```

## Architecture Overview

SiYuan is a personal knowledge management system with a client-server architecture:

### Core Components
- **Kernel (Go)**: Backend server handling data storage, search, sync, and API endpoints
  - Located in `kernel/` directory
  - Uses SQLite for data storage with custom block-level document format
  - RESTful API for frontend communication
  - Supports real-time sync and collaboration features

- **Frontend (TypeScript/JavaScript)**: Electron-based desktop application and web interface
  - Located in `app/` directory
  - Uses Webpack for bundling with different configs for mobile/desktop/export targets
  - Block-based editor with Markdown WYSIWYG capabilities
  - Supports plugins, themes, and custom widgets

### Key Directories
- `kernel/api/`: API endpoints for frontend operations
- `kernel/model/`: Business logic and data models
- `kernel/sql/`: Database operations and queries
- `kernel/util/`: Utility functions and helpers
- `app/src/`: Frontend source code
- `app/stage/`: Build output and static resources
- `scripts/`: Build scripts for different platforms

### Data Storage
- Documents stored as JSON files with `.sy` extension
- SQLite database for metadata, search indexes, and relationships
- Block-level reference system for linking content
- Asset management for images, files, and media

### Frontend Architecture
- Modular design with separate concerns (editor, layout, dialogs, etc.)
- Plugin system for extensibility
- Mobile-responsive design with dedicated mobile components
- Real-time communication with backend via WebSocket and HTTP API

## Important Notes
- This is a third-party implementation of SiYuan with modifications to first-party components
- Includes third-party inbox implementation with Cloudflare Worker server
- Some features from the official version may be modified or removed
- BEARER_TOKEN for third-party inbox API: FDaxY9AMK18dhRD2raqa