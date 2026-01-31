import { useState, useEffect } from "react";
import { FaChartBar, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaTaxi, FaMapMarkedAlt, FaUsers } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../config/api";
import "../../styles/AdminDashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/bookings?limit=5")
      ]);
      
      setStats(statsRes.data.data);
      setRecentBookings(bookingsRes.data.data.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-badge confirmed";
      case "cancelled":
        return "status-badge cancelled";
      case "pending":
        return "status-badge pending";
      default:
        return "status-badge";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="loader">Loading Dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🚀 Admin Dashboard</h1>
        <p>Welcome! Manage your taxi booking system efficiently</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Total Bookings</h3>
              <div className="stat-value">{stats?.bookings.total || 0}</div>
            </div>
            <div className="stat-icon"><FaChartBar /></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Confirmed</h3>
              <div className="stat-value">{stats?.bookings.confirmed || 0}</div>
            </div>
            <div className="stat-icon"><FaCheckCircle /></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Cancelled</h3>
              <div className="stat-value">{stats?.bookings.cancelled || 0}</div>
            </div>
            <div className="stat-icon"><FaTimesCircle /></div>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <div className="stat-value">₹{stats?.revenue || 0}</div>
            </div>
            <div className="stat-icon revenue"><FaMoneyBillWave /></div>
          </div>
        </div>

        <div className="stat-card buses">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Total Taxis</h3>
              <div className="stat-value">{stats?.taxis || 0}</div>
            </div>
            <div className="stat-icon buses"><FaTaxi /></div>
          </div>
        </div>

        <div className="stat-card routes">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Active Routes</h3>
              <div className="stat-value">{stats?.routes || 0}</div>
            </div>
            <div className="stat-icon routes"><FaMapMarkedAlt /></div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-content">
              <h3>Registered Users</h3>
              <div className="stat-value">{stats?.users || 0}</div>
            </div>
            <div className="stat-icon"><FaUsers /></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2>⚡ Quick Actions</h2>
        <div className="quick-actions">
          <Link to="/admin/taxis" className="quick-action-btn">
            <span>🚖</span>
            <p>Manage Taxis</p>
          </Link>
          <Link to="/admin/routes" className="quick-action-btn">
            <span>🗺️</span>
            <p>Manage Routes</p>
          </Link>
          <Link to="/admin/bookings" className="quick-action-btn">
            <span>📝</span>
            <p>View All Bookings</p>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="dashboard-section">
        <h2>📋 Recent Bookings</h2>
        {recentBookings.length > 0 ? (
          <div className="recent-bookings">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Passenger</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Passengers</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <span className="booking-id">
                        #{booking._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="passenger-info">
                        <strong>{booking.user?.name || "N/A"}</strong>
                        <small>{booking.user?.email || ""}</small>
                      </div>
                    </td>
                    <td>
                      <div className="route-info">
                        <span>{booking.route?.startLocation || "N/A"}</span>
                        <span className="route-arrow">→</span>
                        <span>{booking.route?.endLocation || "N/A"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-time">
                        <div>{formatDate(booking.rideDate)}</div>
                        <small>{formatTime(booking.rideDate)}</small>
                      </div>
                    </td>
                    <td>
                      <span className="passenger-count">
                        {booking.passengerCount || 1}
                      </span>
                    </td>
                    <td>
                      <strong className="amount">₹{booking.totalAmount}</strong>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(booking.bookingStatus)}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="view-all-container">
              <Link to="/admin/bookings" className="btn btn-primary">
                View All Bookings →
              </Link>
            </div>
          </div>
        ) : (
          <p className="no-data">No bookings yet</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
