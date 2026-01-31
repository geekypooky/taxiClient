import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaTicketAlt, FaMoneyBillWave, FaBus, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    source: "",
    destination: "",
    date: "",
  });
  const [taxis, setTaxis] = useState([]);
  const [loading, setLoading] = useState(true);

  // List of Tamil Nadu cities - matching routes in database
  const cities = [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Salem",
    "Trichy",
    "Erode",
    "Tirunelveli",
    "Vellore",
    "Thoothukudi",
    "Dindigul",
    "Thanjavur",
    "Kanchipuram",
    "Namakkal",
    "Hosur",
  ];

  useEffect(() => {
    fetchTaxis();
  }, []);

  const fetchTaxis = async () => {
    try {
      const response = await api.get("/taxis");
      setTaxis(response.data.data.slice(0, 6)); // Show only first 6 taxis
    } catch (err) {
      console.error("Error fetching taxis");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(
      `/search?source=${searchData.source}&destination=${searchData.destination}&date=${searchData.date}`
    );
  };

  const scrollToSearch = () => {
    const el = document.querySelector(".search-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-grid">
            <div className="hero-left">
              <h1>Request a taxi ride</h1>
              <p>Book now or schedule your trip for later.</p>

              <form onSubmit={handleSearch} className="search-form">
                <div className="search-inputs">
                  <select
                    value={searchData.source}
                    onChange={(e) =>
                      setSearchData({ ...searchData, source: e.target.value })
                    }
                    required
                  >
                    <option value="">Pickup city</option>
                    {cities.map((city) => (
                      <option key={`source-${city}`} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <select
                    value={searchData.destination}
                    onChange={(e) =>
                      setSearchData({ ...searchData, destination: e.target.value })
                    }
                    required
                  >
                    <option value="">Dropoff city</option>
                    {cities.map((city) => (
                      <option key={`dest-${city}`} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={searchData.date}
                    onChange={(e) =>
                      setSearchData({ ...searchData, date: e.target.value })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                  <button type="submit" className="btn btn-primary">
                    See prices
                  </button>
                </div>
              </form>
            </div>

            <div className="hero-right" aria-hidden="true">
              <div className="hero-visual">
                <dotlottie-wc
                  src="https://lottie.host/d8d859e7-162d-4378-9dc5-ef519a6eb81d/4KYNpC5UtS.lottie"
                  autoplay
                  loop
                  style={{ width: "100%", height: "100%" }}
                ></dotlottie-wc>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Buses */}
      <section className="available-buses">
        <div className="container">
          <h2>Available Taxis</h2>
          {loading ? (
            <p className="loading-text">Loading taxis...</p>
          ) : taxis.length === 0 ? (
            <p className="no-buses">
              No taxis available yet. Admin can add taxis from the admin panel.
            </p>
          ) : (
            <div className="buses-grid">
              {taxis.map((taxi) => (
                <div key={taxi._id} className="bus-card-home">
                  <div className="bus-header">
                    <h4>{taxi.name}</h4>
                    <span className="bus-type-badge">{taxi.taxiType}</span>
                  </div>
                  <div className="bus-details">
                    <p>
                      <strong>Vehicle Number:</strong> {taxi.vehicleNumber}
                    </p>
                    <p>
                      <strong>Operator:</strong> {taxi.operator}
                    </p>
                    <p>
                      <strong>Capacity:</strong> {taxi.capacity} passengers
                    </p>
                    {taxi.rating > 0 && (
                      <div className="bus-rating">
                        <div className="rating-badge">
                          ⭐ {taxi.rating.toFixed(1)}
                        </div>
                        <span className="review-count">
                          ({taxi.reviewCount}{" "}
                          {taxi.reviewCount === 1 ? "review" : "reviews"})
                        </span>
                      </div>
                    )}
                  </div>
                  {taxi.amenities && taxi.amenities.length > 0 && (
                    <div className="bus-amenities">
                      <strong>Amenities:</strong>
                      <div className="amenities-list">
                        {taxi.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="amenity-tag">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {taxis.length > 0 && (
            <div className="view-all">
              <button type="button" className="btn btn-outline" onClick={scrollToSearch}>
                Search Routes
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{ color: "var(--text-dark)", background: "var(--bg-gray)" }}><FaTicketAlt /></div>
              <h3>Easy Booking</h3>
              <p>Book your taxi rides in just a few clicks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: "var(--text-dark)", background: "var(--bg-gray)" }}><FaMoneyBillWave /></div>
              <h3>Best Prices</h3>
              <p>Get the best deals and offers on taxi rides</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: "var(--text-dark)", background: "var(--bg-gray)" }}><FaBus /></div>
              <h3>Wide Network</h3>
              <p>Thousands of routes across the country</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon" style={{ color: "var(--text-dark)", background: "var(--bg-gray)" }}><FaLock /></div>
              <h3>Secure Payment</h3>
              <p>100% secure payment gateway</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
