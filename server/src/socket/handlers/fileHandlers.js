import activeRooms from "../../store/activeRooms.js";
import detectLanguage from "../../utils/detectLanguage.js";

export default function fileHandlers(socket, io){

    socket.on(
      "create-file",
      ({ roomId, fileName }) => {
        const room = activeRooms[roomId];
        if(!room) return;

        if(room.files[fileName]) return;

        room.files[fileName] = {
          language: detectLanguage(fileName),
          content: ""
        };

        io.to(roomId).emit("files-updated", room.files);

      }
    );
}