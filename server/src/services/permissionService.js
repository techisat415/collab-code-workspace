import prisma from "../lib/prisma.js";

export async function canAccessWorkspace(userId, roomId) {
  const room = await prisma.room.findUnique({
      where: {
        roomId,
      },
      include: {
        members: true,
      },
    });

  if (!room) return false;
  if (room.ownerId === userId) return true;

  return room.members.some(member => member.userId === userId);
}