import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket.js";

function EditorPage() {

  const { roomId } = useParams();
  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {

    socket.emit("join-room", roomId);

    socket.on("files-updated", (incomingFiles) => {
      if(!incomingFiles){
        console.log("No files received from server.");
      };
      console.log("Files received from server:", incomingFiles);
      setFiles(incomingFiles);

      const fileNames = Object.keys(incomingFiles);

      console.log("File names in room:", fileNames);
      if(fileNames.length > 0){
        setActiveFile(fileNames[0]);
        console.log(`Active file set to ${fileNames[0]}`);
      }
    });

    socket.on("file-created", ({ name, language }) => {
      setFiles(prev => ({
      ...prev,
      [name]: {
          content: "",
          language,
        },
      })
      );

      setActiveFile(name);
    });

    socket.on("receive-file-edit", ({ name, content }) => {
      setFiles(prev => ({
        ...prev,
        [name]: {
          ...prev[name],
          content,
        }
      }))
    });

    socket.on("file-renamed", ({ oldName, newName }) => {
      setFiles(prev => {
        const copy = { ...prev };
        copy[newName] = copy[oldName];
        delete copy[oldName];
        return copy;
      });

      setActiveFile(prev =>
        prev === oldName ? newName : prev
      );
    });

    socket.on("file-deleted", ({ name }) => {
      setFiles(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });

      setActiveFile(prev =>
        prev === name ? (Object.keys(files).length > 1 ? Object.keys(files)[0] : null) : prev
      );
    });

    socket.on("room-users", (count) => {
      setOnlineUsers(count);
    });

    return () => {
      socket.off("files-updated");
      socket.off("receive-file-edit");
      socket.off("file-created");
      socket.off("file-renamed");
      socket.off("file-deleted");
      socket.off("room-users");
    };

  }, [roomId]);

  const handleCodeChange = (value) => {

    const newCode = value || "";

    setFiles(prev => ({
      ...prev,
      [activeFile]: {
        ...prev[activeFile],
        content: newCode,
      }
    }));

    socket.emit("edit-file", {
      roomId,
      name: activeFile,
      content: newCode,
    });
  };

  const createFile = () =>{
    const name = prompt("Enter the name of the file!");
    if(!name) return;

    socket.emit("create-file", {
      roomId,
      name
    });
  };

  const renameFile = (oldName) => {
    const newName = prompt("New file name:", oldName);
    if (!newName) return;
    
    socket.emit("rename-file", { roomId, oldName, newName, });
  };

  const deleteFile = (name) => {
    socket.emit("delete-file", { roomId, name, });
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

      {
        Object.keys(files).map((name) => (
        <div
            key={name}
            onClick={() => setActiveFile(name)}
            style={{
                  padding: "8px",
                  cursor: "pointer",
                  background: activeFile === name? "#333": "#000000",
                  color: "white",
            }}
        >
          {name}
          <button onClick={(e => {
            e.stopPropagation();
            renameFile(name);
          })}> ✏️</button>
          <button onClick={(e) => {
            e.stopPropagation();
            deleteFile(name);
          }}> ❌</button>
        
        </div>
        ))
      }
      </div>
      <div style={{ flex: 1, padding: "20px" }}>

      <h2>Workspace: {roomId}</h2>
      <p>Users online: {onlineUsers}</p>

      <Editor
        height="80vh"
        language={files[activeFile]?.language || "plaintext"}
        value={files[activeFile]?.content || ""}
        theme="vs-dark"
        
        onChange={handleCodeChange}
      />

      </div>
    </div>
  );
}

export default EditorPage;