import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import "../styles/MyBookings.css";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/bookings/user/${user.id}`);
      setBookings(response.data.data);
    } catch (err) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await api.put(`/bookings/${bookingId}/cancel`, {
        reason: "User cancelled",
      });
      alert("Booking cancelled successfully");
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to cancel booking");
    }
  };

  if (loading) return <div className="loader">Loading bookings...</div>;

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>

      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You haven't made any bookings yet.</p>
          <a href="/search" className="btn btn-primary">
            Search Buses
          </a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <h3>
                  {booking.route.source} → {booking.route.destination}
                </h3>
                <span className={`status ${booking.bookingStatus}`}>
                  {booking.bookingStatus}
                </span>
              </div>

              <div className="booking-details">
                <div className="detail-row">
                  <span className="label">Booking ID:</span>
                  <span className="value">{booking.bookingId || booking._id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Taxi:</span>
                  <span className="value">
                    {booking.taxi?.name} ({booking.taxi?.model})
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Journey Date:</span>
                  <span className="value">
                    {new Date(booking.rideDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Passengers:</span>
                  <span className="value">
                    {booking.passengerCount}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Total Amount:</span>
                  <span className="value">₹{booking.totalAmount}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Payment Status:</span>
                  <span className={`value payment-${booking.paymentStatus}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="booking-actions">
                {booking.bookingStatus === "confirmed" &&
                  new Date(booking.rideDate) > new Date() && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      Cancel Booking
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
