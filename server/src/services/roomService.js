import prisma from "../lib/prisma.js";
import activeRooms from "../store/activeRooms.js";

export async function loadRoom(roomId, socketId){
    let roomInMemory = activeRooms[roomId];

    if(roomInMemory){
        roomInMemory.users.add(socketId);
        return{
            room: roomInMemory,
            source: "RAM",
        };
    }

    

    let room = await prisma.room.findUnique({
        where: {
            roomId,
        },

        include: {
            files: true,
        }
    });


    if(room && room.files.length === 0){

    await prisma.file.create({
        data:{
            roomId: room.id,
            name:"main.js",
            language:"javascript",
            content:""
        }
    });

    room = await prisma.room.findUnique({
        where:{ roomId },
        include:{ files:true }
    });
}

    console.log("FILES IN DB:",room?.files);

    if(!room){
        room = await prisma.room.create({
            data: {
                roomId,

                files: {
                create: {
                    name: "main.js",
                    language: "javascript",
                    content: "",
                }
            },
            },
            include: {
                files: true,
            }
        });

        console.log(`Room ${roomId} created in DB with default file.`);
        console.log(JSON.stringify(room.files, null, 2));
    }

    const files = {};

    room.files.forEach((file) => {
        files[file.name] = { 
            content: file.content, 
            language: file.language || "plaintext",
        };
    });

    activeRooms[roomId] = {
        files,
        activeFile: room.files[0]?.name || null,
        users: new Set([socketId]),
        lastActivity: Date.now(),
        lastSaved: Date.now(),
    };

    return {
        room: activeRooms[roomId],
        source: "DB",
    };   

}

export async function saveRoom(roomId){
    const room = activeRooms[roomId];

    if(!room) return;

    room.lastSaved = Date.now();
}