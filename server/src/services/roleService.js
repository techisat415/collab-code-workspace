import prisma from "../lib/prisma.js";

export async function getWorkspaceRole(userId, roomId){
  const room = await prisma.room.findUnique({
    where: { roomId },
    include: {
      members: true,
    }
  });

  if (!room) return null;
  const member = room.members.find(m => m.userId === userId);
  return member?.role ?? null;
}

export async function canEdit(userId, roomId) {
  const role = await getWorkspaceRole(userId, roomId);
  return ( role === "OWNER" || role === "EDITOR");
}

export async function isOwner(userId, roomId) {
  const role = await getWorkspaceRole(userId, roomId);
  return role === "OWNER";
}