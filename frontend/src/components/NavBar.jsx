import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../utils/UserContext";

const NavBar = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });
      if (response.ok) {
        setUser(null);
        navigate("/");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="navbar">
      <Link to={user ? "/feed" : "/"} className="navbar-brand">
        💻 gitConnect
      </Link>

      {user && (
        <div className="navbar-menu">
          <Link to="/feed" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
            Feed
          </Link>
          <Link to="/profile" className="navbar-user">
            <div className="navbar-avatar">
              {user.firstName[0].toUpperCase()}
            </div>
            <span>{user.firstName}</span>
          </Link>
          <button className="btn-nav-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
