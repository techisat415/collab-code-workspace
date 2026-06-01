import activeRooms from "../../store/activeRooms.js";
import detectLanguage from "../../utils/detectLanguage.js";
import prisma from "../../lib/prisma.js";

export default function fileHandlers(socket, io){

  socket.on("create-file", async ({ roomId, name }) => {
    const room = activeRooms[roomId];
    if (!room) return;
    if (room.files[name]) {
      return;
    }
      
    room.files[name] = {
      content: "",
      language: detectLanguage(name),
    };

    const dbRoom = await prisma.room.findUnique({
        where: { roomId }
    });

    await prisma.file.create({
        data: {
            roomId: dbRoom.id,
            name,
            language: detectLanguage(name),
            content: "",
        }
    });
      
    io.to(roomId).emit("file-created", {
      name,
      language: detectLanguage(name),
    });
  });

  socket.on("rename-file", async ({ roomId, oldName, newName }) => {
    console.log("RENAME RECEIVED", oldName, newName);
    const room = activeRooms[roomId];
    if (!room || !room.files[oldName] || room.files[newName]) return;
    if(room.files[newName]){
        return;
    }

    room.files[newName] = room.files[oldName];
    room.files[newName].language = detectLanguage(newName);
    delete room.files[oldName];

    const dbRoom = await prisma.room.findUnique({
        where: { roomId }
    });

    await prisma.file.updateMany({
        where: {
            roomId: dbRoom.id,
            name: oldName,
        },
        data: {
            name: newName,
            language: detectLanguage(newName),
        }
    });

    io.to(roomId).emit("file-renamed", {
        oldName,
        newName,
    });
  });
  

  socket.on("delete-file", async ({ roomId, name }) => {
    console.log("DELETE RECEIVED", name);
    const room = activeRooms[roomId];
    if (!room) return;
    if(Object.keys(room.files).length === 1){
        return;
    }

    delete room.files[name];

    const dbRoom = await prisma.room.findUnique({
        where: { roomId }
    });

    await prisma.file.deleteMany({
        where: {
            roomId: dbRoom.id,
            name,
        }
    });

    io.to(roomId).emit("file-deleted", {name,});
  });
}