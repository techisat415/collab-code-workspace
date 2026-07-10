import { useState, useEffect, useRef } from "react";
import socket from "../socket/socket";
import { SendIcon } from "./icons.jsx";
import "./ChatBox.css";

export default function ChatBox({ roomId }) {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    const handleMessage = (message) => {
        setMessages(prev => [...prev, message,]);
    };
    socket.on("receive-chat-message", handleMessage);
    
    return () => {
        socket.off("receive-chat-message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

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
    <div className="chatbox">
      <div className="chatbox__list" ref={listRef}>
        {messages.length === 0 && (
          <div className="chatbox__empty">No messages yet — say hi to whoever's online.</div>
        )}
        {messages.map((msg, index) => (
          <div className="chatbox__msg" key={index}>
            <div className="chatbox__msg-author">{msg.username}</div>
            <div className="chatbox__msg-body">{msg.message}</div>
          </div>
        ))}
      </div>

      <div className="chatbox__composer">
        <input
          className="chatbox__input"
          placeholder="Message the room…"
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button
          className="chatbox__send"
          onClick={sendMessage}
          disabled={!message.trim()}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
