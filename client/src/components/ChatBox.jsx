import { useState, useEffect } from "react";
import socket from "../socket/socket";

export default function ChatBox({ roomId }) {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleMessage = (message) => {
        setMessages(prev => [...prev, message,]);
    };
    socket.on("receive-chat-message", handleMessage);
    
    return () => {
        socket.off("receive-chat-message", handleMessage);
    };
  }, []);

  const sendMessage = () => {

    if (!message.trim()) return;
    socket.emit("send-chat-message",
      {
        roomId,
        message,
      }
    );

    setMessage("");
  };

  return (
    <div>
        <div style={{
            height: "250px",
            overflowY: "auto",
            border: "1px solid gray",
            marginBottom: "10px",
        }}
        >{messages.map((msg, index) => (<div key={index}>
          <strong>{msg.username}</strong>{" : "}{msg.message}
        </div>
      ))}
    </div>
      <input
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}