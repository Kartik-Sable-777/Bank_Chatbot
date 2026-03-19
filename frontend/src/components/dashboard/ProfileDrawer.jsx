import { FiX } from "react-icons/fi";

function ProfileDrawer({ setDrawerOpen }) {
  return (
    <div className="profile-drawer glass">
      <FiX
        size={24}
        className="drawer-close"
        onClick={() => setDrawerOpen(false)}
      />

      <div className="profile-links">
        <a href="#">Account Overview</a>
        <a href="#">Security Settings</a>
        <a href="#">Transactions</a>
        <a href="#">Support</a>
        <a href="frontend/src/components/auth/LoginForm.jsx" className="logout-link ">
          Logout
        </a>
      </div>
    </div>
  );
}

export default ProfileDrawer;