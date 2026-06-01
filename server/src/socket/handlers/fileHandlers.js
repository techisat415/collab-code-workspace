import activeRooms from "../../store/activeRooms.js";
import detectLanguage from "../../utils/detectLanguage.js";

export default function fileHandlers(socket, io){

  socket.on("create-file", ({ roomId, name }) => {
      const room = activeRooms[roomId];
      if (!room) return;
      
      room.files[name] = {
        content: "",
        language: detectLanguage(name),
      };
      
      io.to(roomId).emit("file-created", {
        name,
        language: detectLanguage(name),
      });
    });
}