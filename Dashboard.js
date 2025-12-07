import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard({ onClose }) {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const transactions = user?.transactions || [];

  // ----------------- CATEGORY AUTOMATION -----------------
  const categorize = (merchant) => {
    merchant = merchant.toLowerCase();
    if (["swiggy", "zomato", "kfc", "dominos"].some(m => merchant.includes(m))) return "Food";
    if (["amazon", "flipkart", "myntra", "ajio"].some(m => merchant.includes(m))) return "Shopping";
    if (["uber", "ola", "rapido"].some(m => merchant.includes(m))) return "Travel";
    if (["hp", "shell", "petrol", "bp"].some(m => merchant.includes(m))) return "Fuel";
    return "Others";
  };

  // Auto assign category to each transaction
  const categoryTotals = {};
  transactions.forEach((t) => {
    const category = categorize(t.merchant);
    categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
  });

  const totalMonthlySpend = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // AI spending insight
  const highestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0];
  const insight = `⚠ You are spending the most on ${highestCategory}. Consider reducing your spending next month.`;

  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ["#4f46e5", "#06b6d4", "#22c55e", "#f43f5e", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="dash-overlay">
      <div className="dash-card">
        <h2>📊 Spending Analytics</h2>

        <Pie data={data} />

        <div className="dash-legend">
          {Object.entries(categoryTotals).map(([category, amt]) => (
            <p key={category}>
              <strong>{category}</strong>
              <span> ₹{amt.toLocaleString()}</span>
            </p>
          ))}
        </div>

        <p className="dash-insight">{insight}</p>

        <h3 className="total">
          💰 Total Spend This Month: ₹{totalMonthlySpend.toLocaleString()}
        </h3>

        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
