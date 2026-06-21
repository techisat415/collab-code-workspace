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

    const memberships = await prisma.workspaceMember.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        workspace: true,
      }
    })
    const rooms = memberships.map((member) => ({
      roomId: member.workspace.roomId,
      name: member.workspace.name,
      role: member.role,
      createdAt: member.workspace.createdAt,
      updatedAt: member.workspace.updatedAt,
    }));

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

export async function getWorkspaceController(req, res) {
  try {
    const { roomId } = req.params;
    const room = await prisma.room.findUnique({
      where: {
        roomId,
      },

      select: {
        roomId: true,
        name: true,
      },
    });

    if (!room) return res.status(404).json({error: "Workspace not found"});
    res.json(room);

  } catch (err) {

    console.error(err);

    res.status(500).json({error: "Failed to fetch workspace"});
  }
}

export async function getWorkspaceMembersController(req, res) {
  try {

    const { roomId } = req.params;
    const room = await prisma.room.findUnique({
      where: { roomId },

      include: {
        members:{
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
              }
            }
          }
        }
      },
    });

    if (!room) return res.status(404).json({error: "Workspace not found"});

    res.json(
      room.members.map(member => ({
        id: member.user.id,
        username: member.user.username,
        name: member.user.name,
        role: member.role,
      }))
    );

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch members",
    });
  }
}

export async function getInviteInfoController(req, res) {
  try {

    const { roomId } = req.params;

    const room = await prisma.room.findUnique({
      where: { roomId },

      include: {
        owner: {
          select: {
            username: true,
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({
        error: "Workspace not found",
      });
    }

    const existingMember =
      await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: req.user.userId,
            workspaceId: room.id,
          }
        }
      });

    res.json({
      roomId: room.roomId,
      name: room.name,
      owner: room.owner.username,
      isMember: !!existingMember,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Failed to load invite",
    });
  }
}