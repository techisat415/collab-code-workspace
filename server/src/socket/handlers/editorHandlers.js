import * as Y from "yjs";
import roomDocs from "../../store/roomDocs.js";
import activeRooms from "../../store/activeRooms.js";
import { canEdit } from "../../services/roleService.js";

export default function editorHandlers(socket, io){

  socket.on("yjs-sync", async ({ roomId, path, update }) => {
    const allowed = await canEdit(socket.user.userId, roomId);
    if (!allowed) {
      socket.emit("permission-denied", "You only have view access.");
      return;
    }
    const key = `${roomId}:${path}`;

    if (!roomDocs[key]) {
      roomDocs[key] = new Y.Doc();
    }
    Y.applyUpdate(roomDocs[key], new Uint8Array(update));
    const room = activeRooms[roomId];

    if (room) {
      room.lastActivity = Date.now();
    }

    socket.to(roomId).emit("yjs-update",
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

  socket.on("awareness-update", ({ roomId, update }) => {

    socket.to(roomId).emit(
      "awareness-update",
      {
        update,
      }
    );
  });
}