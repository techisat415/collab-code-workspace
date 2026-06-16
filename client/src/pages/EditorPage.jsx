import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import socket from "../socket/socket.js";
import FileTree from "../components/FileTree.jsx";

function EditorPage() {

  const { roomId } = useParams();
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [remoteCursors, setRemoteCursors] = useState({});

  const editorRef = useRef(null);
  const ydocRef = useRef(null);
  const bindingRef = useRef(null);
  const remoteCursorDecorationsRef = useRef([]);
  const activeFileRef = useRef(null);

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

    if (bindingRef.current) {
      bindingRef.current.destroy();
    }

    bindingRef.current = new MonacoBinding(
      ydoc.getText("content"),
      model,
      new Set([editor])
    );
  };

  useEffect(() => {
    ydocRef.current = new Y.Doc();

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    attachYjsBinding();

    editor.onDidChangeCursorPosition((e) => {
      const path = activeFileRef.current;

      if (!path) {
        return;
      }

      socket.emit("cursor-move", {
        roomId,
        path,
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });
  }

  useEffect(() => {
    setRemoteCursors({});

    socket.emit("join-room", roomId);

    const handleFilesUpdated = (incomingFiles) => {
      if(!incomingFiles){
        console.log("No files received from server.");
      };
      console.log("Files received from server:", incomingFiles);
      setFiles(incomingFiles);

      const filePaths = Object.keys(incomingFiles);

      console.log("File paths in room:", filePaths);
      if(filePaths.length > 0){
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

    const handleRoomUsers = (count) => {
      setOnlineUsers(count);
    };

    const handleUserCursor = (data) => {
      setRemoteCursors((previous) => ({
        ...previous,
        [data.socketId]: data,
      }));
    };

    const handleYjsState = ({ path, update }) => {
      if (path !== activeFileRef.current || !ydocRef.current) {
        return;
      }

      Y.applyUpdate(
        ydocRef.current,
        new Uint8Array(update)
      );

      setFiles(prev => ({
        ...prev,
        [path]: {
          ...prev[path],
        },
      }));
    };

    const handleYjsUpdate = ({ path, update }) => {
      if (path !== activeFileRef.current || !ydocRef.current) {
        return;
      }

      Y.applyUpdate(
        ydocRef.current,
        new Uint8Array(update)
      );

      setFiles(prev => ({
        ...prev,
        [path]: {
          ...prev[path],
        },
      }));
    };

    socket.on("files-updated", handleFilesUpdated);
    socket.on("file-created", handleFileCreated);
    // socket.on("receive-file-edit", handleReceiveFileEdit);
    socket.on("file-renamed", handleFileRenamed);
    socket.on("file-deleted", handleFileDeleted);
    socket.on("room-users", handleRoomUsers);
    socket.on("user-cursor", handleUserCursor);
    socket.on("yjs-state", handleYjsState);
    socket.on("yjs-update", handleYjsUpdate);

    return () => {
      socket.off("files-updated", handleFilesUpdated);
      socket.off("file-created", handleFileCreated);
      // socket.off("receive-file-edit", handleReceiveFileEdit);
      socket.off("file-renamed", handleFileRenamed);
      socket.off("file-deleted", handleFileDeleted);
      socket.off("room-users", handleRoomUsers);
      socket.off("user-cursor", handleUserCursor);
      socket.off("yjs-state", handleYjsState);
      socket.off("yjs-update", handleYjsUpdate);
    };

  }, [roomId]);

  useEffect(() => {
    if (!activeFile) {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }

      if (ydocRef.current) {
        ydocRef.current.destroy();
        ydocRef.current = null;
      }

      return;
    }

    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    if (ydocRef.current) {
      ydocRef.current.destroy();
      ydocRef.current = null;
    }

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
    const editor = editorRef.current;
    const model = editor?.getModel();

    if (!editor || !model) {
      return;
    }

    console.log("REMOTE CURSORS:", remoteCursors);
    console.log("ACTIVE FILE:", activeFile);

    const decorations = Object.values(remoteCursors)
      .filter((cursor) => cursor.path === activeFile)
      .map((cursor) => {
        const lineNumber = Math.max(1, Math.min(cursor.line, model.getLineCount()));
        const lineMaxColumn = model.getLineMaxColumn(lineNumber);
        const columnNumber = Math.max(1, Math.min(cursor.column, lineMaxColumn));

        return {
          range: {
            startLineNumber: lineNumber,
            startColumn: 1,
            endLineNumber: lineNumber,
            endColumn: lineMaxColumn,
          },
          options: {
            isWholeLine: true,
            className: "remote-cursor",
          },
        };
      });

    console.log("DECORATIONS:", decorations);

    remoteCursorDecorationsRef.current = editor.deltaDecorations(
      remoteCursorDecorationsRef.current,
      decorations
    );
  }, [remoteCursors, activeFile]);

  const createFile = () =>{
    const path = prompt("Enter file path:");
    if(!path) return;

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

  return (
    <div style = {{
      display: "flex",
      height: "100vh",
    }}>
      <div style={{
              width: "250px",
              borderRight: "1px solid #333",
              padding: "10px",
      }}>
        <button onClick={createFile}> + New File</button>

        <hr />
        <FileTree
          files={files}
          activePath={activeFile}
          onSelect={setActiveFile}
          onRename={renameFile}
          onDelete={deleteFile}
        />
      </div>
      <div style={{ flex: 1, padding: "20px" }}>

      <h2>Workspace: {roomId}</h2>
      <p>Users online: {onlineUsers}</p>

      <Editor
        height="80vh"
        language={files[activeFile]?.language || "plaintext"}
        defaultValue=""
        theme="vs-dark"
        
        onMount={handleEditorDidMount}
        // onChange={handleCodeChange}
      />

      </div>
    </div>
  );
}

export default EditorPage;