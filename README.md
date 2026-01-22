# DevFlow - Real-Time Collaborative Code Editor

A production-ready collaborative code editor built with modern web technologies, featuring real-time synchronization using Operational Transformation (OT) and WebSocket communication.

![DevFlow](https://img.shields.io/badge/Node.js-20+-green) ![Next.js](https://img.shields.io/badge/Next.js-16+-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

## 🎯 Overview

DevFlow is a real-time collaborative code editor that allows multiple users to edit code simultaneously in isolated rooms. It uses **Operational Transformation** to resolve concurrent edits and maintain document consistency across all clients without requiring central authority.

Perfect for:
- Pair programming sessions
- Code interviews
- Team collaboration
- Teaching and mentoring
- Real-time coding demonstrations

## ✨ Features

### Core Functionality
- ✅ **Real-Time Collaboration** - See changes instantly across all connected users
- ✅ **Multi-Room Architecture** - Create isolated editing spaces for different projects
- ✅ **Conflict Resolution** - Operational Transformation ensures consistent state across clients
- ✅ **Syntax Highlighting** - Multiple language support via Monaco Editor
- ✅ **Connection Status** - Real-time connection state indicators
- ✅ **Room Management** - Create, list, and join rooms seamlessly

### Technical Features
- ✅ **WebSocket Communication** - Low-latency real-time updates
- ✅ **Full TypeScript** - Type-safe codebase throughout
- ✅ **Responsive Design** - Works on desktop and mobile
- ✅ **Automatic Room Cleanup** - Rooms delete after 60 seconds of inactivity
- ✅ **Operation Versioning** - Track and manage concurrent operations

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Next.js)                   │
│  ┌──────────────────────┐  ┌──────────────────────────────┐ │
│  │  Monaco Editor       │  │  WebSocket Client            │ │
│  │  - Syntax Highlight  │  │  - Real-time Sync            │ │
│  │  - Multi-language    │  │  - Pending Ops Queue         │ │
│  └──────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                    WebSocket (ws://)
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Server Layer (Node.js)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         WebSocket Server (ws)                        │  │
│  │  - Connection Management                             │  │
│  │  - Message Routing                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    Operational Transformation Engine                 │  │
│  │  - Transform(opA, opB): Operation                    │  │
│  │  - Resolve concurrent edits                          │  │
│  │  - Maintain version history                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Room Manager                                 │  │
│  │  - Room state management                             │  │
│  │  - Client tracking                                   │  │
│  │  - Automatic cleanup                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                         REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                               │
│  - In-memory storage (current)                              │
│  - MongoDB (future)                                         │
│  - Operation history (future)                               │
└─────────────────────────────────────────────────────────────┘
```

### Operational Transformation

DevFlow uses **Operational Transformation** to handle concurrent edits:

1. **Client Sends Operation** - User types text → client generates operation with `serverVersion`
2. **Server Receives & Transforms** - Server receives operation, transforms it against newer operations in history
3. **Apply & Broadcast** - Server applies transformed operation, increments version, broadcasts to other clients
4. **Client Transforms Pending** - Receiving clients transform their pending operations against the remote operation

This ensures **eventual consistency** without requiring locks or central arbitration.

```
Client A                     Server              Client B
   │                          │                    │
   ├─ insert 'a' v0 ─────────>│                    │
   │                          ├─ apply op ─────────┤
   │                          ├─ transform ────────┤
   │                          │ pending ops        │
   │<────────────────────────┤────────────────────┤
   │    remote ops broadcast  │  insert 'b' v0    │
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with SSR
- **TypeScript** - Type safety
- **Monaco Editor** - VS Code's editor component
- **TailwindCSS** - Utility-first CSS
- **Axios** - HTTP client
- **WebSocket API** - Browser native WebSocket

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - HTTP server
- **ws** - WebSocket server
- **TypeScript** - Type safety
- **CORS** - Cross-origin support

### DevOps
- **Vercel** - Frontend hosting
- **Railway** - Backend hosting
- **Docker** (roadmap) - Containerization

## 📁 Project Structure

```
devflow/
├── devflow-client/          # Next.js frontend
│   ├── app/
│   │   ├── page.tsx         # Room listing page
│   │   ├── room/
│   │   │   └── [roomId]/
│   │   │       └── page.tsx # Collaborative editor
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── lib/
│   │   └── ot.ts            # OT algorithm (client copy)
│   ├── public/              # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
│
├── devflow-server/          # Express.js backend
│   ├── src/
│   │   ├── index.ts         # WebSocket server & REST API
│   │   ├── ot.ts            # Operational Transformation
│   │   ├── room.ts          # Room management
│   │   └── config.ts        # Configuration
│   ├── dist/                # Compiled JavaScript
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                 # Environment variables
│
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Local Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/slayer1371/Devflow.git
cd devflow
```

#### 2. Setup Server

```bash
cd devflow-server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
EOF

# Compile TypeScript
npm run build

# Start server
npm run dev
```

Server runs on `http://localhost:4000`

#### 3. Setup Client (New Terminal)

```bash
cd devflow-client

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
EOF

# Start dev server
npm run dev
```

Client runs on `http://localhost:3000`

#### 4. Test Collaboration

Open two browser tabs:
- Tab 1: `http://localhost:3000`
- Tab 2: `http://localhost:3000`

Create a room, open it in both tabs, and start typing!

## 💻 Usage

### Create a Room
1. Click **"Create New Room"** button on home page
2. Room is created and you're redirected to the editor
3. Share the URL with collaborators

### Join a Room
1. Click on an active room from the list
2. Start collaborating in real-time

### Editor Features
- **Syntax Highlighting** - Automatic for JavaScript (extensible)
- **Real-Time Updates** - See others' changes instantly
- **Connection Status** - Indicator shows connection state
- **Version Tracking** - See current server version

## 🔄 How It Works

### Operation Types

DevFlow supports three operation types:

```typescript
interface InsertOp {
  type: 'insert';
  position: number;      // Where to insert
  text: string;          // Text to insert
  version: number;       // Server version when created
}

interface DeleteOp {
  type: 'delete';
  position: number;      // Where to delete from
  length: number;        // How many characters
  version: number;
}

interface ReplaceOp {
  type: 'replace';
  position: number;      // Where to replace
  deleteLength: number;  // How many to delete
  insertText: string;    // What to insert
  version: number;
}
```

### Transform Algorithm

The core of DevFlow - how it resolves concurrent edits:

```typescript
function transform(opA: Operation, opB: Operation): Operation {
  // If both are inserts at same position, opB wins
  if (opA.type === 'insert' && opB.type === 'insert') {
    if (opB.position < opA.position) {
      return { ...opA, position: opA.position + opB.text.length };
    }
    return opA;
  }
  
  // If A inserts and B deletes before A's position, shift A left
  if (opA.type === 'insert' && opB.type === 'delete') {
    if (opB.position < opA.position) {
      return { ...opA, position: opA.position - opB.length };
    }
    return opA;
  }
  
  // ... (more cases for all combinations)
}
```

### Example Scenario

```
Initial state: "hello"
Client A types at position 5: "!"   → "hello!"
Client B deletes at position 0-1: "" → "ello!"

Both changes concurrent (same version):

Server receives A's insert:
  - No prior ops to transform against
  - Applies: "hello!"
  - Broadcasts to B

Server receives B's delete:
  - Must transform against A's insert
  - Transform: A inserted "!" at position 5, so B's delete at 0-1 unaffected
  - Applies delete to "hello!": "ello!"
  - Broadcasts to A

A receives B's delete:
  - Must transform against pending insert
  - A's pending insert at position 5 is unaffected by B's delete at 0-1
  - Applies: "ello!"

Result: Both clients show "ello!" ✓
```

## 🌐 Deployment

### Deploy to Vercel (Frontend)

```bash
# Push to GitHub
git push origin main

# Connect on Vercel dashboard
# - Select devflow-client directory as root
# - Set NEXT_PUBLIC_API_URL environment variable
# - Deploy
```

### Deploy to Railway (Backend)

```bash
# Push to GitHub
git push origin main

# Connect on Railway dashboard
# - Select devflow-server directory
# - Set PORT=4000, CLIENT_URL=<your-vercel-url>
# - Deploy
```

### Environment Variables

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=https://your-server.railway.app
NEXT_PUBLIC_WS_URL=wss://your-server.railway.app
```

**Backend (.env)**
```
PORT=4000
NODE_ENV=production
CLIENT_URL=https://your-frontend.vercel.app
```

## 🔮 Future Enhancements

### Priority 1 - Resume Impact
- [ ] **MongoDB Persistence** - Save rooms and operation history
- [ ] **User Authentication** - JWT-based auth system
- [ ] **Docker Setup** - Containerization for easy deployment

### Priority 2 - Features
- [ ] **User Presence** - Show active cursor positions and user names
- [ ] **Undo/Redo** - Full undo/redo stack with OT support
- [ ] **Multiple Files** - File tree and multi-file support
- [ ] **Room Permissions** - Read-only mode, invite-only rooms

### Priority 3 - Polish
- [ ] **Unit Tests** - Test OT algorithm thoroughly
- [ ] **Integration Tests** - WebSocket communication tests
- [ ] **Error Recovery** - Graceful reconnection and state recovery
- [ ] **Analytics** - Track room usage and user activity

## 📚 Learning Resources

- [Operational Transformation - Wikipedia](https://en.wikipedia.org/wiki/Operational_transformation)
- [Google Docs Realtime API Explained](https://drive.google.com/file/d/1CnU4bMOcw9eExcqM5uGpwMgFXfWvWe2N/)
- [WebSocket API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)

## 🧪 Testing the OT Algorithm

The OT algorithm handles all combinations:

```
Insert vs Insert    ✓
Insert vs Delete    ✓
Insert vs Replace   ✓
Delete vs Insert    ✓
Delete vs Delete    ✓
Delete vs Replace   ✓
Replace vs Insert   ✓
Replace vs Delete   ✓
Replace vs Replace  ✓
```

All combinations are tested with real-time typing scenarios.

## 🤝 Contributing

Contributions welcome! Areas for contribution:

1. **Bug Fixes** - Found an issue? Create a PR
2. **Features** - Implement from the roadmap
3. **Tests** - Add unit or integration tests
4. **Documentation** - Improve docs or examples
5. **Performance** - Optimize algorithm or reduce latency

### Development Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature
```

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

- **GitHub**: [@slayer1371](https://github.com/slayer1371)
- **Project**: [DevFlow Repository](https://github.com/slayer1371/Devflow)

## 🙏 Acknowledgments

- Mozilla MDN for WebSocket documentation
- Google Docs for OT algorithm inspiration
- Monaco Editor team for the amazing editor
- The open-source community

---

**Built with ❤️ using modern web technologies**

Have questions? Create an issue on GitHub!
