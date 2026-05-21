import registerRoomHandlers from "./handlers/roomHandlers.js";
import registerEditorHandlers from "./handlers/editorHandlers.js";
import registerFileHandlers from "./handlers/fileHandlers.js";

export default function registerSocketHandlers(io) {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    registerRoomHandlers(socket, io);
    registerEditorHandlers(socket, io);
    registerFileHandlers(socket, io);
  });
}