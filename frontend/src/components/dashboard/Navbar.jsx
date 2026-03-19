import { FaUserCircle } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";

function Navbar({ setDrawerOpen, theme, setTheme }) {
  return (
    <div className="navbar glass">
      <div className="brand">
        <img
          className="flag"
          src="https://flagcdn.com/w40/ch.png"
          alt="Swiss Flag"
        />
        <div>
          <h1 className="brand-title">Switz Bank</h1>
          <p className="brand-sub">Helvetia AI Banking Assistant</p>
        </div>
      </div>

      <div className="nav-icons">
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>

        <FaUserCircle
          className="profile-icon"
          size={34}
          onClick={() => setDrawerOpen(true)}
        />
      </div>
    </div>
  );
}

export default Navbar;