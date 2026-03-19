import { useState, useRef, useEffect } from "react";
import axios from "axios";

const RASA_URL = "https://bank-chatbot-ev37.onrender.com";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  const [senderId] = useState(() => {
    let existing = localStorage.getItem("rasa_sender_id");
    if (!existing) {
      existing = "user_" + Math.random().toString(36).substring(2);
      localStorage.setItem("rasa_sender_id", existing);
    }
    return existing;
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) {
      alert("Please type something");
      return;
    }

    const userText = input;
    const userTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 🟢 Add user message
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText, time: userTime },
    ]);

    setInput("");
    setTyping(true);

    try {
      const response = await axios.post(RASA_URL, {
        sender: senderId,
        message: userText,
      });

      setTimeout(() => {
        // 🔴 HANDLE EMPTY OR INVALID RESPONSE
        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "No response from server.",
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
          setTyping(false);
          return;
        }

        let botReplied = false;

        response.data.forEach((reply) => {
          // 🟢 SAFE TEXT CHECK
          if (reply && typeof reply === "object" && reply.text) {
            botReplied = true;

            const botTime = new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            setMessages((prev) => [
              ...prev,
              { sender: "bot", text: reply.text, time: botTime },
            ]);
          }
        });

        // 🔴 FALLBACK IF NO TEXT FOUND
        if (!botReplied) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "Something went wrong. Please try again.",
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }

        setTyping(false);
      }, 100); // keep your typing delay

    } catch (error) {
      console.error("Rasa error:", error);

      // 🔴 SHOW ERROR MESSAGE IN CHAT
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Server error. Please try again.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      setTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            <div>{msg.text}</div>
            <span className="timestamp">{msg.time}</span>
          </div>
        ))}

        {/* 🟢 Typing animation */}
        {typing && (
          <div className="typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        <div ref={chatEndRef}></div>
      </div>

      <div className="input-container">
        <input
          value={input}
          placeholder="Ask Helvetia AI..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;