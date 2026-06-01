import activeRooms from "../../store/activeRooms.js";
import detectLanguage from "../../utils/detectLanguage.js";

export default function fileHandlers(socket, io){

  socket.on("create-file", ({ roomId, name }) => {
    const room = activeRooms[roomId];
    if (!room) return;
    if (room.files[name]) {
      return;
    }
      
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
    console.log("RENAME RECEIVED", oldName, newName);
    const room = activeRooms[roomId];
    if (!room || !room.files[oldName] || room.files[newName]) return;
    if(room.files[newName]){
        return;
    }

    room.files[newName] = room.files[oldName];
    delete room.files[oldName];

    io.to(roomId).emit("file-renamed", {
        oldName,
        newName,
    });
  });
  

  socket.on("delete-file", ({ roomId, name }) => {
    console.log("DELETE RECEIVED", name);
    const room = activeRooms[roomId];
    if (!room) return;
    if(Object.keys(room.files).length === 1){
        return;
    }

    delete room.files[name];
    io.to(roomId).emit("file-deleted", {name,});
  });
}