import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; // same styling as login page

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Enter full name.");
    if (phone.length !== 10) return setError("Enter valid 10-digit mobile no.");
    if (!email.includes("@") || !email.includes(".")) return setError("Enter valid email.");
    if (pin.length !== 6) return setError("Create 6-digit UPI PIN.");
    if (cardLast4.length !== 4) return setError("Enter last 4 digits of card.");

    const newUser = {
      name,
      phone,
      email,
      pin,
      cardLast4,
      creditLimit: 150000,
      availableCredit: 87000,
      bill: { amount: 12500, month: "February 2025" },
      transactions: [
        { date: "15 Feb", merchant: "Amazon", amount: 2499, type: "Shopping" },
        { date: "14 Feb", merchant: "Swiggy", amount: 480, type: "Food" },
        { date: "13 Feb", merchant: "Myntra", amount: 1699, type: "Shopping" },
        { date: "10 Feb", merchant: "Fuel Pump", amount: 2400, type: "Fuel" }
      ]
    };

    // Save to browser (temporary database)
    localStorage.setItem("registeredUser", JSON.stringify(newUser));

    setLoading(true);
    setTimeout(() => {
      navigate("/login"); // after signup go to login
    }, 700);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">📝</div>
          <div>
            <h1 className="login-title">OneCard Registration</h1>
            <p className="login-subtitle">Create your secure account</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="login-form">

          <label className="login-label">
            Full Name
            <input
              type="text"
              className="login-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </label>

          <label className="login-label">
            Mobile Number
            <div className="login-phone-row">
              <span className="login-phone-code">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="login-input"
                placeholder="9876543210"
              />
            </div>
          </label>

          <label className="login-label">
            Email ID
            <input
              type="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
            />
          </label>

          <label className="login-label">
            Create 6-digit UPI PIN
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="login-input"
              placeholder="••••••"
            />
          </label>

          <label className="login-label">
            Last 4 digits of your OneCard
            <input
              type="tel"
              maxLength={4}
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="login-input"
              placeholder="1234"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" disabled={loading}>
            {loading ? "Creating Account…" : "Register"}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-demo-note">Already have an account?</p>
          <button className="login-btn" style={{ marginTop: 10 }} onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
