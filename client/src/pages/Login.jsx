import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout.jsx";
import { MailIcon, LockIcon, ArrowRightIcon } from "../components/icons.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      await api.post("/auth/login", { email, password });
      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't log you in — check your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Workspaces"
      title="Welcome back"
      subtitle="Log in to get back to your rooms."
      footer={<>New here? <Link to="/register">Create an account</Link></>}
    >
      <form className="auth-card__form" onSubmit={handleLogin} style={{ padding: 0 }}>
        <div className="field">
          <label className="field__label" htmlFor="login-email">Email</label>
          <div className="input-group">
            <MailIcon />
            <input
              id="login-email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="login-password">Password</label>
          <div className="input-group">
            <LockIcon />
            <input
              id="login-password"
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
          {!submitting && <ArrowRightIcon width={15} height={15} />}
        </button>
      </form>
    </AuthLayout>
  );
}
