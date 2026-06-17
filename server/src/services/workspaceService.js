import { exec } from "child_process";

function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout);
    });
  });
}

export async function ensureWorkspace(roomId) {
  await run(
    `docker exec collab-ide mkdir -p /workspace/room-${roomId}`
  );
}

export async function deleteWorkspace(roomId) {
  await run(
    `docker exec collab-ide rm -rf /workspace/room-${roomId}`
  );
}