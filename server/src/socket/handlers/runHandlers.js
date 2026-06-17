import { runFile }
from "../../services/runService.js";

export default function runHandlers(socket) {
    socket.on("run-file", async ({roomId, path}) => {
        try {
            const output = await runFile( roomId, path);
            socket.emit("run-output", output);
        } catch (err) {
            socket.emit("run-output", String(err));
        }
    });
}