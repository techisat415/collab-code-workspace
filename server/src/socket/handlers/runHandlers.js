import { runFile }
from "../../services/runService.js";
import { canEdit } from "../../services/roleService.js";

export default function runHandlers(socket) {
    socket.on("run-file", async ({roomId, path}) => {
        try {
            const allowed = await canEdit(socket.user.userId, roomId);
            if (!allowed) {
                socket.emit("run-output", "Permission denied: running files requires editor permission.");
                return;
            }

            const output = await runFile( roomId, path);
            socket.emit("run-output", output);
        } catch (err) {
            socket.emit("run-output", String(err));
        }
    });
}
