import { useState } from "react";
import axios from "axios";
import { ShieldCheck } from "lucide-react";

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api` });

function AdminLogin({ onSuccess, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (data.user.role !== "admin") {
        setError("This account does not have admin access");
        return;
      }

      localStorage.setItem("riderent-auth", JSON.stringify(data));
      onSuccess(data.user);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <section className="auth-page admin-auth-page">
      <div className="auth-panel">
        <div className="admin-login-icon"><ShieldCheck size={28} /></div>
        <p className="eyebrow">RIDERENT ADMIN</p>
        <h1>Admin Login</h1>
        <p className="auth-copy">Sign in to manage rental bookings and vehicles.</p>
        <form onSubmit={handleLogin}>
          <label>Admin email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@riderent.local" /></label>
          <label>Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /></label>
          {error && <p className="inline-status error">{error}</p>}
          <button className="submit-button" type="submit">Login to dashboard</button>
        </form>
        <button className="back-link admin-back-button" onClick={onBack}>Back to website</button>
      </div>
    </section>
  );
}

export default AdminLogin;
