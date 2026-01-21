"use client";

import { useEffect, useRef, useState } from "react";
import Editor from '@monaco-editor/react';
import { Operation } from '../../devflow-server/src/ot'

export default function Home() {
  const [socket, setsocket] = useState<WebSocket | null>(null);
  const [code, setCode] = useState<string>("// Loading");
  const [connectionStatus, setConnectionStatus] = useState<"Connecting"|"Connected"|"Disconnected">("Connecting");
  const [clientId, setClientId] = useState<string>("");
  const [serverVersion, setServerVersion] = useState<number>(0);
  const localVersionRef = useRef<number>(0);

  // const pendingOps = useRef<Operation[]>([]);   //pending operations that have been sent but not yet acknowledged, for production use
  const isApplyingRemoteOp = useRef(false);

  const handleRemoteOperation = (op: Operation) => {
  isApplyingRemoteOp.current = true;
  
  setCode(prevCode => {
    if (op.type === 'insert') {
      return prevCode.slice(0, op.position) + op.text + prevCode.slice(op.position);
    } else if (op.type === 'delete') {
      return prevCode.slice(0, op.position) + prevCode.slice(op.position + op.length);
    } else if (op.type === 'replace') {
      return prevCode.slice(0, op.position) + 
             op.insertText + 
             prevCode.slice(op.position + op.deleteLength);
    }
    return prevCode;
  });
  
  setServerVersion(op.version);
  localVersionRef.current = op.version;
  isApplyingRemoteOp.current = false;
};

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    console.log('Connecting to:', wsUrl);
  
    const newSocket = new WebSocket(wsUrl);  
      
    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      setsocket(newSocket);
      setConnectionStatus("Connected");
    }

    newSocket.onerror = (error) => {
      console.error("WebSocket error: ", error);
      setConnectionStatus("Disconnected");
    }
    
    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'init') {
        setCode(message.content);
        setServerVersion(message.version);
        localVersionRef.current = message.version;
        setClientId(message.clientId);
      }else if (message.type === 'operation') {
        console.log("Received remote operation:", message.operation);
        handleRemoteOperation(message.operation);
      }
    }
    
    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
      setConnectionStatus("Disconnected");
    }

    return () => {
      newSocket.close();
    }
  }, []);



  const handleEditorChange = (newValue: string | undefined) => {
    if (newValue === undefined || !socket || isApplyingRemoteOp.current) {
      return;
    }

    const oldCode = code;
    const newCode = newValue;

    const op = generateOperation(oldCode, newCode, localVersionRef.current);
    
    if(op) {
      console.log("Sending operation", op);
      socket.send(JSON.stringify({ type: 'operation', operation: op }));

      setCode(newCode);
      localVersionRef.current++;
      
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


  if (!socket) {
    return <div className="p-8">Loading...</div>
  }
  
    return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">DevFlow - Collaborative Code Editor</h1>
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