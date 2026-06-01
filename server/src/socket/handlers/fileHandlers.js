import activeRooms from "../../store/activeRooms.js";
import detectLanguage from "../../utils/detectLanguage.js";

export default function fileHandlers(socket, io){

  socket.on("create-file", ({ roomId, name }) => {
    const room = activeRooms[roomId];
    if (!room) return;
      
    room.files[name] = {
      content: "",
      language: detectLanguage(name),
    };
      
    io.to(roomId).emit("file-created", {
      name,
      language: detectLanguage(name),
    });
  });

  socket.on("rename-file", ({ roomId, oldName, newName }) => {
    const room = activeRooms[roomId];
    if (!room) return;

    room.files[newName] = room.files[oldName];
    delete room.files[oldName];

    io.to(roomId).emit("file-renamed", {
        oldName,
        newName,
    });
  });
  

  socket.on("delete-file", ({ roomId, name }) => {
    const room = activeRooms[roomId];
    if (!room) return;

    delete room.files[name];
    io.to(roomId).emit("file-deleted", {name,});
  });
}