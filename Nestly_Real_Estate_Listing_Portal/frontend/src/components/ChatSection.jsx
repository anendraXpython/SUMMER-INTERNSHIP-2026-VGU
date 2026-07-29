import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
// import { getMessageHistory, API_BASE } from "../api/api";
import { getMessageHistory, clearChatHistory, API_BASE } from "../api/api";

const socket = io(API_BASE.replace("/api", ""));

function ChatSection({ user, selectedListing }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("Connecting to chat server...");
  const messagesEndRef = useRef(null);

  const roomId = selectedListing ? selectedListing._id : "general";

  useEffect(() => {
    getMessageHistory(selectedListing ? selectedListing._id : null).then((res) =>
      setMessages(res.data)
    );
    socket.emit("join room", roomId);
  }, [roomId, selectedListing]);

  useEffect(() => {
    function handleConnect() {
      setConnectionStatus("Connected to chat server.");
      socket.emit("join room", roomId);
    }
    function handleDisconnect() {
      setConnectionStatus("Disconnected from chat server.");
    }
    function handleIncoming(data) {
      setMessages((prev) => [...prev, data]);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat message", handleIncoming);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat message", handleIncoming);
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (messageText.trim() === "") return;

    socket.emit("chat message", {
      name: user.username,
      role: user.role,
      text: messageText,
      listingId: selectedListing ? selectedListing._id : null,
    });

    setMessageText("");
  };

  // const handleClearChat = async () => {
  //   const confirmed = window.confirm(
  //     "Clear all messages in this chat? This cannot be undone."
  //   );
  //   if (!confirmed) return;

  //   await clearChatHistory(selectedListing ? selectedListing._id : null);
  //   setMessages([]);
  // };

    const handleClearChat = () => {
      const confirmed = window.confirm(
        "Clear this chat from your screen? (Messages stay saved for the other person.)"
      );
      if (!confirmed) return;

      setMessages([]); 
    };


  return (
    <section id="chat">
      <h2>Live Chat with an Agent</h2>
      <p>
        {selectedListing
          ? `Chatting about: ${selectedListing.title}`
          : "General chat — open a listing's details to start a thread about that specific property."}
      </p>

      <button className="btn-secondary" onClick={handleClearChat} style={{ marginBottom: "10px" }}>
        Clear Chat
      </button>

      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg._id || Math.random()}
              className={msg.name === user.username ? "chat-bubble own" : "chat-bubble other"}
            >
              <strong>{msg.name}</strong>
              {msg.role === "agent" && <span className="agent-tag">agent</span>}: {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-row">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="btn-primary" onClick={handleSend}>
            Send
          </button>
        </div>

        <p className="chat-status">{connectionStatus}</p>
      </div>
    </section>
  );
}

export default ChatSection;
