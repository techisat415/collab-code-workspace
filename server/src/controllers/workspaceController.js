import prisma from "../lib/prisma.js";
import { createWorkspace } from "../services/workspaceService.js";

export async function createWorkspaceController(req, res) {
  try {
    const { name } = req.body;
    const room = await createWorkspace(req.user.userId, name);
    res.status(201).json(room);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to create workspace",
    });
  }
}

export async function getWorkspacesController(req, res) {
  try {

    const rooms =
      await prisma.room.findMany({
        where: {
          ownerId: req.user.userId,
        },

        select: {
          roomId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    res.json(rooms);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to fetch workspaces",
    });
  }
}

export async function joinWorkspaceController(req, res) {
  try {
    const { roomId } = req.params;
    const room = await prisma.room.findUnique({
      where: { roomId }
    });

    if (!room) {
      return res.status(404).json({
        error: "Workspace not found"
      });
    }

    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: req.user.userId,
          workspaceId: room.id
        }
      },
      update: {},
      create: {
        userId: req.user.userId,
        workspaceId: room.id,
        role: "EDITOR"
      }
    });

    res.json({
      message: "Joined workspace"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Failed to join workspace"
    });
  }
}