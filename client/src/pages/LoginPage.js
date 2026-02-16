import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import bg from "../assets/bg-red-forest.jpg";
import { API } from "../api";   // ✅ ADDED

function LoginPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {

    // 🔐 ADMIN LOGIN
    if (isAdmin) {
      if (username === "admin" && password === "admin123") {
        navigate("/admin");
      } else {
        alert("Invalid Admin Credentials");
      }
      return;
    }

    // 👥 TEAM LOGIN
    fetch(`${API}/api/auth/login`, {   // ✅ UPDATED
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: username,
        password: password
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("teamId", username);
          alert("Login Successful");
          navigate("/round1");
        } else {
          alert(data.message || "Invalid Team ID or Password");
        }
      })
      .catch(() => alert("Server error"));
  };

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${bg})` }}
    >

      {/* 🍁 Falling Leaves */}
      <div className="leaves">
        {[...Array(20)].map((_, i) => (
          <span key={i}></span>
        ))}
      </div>

      <div className="login-card">

        <h1>AI SYNTAX STUDIO</h1>
        <p>Select Login Type</p>

        <div className="toggle-buttons">
          <button
            className={!isAdmin ? "active" : ""}
            onClick={() => setIsAdmin(false)}
          >
            Team Login
          </button>

          <button
            className={isAdmin ? "active" : ""}
            onClick={() => setIsAdmin(true)}
          >
            Admin Login
          </button>
        </div>

        <div className="form">
          <input
            type="text"
            placeholder={isAdmin ? "Admin Username" : "Team ID"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder={isAdmin ? "Admin Password" : "Team PIN"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="login-btn" onClick={handleLogin}>
            {isAdmin ? "Login as Admin" : "Login as Team"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
