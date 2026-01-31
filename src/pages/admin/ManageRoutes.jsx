import { useState, useEffect } from "react";
import api from "../../config/api";
import "../../styles/AdminPages.css";

const ManageRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [taxis, setTaxis] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    taxi: "",
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    distance: "",
    price: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchRoutes();
    fetchTaxis();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get("/admin/routes");
      setRoutes(response.data.data);
    } catch (err) {
      alert("Failed to load routes");
    }
  };

  const fetchTaxis = async () => {
    try {
      const response = await api.get("/admin/taxis");
      setTaxis(response.data.data);
    } catch (err) {
      console.error("Failed to load taxis");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/routes/${editingId}`, formData);
        alert("Route updated successfully");
      } else {
        await api.post("/admin/routes", formData);
        alert("Route added successfully");
      }
      resetForm();
      fetchRoutes();
    } catch (err) {
      alert(err.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this route?")) return;
    try {
      await api.delete(`/admin/routes/${id}`);
      alert("Route deleted");
      fetchRoutes();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  const resetForm = () => {
    setFormData({
      taxi: "",
      source: "",
      destination: "",
      departureTime: "",
      arrivalTime: "",
      duration: "",
      distance: "",
      price: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Manage Routes</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Route"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <select
            value={formData.taxi}
            onChange={(e) => setFormData({ ...formData, taxi: e.target.value })}
            required
          >
            <option value="">Select Taxi</option>
            {taxis.map((taxi) => (
              <option key={taxi._id} value={taxi._id}>
                {taxi.model} - {taxi.numberPlate} ({taxi.capacity} seats)
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Source City"
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Destination City"
            value={formData.destination}
            onChange={(e) =>
              setFormData({ ...formData, destination: e.target.value })
            }
            required
          />
          <input
            type="time"
            placeholder="Departure Time"
            value={formData.departureTime}
            onChange={(e) =>
              setFormData({ ...formData, departureTime: e.target.value })
            }
            required
          />
          <input
            type="time"
            placeholder="Arrival Time"
            value={formData.arrivalTime}
            onChange={(e) =>
              setFormData({ ...formData, arrivalTime: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Duration (e.g., 4 hours)"
            value={formData.duration}
            onChange={(e) =>
              setFormData({ ...formData, duration: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Distance (km)"
            value={formData.distance}
            onChange={(e) =>
              setFormData({ ...formData, distance: e.target.value })
            }
            required
          />
          <input
            type="number"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
          />
          <button type="submit" className="btn btn-success">
            {editingId ? "Update Route" : "Add Route"}
          </button>
        </form>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Taxi</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Distance</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route._id}>
                <td>
                  {route.taxi?.model} <small>({route.taxi?.numberPlate})</small>
                </td>
                <td>
                  {route.source} → {route.destination}
                </td>
                <td>{route.departureTime}</td>
                <td>{route.arrivalTime}</td>
                <td>{route.distance} km</td>
                <td>₹{route.price}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(route._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageRoutes;
