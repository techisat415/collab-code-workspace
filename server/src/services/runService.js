import { runInWorkspace } from "./dockerExecutor.js";
import { runtimeRegistry } from "../config/runtimeRegistry.js";
import { runRestrictedFile } from "./restrictedExecutionService.js";
import { isRestrictedTerminalMode } from "./terminalMode.js";

export async function runFile(
  roomId,
  path
) {
  if (isRestrictedTerminalMode()) {
    return runRestrictedFile(roomId, path);
  }

  const extension =
    path.split(".").pop().toLowerCase();

  const runtime =
    runtimeRegistry[extension];

  if (!runtime) {
    throw new Error(
      `Unsupported file type: ${extension}`
    );
  }

  return runInWorkspace(
    roomId,
    runtime.command(path)
  );
}
