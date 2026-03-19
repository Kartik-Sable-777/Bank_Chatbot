import { useState } from "react";
import axios from "axios";

function AdminLogin({ setIsAdmin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("https://bank-chatbot-ev37.onrender.com/admin/login", {
        username,
        password,
      });

      if (res.data.success) {
        setIsAdmin(true);
      }
    } catch (err) {
      alert("Invalid admin credentials");
    }
  };

  return (
    <div className="login-container glass">
      <h2>Admin Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default AdminLogin;