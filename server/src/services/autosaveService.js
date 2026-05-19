import activeRooms from "../store/activeRooms.js";
import { saveRoom } from "./roomService.js";

export default function startAutosaveService(){

    setInterval(async ()=> {

        console.log("Autosave: Saving all active rooms...");

        for(const roomId in activeRooms){

            const room = activeRooms[roomId];
            if(Date.now() - room.lastActivity > 5000 &&
                room.lastSaved < room.lastActivity){

                await saveRoom(roomId);
                console.log(`Autosave: Room ${roomId} has been saved.`);
            }
        }        
    }, 5000);
}