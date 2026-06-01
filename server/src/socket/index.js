import roomHandlers from "./handlers/roomHandlers.js";
import editorHandlers from "./handlers/editorHandlers.js";
import fileHandlers from "./handlers/fileHandlers.js";

export default function registerSocketHandlers(io) {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    roomHandlers(socket, io);
    editorHandlers(socket, io);
    fileHandlers(socket, io);
  });
}