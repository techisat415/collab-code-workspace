// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/api";
// import { useAuth } from "../context/AuthContext";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const { refreshUser } = useAuth();
//   const navigate = useNavigate();

//   async function handleLogin() {
//     await api.post("/auth/login", { email, password });
//     await refreshUser();
//     navigate("/dashboard");
//   }

//   return (
//     <div>
//       <input
//         placeholder="email"
//         onChange={(e) =>
//           setEmail(e.target.value)
//         }
//       />

//       <input
//         type="password"
//         placeholder="password"
//         onChange={(e) =>
//           setPassword(e.target.value)
//         }
//       />

//       <button onClick={handleLogin}>
//         Login
//       </button>
//     </div>
//   );
// }


import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await api.post("/auth/login", {
        email,
        password,
      });

      await refreshUser();
      navigate("/dashboard");

    } catch (err) {

      alert(err.response?.data?.error || "Login failed");
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
            Collaborative Workspace
          </h1>

          <p className="auth-subtitle">
            Welcome back.
          </p>

          <form
            className="auth-form" onSubmit={handleSubmit}>

            <div className="auth-group">
              <label className="auth-label"> Email</label>

              <input
                className="auth-input"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-group">
              <label className="auth-label">
                Password
              </label>

              <input
                className="auth-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
            >
              Sign In
            </button>

          </form>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link
              className="auth-link"
              to="/register"
            >
              Sign Up
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}