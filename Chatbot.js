// src/pages/Chatbot.js
import React, { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { pdf } from "@react-pdf/renderer";
import StatementPDF from "../components/StatementPDF";
import Dashboard from "../components/Dashboard";
import "./Chatbot.css";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello 👋 I’m your OneCard Assistant. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isCardBlocked, setIsCardBlocked] = useState(false);

  const [lastIntent, setLastIntent] = useState(null);
  const [blockStep, setBlockStep] = useState(null);
  const [blockReason, setBlockReason] = useState("");

  /** 🔊 TTS toggle */
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const bottomRef = useRef(null);

  // 🎤 NEW: media recorder refs (audio → backend)
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** 🔊 TTS — updated with protection */
  const speak = (text) => {
    if (!ttsEnabled || !text) return;
    window.speechSynthesis.cancel(); // stop leftovers
    const filtered = text.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF•]/gu, "");
    const msg = new SpeechSynthesisUtterance(filtered);
    msg.lang = "en-IN";
    msg.rate = 1;
    window.speechSynthesis.speak(msg);
  };

  /** 🎤 Voice input using MediaRecorder + backend /speech-to-text */
  const startVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      setIsRecording(true);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("file", blob, "speech.webm");

        try {
          const res = await fetch("http://localhost:8000/speech-to-text", {
            method: "POST",
            body: form,
          });
          const data = await res.json();
          console.log("STT response:", data);
          if (data.text) {
            setInput(data.text);
            setTimeout(() => sendMessage(data.text), 200);
          } else if (data.error) {
            finish("⚠ Voice service error, please try again.");
          }
        } catch (err) {
          console.error("STT error:", err);
        } finally {
          stream.getTracks().forEach((t) => t.stop());
        }
      };

      recorder.start();

      // auto-stop after 6 seconds (or replace with a Stop button if preferred)
      setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, 6000);
    } catch (err) {
      console.error("Mic error:", err);
      setIsRecording(false);
      finish("⚠ Microphone access denied.");
    }
  };

  const finish = (reply) => {
    setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    speak(reply);
    setIsStreaming(false);
  };

  const closeQR = () => {
    setShowQR(false);
    setQrValue("");
  };

  /** Small talk detection */
  const detectSmallTalk = (msg) => {
    if (/^(hi|hello|hey|namaste)/.test(msg)) return "greeting";
    if (/(thank|thanks)/.test(msg)) return "thanks";
    if (/(what can you do|help|features)/.test(msg)) return "capability";
    return null;
  };

  /** MAIN MESSAGE HANDLER */
  const sendMessage = async (forcedText) => {
    const text = (forcedText ?? input).trim();
    if (!text) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setIsStreaming(true);

    const user = JSON.parse(sessionStorage.getItem("user"));
    if (!user) {
      finish("Session expired. Please login again.");
      return;
    }

    const msg = text.toLowerCase();

    /** Small talk */
    const talk = detectSmallTalk(msg);
    if (talk === "greeting") {
      finish(
        "Hi! 👋 I can help you check balance, statements, transactions, bill payments, spending analytics & block/track your card."
      );
      setLastIntent(null);
      return;
    }
    if (talk === "thanks") {
      finish("You're welcome 😊 Anything else I can assist with?");
      setLastIntent(null);
      return;
    }
    if (talk === "capability") {
      finish(
        "I assist with:\n• Balance\n• Transactions\n• Statements\n• Bill payment\n• Spending analytics\n• Track card\n• Block card"
      );
      setLastIntent(null);
      return;
    }

    /** Pay Bill follow-ups */
    if (
      ["yes", "sure", "okay", "ok"].includes(msg) &&
      lastIntent === "pay-bill-intent"
    ) {
      const { amount } = user.bill;
      const upi = `upi://pay?pa=demo@upi&pn=OneCard&am=${amount}&cu=INR`;
      setQrValue(upi);
      setShowQR(true);
      finish("Generating QR code 🔄 Scan using your UPI app to complete payment.");
      setLastIntent("qr-shown");
      return;
    }

    if (["no", "later"].includes(msg) && lastIntent === "pay-bill-intent") {
      finish("No problem, pay anytime by saying **Pay Bill**.");
      setLastIntent(null);
      return;
    }

    if (
      ["done", "paid"].some((w) => msg.includes(w)) &&
      lastIntent === "qr-shown"
    ) {
      closeQR();
      finish("Payment acknowledged 💳 If it doesn't reflect, wait 2–3 minutes.");
      user.bill.amount = 0;
      sessionStorage.setItem("user", JSON.stringify(user));
      setLastIntent(null);
      return;
    }

    /** Pay Bill – first stage */
    if (msg.includes("pay bill") || msg.includes("bill")) {
      const { amount, month } = user.bill;
      if (!amount || amount <= 0) {
        finish("🎉 No outstanding bill. You're all clear!");
        return;
      }
      finish(
        `🧾 Pending bill: ₹${amount.toLocaleString()} for ${month}.\nShall I generate QR for payment?`
      );
      setLastIntent("pay-bill-intent");
      return;
    }

    /** Balance */
    if (msg.includes("balance")) {
      const { creditLimit, availableCredit, bill } = user;
      const used = creditLimit - availableCredit;
      finish(
        `💳 Credit Limit: ₹${creditLimit}\n📉 Used: ₹${used}\n🟢 Available: ₹${availableCredit}\n🧾 Bill due: ₹${bill.amount}`
      );
      return;
    }

    /** Transactions */
    if (msg.includes("transactions") || msg.includes("history")) {
      const tx = user.transactions
        .map((t) => `📅 ${t.date} — ${t.merchant} — ₹${t.amount}`)
        .join("\n");
      finish(`Here are your recent transactions:\n\n${tx}`);
      return;
    }

    /** Download Statement */
    if (msg.includes("statement")) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "📄 Statement ready.\nTap below to download." },
        { from: "bot", text: "⬇ Download Statement PDF", action: "downloadPdf" },
      ]);
      speak("Your statement is ready for download");
      setIsStreaming(false);
      return;
    }

    /** Analytics Dashboard */
    if (msg.includes("analytics") || msg.includes("spending")) {
      finish("📊 Opening spending analytics dashboard…");
      setShowDashboard(true);
      return;
    }

    /** Track Card */
    if (msg.includes("track card")) {
      finish(
        "🔎 Card in transit via BlueDart.\nTracking ID: ONE123456789\nExpected delivery: 2–3 days."
      );
      return;
    }

    /** Block Card */
    if (msg.includes("block card")) {
      if (isCardBlocked) {
        finish("🚫 Your card is already blocked.");
        return;
      }
      finish("Tell me the reason: Lost, Stolen, or Other?");
      setBlockStep("reason");
      return;
    }

    if (blockStep === "reason") {
      setBlockReason(msg);
      finish("Do you want to permanently block & issue replacement? (yes/no)");
      setBlockStep("confirm");
      return;
    }

    if (blockStep === "confirm" && msg === "yes") {
      setIsCardBlocked(true);
      finish("🔒 Card blocked successfully.\nReplacement will arrive in 5 days.");
      setBlockStep(null);
      return;
    }

    /** Fallback → send to backend if running */
    try {
      const response = await fetch("http://localhost:8000/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value);

        setMessages((prev) => [
          ...prev.filter((m) => m.from !== "bot-stream"),
          { from: "bot-stream", text: buffer },
        ]);
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.from !== "bot-stream"),
        { from: "bot", text: buffer },
      ]);
      speak(buffer);
    } catch {
      finish("⚠ Server unavailable. Try again later.");
    }
  };

  /** Handle click → Download PDF */
  const handleBotClick = async (msg) => {
    if (msg.action === "downloadPdf") {
      const user = JSON.parse(sessionStorage.getItem("user"));
      const blob = await pdf(<StatementPDF user={user} />).toBlob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Statement.pdf";
      link.click();
    }
  };

  /** Show saved chat history */
  const showHistory = () => {
    const old = JSON.parse(localStorage.getItem("history") || "[]");
    if (!old.length) return alert("No saved history available.");
    setMessages(old);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="logo">💳</div>
        <div>
          <h2>OneCard Assistant</h2>
          <span className="online">AI-Powered • Online</span>
        </div>

        {/* 🔊 TTS with immediate stop fix */}
        <button
          className="tts-toggle"
          onClick={() =>
            setTtsEnabled((v) => {
              const newVal = !v;
              if (!newVal) window.speechSynthesis.cancel(); // stop immediately
              return newVal;
            })
          }
        >
          {ttsEnabled ? "🔊 Voice On" : "🔈 Voice Off"}
        </button>

        <button className="history-btn" onClick={showHistory}>
          History
        </button>
      </div>

      {/* Quick buttons */}
      <div className="quick-actions">
        {[
          "Check Balance",
          "Recent Transactions",
          "Download Statement",
          "Spending Analytics",
          "Track Card",
          "Block Card",
          "Pay Bill",
        ].map((txt, i) => (
          <button key={i} className="qa-btn" onClick={() => sendMessage(txt)}>
            {txt}
          </button>
        ))}
      </div>

      {/* Chat Window */}
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`msg ${msg.from}`}
            onClick={() => handleBotClick(msg)}
            style={{ cursor: msg.action ? "pointer" : "default" }}
          >
            {msg.text}
          </div>
        ))}

        {showQR && (
          <div className="qr-container">
            <div className="qr-header">
              <strong>Scan to Pay</strong>
              <button className="qr-close-btn" onClick={closeQR}>
                ✕
              </button>
            </div>
            <QRCode value={qrValue} size={180} />
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Input section */}
      <div className="input-section">
        <input
          type="text"
          placeholder="Type your message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button
          className={`mic-btn ${isRecording ? "recording" : ""}`}
          onClick={startVoiceInput}
        >
          🎤
        </button>

        <button
          className="send-btn"
          disabled={isStreaming}
          onClick={() => sendMessage()}
        >
          Send
        </button>
      </div>

      {showDashboard && <Dashboard onClose={() => setShowDashboard(false)} />}
    </div>
  );
}
