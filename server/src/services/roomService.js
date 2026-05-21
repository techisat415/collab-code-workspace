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

    if(!room){
        room = await prisma.room.create({
            data: {
                roomId,
                code: "",
            },
        });
    }

    const files = {};

    room.files.forEach((file) => {
        files[file.fileName] = { 
            content: file.content, 
            language: file.language || "plaintext",
        };
    });

    activeRooms[roomId] = {
        code: room.code,
        files,
        activeFiles: room.files[0]?.name || null,
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

    await prisma.room.update({
        where: {
            roomId,
        },
        data: {
            code: room.code,
        },
    });

    room.lastSaved = Date.now();
}