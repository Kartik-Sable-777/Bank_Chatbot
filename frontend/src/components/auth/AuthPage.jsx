import { useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

function AuthPage({ setLoggedIn, isAdmin, setIsAdmin }) {
  const [mode, setMode] = useState("login");

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>

      {/* 🔴 TOGGLE BUTTON OUTSIDE CARD */}
      <button
        onClick={() => setIsAdmin(true)}
        style={toggleStyle}
      >
        Admin Mode
      </button>

      {/* ORIGINAL CARD */}
      <div className="login-container glass">
        <h2>Switz Bank</h2>
        <p>{mode === "login" ? "Secure Login" : "Create Your Account"}</p>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <button
            onClick={() => setMode("login")}
            style={{ flex: 1, opacity: mode === "login" ? 1 : 0.6 }}
          >
            Login
          </button>

          <button
            onClick={() => setMode("signup")}
            style={{ flex: 1, opacity: mode === "signup" ? 1 : 0.6 }}
          >
            Sign Up
          </button>
        </div>

        {mode === "login" ? (
          <LoginForm setLoggedIn={setLoggedIn} />
        ) : (
          <SignupForm />
        )}
      </div>

    </div>
  );
}

export default AuthPage;

const toggleStyle = {
  position: "absolute",
  top: "20px",
  right: "20px",
  padding: "8px 16px",
  borderRadius: "20px",
  border: "none",
  background: "#d90429",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
  zIndex: 1000,
};