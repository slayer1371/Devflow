import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { Operation, transform } from './ot';
import { config } from './config';
import { Room, RoomManager } from './room';
import type { Client } from './room';

const app = express();
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

app.use(express.json());
app.get('/health', (req, res) => {
  res.json({ status: 'ok', clients: wss.clients.size });
});

const httpServer = app.listen(config.port);

const wss = new WebSocketServer({ server: httpServer });
const roomManager = new RoomManager();

console.log(`🚀 HTTP Server running on http://localhost:${config.port}`);
console.log('🔌 WebSocket server ready');

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

  ws.on('message', (data) => {
    try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join-room') {
        handleJoinRoom(message.roomId, ws, clientId);
        } 
        else if (message.type === 'operation') {
        handleOperation(message.operation, ws, message.roomId, roomManager);
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

        const room = roomManager.getRoom(roomId);
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
        }
        clients.delete(ws);
    }
    console.log(`❌ Client disconnected (Total: ${wss.clients.size})`);
    });

// ws.send('Welcome to the WebSocket server!');
})

function handleOperation(op: Operation, ws: WebSocket,roomId: string, roomManager: RoomManager) {
    const room = roomManager.getRoom(roomId);
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

function handleJoinRoom(roomId: string, ws: WebSocket, clientId: string) {
  let room = roomManager.getRoom(roomId);
  
  if (!room) {
      console.log(`Room ${roomId} not found, cannot join`);
      ws.send(JSON.stringify({
          type: 'error',
          message: 'Room not found'
        }));
        return;
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
        userId: clientId
      }));
    }
  });
}

app.get('/api/rooms', (req, res) => {
     // Return roomManager.listActiveRooms()
        res.json(roomManager.listActiveRooms());
   });
   
   app.post('/api/rooms', (req, res) => {
     // Create room, return { roomId, name }
        const { name, language } = req.body || {};
        const roomName = name || `Room ${Date.now()}`;
        const newRoom = roomManager.createRoom(roomName, language || "javascript");
        res.json({ roomId: newRoom.id, name: newRoom.name });
   });