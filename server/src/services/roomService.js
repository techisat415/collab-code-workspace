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
    });

    if(!room){
        room = await prisma.room.create({
            data: {
                roomId,
                code: "",
            },
        });
    }

    activeRooms[roomId] = {
        code: room.code,
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