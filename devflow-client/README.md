# DevFlow Client

The frontend for DevFlow, built with Next.js, React, and Tailwind CSS.

## Architecture

The client is structured to separate UI components from business logic and state management.

### 1. Hooks (`hooks/`)
Encapsulates complex logic and state.
- `useCollaborativeRoom.ts`: Manages WebSocket connections, Operational Transformation (OT) logic, and synchronization state (code, version, connection status).

### 2. Components (`components/`)
Reusable UI elements.
- `RoomEditor.tsx`: Wrapper around Monaco Editor.
- `RoomList.tsx`: Displays a grid of available rooms.
- `RoomCard.tsx`: Individual room card component.
- `ConnectionStatus.tsx`: Badge indicating connection state.
- `UserHeader.tsx`: Displays user info and logout button.

### 3. Pages (`app/`)
Next.js pages that assemble components.
- `page.tsx`: The dashboard. Fetches rooms and displays the list.
- `room/[id]/page.tsx`: The collaborative editor page. Uses `useCollaborativeRoom` to power the editor.

## Key Features

- **Real-time Collaboration**: Powered by WebSockets and OT.
- **Authentication**: NextAuth.js integration for secure access.
- **Middleware**: Protects routes from unauthorized access.

## Running the Client

\`\`\`bash
npm install
npm run dev
\`\`\`
