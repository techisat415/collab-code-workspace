import roomTerminals from "../store/roomTerminals.js";
import { runInWorkspace } from "./dockerExecutor.js";

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

export async function executeTerminalCommand(
  roomId,
  command
) {

  if (!roomTerminals[roomId]) {
    roomTerminals[roomId] = {
      cwd: `/workspace/room-${roomId}`,
    };
  }

  const terminal = roomTerminals[roomId];

  const trimmed = command.trim();

  //
  // HANDLE cd
  //
  if (
    trimmed === "cd" ||
    trimmed.startsWith("cd ")
  ) {

    let target =
      trimmed.slice(2).trim();

    if (!target) {
      target = `/workspace/room-${roomId}`;
    }

    if (target.startsWith("/")) {
      terminal.cwd =
        normalizePath(target);
    } else {
      terminal.cwd =
        normalizePath(
          `${terminal.cwd}/${target}`
        );
    }

    return terminal.cwd;
  }

  //
  // HANDLE pwd
  //
  if (trimmed === "pwd") {
    return terminal.cwd;
  }

  //
  // EVERYTHING ELSE
  //
  return runInWorkspace(
    roomId,
    command,
    terminal.cwd
  );
}