import { useEffect, useRef, useState } from "react";
import { transform, Operation } from "@devflow/shared";
import { useSession } from "next-auth/react";

/**
 * Custom hook to manage the WebSocket connection and state for a collaborative room.
 * Handles joining, syncing, and Operational Transformation (OT).
 * @param roomId The ID of the room to connect to.
 * @returns Object containing code, status, and handlers.
 */
export function useCollaborativeRoom(roomId: string) {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [code, setCode] = useState<string>("// Loading");
  const [connectionStatus, setConnectionStatus] = useState<"Connecting"|"Connected"|"Disconnected"|"Access Denied">("Connecting");
  const [clientId, setClientId] = useState<string>("");
  const [serverVersion, setServerVersion] = useState<number>(0);
  
  const currentCodeRef = useRef<string>("// Loading");
  const pendingOps = useRef<Operation[]>([]);
  const isApplyingRemoteOp = useRef(false);

  const isAccessDenied = useRef(false);

  useEffect(() => {
    isAccessDenied.current = false; // Reset on new connection attempt based on dependencies
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    console.log('Connecting to:', wsUrl);
  
    const newSocket = new WebSocket(wsUrl);  
      
    newSocket.onopen = () => {
      console.log("WebSocket connection established");
      setSocket(newSocket);
      setConnectionStatus("Connected");
    
      if (session?.user) {
          newSocket.send(JSON.stringify({
              type : 'join-room',
              roomId: roomId,
              userId: (session.user as any).id
          }));
      }
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
        setClientId(message.clientId);
      } else if (message.type === 'operation') {
        console.log("Received remote operation:", message.operation);
        handleRemoteOperation(message.operation);
      } else if(message.type === 'error') {
        console.error("Error from server:", message.message);
        if (message.message.includes("Access denied")) {
            isAccessDenied.current = true;
            setConnectionStatus("Access Denied");
            newSocket.close();
        }
      }
    }
    
    newSocket.onclose = () => {
      console.log("WebSocket connection closed");
      if (!isAccessDenied.current) {
          setConnectionStatus("Disconnected");
      }
    }

    return () => {
      // Prevent event listeners from firing after unmount/cleanup
      newSocket.onopen = null;
      newSocket.onclose = null;
      newSocket.onerror = null;
      newSocket.onmessage = null;
      newSocket.close();
    }
  }, [roomId, session]);

  /**
   * Applies a remote operation to the local code state.
   * Transforms pending local operations against the incoming remote operation
   * to ensure consistency (OT).
   * @param op The remote operation received from the server.
   */
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

  const generateOperation = (oldValue: string, newValue: string, serverVersion: number): Operation | null => {
    let i = 0;
    while (i < oldValue.length && i < newValue.length && oldValue[i] === newValue[i]) {
      i++;
    }

    let oldEnd = oldValue.length;
    let newEnd = newValue.length;

    while( oldEnd > i && newEnd > i && oldValue[oldEnd - 1] === newValue[newEnd - 1]) {
      oldEnd--;
      newEnd--;
    }
    
    const deletedText = oldValue.slice(i, oldEnd);
    const insertedText = newValue.slice(i, newEnd);

    if(deletedText.length > 0 && insertedText.length > 0) {
      return {
      type: 'replace',
      position: i,
      deleteLength: deletedText.length,
      insertText: insertedText,
      version: serverVersion
    };
    }

    if(insertedText.length > 0) {
      return {
      type: 'insert',
      position: i,
      text: insertedText,
      version: serverVersion
    };
    }

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

  /**
   * Handles local changes in the editor.
   * Generates an operation describing the change and sends it to the server.
   * @param newValue The new content of the editor.
   */
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
      setServerVersion(prev => prev + 1);
    }
  }

  return {
      code,
      connectionStatus,
      clientId,
      serverVersion,
      handleEditorChange
  };
}
