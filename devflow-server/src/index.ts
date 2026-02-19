import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { Operation, transform } from "@devflow/shared";
import { config } from './config';
import { Room, RoomManager } from './services/room.service';
import type { Client } from './services/room.service';
import authRouter from './routes/auth.routes';
import { createRoomRouter } from './routes/room.routes';

const app = express();
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

app.use(express.json());

const httpServer = app.listen(config.port, () => {
    console.log(`🚀 HTTP Server running on http://localhost:${config.port}`);
    console.log('🔌 WebSocket server ready');
});

const wss = new WebSocketServer({ server: httpServer });
// Instantiate RoomManager before routes so it's shared
const roomManager = new RoomManager();

// Routes
app.use('/api', authRouter);
app.use('/api', createRoomRouter(roomManager));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', clients: wss.clients.size });
});

const clients = new Map<WebSocket, Client>()
const clientRooms = new Map<string, string>(); // clientId -> roomId


wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(7);
    const client = { ws, id: clientId }
    clients.set(ws, client);
    console.log(`✅ New client connected (Total: ${wss.clients.size})`);

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('message', async (data) => {
    try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join-room') {
            await handleJoinRoom(message.roomId, ws, clientId, message.userId);
        } 
        else if (message.type === 'operation') {
            await handleOperation(message.operation, ws, message.roomId, roomManager);
        }
    }catch (error) {
        console.error('Error processing message:', error);
    }
  })

  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
        const roomId = clientRooms.get(client.id);
        if (roomId) {
        roomManager.removeClientFromRoom(roomId, client.id);
        clientRooms.delete(client.id);

        roomManager.getRoom(roomId).then(room => {
             if(room) {
                room.clients.forEach((otherClient) => {
                    if(otherClient.ws.readyState === WebSocket.OPEN) {
                        otherClient.ws.send(JSON.stringify({
                            type: 'user-left',
                            roomId: roomId,
                            userId: client.id
                        }));
                    }
                })
            }
        });
       
        }
        clients.delete(ws);
    }
    console.log(`❌ Client disconnected (Total: ${wss.clients.size})`);
    });
})

async function handleOperation(op: Operation, ws: WebSocket,roomId: string, roomManager: RoomManager) {
    const room = await roomManager.getRoom(roomId);
    if(!room) {
        console.error(`Room ${roomId} not found for operation`);
        return;
    }

    let transformedOp = op;

    // Transform against all concurrent operations
    for (let i = op.version; i < room.operationHistory.length; i++) {
        transformedOp = transform(transformedOp, room.operationHistory[i]);
    }

    applyOperationToRoom(room, transformedOp);

    room.version++;
    transformedOp.version = room.version;

    room.operationHistory.push(transformedOp);
    
    // Broadcast to all clients except sender
    const broadcast = JSON.stringify({
        type: 'operation',
        operation: transformedOp,
        roomId: roomId
    });

  room.clients.forEach((client) => {
    if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(broadcast);
    }
  });
  
  // Persist to Redis asynchronously
  roomManager.saveToRedis(room).catch(err => console.error("Redis save error:", err));
}

function applyOperationToRoom(room : Room, op: Operation) {
    
  if (op.type === 'insert') {
    room.documentContent = 
      room.documentContent.slice(0, op.position) + 
      op.text + 
      room.documentContent.slice(op.position);
  } else if (op.type === 'delete') {
    room.documentContent = 
      room.documentContent.slice(0, op.position) + 
      room.documentContent.slice(op.position + op.length);
  } else if (op.type === 'replace') {
    room.documentContent = 
      room.documentContent.slice(0, op.position) + 
      op.insertText + 
      room.documentContent.slice(op.position + op.deleteLength);
  }
}

async function handleJoinRoom(roomId: string, ws: WebSocket, clientId: string, userId?: string) {
  let room = await roomManager.getRoom(roomId);
  
  if (!room) {
       console.log(`Room ${roomId} not found.`);
       ws.send(JSON.stringify({
           type: 'error',
           message: 'Room not found'
       }));
       return;
  }

  // Check Privacy
  if (room.privacy === 'PRIVATE') {
      if (!userId || !room.participants.has(userId)) {
          console.log(`Access denied for user ${userId} to room ${roomId}`);
          ws.send(JSON.stringify({
              type: 'error',
              message: 'Access denied: Private room'
          }));
          return;
      }
  }
    
    const client = clients.get(ws);
    if (!client) return;
    
    // Add client to room
    roomManager.addClientToRoom(roomId, client);
    clientRooms.set(clientId, roomId);
  
  console.log(`Client ${clientId} joined room ${roomId}`);
  
  // Send initial room state
  ws.send(JSON.stringify({
      type: 'init',
      roomId: roomId,
      content: room.documentContent,
      version: room.version,
      clientId: clientId,
      language: room.language
  }));
  
  // Notify others in room
  room.clients.forEach((otherClient) => {
    if (otherClient.id !== clientId && otherClient.ws.readyState === WebSocket.OPEN) {
      otherClient.ws.send(JSON.stringify({
        type: 'user-joined',
        roomId: roomId,
        userId: clientId, // This is the socket client ID, not user auth ID. Kept for cursors.
        userAuthId: userId
      }));
    }
  });
}