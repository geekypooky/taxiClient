import { useState, useEffect } from "react";
import api from "../../config/api";
import "../../styles/AdminPages.css";

const ManageTaxis = () => {
  const [taxis, setTaxis] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    vehicleNumber: "",
    taxiType: "Sedan",
    capacity: 4,
    pricePerKm: "",
    driverName: "",
    driverPhone: "",
    operator: "",
    isAvailable: true,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTaxis();
  }, []);

  const fetchTaxis = async () => {
    try {
      const response = await api.get("/admin/taxis");
      setTaxis(response.data.data);
    } catch (err) {
      alert("Failed to load taxis");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/admin/taxis/${editingId}`, formData);
        alert("Taxi updated successfully");
      } else {
        await api.post("/admin/taxis", formData);
        alert("Taxi added successfully");
      }
      resetForm();
      fetchTaxis();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Operation failed";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (taxi) => {
    setFormData({
      name: taxi.name,
      model: taxi.model,
      vehicleNumber: taxi.vehicleNumber,
      taxiType: taxi.taxiType || "Sedan",
      capacity: taxi.capacity,
      pricePerKm: taxi.pricePerKm,
      driverName: taxi.driverName,
      driverPhone: taxi.driverPhone,
      operator: taxi.operator,
      isAvailable: taxi.isActive, // backend uses isActive
    });
    setEditingId(taxi._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this taxi?")) return;
    try {
      await api.delete(`/admin/taxis/${id}`);
      alert("Taxi deleted");
      fetchTaxis();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      model: "",
      vehicleNumber: "",
      taxiType: "Sedan",
      capacity: 4,
      pricePerKm: "",
      driverName: "",
      driverPhone: "",
      operator: "",
      isAvailable: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Manage Taxis</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Taxi"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="text"
            placeholder="Taxi Name (e.g., City Cab)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Model (e.g., Toyota Innova)"
            value={formData.model}
            onChange={(e) =>
              setFormData({ ...formData, model: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Vehicle Number"
            value={formData.vehicleNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                vehicleNumber: e.target.value.toUpperCase(),
              })
            }
            required
          />
          <select
            value={formData.taxiType}
            onChange={(e) =>
              setFormData({ ...formData, taxiType: e.target.value })
            }
            required
          >
            <option value="Mini">Mini</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Luxury">Luxury</option>
            <option value="Premium">Premium</option>
          </select>
          <input
            type="number"
            placeholder="Capacity (Passengers)"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
            }
            required
            min="1"
            max="10"
          />
          <input
            type="number"
            placeholder="Price Per Km (₹)"
            value={formData.pricePerKm}
            onChange={(e) =>
              setFormData({ ...formData, pricePerKm: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Driver Name"
            value={formData.driverName}
            onChange={(e) =>
              setFormData({ ...formData, driverName: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Driver Phone"
            value={formData.driverPhone}
            onChange={(e) =>
              setFormData({ ...formData, driverPhone: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Operator / Agency Name"
            value={formData.operator}
            onChange={(e) =>
              setFormData({ ...formData, operator: e.target.value })
            }
            required
          />
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
              />
              Available for Booking
            </label>
          </div>
          <button type="submit" className="btn btn-success">
            {editingId ? "Update Taxi" : "Add Taxi"}
          </button>
        </form>
      )}

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Taxi</th>
              <th>Vehicle No</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Price/Km</th>
              <th>Driver</th>
              <th>Operator</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxis.map((taxi) => (
              <tr key={taxi._id}>
                <td>
                  <strong>{taxi.name}</strong>
                  <br />
                  <small>{taxi.model}</small>
                </td>
                <td>{taxi.vehicleNumber}</td>
                <td>{taxi.taxiType}</td>
                <td>{taxi.capacity}</td>
                <td>₹{taxi.pricePerKm}</td>
                <td>
                  {taxi.driverName}
                  <br />
                  <small>{taxi.driverPhone}</small>
                </td>
                <td>{taxi.operator}</td>
                <td>
                  <span
                    className={`badge ${
                      taxi.isActive ? "confirmed" : "cancelled"
                    }`}
                  >
                    {taxi.isActive ? "Available" : "Busy"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleEdit(taxi)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(taxi._id)}
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

export default ManageTaxis;
