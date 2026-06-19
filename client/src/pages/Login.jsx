import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogin() {
    await api.post("/auth/login", { email, password });
    await refreshUser();
    navigate("/dashboard");
  }

  return (
    <div>
      <input
        placeholder="email"
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="password"
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}