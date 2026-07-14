import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import "../styles/auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", name: "", password: "", });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post("/auth/register", form);

      navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.error ||
        "Registration failed"
      );
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="blob blob--1" />
        <div className="blob blob--2" />
        <div className="blob blob--3" />
        <div className="blob blob--4" />

        <div className="auth-hero__content">

          <h1>
            Build together.
            <br />
            Code together.
          </h1>

        </div>

      </div>
      <div className="auth-right">
      <div className="auth-card">

        <h1 className="auth-title">
          Collaborative IDE
        </h1>

        <p className="auth-subtitle">
          Create an account to start collaborating.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-group">
            <label className="auth-label">
              Name
            </label>

            <input
              className="auth-input"
              placeholder="Your name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">
              Username
            </label>

            <input
              className="auth-input"
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value,
                })
              }
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">
              Email
            </label>

            <input
              className="auth-input"
              placeholder="your.email@example.com"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">
              Password
            </label>

            <input
              className="auth-input"
              placeholder="Minimum 8 characters"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
          >
            Create Account
          </button>

        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link
            className="auth-link"
            to="/login"
          >
            Sign In
          </Link>
        </div>

      </div>
      </div>
    </div>
  );
}