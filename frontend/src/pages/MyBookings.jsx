import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api` });

function MyBookings({ user, onBack }) {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/bookings")
      .then(({ data }) => setBookings(data.filter((booking) => booking.email === user.email)))
      .catch(() => setError("Could not load your bookings."));
  }, [user.email]);

  return <section className="dashboard-page"><div className="dashboard-inner"><button className="back-link" onClick={onBack}>← Back to fleet</button><p className="eyebrow">YOUR JOURNEY</p><h1>My bookings</h1><p className="dashboard-lead">Everything you have reserved with RideRent, in one place.</p>{error && <p className="inline-status error">{error}</p>}<div className="booking-list">{bookings.length === 0 && !error && <div className="empty-state">No bookings yet. Your next ride is waiting.</div>}{bookings.map((booking) => <article className="booking-row" key={booking._id}><div><strong>{booking.vehicle?.name || "Vehicle"}</strong><span>{new Date(booking.startDate).toLocaleDateString()} → {new Date(booking.endDate).toLocaleDateString()}</span></div><div><b>₹{booking.totalAmount}</b><small className={`status-${booking.status}`}>{booking.status}</small></div></article>)}</div></div></section>;
}

export default MyBookings;
