import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../config/api";
import "../styles/SearchTaxis.css";

const SearchTaxis = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [taxis, setTaxis] = useState([]);
  const [filteredTaxis, setFilteredTaxis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Passenger count modal states
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [selectedTaxiForBooking, setSelectedTaxiForBooking] = useState(null);
  const [passengerCount, setPassengerCount] = useState(1);

  // Filter states
  const [filters, setFilters] = useState({
    taxiTypes: [],
    minPrice: 0,
    maxPrice: 5000,
    departureTime: "all",
    minRating: 0,
  });

  const [sortBy, setSortBy] = useState("price-low");

  const source = searchParams.get("source");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");

  const hasSearchParams = Boolean(source && destination && date);

  useEffect(() => {
    if (hasSearchParams) {
      searchTaxis();
    } else {
      setTaxis([]);
      setError("Please select source, destination, and date from the Home page.");
    }
  }, [hasSearchParams, source, destination, date]);

  useEffect(() => {
    applyFilters();
  }, [taxis, filters, sortBy]);

  const searchTaxis = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(
        `/taxis/search?source=${source}&destination=${destination}&date=${date}`
      );
      setTaxis(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to search taxis");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...taxis];

    // Filter by taxi types
    if (filters.taxiTypes.length > 0) {
      result = result.filter((route) =>
        filters.taxiTypes.includes(route.taxi.taxiType)
      );
    }

    // Filter by price range
    result = result.filter(
      (route) =>
        route.price >= filters.minPrice && route.price <= filters.maxPrice
    );

    // Filter by departure time
    if (filters.departureTime !== "all") {
      result = result.filter((route) => {
        const hour = parseInt(route.departureTime.split(":")[0]);

        switch (filters.departureTime) {
          case "early-morning": // 12 AM - 6 AM
            return hour >= 0 && hour < 6;
          case "morning": // 6 AM - 12 PM
            return hour >= 6 && hour < 12;
          case "afternoon": // 12 PM - 6 PM
            return hour >= 12 && hour < 18;
          case "evening": // 6 PM - 12 AM
            return hour >= 18;
          default:
            return true;
        }
      });
    }

    // Filter by rating
    if (filters.minRating > 0) {
      result = result.filter(
        (route) => (route.taxi.rating || 0) >= filters.minRating
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.taxi.rating || 0) - (a.taxi.rating || 0));
        break;
      case "departure":
        result.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        break;
      default:
        break;
    }

    setFilteredTaxis(result);
  };

  const handleTaxiTypeChange = (taxiType) => {
    setFilters((prev) => ({
      ...prev,
      taxiTypes: prev.taxiTypes.includes(taxiType)
        ? prev.taxiTypes.filter((t) => t !== taxiType)
        : [...prev.taxiTypes, taxiType],
    }));
  };

  const handleSelectTaxi = (taxiId, routeId) => {
    // Find the selected taxi route
    const selectedRoute = filteredTaxis.find((route) => route._id === routeId);
    
    if (!selectedRoute) {
      alert("Invalid taxi selection");
      return;
    }

    // Show passenger count modal
    setSelectedTaxiForBooking(selectedRoute);
    setPassengerCount(1); // Reset to 1
    setShowPassengerModal(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedTaxiForBooking) return;

    // Validate passenger count
    if (passengerCount < 1 || passengerCount > selectedTaxiForBooking.taxi.capacity) {
      alert(`Please select between 1 and ${selectedTaxiForBooking.taxi.capacity} passengers`);
      return;
    }

    // Store booking data in localStorage for Payment page
    const bookingData = {
      busId: selectedTaxiForBooking.taxi._id,
      routeId: selectedTaxiForBooking._id,
      date: date,
      selectedSeats: [1], // Single seat representing the whole taxi booking
      totalAmount: selectedTaxiForBooking.price,
      passengerCount: passengerCount, // Store selected passenger count
      isTaxiBooking: true,
      taxiDetails: {
        name: selectedTaxiForBooking.taxi.name,
        type: selectedTaxiForBooking.taxi.taxiType,
        capacity: selectedTaxiForBooking.taxi.capacity,
      },
      routeDetails: {
        source: selectedTaxiForBooking.source,
        destination: selectedTaxiForBooking.destination,
        departureTime: selectedTaxiForBooking.departureTime,
        arrivalTime: selectedTaxiForBooking.arrivalTime,
        duration: selectedTaxiForBooking.duration,
      }
    };

    localStorage.setItem("bookingData", JSON.stringify(bookingData));
    setShowPassengerModal(false);
    navigate("/payment");
  };

  if (!hasSearchParams) {
    return (
      <div className="search-buses">
        <div className="search-header">
          <div className="container">
            <h2>Search Taxis</h2>
            <p>Select source, destination, and date to see available taxis.</p>
          </div>
        </div>

        <div className="search-content container">
          <div className="no-results">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate("/")}
            >
              Go to Home Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loader">Searching taxis...</div>;
  }

  return (
    <div className="search-buses">
      <div className="search-header">
        <div className="container">
          <h2>
            {source} → {destination}
          </h2>
          <p>
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-content container">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <h3>Filters</h3>

          {/* Taxi Type Filter */}
          <div className="filter-section">
            <h4>Taxi Type</h4>
            {["Mini", "Sedan", "SUV", "Luxury", "Premium"].map(
              (type) => (
                <label key={type} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.taxiTypes.includes(type)}
                    onChange={() => handleTaxiTypeChange(type)}
                  />
                  <span>{type}</span>
                </label>
              )
            )}
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: Number(e.target.value) })
                }
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: Number(e.target.value) })
                }
              />
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: Number(e.target.value) })
              }
              className="price-slider"
            />
            <div className="price-labels">
              <span>₹{filters.minPrice}</span>
              <span>₹{filters.maxPrice}</span>
            </div>
          </div>

          {/* Departure Time Filter */}
          <div className="filter-section">
            <h4>Departure Time</h4>
            {[
              { value: "all", label: "All Times" },
              { value: "early-morning", label: "Early Morning (12AM - 6AM)" },
              { value: "morning", label: "Morning (6AM - 12PM)" },
              { value: "afternoon", label: "Afternoon (12PM - 6PM)" },
              { value: "evening", label: "Evening (6PM - 12AM)" },
            ].map((time) => (
              <label key={time.value} className="filter-radio">
                <input
                  type="radio"
                  name="departureTime"
                  checked={filters.departureTime === time.value}
                  onChange={() =>
                    setFilters({ ...filters, departureTime: time.value })
                  }
                />
                <span>{time.label}</span>
              </label>
            ))}
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h4>Minimum Rating</h4>
            <select
              value={filters.minRating}
              onChange={(e) =>
                setFilters({ ...filters, minRating: Number(e.target.value) })
              }
              className="rating-select"
            >
              <option value="0">All</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          <button
            className="btn btn-outline btn-block"
            onClick={() =>
              setFilters({
                taxiTypes: [],
                minPrice: 0,
                maxPrice: 5000,
                departureTime: "all",
                minRating: 0,
              })
            }
          >
            Clear Filters
          </button>
        </aside>

        {/* Taxis List */}
        <main className="buses-section">
          <div className="sort-controls">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rating</option>
              <option value="departure">Departure Time</option>
            </select>
            <span className="results-count">
              {filteredTaxis.length}{" "}
              {filteredTaxis.length === 1 ? "taxi" : "taxis"} found
            </span>
          </div>

          {filteredTaxis.length === 0 && !loading && (
            <div className="no-results">
              <p>No taxis found matching your filters.</p>
              <p>Try adjusting your filters or search criteria.</p>
            </div>
          )}

          <div className="buses-list">
            {filteredTaxis.map((route) => (
              <div key={route._id} className="bus-card">
                <div className="bus-info">
                  <div className="bus-name-section">
                    <h3>{route.taxi.name}</h3>
                    {route.taxi.rating > 0 && (
                      <div className="bus-rating-badge">
                        ⭐ {route.taxi.rating.toFixed(1)}
                        <span className="review-text">
                          ({route.taxi.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="bus-type">{route.taxi.taxiType}</p>
                  <div className="amenities">
                    {route.taxi.amenities?.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="amenity">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  {route.offers && (
                    <div className="offer-badge">{route.offers}</div>
                  )}
                </div>

                <div className="bus-timings">
                  <div className="timing">
                    <span className="time">{route.departureTime}</span>
                    <span className="location">{route.source}</span>
                  </div>
                  <div className="duration">
                    <span>{route.duration}</span>
                    <div className="arrow">→</div>
                  </div>
                  <div className="timing">
                    <span className="time">{route.arrivalTime}</span>
                    <span className="location">{route.destination}</span>
                  </div>
                </div>

                <div className="bus-details">
                  <div className="seats-available">
                    <span className="seats-count">
                      {route.isAvailable ? "Available" : "Booked"}
                    </span>
                    <span className="seats-label">
                      Capacity: {route.taxi.capacity}
                    </span>
                  </div>
                  <div className="price">
                    <span className="price-label">Ride Price</span>
                    <span className="price-amount">₹{route.price}</span>
                  </div>
                </div>

                <div className="bus-action">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSelectTaxi(route.taxi._id, route._id)}
                    disabled={!route.isAvailable}
                  >
                    {route.isAvailable ? "Book Now" : "Not Available"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Passenger Count Modal */}
      {showPassengerModal && selectedTaxiForBooking && (
        <div className="modal-overlay" onClick={() => setShowPassengerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Select Passenger Count</h2>
            <div className="modal-body">
              <div className="taxi-info">
                <h3>{selectedTaxiForBooking.taxi.name}</h3>
                <p className="taxi-type">{selectedTaxiForBooking.taxi.taxiType}</p>
                <p className="capacity-info">
                  Maximum Capacity: <strong>{selectedTaxiForBooking.taxi.capacity} passengers</strong>
                </p>
              </div>
              
              <div className="passenger-count-selector">
                <label htmlFor="passengerCount">
                  How many passengers are traveling?
                </label>
                <div className="count-input-group">
                  <button 
                    className="count-btn"
                    onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                    disabled={passengerCount <= 1}
                  >
                    -
                  </button>
                  <input
                    id="passengerCount"
                    type="number"
                    min="1"
                    max={selectedTaxiForBooking.taxi.capacity}
                    value={passengerCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setPassengerCount(Math.min(Math.max(1, value), selectedTaxiForBooking.taxi.capacity));
                    }}
                    className="passenger-input"
                  />
                  <button 
                    className="count-btn"
                    onClick={() => setPassengerCount(Math.min(selectedTaxiForBooking.taxi.capacity, passengerCount + 1))}
                    disabled={passengerCount >= selectedTaxiForBooking.taxi.capacity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="price-info">
                <span>Total Price:</span>
                <strong>₹{selectedTaxiForBooking.price}</strong>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-outline"
                onClick={() => setShowPassengerModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleConfirmBooking}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchTaxis;
