import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import AuthLayout from "../components/AuthLayout.jsx";
import { MailIcon, LockIcon, UserIcon, ArrowRightIcon } from "../components/icons.jsx";

export default function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
  });

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Workspaces"
      title="Create your account"
      subtitle="Set up a login so you can create and join rooms."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form className="auth-card__form" onSubmit={handleSubmit} style={{ padding: 0 }}>
        <div className="field">
          <label className="field__label" htmlFor="reg-name">Name</label>
          <div className="input-group">
            <UserIcon />
            <input
              id="reg-name"
              className="input"
              placeholder="Ada Lovelace"
              value={form.name}
              onChange={updateField("name")}
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="reg-username">Username</label>
          <div className="input-group">
            <UserIcon />
            <input
              id="reg-username"
              className="input"
              placeholder="ada"
              value={form.username}
              onChange={updateField("username")}
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="reg-email">Email</label>
          <div className="input-group">
            <MailIcon />
            <input
              id="reg-email"
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={updateField("email")}
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="reg-password">Password</label>
          <div className="input-group">
            <LockIcon />
            <input
              id="reg-password"
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              onChange={updateField("password")}
              required
            />
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
          {!submitting && <ArrowRightIcon width={15} height={15} />}
        </button>
      </form>
    </AuthLayout>
  );
}
