import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [room, setRoomId] = useState("");
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
    socket.emit("join-room", room);
  };

  const handleCodeChange = (e) => {
    if(!room) return alert("Please enter a room ID to join");
    const newCode = e.target.value;

    setCode(newCode);

    socket.emit("code-edit", {
      room,
      code: newCode,
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Collaborative Code Editor</h1>

      <input
        type="text"
        placeholder="Room ID"
        value={room}
        onChange={(e) => setRoomId(e.target.value)}
      />

      <button onClick={joinRoom}>
        Join Room
      </button>

      <br /><br />

      <textarea
        value={code}
        onChange={handleCodeChange}
        rows={20}
        cols={80}
        placeholder="Start typing..."
      />
    </div>
  );
}

export default App;