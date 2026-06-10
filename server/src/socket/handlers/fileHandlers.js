import activeRooms from "../../store/activeRooms.js";
import detectLanguage from "../../utils/detectLanguage.js";
import prisma from "../../lib/prisma.js";

function getFileName(filePath) {
  return filePath.split("/").pop() || filePath;
}

export default function fileHandlers(socket, io){

  socket.on("create-file", async ({ roomId, path }) => {
    const room = activeRooms[roomId];
    if (!room) return;
    if (room.files[path]) {
      return;
    }
      
    room.files[path] = {
      name: getFileName(path),
      path,
      content: "",
      language: detectLanguage(path),
    };

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
      content: "",
    });
  });

  socket.on("rename-file", async ({ roomId, oldPath, newPath }) => {
    console.log("RENAME RECEIVED", oldPath, newPath);
    const room = activeRooms[roomId];
    if (!room || !room.files[oldPath] || room.files[newPath]) return;
    if(room.files[newPath]){
        return;
    }

    room.files[newPath] = room.files[oldPath];
    room.files[newPath].name = getFileName(newPath);
    room.files[newPath].path = newPath;
    room.files[newPath].language = detectLanguage(newPath);
    delete room.files[oldPath];

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
    console.log("DELETE RECEIVED", path);
    const room = activeRooms[roomId];
    if (!room) return;
    if(Object.keys(room.files).length === 1){
        return;
    }

    delete room.files[path];

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