import prisma from "../../lib/prisma.js";
import activeRooms from "../../store/activeRooms.js";

const EXTENSIONS = {

 js:"javascript",
 jsx:"javascript",
 py:"python",
 cpp:"cpp",
 java:"java",
 css:"css",
 html:"html",
 ts:"typescript",
 prisma:"prisma"

};

export default function registerFileHandlers(io,socket){

 socket.on(

  "create-file",

  async ({roomId,fileName})=>{

   const room=activeRooms[roomId];
   if(!room) return;

   const ext=fileName.split(".").pop();
   const language=  EXTENSIONS[ext] || "plaintext";

   room.files[fileName]={

    content:"",
    language

   };

   if(!room.activeFile) room.activeFile=fileName;
   const dbRoom = await prisma.room.findUnique({

      where:{roomId}

    });

   await prisma.file.create({
    data:{

      name:fileName,
      language,
      roomId:dbRoom.id

    }
   });

   io.to(roomId).emit("files-updated", room.files);

  });

  socket.on( "switch-file", ({roomId,fileName})=>{

    const room = activeRooms[roomId];
    if(!room) return;

    room.activeFile=fileName;
    socket.emit("file-content",
        {
            fileName,
            content: room.files[fileName].content,
            language: room.files[fileName].language
        }

    );

});

}