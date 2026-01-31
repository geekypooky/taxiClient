import { useState, useEffect } from "react";
import { FaMobileAlt, FaCreditCard, FaUniversity } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";
import { generateTicketPDF } from "../utils/ticketPDF";
import "../styles/Payment.css";

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get booking data from localStorage
    const data = localStorage.getItem("bookingData");
    if (!data) {
      alert("No booking data found. Please select seats first.");
      navigate("/");
      return;
    }

    const parsedData = JSON.parse(data);
    setBookingData(parsedData);

    // Initialize passenger array based on selected seats
    setPassengers(
      parsedData.selectedSeats.map((seatNumber) => ({
        seatNumber,
        name: "",
        age: "",
        gender: "Male",
      }))
    );

    // Fetch route details (or use stored details for taxi bookings)
    if (parsedData.isTaxiBooking && parsedData.routeDetails) {
      // For taxi bookings, use the stored route details
      setRouteDetails({
        ...parsedData.routeDetails,
        bus: parsedData.taxiDetails,
      });
    } else {
      // For bus bookings, fetch route details from API
      fetchRouteDetails(parsedData.busId, parsedData.routeId);
    }
  }, []);

  const fetchRouteDetails = async (busId, routeId) => {
    try {
      const response = await api.get(`/buses/${busId}`);
      const route = response.data.data.routes.find((r) => r._id === routeId);
      setRouteDetails({
        ...route,
        bus: response.data.data.bus,
      });
    } catch (err) {
      setError("Failed to load route details");
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const validateForm = () => {
    // Check all passengers have name and age
    for (const passenger of passengers) {
      if (!passenger.name.trim()) {
        alert("Please fill in all passenger names");
        return false;
      }
      if (!passenger.age || passenger.age < 1 || passenger.age > 120) {
        alert("Please enter valid age for all passengers (1-120)");
        return false;
      }
    }

    if (!termsAccepted) {
      alert("Please accept terms and conditions");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      let bookingPayload;
      
      if (bookingData.isTaxiBooking) {
        // Taxi booking payload
        const passenger = passengers[0]; // Single passenger for taxi
        bookingPayload = {
          taxiId: bookingData.busId,
          routeId: bookingData.routeId,
          rideDate: bookingData.date,
          passengerCount: bookingData.passengerCount || 1,
          passengerName: passenger.name,
          passengerPhone: user?.phone || "0000000000", // Use user's phone or default
          totalAmount: bookingData.totalAmount,
          paymentMethod: paymentMethod,
          bookingStatus: "confirmed",
        };
      } else {
        // Bus booking payload (original structure)
        bookingPayload = {
          busId: bookingData.busId,
          routeId: bookingData.routeId,
          journeyDate: bookingData.date,
          seats: passengers.map((p) => ({
            seatNumber: p.seatNumber,
            passengerName: p.name,
            passengerAge: parseInt(p.age),
            passengerGender: p.gender,
          })),
          totalAmount: bookingData.totalAmount,
          paymentMethod: paymentMethod,
          bookingStatus: "confirmed",
        };
      }

      const response = await api.post("/bookings", bookingPayload);
      const bookingId = response.data.data._id;

      // Generate PDF ticket data
      const ticketData = {
        bookingId: bookingId,
        passengers: passengers,
        route: routeDetails,
        bus: routeDetails.bus,
        journeyDate: bookingData.date,
        totalSeats: bookingData.selectedSeats.length,
        totalAmount: bookingData.totalAmount,
        isTaxiBooking: bookingData.isTaxiBooking,
        passengerCount: bookingData.passengerCount,
      };

      // Generate and download PDF ticket
      generateTicketPDF(ticketData);

      // Clear booking data from localStorage
      localStorage.removeItem("bookingData");

      // Show success message specific to booking type
      const successMessage = bookingData.isTaxiBooking
        ? `🎉 Taxi booked successfully!\n\nYour booking ID is: ${bookingId}\nReceipt has been downloaded.\n\nThank you for choosing our service!`
        : `🎉 Booking confirmed!\n\nYour booking ID is: ${bookingId}\nTicket has been downloaded.\n\nThank you for choosing our service!`;
      
      alert(successMessage);
      navigate("/my-bookings");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to create booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData || !routeDetails) {
    return <div className="loader">Loading booking details...</div>;
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Complete Your Booking</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="payment-content">
          {/* Booking Summary */}
          <div className="booking-summary-card">
            <h2>Booking Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>{bookingData.isTaxiBooking ? 'Taxi:' : 'Bus:'}</span>
                <strong>{routeDetails.bus.name}</strong>
              </div>
              <div className="summary-row">
                <span>Route:</span>
                <strong>
                  {routeDetails.source} → {routeDetails.destination}
                </strong>
              </div>
              <div className="summary-row">
                <span>Date:</span>
                <strong>
                  {new Date(bookingData.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
              </div>
              <div className="summary-row">
                <span>Departure:</span>
                <strong>{routeDetails.departureTime}</strong>
              </div>
              {bookingData.isTaxiBooking && bookingData.passengerCount && (
                <div className="summary-row">
                  <span>Passengers:</span>
                  <strong>{bookingData.passengerCount}</strong>
                </div>
              )}
              {!bookingData.isTaxiBooking && (
                <div className="summary-row">
                  <span>Selected Seats:</span>
                  <strong>{bookingData.selectedSeats.join(", ")}</strong>
                </div>
              )}
              <div className="summary-row total">
                <span>Total Amount:</span>
                <strong>₹{bookingData.totalAmount}</strong>
              </div>
            </div>
          </div>

          {/* Passenger Details Form */}
          <div className="passenger-details-card">
            <h2>Passenger Details</h2>
            <form onSubmit={handleSubmit}>
              {passengers.map((passenger, index) => (
                <div key={passenger.seatNumber} className="passenger-form">
                  <h3>
                    {bookingData.isTaxiBooking 
                      ? `Passenger ${index + 1}` 
                      : `Passenger ${index + 1} - Seat ${passenger.seatNumber}`}
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        value={passenger.name}
                        onChange={(e) =>
                          handlePassengerChange(index, "name", e.target.value)
                        }
                        placeholder="Full Name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Age *</label>
                      <input
                        type="number"
                        value={passenger.age}
                        onChange={(e) =>
                          handlePassengerChange(index, "age", e.target.value)
                        }
                        placeholder="Age"
                        min="1"
                        max="120"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender *</label>
                      <select
                        value={passenger.gender}
                        onChange={(e) =>
                          handlePassengerChange(index, "gender", e.target.value)
                        }
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {/* Payment Method */}
              <div className="payment-method-section">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <span className="payment-icon"><FaMobileAlt /></span>
                      UPI
                    </span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <span className="payment-icon"><FaCreditCard /></span>
                      Credit/Debit Card
                    </span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === "netbanking"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="payment-label">
                      <span className="payment-icon"><FaUniversity /></span>
                      Net Banking
                    </span>
                  </label>
                </div>
                <p className="payment-note">
                  <strong>Note:</strong> This is a demo. Payment will be
                  simulated.
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="terms-section">
                <label className="terms-checkbox">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span>
                    I accept the{" "}
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      terms and conditions
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-large btn-block"
                disabled={loading}
              >
                {loading ? "Processing..." : `Pay ₹${bookingData.totalAmount}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
