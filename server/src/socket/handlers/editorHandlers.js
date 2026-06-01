import activeRooms from "../../store/activeRooms.js";

export default function editorHandlers(socket, io){

    socket.on("edit-file", ({roomId, name, content}) => {

        console.log("EDIT RECEIVED:", {
            roomId,
            name,
            content
            });


        const room = activeRooms[roomId];
        
        if(!room){
            console.log(`Room ${roomId} not found in memory. Edit ignored.`);
            return;
        }

        const file = room.files[name];
        if(!file){
            console.log(`File ${name} not found in room ${roomId}. Edit ignored.`);
            return;
        }

        file.content = content;
        room.lastActivity = Date.now();

        socket.to(roomId).emit("receive-file-edit", { name, content });
    })
}