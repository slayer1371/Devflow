import { WebSocket } from "ws";
import { Operation } from "@devflow/shared";

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
    ownerId?: string;
    privacy: "PUBLIC" | "PRIVATE";
    participants: Set<string>; // userIds
}
import { prisma, redis } from "../db";

/**
 * Manages the lifecycle of collaborative rooms, including:
 * - Creating/Retrieving rooms
 * - managing active participants (WebSockets)
 * - Persisting data to Redis and Database
 */
class RoomManager {
    private rooms : Map<string, Room> = new Map();

    /**
     * Creates a new room and persists it.
     * @param name Display name of the room.
     * @param language Programming language (default: javascript).
     * @param roomId Optional custom ID.
     * @param userId Optional ID of the owner (creator).
     * @returns The created Room object.
     */
    async createRoom(name: string, language: string = "javascript", roomId?: string, userId?: string ): Promise<Room> {
        const newRoomId = roomId || Math.random().toString(36).substring(7);
        const newRoom: Room = {
            id : newRoomId,
            documentContent: "",
            version: 0,
            operationHistory: [],
            clients: new Map(),
            name,
            language: language || "javascript",
            createdAt: new Date(),
            ownerId: userId,
            privacy: "PUBLIC", // Default to PUBLIC for easy sharing
            participants: userId ? new Set([userId]) : new Set()
        };
        
        this.rooms.set(newRoomId, newRoom);
        
        // Persist initial state
        await this.saveToRedis(newRoom);
        
        // Save to DB with relation
        await prisma.room.create({
            data: {
                id: newRoomId,
                name: newRoom.name,
                language: newRoom.language,
                content: "",
                ownerId: userId,
                privacy: "PUBLIC",
                // Create participant entry for owner
                participants: userId ? {
                    create: {
                        userId: userId,
                        role: "OWNER"
                    }
                } : undefined
            }
        });
        
        return newRoom;
    }

    async updateRoomPrivacy(roomId: string, privacy: "PUBLIC" | "PRIVATE") {
        const room = await this.getRoom(roomId);
        if (!room) throw new Error("Room not found");
        
        room.privacy = privacy;
        this.rooms.set(roomId, room);
        await this.saveToRedis(room);
        
        await prisma.room.update({
            where: { id: roomId },
            data: { privacy }
        });
        
        return room;
    }

    /**
     * Retrieves a room by ID.
     * Checks memory first, then Redis, then Database.
     * @param roomId The unique ID of the room.
     * @returns The Room object or null if not found.
     */
    async getRoom(roomId: string): Promise<Room | null> {
        // 1. Check memory
        if (this.rooms.has(roomId)) {
            return this.rooms.get(roomId)!;
        }

        // 2. Check Redis
        const cachedRoom = await redis.hGetAll(`room:${roomId}`);
        if (cachedRoom && cachedRoom.id) {
            const room: Room = {
                id: cachedRoom.id,
                documentContent: cachedRoom.content || "",
                version: parseInt(cachedRoom.version || "0"),
                language: cachedRoom.language || "javascript",
                operationHistory: [], // History not persisted for now (could be problematic for reconnects if history is needed for OT)
                clients: new Map(),
                name: cachedRoom.name || "Untitled",
                createdAt: new Date(cachedRoom.createdAt || Date.now()),
                privacy: (cachedRoom.privacy as "PUBLIC" | "PRIVATE") || "PUBLIC",
                ownerId: cachedRoom.ownerId,
                participants: new Set(cachedRoom.participants ? JSON.parse(cachedRoom.participants) : [])
            };
            this.rooms.set(roomId, room);
            return room;
        }

        // 3. Check DB
        const dbRoom = await prisma.room.findUnique({ where: { id: roomId } });
        if (dbRoom) {
             const room: Room = {
                id: dbRoom.id,
                documentContent: dbRoom.content,
                version: dbRoom.version,
                language: dbRoom.language,
                operationHistory: [],
                clients: new Map(),
                name: dbRoom.name,
                createdAt: dbRoom.createdAt,
                privacy: dbRoom.privacy,
                ownerId: dbRoom.ownerId || undefined,
                participants: new Set() // We'd need to fetch these, but for now empty or modify query
            };
            
            // Fetch participants if needed, but for sync/memory model we might want to load them?
            // Let's load them.
            const participants = await prisma.roomParticipant.findMany({
                where: { roomId: roomId },
                select: { userId: true }
            });
            room.participants = new Set(participants.map(p => p.userId));

            this.rooms.set(roomId, room);
            await this.saveToRedis(room); // Re-hydrate Redis
            return room;
        }

        return null;
    }
    
    /**
     * Persists the current state of a room to Redis for fast retrieval.
     * @param room The Room object to save.
     */
    async saveToRedis(room: Room) {
        await redis.hSet(`room:${room.id}`, {
            id: room.id,
            content: room.documentContent,
            version: room.version.toString(),
            language: room.language || "javascript",
            name: room.name,
            createdAt: room.createdAt.toISOString(),
            privacy: room.privacy,
            ownerId: room.ownerId || "",
            participants: JSON.stringify(Array.from(room.participants))
        });
        // Set expiry for 1 hour of inactivity
        await redis.expire(`room:${room.id}`, 3600);
    }

    async saveToDB(room: Room) {
        await prisma.room.update({
            where: { id: room.id },
            data: {
                content: room.documentContent,
                version: room.version,
                language: room.language,
                privacy: room.privacy
            }
        });
        
        // Save participants? Usually they are added via addParticipant, 
        // but if we modified the set in memory, we might want to sync? 
        // For now, assume participants are added via specific API calls not bulk update.
    }

    async deleteRoom(id: string): Promise<boolean> {
        // 1. Remove from memory
        const deleted = this.rooms.delete(id);
        
        // 2. Remove from Redis
        await redis.del(`room:${id}`);
        
        // 3. Remove from DB (Participants cascade delete usually, or we must delete them first)
        try {
            // Check if room exists in DB first to avoid error
            const exists = await prisma.room.findUnique({ where: { id } });
            if (exists) {
                // Delete participants first if cascade isn't set up in schema (safest approach)
                await prisma.roomParticipant.deleteMany({ where: { roomId: id } });
                await prisma.room.delete({ where: { id } });
            }
        } catch (error) {
            console.error(`Failed to delete room ${id} from DB:`, error);
        }

        return deleted;
    }
    
    // Updated to be async potentially, but keeping sync signature for now if possible? 
    // No, getRoom is async now, so callers must await.

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
            // Save final state to DB when room becomes empty
            this.saveToDB(room).then(() => {
                console.log(`Room ${roomId} saved to DB.`);
            });

            setTimeout(() => {
                const stillEmpty = this.rooms.get(roomId);
                if(stillEmpty && stillEmpty.clients.size === 0) {   
                    this.deleteRoom(roomId);
                    console.log(`Room ${roomId} unloaded from memory due to inactivity.`);
                }   
            }, 60000); // 1 minute buffer
        }
    }

    async addParticipant(roomId: string, userId: string) {
        let room = await this.getRoom(roomId);
        if (!room) throw new Error("Room not found");

        // Update memory
        room.participants.add(userId);
        
        // Ensure room is private if we are explicitly adding participants? 
        // Or just keep it as is. Let's force PRIVATE if it's an invite.
        if (room.privacy === 'PUBLIC') {
            room.privacy = 'PRIVATE';
        }
        
        this.rooms.set(roomId, room);
        await this.saveToRedis(room);

        // Update DB
        // 1. Update privacy if changed
        await prisma.room.update({
            where: { id: roomId },
            data: { privacy: room.privacy }
        });

        // 2. Create participant record
        // Check if exists first to avoid error
        const existing = await prisma.roomParticipant.findUnique({
             where: {
                userId_roomId: {
                    userId,
                    roomId
                }
             }
        });

        if (!existing) {
            await prisma.roomParticipant.create({
                data: {
                    userId,
                    roomId,
                    role: 'EDITOR'
                }
            });
        }
        
        return room;
    }

    getRoomCount() : number {
        return this.rooms.size;
    }

}

export { Room, RoomManager };
export type { Room as RoomType };