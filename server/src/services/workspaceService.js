import { exec } from "child_process";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { createWorkspaceFile } from "./fileSyncService.js";

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
    `docker exec collab-1 mkdir -p /workspace/room-${roomId}`
  );
}

export async function deleteWorkspace(roomId) {
  await run(
    `docker exec collab-1 rm -rf /workspace/room-${roomId}`
  );
}

export async function createWorkspace(ownerId, name) {

  const roomId = crypto.randomUUID();
  const room = await prisma.room.create({
    data: {
      roomId,
      name,
      owner: {
        connect: {
          id: ownerId,
        }
      },

      files: {
        create: {
          name: "main.js",
          path: "main.js",
          language: "javascript",
          content: "",
        }
      }
    },
    include: {
      files: true,
    }
  });

  await prisma.workspaceMember.create({
    data: {
      userId: ownerId,
      workspaceId: room.id,
      role: "EDITOR",
    }
  })

  await ensureWorkspace(roomId);
  await createWorkspaceFile(roomId, "main.js");

  return room;
}

export async function removeWorkspace(roomId, userId) {
  
  const room = await prisma.room.findUnique({
    where: {
      roomId,
    },
  });

  if(!room){
    throw new Error("Workspace not found");
  }

  if(room.ownerId !== userId) {
    throw new Error("Only the owner can delete the workspace");
  }

  await prisma.room.delete({
    where: {
      roomId,
    },
  });

  await deleteWorkspace(roomId);
}