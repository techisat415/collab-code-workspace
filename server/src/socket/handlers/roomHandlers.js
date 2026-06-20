import activeRooms from "../../store/activeRooms.js";
import { loadRoom, saveRoom } from "../../services/roomService.js";
import { canAccessWorkspace } from "../../services/permissionService.js";

function getRoomUserCount(io, roomId) {
    const clients = io.sockets.adapter.rooms.get(roomId);

    return clients ? clients.size : 0;
}

function getUniqueUserCount(io, roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return 0;

    const users = new Set();
    for (const socketId of room) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket?.user?.userId) users.add(socket.user.userId);
    }

    return users.size;
}

function getOnlineUsers(io, roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return [];

    const users = new Map();

    for (const socketId of room) {
        const socket = io.sockets.sockets.get(socketId);

        if (socket?.user?.userId) {
            users.set(socket.user.userId, {
                userId: socket.user.userId,
                username: socket.user.username,
            });
        }
    }

    return Array.from(users.values());
}

export default function roomHandlers(socket, io){
    socket.on("join-room", async(roomId) => {

        console.log("socket.user= ", socket.user);

        const allowed = await canAccessWorkspace(socket.user.userId, roomId);
        console.log('allowed= ', allowed);
        if(!allowed){
            socket.emit("error", "You do not have permission to access this workspace.");
            return;
        }
        console.log("access granted");
        const { room, source } = await loadRoom(roomId, socket.id);

        if(socket.disconnected){
            console.log(`Socket ${socket.id} disconnected before room ${roomId} could be loaded.`);
            return;
        }

        socket.join(roomId);
        console.log("ONLINE USERS:", getOnlineUsers(io, roomId));
        io.to(roomId).emit("room-users", {
            count: getUniqueUserCount(io, roomId),
            users: getOnlineUsers(io, roomId),
        });
        socket.emit("files-updated", room.files);

        console.log(`Socket ${socket.id} joined room ${roomId}. Room loaded from ${source}.`);
    });

    socket.on("disconnect", async() => {
        console.log(`Socket ${socket.id} disconnected. Checking rooms...`);

        for(const roomId in activeRooms){

            const count = getUniqueUserCount(io, roomId);
            console.log(`Room ${roomId} has ${count} unique users after disconnection.`);

     
            io.to(roomId).emit("room-users", {
                count,
                users: getOnlineUsers(io, roomId),
            });

            if(count === 0){
                await saveRoom(roomId);
                delete activeRooms[roomId];
                console.log(`Room ${roomId} has been saved and removed from memory due to inactivity.`);
            }
        }
    });
}