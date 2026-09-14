import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowRight, Bike, CarFront, Check, MapPin, X } from "lucide-react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  startDate: "",
  endDate: ""
};

function App() {
  const savedAuth = JSON.parse(localStorage.getItem("riderent-auth") || "null");
  const isAdminPath = window.location.pathname === "/admin";
  const [vehicles, setVehicles] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(savedAuth?.user || null);

  useEffect(() => {
    api.get("/vehicles?available=true")
      .then(({ data }) => setVehicles(data))
      .catch(() => setStatus({ type: "error", message: "Fleet unavailable. Start the backend and try again." }))
      .finally(() => setLoading(false));
  }, []);

  const filteredVehicles = useMemo(() => {
    if (filter === "all") return vehicles;
    return vehicles.filter((vehicle) => vehicle.type === filter);
  }, [filter, vehicles]);

  const openBooking = (vehicle) => {
    setSelectedVehicle(vehicle);
    setForm(initialForm);
    setStatus({ type: "", message: "" });
  };

  const closeBooking = () => setSelectedVehicle(null);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const totalDays = form.startDate && form.endDate
    ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000))
    : 0;

  const submitBooking = async (event) => {
    event.preventDefault();
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setStatus({ type: "error", message: "Return date must be after the pickup date." });
      return;
    }

    try {
      await api.post("/bookings", {
        vehicle: selectedVehicle._id,
        ...form,
        totalAmount: totalDays * selectedVehicle.pricePerDay
      });
      setStatus({ type: "success", message: "Booking request sent. We will confirm it shortly." });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.message || "Booking failed. Please try again." });
    }
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setPage("home");
  };

  const signOut = () => {
    localStorage.removeItem("riderent-auth");
    setUser(null);
    setPage("home");
  };

  const leaveAdmin = () => {
    window.location.assign("/");
  };

  if (page === "login") return <Login onSuccess={handleAuthSuccess} onBack={() => setPage("home")} onRegister={() => setPage("register")} />;
  if (page === "register") return <Register onSuccess={handleAuthSuccess} onBack={() => setPage("home")} onLogin={() => setPage("login")} />;
  if (page === "bookings" && user) return <MyBookings user={user} onBack={() => setPage("home")} />;
  if (page === "admin" && user?.role === "admin") return <AdminDashboard onBack={() => setPage("home")} />;
  if (isAdminPath) {
    if (user?.role === "admin") return <AdminDashboard onBack={leaveAdmin} />;
    return <Login onSuccess={handleAuthSuccess} onBack={leaveAdmin} onRegister={() => setPage("register")} />;
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <a className="brand" href="#home" aria-label="RideRent home">
          <span className="brand-mark"><CarFront size={18} /></span>
          Ride<span>Rent</span>
        </a>
        <div className="nav-links">
          <button className="nav-link-button" onClick={() => setPage("home")}>Home</button>
          <a href="#fleet">Fleet</a>
          <a href="#why-us">Why us</a>
          {user ? <><button className="nav-link-button" onClick={() => setPage("bookings")}>My bookings</button>{user.role === "admin" && <button className="nav-link-button" onClick={() => setPage("admin")}>Admin</button>}<button className="nav-cta" onClick={signOut}>Sign out</button></> : <button className="nav-cta" onClick={() => setPage("login")}>Sign in <ArrowRight size={16} /></button>}
        </div>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <p className="eyebrow">MOVE WITH INTENTION</p>
            <h1>Your next <em>great escape</em> starts here.</h1>
            <p className="hero-description">Premium cars and city-ready bikes, ready when your plans are. Simple prices, flexible pickups, and no unnecessary detours.</p>
            <a className="primary-button" href="#fleet">Explore the fleet <ArrowRight size={18} /></a>
          </div>
          <div className="hero-note">
            <span className="route-line" />
            <strong>COIMBATORE · ERODE · SALEM</strong>
            <span>One booking away from somewhere new.</span>
          </div>
        </section>

        <section className="fleet-section" id="fleet">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE FLEET</p>
              <h2>Choose your kind of freedom.</h2>
            </div>
            <div className="filters" aria-label="Filter vehicles">
              {["all", "car", "bike"].map((option) => (
                <button key={option} className={filter === option ? "filter active" : "filter"} onClick={() => setFilter(option)}>
                  {option === "car" && <CarFront size={16} />}
                  {option === "bike" && <Bike size={16} />}
                  {option[0].toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {status.type === "error" && !selectedVehicle && <p className="inline-status error">{status.message}</p>}
          {loading ? <div className="loading">Loading the fleet...</div> : (
            <div className="vehicle-grid">
              {filteredVehicles.map((vehicle) => (
                <article className="vehicle-card" key={vehicle._id}>
                  <div className="vehicle-image-wrap">
                    <img src={vehicle.image} alt={vehicle.name} />
                    <span className="vehicle-type">{vehicle.type}</span>
                  </div>
                  <div className="vehicle-content">
                    <div className="vehicle-title-row">
                      <div>
                        <h3>{vehicle.name}</h3>
                        <p><MapPin size={14} /> {vehicle.location}</p>
                      </div>
                      <strong className="price">₹{vehicle.pricePerDay}<small>/day</small></strong>
                    </div>
                    <div className="vehicle-details"><span>{vehicle.fuelType}</span><span>{vehicle.transmission}</span><span>{vehicle.seats} seats</span></div>
                    <button className="book-button" onClick={() => openBooking(vehicle)}>Book this ride <ArrowRight size={16} /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && filteredVehicles.length === 0 && <div className="empty-state">No rides match this filter yet.</div>}
        </section>

        <section className="why-section" id="why-us">
          <p className="eyebrow">WHY RIDERENT</p>
          <h2>Good journeys begin with fewer complications.</h2>
          <div className="benefits"><div><span>01</span><h3>Clear pricing</h3><p>What you see is what you pay per day.</p></div><div><span>02</span><h3>Local knowledge</h3><p>Pickup points that make sense for your route.</p></div><div><span>03</span><h3>Ready to roll</h3><p>Every ride is checked before it reaches you.</p></div></div>
        </section>
      </main>

      <footer><span>© 2026 RideRent</span><span>Car & bike rentals for the road ahead.</span></footer>

      {selectedVehicle && <div className="modal-backdrop" role="presentation" onClick={closeBooking}>
        <div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title" onClick={(event) => event.stopPropagation()}>
          <button className="close-button" onClick={closeBooking} aria-label="Close booking form"><X size={20} /></button>
          <p className="eyebrow">RESERVE YOUR RIDE</p>
          <h2 id="booking-title">{selectedVehicle.name}</h2>
          <p className="modal-summary">₹{selectedVehicle.pricePerDay}/day · {selectedVehicle.location}</p>
          <form onSubmit={submitBooking}>
            <label>Name<input required name="customerName" value={form.customerName} onChange={updateForm} placeholder="Your full name" /></label>
            <div className="form-row"><label>Email<input required type="email" name="email" value={form.email} onChange={updateForm} placeholder="you@example.com" /></label><label>Phone<input required name="phone" value={form.phone} onChange={updateForm} placeholder="10-digit number" /></label></div>
            <div className="form-row"><label>Pickup date<input required type="date" name="startDate" min={new Date().toISOString().split("T")[0]} value={form.startDate} onChange={updateForm} /></label><label>Return date<input required type="date" name="endDate" value={form.endDate} onChange={updateForm} /></label></div>
            {totalDays > 0 && <div className="total-row"><span>{totalDays} day{totalDays > 1 ? "s" : ""}</span><strong>₹{totalDays * selectedVehicle.pricePerDay}</strong></div>}
            {status.message && <p className={`inline-status ${status.type}`}>{status.message}</p>}
            <button className="submit-button" type="submit"><Check size={17} /> Send booking request</button>
          </form>
        </div>
      </div>}
    </div>
  );
}

export default App;
