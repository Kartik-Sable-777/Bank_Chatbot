import { useState } from "react";
import { FiX } from "react-icons/fi";
import Chat from "./Chat";
import robot from "../../assets/robot.png";

function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <img
          src={robot}
          alt="Chatbot"
          className="robot-icon"
          onClick={() => setOpen(true)}
        />
      )}

      {open && (
        <>
          <div
            className="chat-overlay"
            onClick={() => setOpen(false)}
          ></div>

          <div className="chat-panel glass">
            <FiX
              className="chat-close"
              size={22}
              onClick={() => setOpen(false)}
            />
            <Chat />
          </div>
        </>
      )}
    </>
  );
}

export default ChatWidget;