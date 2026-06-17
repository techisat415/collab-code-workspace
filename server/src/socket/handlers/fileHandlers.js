import activeRooms from "../../store/activeRooms.js";
import detectLanguage from "../../utils/detectLanguage.js";
import { createWorkspaceFile, renameWorkspaceFile, deleteWorkspaceFile } from "../../services/fileSyncService.js";
import prisma from "../../lib/prisma.js";
import * as Y from "yjs";
import roomDocs from "../../store/roomDocs.js";

function getFileName(filePath) {
  return filePath.split("/").pop() || filePath;
}

export default function fileHandlers(socket, io){

  socket.on("create-file", async ({ roomId, path }) => {

    await createWorkspaceFile(roomId, path);
    const room = activeRooms[roomId];
    if (!room) return;
    if (room.files[path]) {
      return;
    }
      
    room.files[path] = {
      name: getFileName(path),
      path,
      language: detectLanguage(path),
    };

    const key = `${roomId}:${path}`;

    if (!roomDocs[key]) {
      roomDocs[key] = new Y.Doc();
    }

    const dbRoom = await prisma.room.findUnique({
        where: { roomId }
    });

    await prisma.file.create({
        data: {
            roomId: dbRoom.id,
            name: getFileName(path),
            path,
            language: detectLanguage(path),
            content: "",
        }
    });
      
    io.to(roomId).emit("file-created", {
      name: getFileName(path),
      path,
      language: detectLanguage(path),
    });
  });

  socket.on("rename-file", async ({ roomId, oldPath, newPath }) => {
    await renameWorkspaceFile(roomId, oldPath, newPath);
    console.log("RENAME RECEIVED", oldPath, newPath);
    const room = activeRooms[roomId];
    if (!room || !room.files[oldPath] || room.files[newPath]) return;
    if(room.files[newPath]){
        return;
    }

    const oldKey = `${roomId}:${oldPath}`;
    const newKey = `${roomId}:${newPath}`;

    if (roomDocs[oldKey]) {
      roomDocs[newKey] = roomDocs[oldKey];
      delete roomDocs[oldKey];
    }

    room.files[newPath] = room.files[oldPath];
    room.files[newPath].name = getFileName(newPath);
    room.files[newPath].path = newPath;
    room.files[newPath].language = detectLanguage(newPath);
    delete room.files[oldPath];

    if (room.activeFile === oldPath) {
      room.activeFile = newPath;
    }

    const dbRoom = await prisma.room.findUnique({
        where: { roomId }
    });

    await prisma.file.updateMany({
        where: {
            roomId: dbRoom.id,
            path: oldPath,
        },
        data: {
            name: getFileName(newPath),
            path: newPath,
            language: detectLanguage(newPath),
        }
    });

    io.to(roomId).emit("file-renamed", {
        oldPath,
        newPath,
    });
  });
  

  socket.on("delete-file", async ({ roomId, path }) => {
    await deleteWorkspaceFile(roomId, path);
    console.log("DELETE RECEIVED", path);
    const room = activeRooms[roomId];
    if (!room) return;
    if(Object.keys(room.files).length === 1){
        return;
    }

    delete roomDocs[`${roomId}:${path}`];

    delete room.files[path];

    if (room.activeFile === path) {
      room.activeFile = Object.keys(room.files)[0] || null;
    }

    const dbRoom = await prisma.room.findUnique({
        where: { roomId }
    });

    await prisma.file.deleteMany({
        where: {
            roomId: dbRoom.id,
            path,
        }
    });

    io.to(roomId).emit("file-deleted", { path });
  });
}