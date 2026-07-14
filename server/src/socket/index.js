import roomHandlers from "./handlers/roomHandlers.js";
import editorHandlers from "./handlers/editorHandlers.js";
import fileHandlers from "./handlers/fileHandlers.js";
import runHandlers from "./handlers/runHandlers.js";
import terminalHandlers from "./handlers/terminalHandlers.js";
import chatHandlers from "./handlers/chatHandlers.js";

export default function registerSocketHandlers(io) {

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    roomHandlers(socket, io);
    editorHandlers(socket, io);
    chatHandlers(socket, io);
    fileHandlers(socket, io);
    runHandlers(socket);
    terminalHandlers(socket, io);
  });
}
