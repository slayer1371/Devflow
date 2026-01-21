import { WebSocket } from "ws";
import { Operation } from "./ot";

export interface Client {
    ws: WebSocket;
    id: string;
}

interface Room {
    id:string,
    documentContent: string;
    version : number,
    operationHistory : Operation[];
    clients: Map<string, Client>; // clientId to Client
    name: string;
    language?: string;
    createdAt: Date;
}
class RoomManager {
    private rooms : Map<string, Room> = new Map();
    createRoom(name: string, language?: string): Room {
        const roomId = Math.random().toString(36).substring(7);
        const newRoom: Room = {
            id : roomId,
            documentContent: "",
            version: 0,
            operationHistory: [],
            clients: new Map(),
            name,
            language,
            createdAt: new Date()
        };
        this.rooms.set(roomId, newRoom);
        return newRoom;
    }
    getRoom(id: string): Room | null {
        return this.rooms.get(id) || null;
    }
    deleteRoom(id: string): boolean {
        return this.rooms.delete(id);
    }
    listActiveRooms(): Array<{id: string, name: string, userCount: number, createdAt: Date, language?: string}> {
        return Array.from(this.rooms.entries()).map(([id, room]) => ({
            id,
            name: room.name,
            userCount: room.clients.size,
            createdAt: room.createdAt,
            language: room.language
        }));
    }
    addClientToRoom(roomId: string, client: Client): void {
        const room = this.rooms.get(roomId);
        if (room) {
            room.clients.set(client.id, client);
        }
    }
    removeClientFromRoom(roomId: string, clientId: string): void {
        const room = this.rooms.get(roomId);
        if(room) {
            room.clients.delete(clientId);
        }
        if(room?.clients.size === 0) {
            setTimeout(() => {
            const stillEmpty = this.rooms.get(roomId);
            if(stillEmpty && stillEmpty.clients.size === 0) {   
                this.deleteRoom(roomId);
                console.log(`Room ${roomId} deleted due to inactivity.`);
            }   
        }, 60000);
        }
    }

    getRoomCount() : number {
        return this.rooms.size;
    }

}

export { Room, RoomManager };
export type { Room as RoomType };