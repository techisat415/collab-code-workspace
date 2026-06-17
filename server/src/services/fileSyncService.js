import { runInWorkspace } from "./dockerExecutor.js";

export async function createWorkspaceFile(
    roomId,
    path
) {
    const dir = path.split("/").slice(0, -1).join("/");

    if (dir) {
        await runInWorkspace(
            roomId,
            `mkdir -p "${dir}"`
        );
    }

    await runInWorkspace(
        roomId,
        `touch "${path}"`
    );
}

export async function deleteWorkspaceFile(
    roomId,
    path
) {
    await runInWorkspace(
        roomId,
        `rm -f "${path}"`
    );
}

export async function renameWorkspaceFile(
    roomId,
    oldPath,
    newPath
) {
    await runInWorkspace(
        roomId,
        `mv "${oldPath}" "${newPath}"`
    );
}

export async function writeWorkspaceFile(
    roomId,
    path,
    content
) {
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