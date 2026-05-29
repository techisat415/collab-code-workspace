import activeRooms from "../../store/activeRooms.js";
import { loadRoom, saveRoom } from "../../services/roomService.js";

export default function roomHandlers(socket, io){
    socket.on("join-room", async(roomId) => {

        socket.join(roomId);

        const { room, source } = await loadRoom(roomId, socket.id);
        io.to(roomId).emit("room-users", room.users.size);

        socket.emit("files-updated", room.files);

        console.log(`Socket ${socket.id} joined room ${roomId}. Room loaded from ${source}.`);
    });

    socket.on("disconnect", async() => {
        console.log(`Socket ${socket.id} disconnected. Checking rooms...`);

        for(const roomId in activeRooms){

            const room = activeRooms[roomId];
            room.users.delete(socket.id);
            io.to(roomId).emit("room-users", room.users.size);

            if(room.users.size === 0){
                await saveRoom(roomId);
                delete activeRooms[roomId];
                console.log(`Room ${roomId} has been saved and removed from memory due to inactivity.`);
            }
        }
    });
}