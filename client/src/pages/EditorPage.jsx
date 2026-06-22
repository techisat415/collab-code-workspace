import * as Y from "yjs";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness";
import { applyAwarenessUpdate, encodeAwarenessUpdate } from "y-protocols/awareness";
import SharedTerminal from "../components/Terminal.jsx";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket.js";
import FileTree from "../components/FileTree.jsx";
import api from "../api/api.js";
import ChatBox from "../components/ChatBox.jsx";
import WorkspaceSettings from "../components/WorkspaceSettings.jsx";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FilesIcon,
  ChatIcon,
  TerminalIcon,
  PlayIcon,
  SettingsIcon,
  LinkIcon,
  PlusIcon,
} from "../components/icons.jsx";
import "./EditorPage.css";

// Collapse state for the explorer/chat/terminal drawers is small and
// purely cosmetic, but persisting it makes the IDE feel "sticky" across
// reloads instead of resetting to the same defaults every time.
function usePersistedToggle(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? initial : stored === "1";
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, value ? "1" : "0");
    } catch {
      // localStorage can be unavailable (privacy mode, etc) — not worth surfacing
    }
  }, [key, value]);

  return [value, setValue];
}

function EditorPage() {

  const { roomId } = useParams();
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("");
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState([]);

  const [explorerOpen, setExplorerOpen] = usePersistedToggle("ide:explorerOpen", true);
  const [chatOpen, setChatOpen] = usePersistedToggle("ide:chatOpen", false);
  const [terminalOpen, setTerminalOpen] = usePersistedToggle("ide:terminalOpen", true);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const presenceRef = useRef(null);

  const editorRef = useRef(null);
  const ydocRef = useRef(null);
  const awarenessDocRef = useRef(null);
  const awarenessRef = useRef(null);
  const bindingRef = useRef(null);
  const activeFileRef = useRef(null);

  const buildAwarenessStyles = () => {
    const awareness = awarenessRef.current;

    if (!awareness) {
      return;
    }

    let styleElement = document.getElementById("yjs-awareness-styles");

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "yjs-awareness-styles";
      document.head.appendChild(styleElement);
    }

    const rules = [
      ".yRemoteSelection { background: rgba(255, 0, 0, 0.3) !important; }",
      ".yRemoteSelectionHead { border-left: 2px solid red !important; }",
    ];

    for (const [clientId, state] of awareness.getStates()) {
      if (clientId === awareness.clientID) {
        continue;
      }

      const color = state?.user?.color;

      if (!color) {
        continue;
      }

      rules.push(`.yRemoteSelection-${clientId} { background: ${color}33 !important; }`);
      rules.push(`.yRemoteSelectionHead-${clientId} { border-left: 2px solid ${color} !important; }`);
    }

    styleElement.textContent = rules.join("\n");
  };

  const initializeAwareness = () => {
    if (!awarenessDocRef.current) {
      return;
    }

    socket.on("connect", () => {
      console.log("SOCKET ID:", socket.id);
    });

    awarenessRef.current = new Awareness(awarenessDocRef.current);

    const userId = socket.id || crypto.randomUUID();

    awarenessRef.current.setLocalStateField("user", {
      name: `Guest-${userId.slice(0, 4)}`,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    });

    buildAwarenessStyles();

    socket.emit("awareness-update", {
      roomId,
      update: Array.from(
        encodeAwarenessUpdate(
          awarenessRef.current,
          [awarenessRef.current.clientID]
        )
      ),
    });
  };

  const attachYjsBinding = () => {
    const editor = editorRef.current;
    const ydoc = ydocRef.current;

    if (!editor || !ydoc) {
      return;
    }

    const model = editor.getModel();

    if (!model) {
      return;
    }

    bindingRef.current = new MonacoBinding(
      ydoc.getText("content"),
      model,
      new Set([editor]),
      awarenessRef.current
    );
  };

  useEffect(() => {
    awarenessDocRef.current = new Y.Doc();
    ydocRef.current = new Y.Doc();
    initializeAwareness();

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }

      if (awarenessDocRef.current) {
        awarenessDocRef.current.destroy();
        awarenessDocRef.current = null;
      }

      awarenessRef.current = null;
    };
  }, []);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await api.get(`/workspace/${roomId}`);
        setWorkspaceName(res.data.name);
      } catch (err) {
        console.error(err);
      }
    }
    loadWorkspace();
  }, [roomId]);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    attachYjsBinding();
  }

  const [role, setRole] = useState(null);

  useEffect(() => {
    async function loadRole() {
      try {
        const res = await api.get(`/workspace/${roomId}/me`);
        setRole(res.data.role);
      }
      catch (err) {
        console.error(err);
      }
    }
    loadRole();
  }, [roomId]);

  useEffect(() => {
    socket.emit("join-room", roomId);

    const handleFilesUpdated = (incomingFiles) => {
      if (!incomingFiles) {
        console.log("No files received from server.");
      };
      console.log("Files received from server:", incomingFiles);
      setFiles(incomingFiles);

      const filePaths = Object.keys(incomingFiles);

      console.log("File paths in room:", filePaths);
      if (filePaths.length > 0) {
        setActiveFile(filePaths[0]);
        console.log(`Active file set to ${filePaths[0]}`);
      }
    };

    const handleFileCreated = ({ path, name, language, content }) => {
      setFiles(prev => ({
        ...prev,
        [path]: {
          name,
          path,
          language,
        },
      })
      );

      setActiveFile(path);
    };

    // const handleReceiveFileEdit = ({ path, content }) => {
    //   return;
    // };

    const handleFileRenamed = ({ oldPath, newPath }) => {
      setFiles(prev => {
        const copy = { ...prev };
        copy[newPath] = {
          ...copy[oldPath],
          path: newPath,
          name: newPath.split("/").pop() || newPath,
        };
        delete copy[oldPath];
        return copy;
      });

      setActiveFile(prev =>
        prev === oldPath ? newPath : prev
      );
    };

    const handleFileDeleted = ({ path }) => {
      setFiles(prev => {
        const copy = { ...prev };
        delete copy[path];
        const remainingFiles = Object.keys(copy);
        setActiveFile(
          remainingFiles.length > 0
            ? remainingFiles[0]
            : null
        );
        return copy;
      });
    };

    const handleRoomUsers = ({ count, users }) => {
      console.log("ROOM USERS RECEIVED:", count);
      setOnlineUsers(count);
      setOnlineMembers(users);
    };

    const handleYjsState = ({ path, update }) => {
      if (path !== activeFileRef.current || !ydocRef.current) {
        return;
      }

      Y.applyUpdate(
        ydocRef.current,
        new Uint8Array(update)
      );
    };

    const handleYjsUpdate = ({ path, update }) => {
      if (path !== activeFileRef.current || !ydocRef.current) {
        return;
      }

      Y.applyUpdate(
        ydocRef.current,
        new Uint8Array(update)
      );
    };

    const handleAwarenessUpdate = ({ update }) => {
      if (!awarenessRef.current) {
        return;
      }

      applyAwarenessUpdate(
        awarenessRef.current,
        new Uint8Array(update),
        "remote"
      );

      buildAwarenessStyles();
    };

    socket.on("files-updated", handleFilesUpdated);
    socket.on("file-created", handleFileCreated);
    // socket.on("receive-file-edit", handleReceiveFileEdit);
    socket.on("file-renamed", handleFileRenamed);
    socket.on("file-deleted", handleFileDeleted);
    socket.on("room-users", handleRoomUsers);
    socket.on("yjs-state", handleYjsState);
    socket.on("yjs-update", handleYjsUpdate);
    socket.on("awareness-update", handleAwarenessUpdate);

    return () => {
      socket.off("files-updated", handleFilesUpdated);
      socket.off("file-created", handleFileCreated);
      // socket.off("receive-file-edit", handleReceiveFileEdit);
      socket.off("file-renamed", handleFileRenamed);
      socket.off("file-deleted", handleFileDeleted);
      socket.off("room-users", handleRoomUsers);
      socket.off("yjs-state", handleYjsState);
      socket.off("yjs-update", handleYjsUpdate);
      socket.off("awareness-update", handleAwarenessUpdate);
    };

  }, [roomId]);


  useEffect(() => {
    async function loadMembers() {
      try {
        const res = await api.get(`/workspace/${roomId}/members`);
        setMembers(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadMembers();
  }, [roomId]);

  useEffect(() => {
    if (!activeFile) {

      return;
    }

    // if (bindingRef.current) {
    //   bindingRef.current.destroy();
    //   bindingRef.current = null;
    // }

    // if (ydocRef.current) {
    //   ydocRef.current.destroy();
    //   ydocRef.current = null;
    // }

    ydocRef.current = new Y.Doc();
    attachYjsBinding();

    socket.emit("request-yjs-state", {
      roomId,
      path: activeFile,
    });
  }, [roomId, activeFile]);

  useEffect(() => {
    const ydoc = ydocRef.current;

    if (!ydoc || !activeFile) {
      return;
    }

    const handler = (update) => {
      socket.emit("yjs-sync", {
        roomId,
        path: activeFile,
        update: Array.from(update),
      });
    };

    ydoc.on("update", handler);

    return () => {
      ydoc.off("update", handler);
    };

  }, [roomId, activeFile]);

  useEffect(() => {
    const awareness = awarenessRef.current;

    if (!awareness) return;

    const handler = ({ added, updated, removed }, origin) => {
      if (origin === "remote") {
        return;
      }

      const changedClients = added.concat(updated, removed);

      socket.emit("awareness-update", {
        roomId,
        update: Array.from(
          encodeAwarenessUpdate(
            awareness,
            changedClients
          )
        ),
      });
    };

    awareness.on("update", handler);

    return () => {
      try {
        awareness.off("update", handler);
      }
      catch (err) {
        console.error("Error removing awareness update listener:", err);
      }
    };

  }, []);

  useEffect(() => {
    if (!showMembers) return;

    const handleClickOutside = (event) => {
      if (presenceRef.current && !presenceRef.current.contains(event.target)) {
        setShowMembers(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMembers]);

  useEffect(() => {
    if (chatOpen) {
      setHasUnreadChat(false);
      return;
    }

    const handleIncoming = () => setHasUnreadChat(true);
    socket.on("receive-chat-message", handleIncoming);
    return () => socket.off("receive-chat-message", handleIncoming);
  }, [chatOpen]);

  const createFile = () => {
    const path = prompt("Enter file path:");
    if (!path) return;

    socket.emit("create-file", {
      roomId,
      path
    });
  };

  const renameFile = (oldPath) => {
    const newPath = prompt("New file path:", oldPath);
    if (!newPath) return;

    socket.emit("rename-file", { roomId, oldPath, newPath, });
  };

  const deleteFile = (path) => {
    socket.emit("delete-file", { roomId, path, });
  };

  const runCurrentFile = () => {
    if (!activeFile) {
      return;
    }
    socket.emit("terminal-command",
      {
        roomId,
        command: `node ${activeFile}`,
      });
  };

  const fileCount = Object.keys(files).length;

  return (
    <div className="ide-shell">
      {/* ---------------------------------------------------------- header --- */}
      <header className="ide-header">
        <div className="ide-header__title">
          <span className="ide-header__eyebrow">Workspace</span>
          <span className="ide-header__name">{workspaceName || roomId}</span>
        </div>

        <div className="ide-header__actions">
          {role && (
            <span className={`role-badge ${role === "OWNER" ? "role-badge--owner" : ""}`}>
              {role}
            </span>
          )}

          <div className="presence" ref={presenceRef}>
            <button
              className="presence__trigger"
              onClick={() => setShowMembers((v) => !v)}
              aria-expanded={showMembers}
            >
              <span className="presence__dot" />
              <span className="presence__label">{onlineUsers} online</span>
              <ChevronDownIcon style={{ opacity: 0.7 }} />
            </button>

            {showMembers && (
              <div className="presence__popover">
                {onlineMembers.length === 0 && (
                  <div className="presence__row" style={{ color: "var(--text-faint)" }}>
                    Nobody else is here yet
                  </div>
                )}
                {onlineMembers.map((user) => (
                  <div className="presence__row" key={user.userId}>
                    <span>{user.username}</span>
                    {user.role === "OWNER" && (
                      <span className="presence__row-owner">OWNER</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {role !== "VIEWER" && (
            <button
              className="btn"
              onClick={() => {
                const link = `${window.location.origin}/invite/${roomId}`;
                navigator.clipboard.writeText(link);
                alert("Invite link copied!");
              }}
            >
              <LinkIcon />
              <span className="btn__label">Invite</span>
            </button>
          )}

          {role === "OWNER" && (
            <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="Workspace settings">
              <SettingsIcon />
            </button>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------ body --- */}
      <div className="ide-body">
        {/* ----------------------------------------------------- explorer --- */}
        <aside className={`panel panel--left ${explorerOpen ? "" : "is-collapsed"}`}>
          <div className="panel__head">
            <span className="panel__head-label">Explorer</span>
            <button className="icon-btn" onClick={() => setExplorerOpen(false)} aria-label="Collapse explorer">
              <ChevronLeftIcon />
            </button>
          </div>

          <div className="panel__body">
            {role !== "VIEWER" && (
              <button className="btn btn--primary explorer__new" onClick={createFile}>
                <PlusIcon />
                <span className="btn__label">New file</span>
              </button>
            )}

            <div className="explorer__tree">
              {fileCount === 0 ? (
                <p className="explorer__empty">No files yet.{role !== "VIEWER" && " Create one to get started."}</p>
              ) : (
                <FileTree
                  files={files}
                  activePath={activeFile}
                  onSelect={setActiveFile}
                  onRename={role !== "VIEWER" ? renameFile : undefined}
                  onDelete={role !== "VIEWER" ? deleteFile : undefined}
                />
              )}
            </div>
          </div>

          <button className="panel__rail" onClick={() => setExplorerOpen(true)} aria-label="Expand explorer">
            <FilesIcon />
            <span className="panel__rail-label">Explorer</span>
          </button>
        </aside>

        {/* --------------------------------------------- editor + terminal --- */}
        <main className="ide-main">
          <div className="toolbar">
            <div className="breadcrumb">
              {activeFile ? (
                <>
                  <span className="breadcrumb__file">{activeFile}</span>
                  <span className="breadcrumb__lang">{files[activeFile]?.language || "plaintext"}</span>
                </>
              ) : (
                <span style={{ color: "var(--text-faint)" }}>No file open</span>
              )}
            </div>

            {role !== "VIEWER" && (
              <button className="btn btn--run" onClick={runCurrentFile} disabled={!activeFile}>
                <PlayIcon />
                <span className="btn__label">Run</span>
              </button>
            )}
          </div>

          <div className="editor-pane">
            {activeFile ? (
              <Editor
                key={activeFile}
                height="100%"
                language={files[activeFile]?.language || "plaintext"}
                defaultValue=""
                theme="vs-dark"
                options={{
                  readOnly: role === "VIEWER",
                }}
                onMount={handleEditorDidMount}
              // onChange={handleCodeChange}
              />
            ) : (
              <div className="editor-pane--empty">
                Select or create a file to start editing.
              </div>
            )}
          </div>

          <div className={`terminal-drawer ${terminalOpen ? "is-open" : ""}`}>
            <button
              className="terminal-drawer__bar"
              onClick={() => setTerminalOpen((v) => !v)}
              aria-expanded={terminalOpen}
            >
              <span className="terminal-drawer__bar-left">
                <TerminalIcon />
                Terminal
              </span>
              {terminalOpen ? <ChevronDownIcon /> : <ChevronUpIcon />}
            </button>

            <div className="terminal-drawer__body">
              <SharedTerminal roomId={roomId} />
            </div>
          </div>
        </main>

        {/* ----------------------------------------------------------- chat --- */}
        <aside className={`panel panel--right ${chatOpen ? "" : "is-collapsed"}`}>
          <div className="panel__head">
            <span className="panel__head-label">Chat</span>
            <button className="icon-btn" onClick={() => setChatOpen(false)} aria-label="Collapse chat">
              <ChevronRightIcon />
            </button>
          </div>

          <div className="panel__body">
            <ChatBox roomId={roomId} />
          </div>

          <button className="panel__rail" onClick={() => setChatOpen(true)} aria-label="Expand chat">
            <span className="panel__rail-badge">
              <ChatIcon />
              {hasUnreadChat && <span className="panel__rail-dot" />}
            </span>
            <span className="panel__rail-label">Chat</span>
          </button>
        </aside>
      </div>

      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <WorkspaceSettings
              members={members}
              workspaceName={workspaceName}
              roomId={roomId}
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorPage;