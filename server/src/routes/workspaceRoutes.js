import { Router } from "express";
import { createWorkspaceController, getWorkspacesController, joinWorkspaceController, getWorkspaceController, getWorkspaceMembersController, getInviteInfoController, getMyRoleController } from "../controllers/workspaceController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createWorkspaceController);
router.post("/:roomId/join", authMiddleware, joinWorkspaceController);
router.get("/", authMiddleware, getWorkspacesController);
router.get("/:roomId", authMiddleware, getWorkspaceController);
router.get("/:roomId/members", authMiddleware, getWorkspaceMembersController);
router.get("/:roomId/invite", authMiddleware, getInviteInfoController);
router.get("/:roomId/me", authMiddleware, getMyRoleController);

export default router;