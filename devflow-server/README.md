# DevFlow Server

The backend for DevFlow, a real-time collaborative code editor. Built with Express, WebSocket (ws), and Prisma.

## Architecture

The server follows a layered architecture to ensure separation of concerns and maintainability:

### 1. Routes (`src/routes/`)
Defines the HTTP endpoints and maps them to controller functions.
- `auth.routes.ts`: Authentication endpoints (`/login`).
- `room.routes.ts`: Room management endpoints (`/rooms`, `/my-rooms`).

### 2. Controllers (`src/controllers/`)
Handles incoming HTTP requests, extracts parameters, and calls the appropriate services.
- `auth.controller.ts`: Handles login/registration logic.
- `room.controller.ts`: Handles room creation and retrieval.

### 3. Services (`src/services/`)
Contains the core business logic and data persistence.
- `auth.service.ts`: User authentication using bcrypt and Prisma.
- `room.service.ts`: Manages active rooms, WebSocket connections, and room persistence using `RoomManager`.

### 4. WebSocket Handler (`src/index.ts`)
The entry point (`index.ts`) initializes the HTTP server and the WebSocket server. It handles real-time events like `join-room` and `operation` (Operational Transformation).

## Key Concepts

- **Operational Transformation (OT)**: Used to ensure consistency during concurrent edits.
- **RoomManager**: A singleton service that tracks active rooms in memory and persists them to Redis/PostgreSQL.
- **Prisma**: ORM used for database interactions (User, Room, RoomParticipant).

## Running the Server

\`\`\`bash
npm install
npm run dev
\`\`\`
