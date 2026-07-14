import { executeTerminalCommand } from "../../services/terminalService.js";
import { canEdit } from "../../services/roleService.js";

export default function terminalHandlers(socket, io){
  socket.on("terminal-command", async ({roomId, command}) => {
    try {
      const allowed = await canEdit(socket.user.userId, roomId);
      if (!allowed) {
        socket.emit("terminal-output", "Permission denied: terminal access requires editor permission.");
        return;
      }

      const output = await executeTerminalCommand( roomId, command );
      io.to(roomId).emit("terminal-output", output);
    } 
    catch(err) {
      socket.emit("terminal-output", String(err));
    }
  });
}
