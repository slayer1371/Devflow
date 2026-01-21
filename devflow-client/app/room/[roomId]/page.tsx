"use client";

import { useEffect, useRef, useState } from "react";
import Editor from '@monaco-editor/react';
import { transform, Operation } from "../../../lib/ot"
import { useParams } from "next/navigation";

export default function Home() {
  const [socket, setsocket] = useState<WebSocket | null>(null);
  const [code, setCode] = useState<string>("// Loading");
  const [connectionStatus, setConnectionStatus] = useState<"Connecting"|"Connected"|"Disconnected">("Connecting");
  const [clientId, setClientId] = useState<string>("");
  const [serverVersion, setServerVersion] = useState<number>(0);
  const localVersionRef = useRef<number>(0);

  const params = useParams();
  const roomId : string | undefined= typeof params.roomId === 'string' ? params.roomId : params.roomId[0];

  const pendingOps = useRef<Operation[]>([]);   //pending operations that have been sent but not yet acknowledged, for production use
  const isApplyingRemoteOp = useRef(false);
  const currentCodeRef = useRef<string>("// Loading");

  const handleRemoteOperation = (op: Operation) => {
  isApplyingRemoteOp.current = true;
  
  // Transform pending operations against this remote operation
  pendingOps.current = pendingOps.current.map(pendingOp => 
    transform(pendingOp, op)
  );
  
  setCode(prevCode => {
    let newCode = prevCode;
    if (op.type === 'insert') {
      newCode = prevCode.slice(0, op.position) + 
             op.text + 
             prevCode.slice(op.position);
    } else if (op.type === 'delete') {
      newCode = prevCode.slice(0, op.position) + 
             prevCode.slice(op.position + op.length);
    } else if (op.type === 'replace') {
      newCode = prevCode.slice(0, op.position) + 
             op.insertText + 
             prevCode.slice(op.position + op.deleteLength);
    }
    currentCodeRef.current = newCode;
    return newCode;
  });
  
  setServerVersion(op.version);
  
  setTimeout(() => {
    isApplyingRemoteOp.current = false;
  }, 0);
};

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    console.log('Connecting to:', wsUrl);
  
    const newSocket = new WebSocket(wsUrl);  
      
    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      setsocket(newSocket);
      setConnectionStatus("Connected");
    

    newSocket.send(JSON.stringify({
        type : 'join-room',
        roomId: roomId
    }))

    };
    newSocket.onerror = (error) => {
      console.error("WebSocket error: ", error);
      setConnectionStatus("Disconnected");
    }
    
    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'init') {
        setCode(message.content);
        currentCodeRef.current = message.content;
        setServerVersion(message.version);
        localVersionRef.current = message.version;
        setClientId(message.clientId);
      }else if (message.type === 'operation') {
        console.log("Received remote operation:", message.operation);
        handleRemoteOperation(message.operation);
      }
      else if(message.type === 'error') {
        console.error("Error from server:", message.message);
      }
    }
    
    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
      setConnectionStatus("Disconnected");
    }

    return () => {
      newSocket.close();
    }
  }, [roomId]);



  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue === undefined || !socket || isApplyingRemoteOp.current) {
      return;
    }

    const oldCode = currentCodeRef.current;
    const newCode = newValue;

    const op = generateOperation(oldCode, newCode, serverVersion);
    
    if(op) {
      console.log("Sending operation", op);

      socket.send(JSON.stringify({ 
        type: 'operation', 
        roomId: roomId, 
        operation: op 
      }));

      pendingOps.current.push(op);
      setCode(newCode);
      currentCodeRef.current = newCode;
      // Increment server version after sending so next operation uses correct version
      setServerVersion(prev => prev + 1);
    }
  }
  
  const generateOperation = (oldValue: string, newValue: string, serverVersion: number): Operation | null => {
    let i = 0;
    // Finding the first differing index
    while (i < oldValue.length && i < newValue.length && oldValue[i] === newValue[i]) {
      i++;
    }

    let oldEnd = oldValue.length;
    let newEnd = newValue.length;

    //finding the last differing index
    while( oldEnd > i && newEnd > i && oldValue[oldEnd - 1] === newValue[newEnd - 1]) {
      oldEnd--;
      newEnd--;
    }
    
    const deletedText = oldValue.slice(i, oldEnd);
    const insertedText = newValue.slice(i, newEnd);

    //replace - both delete and insert
    if(deletedText.length > 0 && insertedText.length > 0) {
      return {
      type: 'replace',
      position: i,
      deleteLength: deletedText.length,
      insertText: insertedText,
      version: serverVersion
    };
    }

    //inserted text only
    if(insertedText.length > 0) {
      return {
      type: 'insert',
      position: i,
      text: insertedText,
      version: serverVersion
    };
    }

    //deleted text only
    if(deletedText.length > 0 ) {
      return {
      type: 'delete',
      position: i,
      length: deletedText.length,
      version: serverVersion
    };
    }

    return null;
  }


  if (!socket || connectionStatus !== "Connected") {
    return (
      <div className="p-8 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">
          {connectionStatus === "Connecting" ? "Connecting to room..." : "Disconnected"}
        </div>
      </div>
    );
  }
  
    return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Room - {roomId}</h1>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full font-semibold ${
              connectionStatus === "Connected" ? "bg-green-500 text-white" : 
              connectionStatus === "Connecting" ? "bg-yellow-500 text-black" : 
              "bg-red-500 text-white"
            }`}>
              {connectionStatus}
            </div>
            <div className="text-gray-400 text-sm">
              Client ID: {clientId} | Version: {serverVersion}
            </div>
          </div>
        </div>

        <div className="border-2 border-gray-700 rounded-lg overflow-hidden shadow-2xl">
          <Editor
            height="600px"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="mt-4 text-gray-400 text-sm">
          <p>💡 Open this page in multiple tabs to see real-time collaboration!</p>
          <p>🔄 Operations are automatically synced using Operational Transformation</p>
        </div>
      </div>
    </div>
  );
}