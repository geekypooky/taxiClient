import { Link } from "react-router-dom";
import { FaTaxi, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaTaxi className="icon-brand" style={{ color: 'currentColor', fontSize: '1.5rem' }} /> Travel Booking
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <>
                  <Link to="/admin/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                  <Link to="/admin/taxis" className="nav-link">
                    Taxis
                  </Link>
                  <Link to="/admin/routes" className="nav-link">
                    Routes
                  </Link>
                  <Link to="/admin/bookings" className="nav-link">
                    Bookings
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" className="nav-link">
                    Home
                  </Link>
                  <Link to="/my-bookings" className="nav-link">
                    My Bookings
                  </Link>
                </>
              )}

              <div className="user-menu">
                <Link to="/profile" className="user-name-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaUser style={{ color: 'currentColor' }} /> {user?.name}
                </Link>
                <button onClick={logout} className="btn btn-outline">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">
                Home
              </Link>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
