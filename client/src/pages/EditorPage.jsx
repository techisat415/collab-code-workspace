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

    socket.on("receive-file-edit", ({ fileName, content }) => {
      setFiles(prev => ({
        ...prev,
        [fileName]: {
          ...prev[fileName],
          content,
        }
      }))
    });

    socket.on("room-users", (count) => {
      setOnlineUsers(count);
    });

    return () => {
      socket.off("sync-code");
      socket.off("receive-file-edit");
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
      fileName: activeFile,
      content: newCode,
    });
  };

  return (
    <div style={{ padding: "20px" }}>

      <h2>Workspace: {roomId}</h2>
      <p>Users online: {onlineUsers}</p>

      <Editor
        height="80vh"
        language={files[activeFile]?.language || "javascript"}
        value={files[activeFile]?.content || ""}
        theme="vs-dark"
        
        onChange={handleCodeChange}
      />

    </div>
  );
}

export default EditorPage;