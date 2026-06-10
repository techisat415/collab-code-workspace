import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket.js";
import FileTree from "../components/FileTree.jsx";

function EditorPage() {

  const { roomId } = useParams();
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);

  const editorRef = useRef(null);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;

      editor.onDidChangeCursorPosition((e) => {
      socket.emit("cursor-move", { roomId, line: e.position.lineNumber, column: e.position.column,});
  });
}

  useEffect(() => {

    socket.emit("join-room", roomId);

    socket.on("files-updated", (incomingFiles) => {
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
    });

    socket.on("file-created", ({ path, name, language, content }) => {
      setFiles(prev => ({
      ...prev,
      [path]: {
          name,
          path,
          content: content || "",
          language,
        },
      })
      );

      setActiveFile(path);
    });

    socket.on("receive-file-edit", ({ path, content }) => {
      setFiles(prev => ({
        ...prev,
        [path]: {
          ...prev[path],
          content,
        }
      }))
    });

    socket.on("file-renamed", ({ oldPath, newPath }) => {
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
    });

    socket.on("file-deleted", ({ path }) => {
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
    });

    socket.on("room-users", (count) => {
      setOnlineUsers(count);
    });

    socket.on("user-cursor", (data) => {
        console.log(data);
    });

    return () => {
      socket.off("files-updated");
      socket.off("receive-file-edit");
      socket.off("file-created");
      socket.off("file-renamed");
      socket.off("file-deleted");
      socket.off("room-users");
      socket.off("user-cursor");
    };

  }, [roomId]);

  const handleCodeChange = (value) => {

    const newCode = value || "";

    if (!activeFile) {
      return;
    }

    setFiles(prev => ({
      ...prev,
      [activeFile]: {
        ...prev[activeFile],
        content: newCode,
      }
    }));

    socket.emit("edit-file", {
      roomId,
      path: activeFile,
      content: newCode,
    });
  };

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
        value={files[activeFile]?.content || ""}
        theme="vs-dark"
        
        onMount={handleEditorDidMount}
        onChange={handleCodeChange}
      />

      </div>
    </div>
  );
}

export default EditorPage;