import { useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

function Register({ onSuccess, onBack, onLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("riderent-auth", JSON.stringify(data));
      onSuccess(data.user);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed");
    }
  };

  return <section className="auth-page"><div className="auth-panel"><button className="back-link" onClick={onBack}>← Back to RideRent</button><p className="eyebrow">JOIN RIDERENT</p><h1>Make more room for the road.</h1><p className="auth-copy">Create an account to book rides faster and track every reservation.</p><form onSubmit={submit}><label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Password<input required minLength="6" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>{error && <p className="inline-status error">{error}</p>}<button className="submit-button" type="submit">Create account</button></form><p className="auth-switch">Already have an account? <button onClick={onLogin}>Sign in</button></p></div></section>;
}

export default Register;
