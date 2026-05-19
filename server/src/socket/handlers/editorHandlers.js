import activeRooms from "../../store/activeRooms.js";

export default function editorHandlers(socket, io){

    socket.on("code-edit", ({roomId, code}) => {
        
        if(!activeRooms[roomId]){
            console.log(`Room ${roomId} not found in memory. Edit ignored.`);
            return;
        }

        activeRooms[roomId].code = code;
        activeRooms[roomId].lastActivity = Date.now();

        socket.to(roomId).emit(
            "receive-code-edit",
            code
        );
    })
}