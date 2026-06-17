import { exec } from "child_process";

export function runInWorkspace(roomId, command, cwd = `/workspace/room-${roomId}`){

  return new Promise(
    (resolve, reject) => {
        exec(`docker exec collab-1 bash -c "cd '${cwd}' && ${command}"`,(error, stdout, stderr) => {
            if (error) {
                resolve(stderr || error.message);
                return;
            }
            resolve(stdout);
        });
    });
}