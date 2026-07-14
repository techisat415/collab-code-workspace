import { runInWorkspace } from "./dockerExecutor.js";
import { isRestrictedTerminalMode } from "./terminalMode.js";

export async function createWorkspaceFile(roomId, path) {
    if (isRestrictedTerminalMode()) {
        return;
    }

    const dir = path.split("/").slice(0, -1).join("/");

    if (dir) {
        await runInWorkspace(roomId, `mkdir -p "${dir}"`);
    }

    await runInWorkspace(roomId, `touch "${path}"`);
}

export async function deleteWorkspaceFile(roomId, path) {
    if (isRestrictedTerminalMode()) {
        return;
    }

    await runInWorkspace(roomId, `rm -f "${path}"`);
}

export async function renameWorkspaceFile(roomId, oldPath, newPath) {
    if (isRestrictedTerminalMode()) {
        return;
    }

    await runInWorkspace(roomId, `mv "${oldPath}" "${newPath}"`);
}

export async function writeWorkspaceFile(
    roomId,
    path,
    content
) {
    if (isRestrictedTerminalMode()) {
        return;
    }

    const encoded = Buffer
        .from(content, "utf8")
        .toString("base64");

    const dir = path
        .split("/")
        .slice(0, -1)
        .join("/");

    if (dir) {
        await runInWorkspace(
            roomId,
            `mkdir -p "${dir}"`
        );
    }

    await runInWorkspace(
        roomId,
        `echo '${encoded}' | base64 -d > "${path}"`
    );
}
