// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const registered = JSON.parse(localStorage.getItem("registeredUser"));

    if (!registered)
      return setError("No user registered — please create an account first.");

    if (phone.length !== 10) return setError("Enter a valid 10-digit mobile number.");
    if (phone !== registered.phone)
      return setError("This mobile number is not registered.");

    if (pin.length !== 6) return setError("Enter 6-digit UPI PIN.");
    if (pin !== registered.pin)
      return setError("❌ Incorrect PIN. Try again.");

    // 🔥 Add fake card + billing + transactions back (kept intact)
    const USER_WITH_FAKE_DB = {
      ...registered,
      cardLast4: "1122",
      creditLimit: 150000,
      availableCredit: 87000,
      bill: {
        amount: 12500,
        month: "February 2025"
      },
      transactions: [
        { date: "15 Feb", merchant: "Amazon", amount: 2499, type: "Shopping" },
        { date: "14 Feb", merchant: "Swiggy", amount: 480, type: "Food" },
        { date: "13 Feb", merchant: "Myntra", amount: 1699, type: "Shopping" },
        { date: "10 Feb", merchant: "Fuel Pump", amount: 2400, type: "Fuel" }
      ]
    };

    // Save user for chatbot
    sessionStorage.setItem("user", JSON.stringify(USER_WITH_FAKE_DB));

    setLoading(true);
    setTimeout(() => {
      navigate("/chat");
    }, 500);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">💳</div>
          <div>
            <h1 className="login-title">OneCard Assistant</h1>
            <p className="login-subtitle">Login securely with UPI PIN</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <label className="login-label">
            Mobile Number
            <div className="login-phone-row">
              <span className="login-phone-code">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="login-input"
                placeholder="9876543210"
              />
            </div>
          </label>

          <label className="login-label">
            6-digit UPI PIN
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="login-input"
              placeholder="••••••"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Verifying…" : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>Don’t have an account?</p>
          <button
            className="login-btn"
            style={{ marginTop: 10 }}
            onClick={() => navigate("/register")}
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}
