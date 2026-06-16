import * as Y from "yjs";
import roomDocs from "../../store/roomDocs.js";
import activeRooms from "../../store/activeRooms.js";

export default function editorHandlers(socket, io){

  socket.on("yjs-sync", ({ roomId, path, update }) => {

    const key = `${roomId}:${path}`;

    if (!roomDocs[key]) {roomDocs[key] = new Y.Doc();}

    Y.applyUpdate(roomDocs[key], new Uint8Array(update));
    const room = activeRooms[roomId];

    if (room) {
      room.lastActivity = Date.now();
    }

    socket.to(roomId).emit(
      "yjs-update",
      {
        path,
        update,
      }
    );
  });

  socket.on("request-yjs-state", ({ roomId, path }) => {

    const key = `${roomId}:${path}`;

    if (!roomDocs[key]) {
      roomDocs[key] = new Y.Doc();
    }

    socket.emit(
      "yjs-state",
      {
        path,
        update: Array.from(
          Y.encodeStateAsUpdate(
            roomDocs[key]
          )
        ),
      }
    );
  });

  socket.on("cursor-move", ({ roomId, path, line, column }) => {
    console.log("CURSOR:", {
      socket: socket.id,
      path,
      line,
      column,
    });

    socket.to(roomId).emit(
      "user-cursor",
      {
        socketId: socket.id,
        path,
        line,
        column,
      }
    );
  });
}