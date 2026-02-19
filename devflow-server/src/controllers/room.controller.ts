import { Request, Response } from 'express';
import { RoomManager } from '../services/room.service';

// We need a singleton instance or pass it from index.ts. 
// For now, let's export a function to get the router which accepts the roomManager.
// actually, the RoomManager needs to be shared with the WebSocket server.
// So we should instantiate it in index.ts and pass it here, or make it a singleton in service.

// Let's go with instantiated in index.ts for now, but to keep routes clean,
// we might need to export a factory function for the router.

export const getRoomsHandler = (roomManager: RoomManager) => (req: Request, res: Response) => {
    res.json(roomManager.listActiveRooms());
};

export const createRoomHandler = (roomManager: RoomManager) => async (req: Request, res: Response) => {
    const { name, language, userId } = req.body || {};
    const roomName = name || `Room ${Date.now()}`;
    const newRoom = await roomManager.createRoom(roomName, language || "javascript", undefined, userId);
    res.json({ roomId: newRoom.id, name: newRoom.name });
};

export const getMyRoomsHandler = (roomManager: RoomManager) => async (req: Request, res: Response) => {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
        res.status(400).json({ error: "userId required" });
        return;
    }

    try {
        const { prisma } = await import('../db');
        
        const participants = await prisma.roomParticipant.findMany({
            where: { userId },
            include: { room: true },
            orderBy: { createdAt: 'desc' }
        });
        
        const rooms = participants.map((p: any) => ({
            id: p.room.id,
            name: p.room.name,
            language: p.room.language || 'javascript',
            createdAt: p.room.createdAt,
            role: p.role,
            userCount: 0 
        }));
        
        // Update user count from active rooms using the injected roomManager
        // Update user count from active rooms using the injected roomManager
        rooms.forEach((room: any) => {
            const active = roomManager.listActiveRooms().find(r => r.id === room.id);
            if (active) {
                room.userCount = active.userCount;
            }
        });
        
        // We need access to roomManager to check active counts. 
        // This suggests getMyRoomsHandler also needs roomManager injected.
        
         res.json(rooms); // Incomplete without active count, but let's fix injection first.
    } catch (error) {
        console.error("Error fetching my rooms:", error);
        res.status(500).json({ error: "Failed to fetch rooms" });
    }
};

export const inviteUserHandler = (roomManager: RoomManager) => async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { email } = req.body;
    
    if (!roomId || !email) {
        res.status(400).json({ error: "Room ID and Email are required" });
        return;
    }

    try {
        const { findUserByEmail } = await import('../services/auth.service');
        const user = await findUserByEmail(email);
        
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        await roomManager.addParticipant(roomId as string, user.id);
        res.json({ message: "User invited successfully", user: { email: user.email, name: user.name } });
    } catch (error) {
        console.error("Error inviting user:", error);
    }
};

export const updatePrivacyHandler = (roomManager: RoomManager) => async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { privacy } = req.body;
    
    if (!roomId || !privacy || (privacy !== 'PUBLIC' && privacy !== 'PRIVATE')) {
        res.status(400).json({ error: "Room ID and valid Privacy setting are required" });
        return;
    }

    try {
        const room = await roomManager.updateRoomPrivacy(roomId as string, privacy);
        res.json({ message: "Privacy updated", privacy: room.privacy });
    } catch (error) {
        console.error("Error updating privacy:", error);
        res.status(500).json({ error: "Failed to update privacy" });
    }
};

export const deleteRoomHandler = (roomManager: RoomManager) => async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const { userId } = req.body; // In a real app, get from session/auth middleware
    
    if (!roomId) {
        res.status(400).json({ error: "Room ID is required" });
        return;
    }

    try {
        const room = await roomManager.getRoom(roomId as string);
        if (!room) {
            res.status(404).json({ error: "Room not found" });
            return;
        }

        // Basic authorization check
        // If room has an ownerId, only allow that owner to delete
        // If no ownerId (legacy/public), anyone can delete? Or restrict? 
        // Let's restrict to owner if owner exists.
        if (room.ownerId && room.ownerId !== userId) {
             res.status(403).json({ error: "Only the owner can delete this room" });
             return;
        }

        await roomManager.deleteRoom(roomId as string);
        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ error: "Failed to delete room" });
    }
};
