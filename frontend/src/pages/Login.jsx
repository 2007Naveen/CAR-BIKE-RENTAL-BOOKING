import { useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

function Login({ onSuccess, onBack, onRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("riderent-auth", JSON.stringify(data));
      onSuccess(data.user);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed");
    }
  };

  return <section className="auth-page"><div className="auth-panel"><button className="back-link" onClick={onBack}>← Back to RideRent</button><p className="eyebrow">WELCOME BACK</p><h1>Pick up where you left off.</h1><p className="auth-copy">Sign in to manage bookings and keep your favourite rides close.</p><form onSubmit={submit}><label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Password<input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>{error && <p className="inline-status error">{error}</p>}<button className="submit-button" type="submit">Sign in</button></form><p className="auth-switch">New to RideRent? <button onClick={onRegister}>Create an account</button></p></div></section>;
}

export default Login;
