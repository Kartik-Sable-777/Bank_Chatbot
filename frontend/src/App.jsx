import { useState } from "react";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import AdminPanel from "./components/admin/AdminPanel";
import AdminLogin from "./components/admin/AdminLogin";
import "./index.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);

  return (
    <div className={`app ${theme}`}>

      {/* ADMIN MODE */}
      {isAdmin ? (
        adminAuth ? (
          <AdminPanel setIsAdmin={setIsAdmin} setAdminAuth={setAdminAuth} />
        ) : (
          <AdminLogin setIsAdmin={setAdminAuth} />
        )
      ) : !loggedIn ? (
        <AuthPage setLoggedIn={setLoggedIn} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      ) : (
        <Dashboard theme={theme} setTheme={setTheme} />
      )}

    </div>
  );
}

export default App;