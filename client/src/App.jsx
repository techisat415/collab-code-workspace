import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState("");
  //const [variableName, setVariableName] = useState(initialValue);

  useEffect(() => {
    socket.on("receive-message", (data) => {
      setReceivedMessage(data);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const joinRoom = () => {
    if (room) {
      socket.emit("join-room", room);
    }
  };

  const sendMessage = () => {
    socket.emit("send-message", { message, room });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Collaborative Code Editor</h1>

      <input
        type="text"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Enter room ID"
      />

      <button onClick={joinRoom}>
        Join Room
      </button>

      <br/> <br/>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>

      <h2>Received:</h2>
      <p>{receivedMessage}</p>
    </div>
  );
}

export default App;