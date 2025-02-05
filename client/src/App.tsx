import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3000");

function App() {
  const [groupId, setGroupId] = useState("general");
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ user: string; text: string }>>([]);

  useEffect(() => {
    socket.emit("joinGroup", groupId, userName);

    socket.on("groupData", (data) => {
      setMessages(data.messages);
    });

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("groupData");
      socket.off("receiveMessage");
    };
  }, [groupId, userName]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("sendMessage", groupId, userName, message);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Group: {groupId}</h2>
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.user}: </strong>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;