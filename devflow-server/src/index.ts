import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { Operation, transform } from './ot';
import { config } from './config';

const app = express();
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', clients: wss.clients.size });
});

const httpServer = app.listen(config.port);

const wss = new WebSocketServer({ server: httpServer });

console.log(`🚀 HTTP Server running on http://localhost:${config.port}`);
console.log('🔌 WebSocket server ready');

let documentContent = "// Write your code here\n";
let version = 0;
let operations: Operation[] = [];

interface Client {
    ws: WebSocket;
    id : string;
}

const clients = new Map<WebSocket, Client>()

wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(7);
    clients.set(ws, { ws, id: clientId });
    console.log(`✅ New client connected (Total: ${wss.clients.size})`);

    ws.send(JSON.stringify({
        type: 'init',
        content: documentContent,
        version: version,
        clientId: clientId
  }));

    ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('message', (data) => {
    try {
        const message = JSON.parse(data.toString());

        if (message.type === 'operation') {
            handleOperation(message.operation, ws);
        }
    }catch (error) {
        console.error('Error processing message:', error);
    }
  })

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`❌ Client disconnected (Total: ${wss.clients.size})`);
});  // ws.send('Welcome to the WebSocket server!');
})

function handleOperation(op: Operation, ws: WebSocket) {
    let transformedOp = op;

    // Transform against all concurrent operations
    for (let i = op.version; i < operations.length; i++) {
        transformedOp = transform(transformedOp, operations[i]);
    }

    applyOperation(transformedOp);

    version++;
    transformedOp.version = version;

    operations.push(transformedOp);
    
    // Broadcast to all clients except sender
    const broadcast = JSON.stringify({
    type: 'operation',
    operation: transformedOp
  });

  wss.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(broadcast);
    }
  });

}

function applyOperation(op: Operation) {
  if (op.type === 'insert') {
    documentContent = 
      documentContent.slice(0, op.position) + 
      op.text + 
      documentContent.slice(op.position);
  } else if (op.type === 'delete') {
    documentContent = 
      documentContent.slice(0, op.position) + 
      documentContent.slice(op.position + op.length);
  } else if (op.type === 'replace') {
    documentContent = 
      documentContent.slice(0, op.position) + 
      op.insertText + 
      documentContent.slice(op.position + op.deleteLength);
  }
}