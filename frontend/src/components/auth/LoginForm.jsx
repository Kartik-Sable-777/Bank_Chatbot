import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

function LoginForm({ setLoggedIn }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const handleLogin = () => {
    if (identifier && password) {
      setLoggedIn(true);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Email or Mobile"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />

      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%" }}
        />
        <span
          onClick={() => setShow(!show)}
          style={{
            position: "absolute",
            right: "15px",
            top: "14px",
            cursor: "pointer",
          }}
        >
          {show ? <FiEyeOff /> : <FiEye />}
        </span>
      </div>

      <button onClick={handleLogin}>Login</button>
    </>
  );
}

export default LoginForm;