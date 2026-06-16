import prisma from "../lib/prisma.js";
import activeRooms from "../store/activeRooms.js";
import roomDocs from "../store/roomDocs.js";
import * as Y from "yjs";

function getFilePath(file) {
    return file.path || file.name;
}

function getFileName(filePath) {
    return filePath.split("/").pop() || filePath;
}

function getOrCreateDoc(file, roomId, filePath) {
    const key = `${roomId}:${filePath}`;

    if (!roomDocs[key]) {
        const doc = new Y.Doc();
        doc.getText("content").insert(0, file.content || "");
        roomDocs[key] = doc;
    }

    return roomDocs[key];
}

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
            path:"main.js",
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
                            path: "main.js",
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
        const filePath = getFilePath(file);
        getOrCreateDoc(file, roomId, filePath);
        files[filePath] = { 
            name: file.name || getFileName(filePath),
            path: filePath,
            language: file.language || "plaintext",
        };
    });

    activeRooms[roomId] = {
        files,
        activeFile: room.files[0] ? getFilePath(room.files[0]) : null,
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

    const dbRoom = await prisma.room.findUnique({
        where: { roomId }
    });

    if(!dbRoom) return;
    for(const path in room.files){

        const file = room.files[path];
        const doc = roomDocs[`${roomId}:${path}`];
        const content = doc?.getText("content").toString() || "";

        console.log("Saving file", file, content);

        await prisma.file.upsert({
            where:{
                roomId_path:{
                    roomId: dbRoom.id,
                    path,
                }
            },
            update:{
                name: file.name || getFileName(path),
                path,
                content,
                language:file.language,
            },
            create:{
                roomId:dbRoom.id,
                name: file.name || getFileName(path),
                path,
                content,
                language:file.language,
            }
        });
    }
    room.lastSaved = Date.now();
    console.log(`DB: Room ${roomId} has been saved.`);
}