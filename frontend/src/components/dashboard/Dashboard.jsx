import { useState } from "react";
import Navbar from "./Navbar";
import Carousel from "./Carousel";
import ProfileDrawer from "./ProfileDrawer";
import ChatWidget from "../chatbot/ChatWidget";

function Dashboard({ theme, setTheme }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        setDrawerOpen={setDrawerOpen}
      />

      <Carousel />

      {drawerOpen && (
        <ProfileDrawer setDrawerOpen={setDrawerOpen} />
      )}

      <ChatWidget />
    </>
  );
}

export default Dashboard;