import { Router } from 'express';
import { 
    createRoomHandler, 
    getMyRoomsHandler, 
    getRoomsHandler, 
    inviteUserHandler,
    updatePrivacyHandler,
    deleteRoomHandler 
} from '../controllers/room.controller';
import { RoomManager } from '../services/room.service';

export const createRoomRouter = (roomManager: RoomManager) => {
    const router = Router();
    
    router.get('/rooms', getRoomsHandler(roomManager));
    router.post('/rooms', createRoomHandler(roomManager));
    router.get('/my-rooms', getMyRoomsHandler(roomManager));
    
    // Invite user
    router.post('/rooms/:roomId/invite', inviteUserHandler(roomManager));

    // Update Privacy
    router.patch('/rooms/:roomId/privacy', updatePrivacyHandler(roomManager));

    // Delete Room
    router.delete('/rooms/:roomId', deleteRoomHandler(roomManager));
    
    return router;
};
