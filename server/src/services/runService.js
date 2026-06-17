import { runInWorkspace } from "./dockerExecutor.js";
import { runtimeRegistry } from "../config/runtimeRegistry.js";

export async function runFile(
  roomId,
  path
) {

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