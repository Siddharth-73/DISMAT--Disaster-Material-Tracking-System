import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ngo"); 

  const handleSignup = async (e) => {
  e.preventDefault();

  try {
    const res = await api.post("/auth/register", {
      name,
      email,
      password,
      role   // this becomes requestedRole in backend
    });

    alert("Signup request sent! Await approval from SuperAdmin.");
    navigate("/pending"); // NEW route

  } catch (error) {
    alert(error.response?.data?.message || "Signup failed");
  }
};


  return (
    <div>
      <h2>Signup</h2>

      <form onSubmit={handleSignup}>
        
        <input 
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input 
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input 
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="warehouse">Warehouse Manager</option>
          <option value="ngo">NGO / Volunteer</option>
          <option value="fieldworker">Field Worker</option>
        </select>

        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default Signup;
