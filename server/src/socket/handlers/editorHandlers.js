import activeRooms from "../../store/activeRooms.js";

export default function editorHandlers(socket, io){

  socket.on("edit-file", ({ roomId, path, content }) => {

    console.log("EDIT RECEIVED:", { roomId, path, content });
        const room = activeRooms[roomId];
        
        if(!room){
            console.log(`Room ${roomId} not found in memory. Edit ignored.`);
            return;
        }

    const file = room.files[path];
        if(!file){
      console.log(`File ${path} not found in room ${roomId}. Edit ignored.`);
            return;
        }

        file.content = content;
        room.lastActivity = Date.now();

    socket.to(roomId).emit("receive-file-edit", { path, content });
    })
    socket.on("cursor-move", ({ roomId, line, column, }) => {
        socket.to(roomId).emit(
          "user-cursor",
          {
            socketId: socket.id,
            line,
            column,
          }
        );
      });}