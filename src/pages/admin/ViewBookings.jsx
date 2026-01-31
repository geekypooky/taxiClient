import { useState, useEffect } from "react";
import api from "../../config/api";
import "../../styles/AdminPages.css";

const ViewBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/admin/bookings");
      setBookings(response.data.data);
    } catch (err) {
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="admin-page">
      <h2>All Bookings</h2>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>User</th>
              <th>Route</th>
              <th>Journey Date</th>
              <th>Passengers</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{booking.bookingId || booking._id.substring(0, 8)}</td>
                <td>{booking.user?.name}</td>
                <td>
                  {booking.route?.source} → {booking.route?.destination}
                </td>
                <td>{new Date(booking.rideDate).toLocaleDateString()}</td>
                <td>{booking.passengerCount}</td>
                <td>₹{booking.totalAmount}</td>
                <td>
                  <span className={`badge ${booking.bookingStatus}`}>
                    {booking.bookingStatus}
                  </span>
                </td>
                <td>
                  <span className={`badge ${booking.paymentStatus}`}>
                    {booking.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewBookings;
