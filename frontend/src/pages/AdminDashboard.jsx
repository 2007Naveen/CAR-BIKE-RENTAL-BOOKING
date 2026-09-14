import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

function AdminDashboard({ onBack }) {
  const auth = JSON.parse(localStorage.getItem("riderent-auth") || "{}");
  const token = auth.token;
  const headers = { Authorization: `Bearer ${auth.token}` };
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [newVehicle, setNewVehicle] = useState({ name: "", type: "car", pricePerDay: "", location: "", image: "", fuelType: "Petrol", transmission: "Automatic", seats: 5 });

  const loadDashboard = async () => {
    try {
      const [summaryResponse, bookingResponse, vehicleResponse] = await Promise.all([
        api.get("/admin/summary", { headers }),
        api.get("/admin/bookings", { headers }),
        api.get("/vehicles")
      ]);
      setSummary(summaryResponse.data);
      setBookings(bookingResponse.data);
      setVehicles(vehicleResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load dashboard");
    }
  };

  useEffect(() => {
    let active = true;
    const requestHeaders = { Authorization: `Bearer ${token}` };

    const loadInitialDashboard = async () => {
      try {
        const [summaryResponse, bookingResponse, vehicleResponse] = await Promise.all([
          api.get("/admin/summary", { headers: requestHeaders }),
          api.get("/admin/bookings", { headers: requestHeaders }),
          api.get("/vehicles")
        ]);

        if (active) {
          setSummary(summaryResponse.data);
          setBookings(bookingResponse.data);
          setVehicles(vehicleResponse.data);
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || "Could not load dashboard");
      }
    };

    loadInitialDashboard();
    return () => { active = false; };
  }, [token]);

  const updateBooking = async (id, status) => {
    await api.patch(`/admin/bookings/${id}/status`, { status }, { headers });
    loadDashboard();
  };

  const deleteVehicle = async (id) => {
    await api.delete(`/admin/vehicles/${id}`, { headers });
    loadDashboard();
  };

  const createVehicle = async (event) => {
    event.preventDefault();
    await api.post("/admin/vehicles", { ...newVehicle, pricePerDay: Number(newVehicle.pricePerDay), seats: Number(newVehicle.seats), available: true }, { headers });
    setNewVehicle({ name: "", type: "car", pricePerDay: "", location: "", image: "", fuelType: "Petrol", transmission: "Automatic", seats: 5 });
    loadDashboard();
  };

  return <section className="dashboard-page"><div className="dashboard-inner"><button className="back-link" onClick={onBack}>← Back to fleet</button><div className="dashboard-header"><div><p className="eyebrow">OPERATIONS</p><h1>Admin dashboard</h1></div><span className="admin-badge">Admin view</span></div>{error && <p className="inline-status error">{error}</p>}{summary && <div className="stats-grid"><div><span>Total vehicles</span><strong>{summary.vehicles}</strong></div><div><span>Available</span><strong>{summary.availableVehicles}</strong></div><div><span>Bookings</span><strong>{summary.bookings}</strong></div><div><span>Revenue</span><strong>₹{summary.revenue}</strong></div></div>}<div className="admin-columns"><div><h2>Vehicles</h2><form className="vehicle-form" onSubmit={createVehicle}><input required placeholder="Vehicle name" value={newVehicle.name} onChange={(event) => setNewVehicle({ ...newVehicle, name: event.target.value })} /><select value={newVehicle.type} onChange={(event) => setNewVehicle({ ...newVehicle, type: event.target.value })}><option value="car">Car</option><option value="bike">Bike</option></select><input required type="number" min="1" placeholder="Price per day" value={newVehicle.pricePerDay} onChange={(event) => setNewVehicle({ ...newVehicle, pricePerDay: event.target.value })} /><input required placeholder="Location" value={newVehicle.location} onChange={(event) => setNewVehicle({ ...newVehicle, location: event.target.value })} /><input required type="url" placeholder="Image URL" value={newVehicle.image} onChange={(event) => setNewVehicle({ ...newVehicle, image: event.target.value })} /><button className="submit-button" type="submit">Add vehicle</button></form><div className="admin-table">{vehicles.map((vehicle) => <div className="admin-row" key={vehicle._id}><span><b>{vehicle.name}</b><small>{vehicle.type} · ₹{vehicle.pricePerDay}/day</small></span><button className="table-action" onClick={() => deleteVehicle(vehicle._id)}>Delete</button></div>)}</div></div><div><h2>Recent bookings</h2><div className="admin-table">{bookings.slice(0, 8).map((booking) => <div className="admin-row" key={booking._id}><span><b>{booking.customerName}</b><small>{booking.vehicle?.name || "Vehicle"}</small></span><select value={booking.status} onChange={(event) => updateBooking(booking._id, event.target.value)}><option>pending</option><option>confirmed</option><option>cancelled</option><option>completed</option></select></div>)}</div></div></div></div></section>;
}

export default AdminDashboard;
