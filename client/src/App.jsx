import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:5000");

function App() {
  const [roomId, setRoomId] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    socket.on("receive-code-edit", (incomingCode) => {
      setCode(incomingCode);
    });

    socket.on("sync-code", (existingCode)=>{
      setCode(existingCode);
    });

    return () => {
      socket.off("receive-code-edit");
      socket.off("sync-code");
    };
    
  }, []);

  const joinRoom = () => {
    socket.emit("join-room", roomId);
  };

  const handleCodeChange = (e) => {
    if(!roomId) return alert("Please enter a room ID to join");
    const newCode = e.target.value;

    setCode(newCode);

    socket.emit("code-edit", {
      roomId: roomId,
      code: newCode,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Collaborative Code Editor</h1>

      <input
        type="text"
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button onClick={joinRoom}>
        Join Room
      </button>

      <br /><br />

      <Editor
        height="400px"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) => {
          
          const newCode = value || "";
          setCode(newCode);
        
          socket.emit("code-edit", {
            roomId: roomId,
            code: newCode,
          });
        }
          
        }
        placeholder="Start typing..."
      />
    </div>
  );
}

export default App;