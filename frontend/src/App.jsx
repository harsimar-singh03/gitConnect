import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "./utils/UserContext";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";

function App() {
  const { setUser } = useUser();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/profile/view");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (err) {
        console.log("No active user session found");
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, [setUser]);

  if (checkingSession) {
    return (
      <div style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
        color: "var(--text-secondary)",
        fontSize: "1.25rem"
      }}>
        <div>Initializing gitConnect...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
