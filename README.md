# Collab Code Workspace

A production-minded collaborative web IDE inspired by VS Code. The app combines a React/Vite frontend with Monaco Editor, Yjs-powered real-time editing, Socket.IO collaboration, shared terminal sessions, chat, workspace roles, invitations, and PostgreSQL persistence through Prisma.

## Features

- JWT authentication with protected frontend routes
- Dashboard for creating and opening workspaces
- Workspace roles: `OWNER`, `EDITOR`, and `VIEWER`
- Invite flow for joining workspaces
- Workspace settings for member role changes, removals, and deletion
- Multi-file workspace with file explorer
- File create, rename, delete, and persistence
- Real-time collaborative editing with Yjs and Monaco bindings
- Collaborative cursor and awareness synchronization
- Real-time online presence
- Shared terminal powered by xterm.js and Socket.IO
- Run-file support for JavaScript, TypeScript, Python, C, C++, and Java
- Real-time workspace chat
- Active room cache with periodic database autosave
- Responsive VS Code-inspired dark IDE layout with resizable panels

## Tech Stack

**Frontend**

- React 19
- Vite
- React Router
- Monaco Editor
- Yjs
- y-monaco
- Socket.IO Client
- xterm.js
- Axios

**Backend**

- Node.js
- Express 5
- Socket.IO
- Prisma
- PostgreSQL
- JWT
- bcrypt
- Docker-based code execution hooks

## Project Structure

```text
client/
  src/
    api/                 # API client helpers
    components/          # Reusable IDE, chat, terminal, settings, and route components
    context/             # Auth context
    hooks/               # Socket and room hooks
    pages/               # Auth, dashboard, invite, workspace, and editor pages
    services/            # Axios service layer
    socket/              # Socket.IO client setup
    store/               # Client-side room state
    styles/              # Shared styling and theme tokens

server/
  prisma/                # Prisma schema and migrations
  src/
    config/              # Runtime registry for executable file types
    controllers/         # HTTP route controllers
    lib/                 # Prisma client
    middlewares/         # Auth middleware
    routes/              # Auth and workspace routes
    services/            # Workspace, permissions, persistence, terminal, and execution logic
    socket/              # Socket.IO registration and event handlers
    store/               # In-memory active rooms, Yjs docs, and terminal state
    utils/               # JWT, hashing, and language utilities
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL
- Docker, required for the current run/terminal execution path

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd collab-code-editor

cd client
npm install

cd ../server
npm install
```

### 2. Configure environment variables

Create `server/.env`:

```env
DATABASE_URL="postgresql://<db-user>:<db-password>@localhost:5432/collab"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5001
```

Do not commit real database credentials or JWT secrets. Keep local values in `.env` files and use your deployment platform's secret manager for production.

The frontend currently connects to `http://localhost:5001`, and the backend allows CORS from `http://localhost:5173`.

### 3. Prepare the database

Create the PostgreSQL database referenced by `DATABASE_URL`, then run Prisma migrations:

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

### 4. Start the backend

```bash
cd server
npm run dev
```

The API and Socket.IO server run on `http://localhost:5001` by default.

### 5. Start the frontend

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

## Development Scripts

### Client

```bash
npm run dev       # Start Vite dev server
npm run build     # Build production frontend
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

### Server

```bash
npm run dev       # Start server with nodemon
```

The server test script is currently a placeholder.

## Collaboration Model

The server keeps active workspaces in memory while collaborators are connected. Room state is loaded from PostgreSQL on join, cached in `activeRooms`, updated through Socket.IO events, and saved periodically by the autosave service. When the last user leaves a room, the room is saved and removed from memory.

Editor collaboration uses one Yjs document per workspace file, keyed by `roomId:path`. Editors send Yjs updates through Socket.IO, and the server broadcasts updates to other clients in the room. Awareness updates are also relayed through Socket.IO for cursor and presence synchronization.

## Permissions Model

Workspace access is role-based:

- `OWNER`: full workspace control, including settings and deletion
- `EDITOR`: can edit workspace files and participate in collaboration
- `VIEWER`: can access the workspace in read-only mode

HTTP routes use authentication middleware, and socket events validate workspace access or edit permission before joining rooms and applying editor changes.

## Code Execution and Terminal Notes

Run-file and terminal commands are routed through Docker execution helpers. The current implementation expects a running container named `collab-1` with workspace directories mounted under:

```text
/workspace/room-<roomId>
```

Supported run-file extensions are configured in `server/src/config/runtimeRegistry.js`:

- `.js`, `.mjs`
- `.ts`
- `.py`
- `.c`, `.cpp`
- `.java`

For production, this execution path should be isolated further with per-workspace containers, strict resource limits, network restrictions, command timeouts, and stronger path validation.

## API Overview

Authentication routes:

```text
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

Workspace routes:

```text
POST   /workspace
GET    /workspace
GET    /workspace/:roomId
POST   /workspace/:roomId/join
GET    /workspace/:roomId/invite
GET    /workspace/:roomId/me
GET    /workspace/:roomId/members
PATCH  /workspace/:roomId/members/:userId
DELETE /workspace/:roomId/members/:userId
DELETE /workspace/:roomId
```

## Production Considerations

- Move client API and socket URLs to Vite environment variables.
- Move CORS origins into server environment configuration.
- Add a root workspace script or package manager workspace for one-command development.
- Replace in-memory room storage with Redis or another shared adapter before horizontally scaling Socket.IO.
- Persist Yjs updates more directly if document history, conflict recovery, or large-file performance becomes important.
- Add server-side rate limiting, request validation, and structured logging.
- Harden Docker execution with sandboxing, quotas, image management, and cleanup.
- Add automated tests for permissions, workspace membership, file operations, and socket event behavior.
