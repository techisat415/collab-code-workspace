import { Router } from "express";
import { createWorkspaceController, getWorkspacesController, joinWorkspaceController, getWorkspaceController } from "../controllers/workspaceController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createWorkspaceController);
router.post("/:roomId/join", authMiddleware, joinWorkspaceController);
router.get("/", authMiddleware, getWorkspacesController);
router.get("/:roomId", authMiddleware, getWorkspaceController);

export default router;