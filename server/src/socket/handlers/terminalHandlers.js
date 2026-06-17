import { executeTerminalCommand } from "../../services/terminalService.js";

export default function terminalHandlers(socket){
  socket.on("terminal-command", async ({roomId, command}) => {
    try {
      const output = await executeTerminalCommand( roomId, command );
      socket.emit("terminal-output", output);
    } 
    catch(err) {
      socket.emit("terminal-output", String(err));
    }
  });
}