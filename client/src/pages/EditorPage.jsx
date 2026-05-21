import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import socket from "../socket/socket.js";

function EditorPage() {

  const { roomId } = useParams();
  const [code, setCode] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {

    socket.emit("join-room", roomId);

    socket.on("sync-code", (incomingCode) => {
      setCode(incomingCode);
    });

    socket.on("receive-file-edit", ({ fileName, content }) => {
      setCode(content);
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
    setCode(newCode);

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
        language={currentLanguage}
        theme="vs-dark"
        value={code}
        onChange={handleCodeChange}
      />

    </div>
  );
}

export default EditorPage;