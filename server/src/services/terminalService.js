import roomTerminals from "../store/roomTerminals.js";
import { runInWorkspace } from "./dockerExecutor.js";
import { executeRestrictedTerminalCommand } from "./restrictedExecutionService.js";
import { isRestrictedTerminalMode } from "./terminalMode.js";

function normalizePath(path) {
  const parts = [];

  for (const part of path.split("/")) {
    if (!part || part === ".") continue;

    if (part === "..") {
      parts.pop();
      continue;
    }

    parts.push(part);
  }

  return "/" + parts.join("/");
}

export async function executeTerminalCommand( roomId, command) {
  if (isRestrictedTerminalMode()) {
    return executeRestrictedTerminalCommand(roomId, command);
  }

  if (!roomTerminals[roomId]) {
    roomTerminals[roomId] = {
      cwd: `/workspace/room-${roomId}`,
    };
  }

  const terminal = roomTerminals[roomId];
  const trimmed = command.trim();

  const workspaceRoot = `/workspace/room-${roomId}`;

  if (trimmed === "cd" || trimmed.startsWith("cd ")) {
    let target = trimmed.slice(2).trim();

    if (!target) {
      terminal.cwd = workspaceRoot;
      return "~";
    }

    const newPath = target.startsWith("/") ? normalizePath(target) : normalizePath(`${terminal.cwd}/${target}`);

    if (!newPath.startsWith(workspaceRoot)) {
      return "Permission denied: You naughty boi! I see what you are trying to do there.";
    }

    try{
      await runInWorkspace(roomId, `[ -d "${newPath}" ]`, workspaceRoot);
      terminal.cwd = newPath;
      return terminal.cwd.replace(workspaceRoot, "~");
    }
    catch {
      return `cd: no such file or directory: ${target}`;
    }
  }

  if (trimmed === "pwd") return terminal.cwd.replace(workspaceRoot, "~");

  return runInWorkspace(roomId, command, terminal.cwd);
}
