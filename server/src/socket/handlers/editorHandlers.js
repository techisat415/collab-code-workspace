import activeRooms from "../../store/activeRooms.js";

export default function editorHandlers(socket, io){

    socket.on("edit-file", ({roomId, fileName, content}) => {

        const room = activeRooms[roomId];
        
        if(!room){
            console.log(`Room ${roomId} not found in memory. Edit ignored.`);
            return;
        }

        const file = room.files[fileName];
        if(!file){
            console.log(`File ${fileName} not found in room ${roomId}. Edit ignored.`);
            return;
        }

        file.content = content;
        room.lastActivity = Date.now();

        socket.to(roomId).emit("receive-file-edit", { fileName, content });
    })
}