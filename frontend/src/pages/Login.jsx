import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });

      const { token, user } = res.data;

      // Save auth data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 🔑 STEP 1: Pending users
      if (user.status === "pending") {
        navigate("/pending", { replace: true });
        return;
      }

      // 🔑 STEP 2: Redirect by role
      switch (user.role) {
        case "superadmin":
          // TEMP: redirect to admin until superadmin dashboard is built
          navigate("/superadmin", { replace: true });
          break;

        case "admin":
          navigate("/admin", { replace: true });
          break;

        case "warehouse":
          navigate("/warehouse", { replace: true });
          break;

        case "ngo":
          navigate("/ngo", { replace: true });
          break;

        case "fieldworker":
          navigate("/fieldworker", { replace: true });
          break;

        default:
          navigate("/", { replace: true });
      }

    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account? <a href="/signup">Create one</a>
      </p>
    </div>
  );
};

export default Login;
