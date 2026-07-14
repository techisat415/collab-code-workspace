import activeRooms from "../store/activeRooms.js";
import roomDocs from "../store/roomDocs.js";
import roomTerminals from "../store/roomTerminals.js";

const HELP_TEXT = [
  "Safe demo terminal",
  "",
  "Available commands:",
  "  help                 Show this help",
  "  clear                Clear the terminal",
  "  pwd                  Print current workspace directory",
  "  ls [path]            List workspace files",
  "  cd [path]            Change virtual directory",
  "  cat <file>           Print a workspace file",
  "  echo <text>          Print text",
  "  node <file.js>       Demo-run a JavaScript file",
  "  python <file.py>     Demo-run a Python file",
  "  npm test             Show demo test output",
  "",
  "This deployed terminal is intentionally restricted. It never runs arbitrary shell commands.",
].join("\r\n");

function parseArgs(command) {
  const args = [];
  const pattern = /"([^"]*)"|'([^']*)'|[^\s]+/g;
  let match;

  while ((match = pattern.exec(command)) !== null) {
    args.push(match[1] ?? match[2] ?? match[0]);
  }

  return args;
}

function hasShellSyntax(command) {
  return /[;&|`$<>\\]/.test(command);
}

function getTerminal(roomId) {
  if (!roomTerminals[roomId]) {
    roomTerminals[roomId] = {
      cwd: "/",
    };
  }

  return roomTerminals[roomId];
}

function normalizeVirtualPath(cwd, target = "") {
  const parts = [];
  const input = target.startsWith("/") ? target : `${cwd}/${target}`;

  for (const part of input.split("/")) {
    if (!part || part === ".") continue;

    if (part === "..") {
      parts.pop();
      continue;
    }

    parts.push(part);
  }

  return parts.join("/");
}

function getRoomFiles(roomId) {
  return activeRooms[roomId]?.files || {};
}

function getFileContent(roomId, path) {
  const doc = roomDocs[`${roomId}:${path}`];
  return doc?.getText("content").toString() || "";
}

function directoryExists(files, dirPath) {
  if (!dirPath) return true;

  const prefix = `${dirPath}/`;
  return Object.keys(files).some((path) => path.startsWith(prefix));
}

function listPath(files, dirPath) {
  const entries = new Map();
  const prefix = dirPath ? `${dirPath}/` : "";

  for (const filePath of Object.keys(files)) {
    if (!filePath.startsWith(prefix)) continue;

    const rest = filePath.slice(prefix.length);
    if (!rest || rest === ".gitkeep") continue;

    const [first, ...remaining] = rest.split("/");
    if (!first) continue;

    entries.set(first, remaining.length > 0 ? `${first}/` : first);
  }

  return Array.from(entries.values()).sort().join("  ") || "(empty)";
}

function extractJavaScriptOutput(content) {
  const lines = [];
  const pattern = /console\.log\((["'`])([\s\S]*?)\1\)/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    lines.push(match[2]);
  }

  return lines;
}

function extractPythonOutput(content) {
  const lines = [];
  const pattern = /print\((["'])([\s\S]*?)\1\)/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    lines.push(match[2]);
  }

  return lines;
}

function runDemoFile(roomId, path, kind) {
  const files = getRoomFiles(roomId);

  if (!files[path]) {
    return `${kind}: ${path}: no such file`;
  }

  const content = getFileContent(roomId, path);
  const output = kind === "node"
    ? extractJavaScriptOutput(content)
    : extractPythonOutput(content);

  if (output.length > 0) {
    return output.join("\r\n");
  }

  return [
    `[demo] ${kind} ${path}`,
    "No simple print output was detected.",
    "The deployed demo terminal does not execute arbitrary user code.",
  ].join("\r\n");
}

export async function executeRestrictedTerminalCommand(roomId, command) {
  const trimmed = String(command || "").trim();
  const terminal = getTerminal(roomId);
  const files = getRoomFiles(roomId);

  if (!trimmed) return "";
  if (hasShellSyntax(trimmed)) {
    return "Blocked: shell operators and redirection are disabled in the deployed demo terminal.";
  }

  const args = parseArgs(trimmed);
  const [cmd, ...rest] = args;

  switch (cmd) {
    case "help":
      return HELP_TEXT;

    case "clear":
      return "\x1b[2J\x1b[H";

    case "pwd":
      return terminal.cwd === "/" ? "~" : `~/${terminal.cwd.slice(1)}`;

    case "whoami":
      return "collab-demo";

    case "date":
      return new Date().toString();

    case "echo":
      return rest.join(" ");

    case "ls": {
      const targetPath = normalizeVirtualPath(terminal.cwd, rest[0] || "");
      if (files[targetPath]) return targetPath.split("/").pop();
      if (!directoryExists(files, targetPath)) {
        return `ls: ${rest[0] || "."}: No such file or directory`;
      }

      return listPath(files, targetPath);
    }

    case "cd": {
      const targetPath = normalizeVirtualPath(terminal.cwd, rest[0] || "");
      if (!directoryExists(files, targetPath)) {
        return `cd: ${rest[0] || "."}: No such directory`;
      }

      terminal.cwd = targetPath ? `/${targetPath}` : "/";
      return "";
    }

    case "cat": {
      if (!rest[0]) return "cat: missing file operand";

      const targetPath = normalizeVirtualPath(terminal.cwd, rest[0]);
      if (!files[targetPath]) return `cat: ${rest[0]}: No such file`;

      return getFileContent(roomId, targetPath) || "";
    }

    case "node": {
      if (!rest[0]) return "node: missing file path";

      const targetPath = normalizeVirtualPath(terminal.cwd, rest[0]);
      return runDemoFile(roomId, targetPath, "node");
    }

    case "python":
    case "python3": {
      if (!rest[0]) return `${cmd}: missing file path`;

      const targetPath = normalizeVirtualPath(terminal.cwd, rest[0]);
      return runDemoFile(roomId, targetPath, "python");
    }

    case "npm":
      if (rest[0] === "test") {
        return [
          "> collab-code-editor@demo test",
          "> restricted-demo-runner",
          "",
          "PASS workspace permissions",
          "PASS collaborative editing",
          "PASS shared terminal broadcast",
          "",
          "Demo test run complete.",
        ].join("\r\n");
      }
      break;

    default:
      break;
  }

  return `Command not available in demo terminal: ${cmd}\r\nRun "help" to see allowed commands.`;
}

export async function runRestrictedFile(roomId, path) {
  const extension = String(path || "").split(".").pop().toLowerCase();

  if (extension === "js" || extension === "mjs" || extension === "ts") {
    return runDemoFile(roomId, path, "node");
  }

  if (extension === "py") {
    return runDemoFile(roomId, path, "python");
  }

  return [
    `[demo] Running ${path}`,
    "This file type is not executed in restricted demo mode.",
  ].join("\r\n");
}
