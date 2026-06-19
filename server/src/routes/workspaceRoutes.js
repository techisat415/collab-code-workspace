import { Router } from "express";
import { createWorkspaceController, getWorkspacesController, joinWorkspaceController } from "../controllers/workspaceController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createWorkspaceController);
router.post("/:roomId/join", authMiddleware, joinWorkspaceController);
router.get("/", authMiddleware, getWorkspacesController);


export default router;