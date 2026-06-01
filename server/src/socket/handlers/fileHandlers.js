import activeRooms from "../../store/activeRooms.js";
import detectLanguage from "../../utils/detectLanguage.js";

export default function fileHandlers(socket, io){

    socket.on(
      "create-file",
      ({ roomId, name }) => {
        const room = activeRooms[roomId];
        if(!room) return;

        if(room.files[name]) return;

        room.files[name] = {
          language: detectLanguage(name),
          content: ""
        };

        io.to(roomId).emit("files-updated", room.files);

      }
    );
}