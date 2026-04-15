import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [audioFile, setAudioFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const API_BASE = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL;
    if (!base) console.warn("Missing API base URL");
    return (base || "http://localhost:5000").replace(/\/$/, "");
  }, []);
  const handleBankScan = async () => {
    try {
      if (!bankAccount.trim() || !selectedBank) {
        setError("Please enter your account number and select your bank.");
        return;
      }

      if (!/^\d+$/.test(bankAccount)) {
        setError("The account number must be a number.");
        return;
      }

      setLoading(true);

      const response = await fetch(`${API_BASE}/api/check-bank-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bank_name: selectedBank,
          account_number: bankAccount,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Account verification error.");
      }

      setResult(data);
    } finally {
      setLoading(false);
    }
  };
    const handleAudioScan = async () => {
      try {
        if (!audioFile) {
          setError("Please select an audio file.");
          return;
        }

        if (audioFile.size > 10 * 1024 * 1024) {
          setError("The file is too large (>10MB)");
          return;
        }

        const allowedTypes = [
          "audio/mpeg",
          "audio/wav",
          "audio/mp4",
          "audio/x-m4a"
        ];

        if (!allowedTypes.includes(audioFile.type)) {
          setError("Invalid file!");
          return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("audio", audioFile);

        const response = await fetch(`${API_BASE}/api/check-audio`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Audio test error!");
        }

        setResult(data);
      } finally {
        setLoading(false);
      }
    };
  const handleScan = async () => {
    setError("");
    setResult(null);

    try {
      if (activeTab === "text") {
        if (!textInput.trim()) {
          setError("Please enter the message content to check.");
          return;
        }

        setLoading(true);

        const response = await fetch(`${API_BASE}/api/detect-text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: textInput }),
        });
    
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Không thể kết nối đến máy chủ.",
          );
        }

        setResult(data);
        return;
      }

      if (activeTab === "phone") {
        if (!phoneInput.trim()) {
          setError("Please enter the phone number to check.");
          return;
        }

        setLoading(true);

        const response = await fetch(`${API_BASE}/api/detect-phone`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone: phoneInput }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Unable to connect to the server.",
          );
        }

        setResult(data);
        return;
      }

      if (activeTab === "bank") {
        await handleBankScan();
        return;
      }

      if (activeTab === "audio") {
        await handleAudioScan();
        return;
      }

      setError(
        "Only text message and phone number checks are supported right now.",
      );
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };




  const handleReportSender = () => {
    if (!result) return;

    const senderInfo = {
      type: activeTab,
      sender:
        activeTab === "phone"
          ? result.display_phone || result.input_phone || phoneInput
          : activeTab === "bank"
            ? bankAccount
            : "Unknown Sender",
      message:
        activeTab === "text"
          ? textInput
          : activeTab === "phone"
            ? `Phone number checked: ${result.display_phone || result.input_phone || phoneInput}`
            : result?.message || "",
      reportContent: {
        title: resultTitle,
        description: result.message || "",
        suspicious: result.matched_patterns || [],
        recommendation: result.recommendation || "",
        riskScore: result.risk_score ?? null,
        level: result.risk_level || "low",
      },
    };

    navigate("/scam-report", {
      state: senderInfo,
    });
  };

  const handleReset = () => {
    setTextInput("");
    setPhoneInput("");
    setBankAccount("");
    setAudioFile(null);
    if (document.getElementById("audioUpload")) {
      document.getElementById("audioUpload").value = "";
    }
    setError("");
    setResult(null);
    setSelectedBank("");
  };

  const riskLevel = (result?.risk_level || "low").toLowerCase();
  const isScam = Boolean(result?.is_scam);
  const isPhoneResult = result?.type === "phone";
  const isTextResult = result?.type === "text";
  const isInvalidPhone = isPhoneResult && result?.is_valid === false;

  const severity = isInvalidPhone
    ? "invalid"
    : riskLevel === "high"
      ? "high"
      : riskLevel === "medium"
        ? "medium"
        : "low";

  const severityStyles = {
    invalid: {
      card: "border-slate-500 bg-slate-100/90",
      ring: "border-slate-600",
      score: "text-slate-800",
      scoreLabel: "text-slate-600",
      badge: "bg-slate-800 text-white",
      icon: "block",
      title: "text-slate-900",
      message: "text-slate-700 font-medium",
      detailBox: "bg-slate-50 border-slate-300",
      detailLabel: "text-slate-700",
      detailText: "text-slate-900",
      tagBox: "bg-slate-100 border-slate-300 text-slate-800",
      tagIcon: "text-slate-700",
      recommendationBox: "bg-white/80 border-slate-300",
      recommendationTitle: "text-slate-900",
      recommendationText: "text-slate-800",
      metaText: "text-slate-700",
    },
    low: {
      card: "border-green-500 bg-green-500/10",
      ring: "border-green-600",
      score: "text-green-700",
      scoreLabel: "text-green-700",
      badge: "bg-green-100 text-green-700",
      icon: "verified",
      title: "text-green-700",
      message: "text-on-surface-variant",
      detailBox: "bg-green-50 border-green-200",
      detailLabel: "text-green-700",
      detailText: "text-green-900",
      tagBox: "bg-green-50 border-green-200 text-green-700",
      tagIcon: "text-green-700",
      recommendationBox: "bg-white/70 border-green-200",
      recommendationTitle: "text-primary",
      recommendationText: "text-on-surface",
      metaText: "text-slate-600",
    },
    medium: {
      card: "border-amber-500 bg-amber-50",
      ring: "border-amber-500",
      score: "text-amber-700",
      scoreLabel: "text-amber-700",
      badge: "bg-amber-100 text-amber-800",
      icon: "warning",
      title: "text-amber-800",
      message: "text-amber-950 font-medium",
      detailBox: "bg-amber-50 border-amber-300",
      detailLabel: "text-amber-700",
      detailText: "text-amber-950",
      tagBox: "bg-amber-50 border-amber-300 text-amber-800",
      tagIcon: "text-amber-700",
      recommendationBox: "bg-white/80 border-amber-300",
      recommendationTitle: "text-amber-800",
      recommendationText: "text-amber-950",
      metaText: "text-amber-800",
    },
    high: {
      card: "border-red-600 bg-red-50",
      ring: "border-red-600",
      score: "text-red-700",
      scoreLabel: "text-red-700",
      badge: "bg-red-100 text-red-700",
      icon: "warning",
      title: "text-red-800",
      message: "text-red-950 font-medium",
      detailBox: "bg-red-50 border-red-300",
      detailLabel: "text-red-700",
      detailText: "text-red-950",
      tagBox: "bg-red-50 border-red-200 text-red-700",
      tagIcon: "text-red-700",
      recommendationBox: "bg-white/80 border-red-300",
      recommendationTitle: "text-red-800",
      recommendationText: "text-red-950",
      metaText: "text-red-800",
    },
  };

  const currentSeverityStyle = severityStyles[severity];
  const severityLabel =
    severity === "invalid" ? "INVALID" : riskLevel.toUpperCase();

  const resultTitle = isPhoneResult
    ? !result.is_valid
      ? "Invalid phone number"
      : riskLevel === "high"
        ? "Warning: High-risk phone number!"
        : riskLevel === "medium"
          ? "Warning: Suspicious phone number!"
          : "Status: Low risk"
    : severity === "high"
      ? "Danger! Potential Fraud Alert."
      : severity === "medium"
        ? "Warning! Suspicious Content Detected."
        : "Analysis Completed";

  return (
    <div className="bg-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen text-on-surface">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm docked full-width top-0 sticky z-50">
        <nav className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-3xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <span className="text-2xl font-black text-blue-900 dark:text-blue-50 tracking-tight">
              Fraud Scanner AI
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            <Link
              className="font-['Public_Sans'] font-bold text-lg text-blue-900 dark:text-blue-400 border-b-4 border-blue-900 dark:border-blue-400 pb-2"
              to="/"
            >
              Scan Text
            </Link>
            <Link
              className="font-['Public_Sans'] font-bold text-lg text-slate-600 dark:text-slate-400 hover:text-blue-800 pb-2 transition-colors"
              to="/scam-report"
            >
              Report Scam
            </Link>
            <Link
              className="font-['Public_Sans'] font-bold text-lg text-slate-600 dark:text-slate-400 hover:text-blue-800 pb-2 transition-colors"
              to="/awareness"
            >
              Awareness Hub
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-blue-900 dark:text-blue-100">
              <span
                className="material-symbols-outlined text-2xl"
                data-icon="help"
              >
                help
              </span>
            </button>
            <button className="p-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-blue-900 dark:text-blue-100">
              <span
                className="material-symbols-outlined text-2xl"
                data-icon="settings"
              >
                settings
              </span>
            </button>
            <button
              onClick={() => (window.location.href = "/login")}
              className="p-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-blue-900 dark:text-blue-100"
            >
              <span
                className="material-symbols-outlined text-2xl"
                data-icon="person"
              >
                person
              </span>
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-screen-xl mx-auto px-8 py-12 md:py-20">
        <section className="mb-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-black text-on-surface mb-6 tracking-tight leading-tight">
              {activeTab === "phone"
                ? "Check Suspicious Phone Numbers"
                : "Check Suspicious Messages"}
            </h1>
            <p className="text-xl md:text-2xl text-on-surface-variant font-light leading-relaxed">
              {activeTab === "phone"
                ? "Enter a phone number below to check format validity, internal scam reports, and suspicious calling patterns."
                : "Choose an input type and paste details below to instantly check for scams with our Digital Concierge AI."}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-800 font-medium">
                <div className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    error
                  </span>
                  <p>{error}</p>
                </div>
              </div>
            )}
            <div className="mb-8">
              <label className="block text-sm font-bold text-primary mb-6 uppercase tracking-widest">
                Input Analysis Field
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <button
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all border-2 ${
                    activeTab === "text"
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline"
                  }`}
                  onClick={() => setActiveTab("text")}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    data-icon="chat"
                  >
                    chat
                  </span>
                  <span className="text-sm md:text-base">Text Message</span>
                </button>

                <button
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all border-2 ${
                    activeTab === "phone"
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline"
                  }`}
                  onClick={() => setActiveTab("phone")}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    data-icon="phone"
                  >
                    phone
                  </span>
                  <span className="text-sm md:text-base">Phone Number</span>
                </button>

                <button
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all border-2 ${
                    activeTab === "bank"
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline"
                  }`}
                  onClick={() => setActiveTab("bank")}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    data-icon="credit_card"
                  >
                    credit_card
                  </span>
                  <span className="text-sm md:text-base">Bank Account</span>
                </button>

                <button
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all border-2 ${
                    activeTab === "audio"
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline"
                  }`}
                  onClick={() => setActiveTab("audio")}
                >
                  <span
                    className="material-symbols-outlined text-2xl"
                    data-icon="mic"
                  >
                    mic
                  </span>
                  <span className="text-sm md:text-base">Audio Recording</span>
                </button>
              </div>

              {activeTab === "text" && (
                <div>
                  <textarea
                    className="w-full p-6 text-xl bg-surface-container-highest border-none rounded-xl focus:ring-4 focus:ring-primary-fixed outline-none transition-all placeholder:text-outline"
                    placeholder="Paste your message here..."
                    rows="8"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
              )}

              {activeTab === "phone" && (
                <div>
                  <input
                    className="w-full p-6 text-2xl bg-surface-container-highest border-none rounded-xl focus:ring-4 focus:ring-primary-fixed outline-none transition-all placeholder:text-outline font-bold"
                    placeholder="Enter phone number..."
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                  <p className="mt-4 text-on-surface-variant text-base">
                    We check for reported scam numbers and international
                    spoofing patterns.
                  </p>
                </div>
              )}

              {activeTab === "bank" && (
                <div>
                  <select
                    className="w-full p-4 mb-4 rounded-xl"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="">-- Select Bank --</option>
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="BIDV">BIDV</option>
                    <option value="MB Bank">MB Bank</option>
                  </select>

                  <input
                    className="w-full p-6 text-2xl bg-surface-container-highest border-none rounded-xl"
                    placeholder="Enter bank account number..."
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
              )}
  {activeTab === "audio" && (
    <div>
      <div
        className="w-full p-12 bg-surface-container-highest border-4 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-4 text-center group cursor-pointer hover:bg-surface-container-high transition-colors"
        onClick={() => document.getElementById("audioUpload").click()}
      >
        <span
          className="material-symbols-outlined text-6xl text-outline group-hover:text-primary transition-colors"
          data-icon="upload_file"
        >
          upload_file
        </span>
        <div>
          <p className="text-xl font-bold text-on-surface">
            Drag and drop audio file here
          </p>
          <p className="text-on-surface-variant mt-2">
            Supports .mp3, .wav, .m4a (Max 10MB)
          </p>
        </div>
      </div>

              {activeTab === "audio" && (
                <div>
                  <div className="w-full p-12 bg-surface-container-highest border-4 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-4 text-center group cursor-pointer hover:bg-surface-container-high transition-colors"
                  onClick={() => document.getElementById("audioUpload").click()}>
                    <span
                      className="material-symbols-outlined text-6xl text-outline group-hover:text-primary transition-colors"
                      data-icon="upload_file"
                    >
                      upload_file
                    </span>
                    <div>
                      <p className="text-xl font-bold text-on-surface">
                        Drag and drop audio file here
                      </p>
                      <p className="text-on-surface-variant mt-2">
                        Supports .mp3, .wav, .m4a (Max 10MB)
                      </p>
                      <input
                        type="file"
                        accept=".mp3,.wav,.m4a"
                        className="hidden"
                        id="audioUpload"
                        onChange={(e) =>
                          setAudioFile(e.target.files?.[0] || null)
                        }
                      />
                    </div>
                  </div>
                  {/* Hiển thị tên file → audioFile được sử dụng ở đây */}
                  {audioFile && (
                    <p className="mt-4 text-sm text-green-600 text-center">
                      Selected: <span className="font-medium">{audioFile.name}</span>
                    </p>
                  )}
                </div>
              )}

      {audioFile && (
        <p className="mt-4 text-sm text-green-600 text-center">
          Selected: <span className="font-medium">{audioFile.name}</span>
        </p>
      )}
    </div>
  )}

            <button
              onClick={handleScan}
              disabled={loading}
              className={`signature-gradient w-full py-6 rounded-xl flex items-center justify-center gap-4 text-on-primary text-2xl font-bold shadow-lg transform transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : "active:scale-95"
              }`}
            >
              <span
                className="material-symbols-outlined text-3xl"
                data-icon="security"
              >
                security
              </span>
              {loading
                ? "Scanning..."
                : activeTab === "phone"
                  ? "Check Phone Number"
                  : activeTab === "text"
                    ? "Scan Message"
                    : "Scan for Risk"}
            </button>
          </div>

          {/* Sidebar How it works */}
          <div className="lg:col-span-5 h-full">
            <aside className="sticky top-28">
              <div className="bg-surface-container-low rounded-2xl p-8 h-full flex flex-col justify-between shadow-lg border border-primary/10">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-6 text-center lg:text-left">
                    How it works
                  </h2>
                  <ul className="space-y-6">
                    <li className="flex gap-4 items-center">
                      <span className="bg-primary-fixed text-primary w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold">
                        1
                      </span>
                      <p className="text-lg text-on-surface-variant">
                        Our AI scans for known phishing patterns and linguistic
                        tricks used by fraudsters.
                      </p>
                    </li>
                    <li className="flex gap-4 items-center">
                      <span className="bg-primary-fixed text-primary w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold">
                        2
                      </span>
                      <p className="text-lg text-on-surface-variant">
                        We verify URLs and data against global databases of
                        malicious activity.
                      </p>
                    </li>
                    <li className="flex gap-4 items-center">
                      <span className="bg-primary-fixed text-primary w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold">
                        3
                      </span>
                      <p className="text-lg text-on-surface-variant">
                        You receive a clear safety rating and step-by-step
                        guidance.
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="mt-12 rounded-xl overflow-hidden shadow-inner">
                  <img
                    alt="close-up of hands holding a smartphone with safe checkmark"
                    className="w-full h-48 object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUBN4OwRx3EWG3_WyEUo9sXDEaO9GatDXkYcwBfqI1_gjs4TdFB65MbXl3-Bw7K62gNKwjYY6a9LkA5etFskk92yLiPGwCHTS_nrUSOjWBmGPODNelxsQfY7lrnQC-1Bk-JuTYBIyqKjDomnf6hC4DOLyKcjnx0yNOj8j1d3ANA-3S__fX-A-B2eDoNxPGjkjI9jX9i19qQoiJH8zMBgaK7MGnbQFAm9jvOa80jlS-raCzIZVNRqUxYD-RrxxW8VyystlFMxboWLo"
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>

        {result && (
          <section className="mt-20">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 flex-grow bg-surface-container-high"></div>
              <h2 className="text-3xl font-black text-on-surface px-4">
                Analysis Result
              </h2>
              <div className="h-1 flex-grow bg-surface-container-high"></div>
            </div>

            <div
              className={`rounded-3xl overflow-hidden shadow-lg border-2 ${currentSeverityStyle.card}`}
            >
              <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[12px] border-surface-container-high"></div>
                    <div
                      className={`absolute inset-0 rounded-full border-[12px] ${currentSeverityStyle.ring}`}
                      style={{
                        clipPath:
                          "polygon(50% 50%, -10% -10%, 110% -10%, 110% 50%)",
                        transform: "rotate(45deg)",
                      }}
                    ></div>
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-5xl font-black ${currentSeverityStyle.score}`}
                      >
                        {result.risk_score ?? "--"}
                      </span>
                      <span
                        className={`text-lg font-bold uppercase tracking-widest ${currentSeverityStyle.scoreLabel}`}
                      >
                        Risk Score
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-6 px-6 py-2 rounded-full font-bold flex items-center gap-2 ${currentSeverityStyle.badge}`}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      data-icon="warning"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {currentSeverityStyle.icon}
                    </span>
                    {severityLabel}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3
                    className={`text-3xl font-black mb-4 leading-tight ${currentSeverityStyle.title}`}
                  >
                    {resultTitle}
                  </h3>

                  <p
                    className={`text-xl mb-8 leading-relaxed ${currentSeverityStyle.message}`}
                  >
                    {result.message}
                  </p>
                  {result.input_text && (
                    <p className="text-sm mt-2">
                      <b>Transcript:</b> {result.input_text}
                    </p>
                  )}

                  {isTextResult && result.input_text && (
                    <div
                      className={`p-4 rounded-xl mb-5 border ${currentSeverityStyle.detailBox}`}
                    >
                      <p
                        className={`text-sm font-semibold uppercase mb-1 ${currentSeverityStyle.detailLabel}`}
                      >
                        Analyzed content:
                      </p>
                      <p
                        className={`italic ${currentSeverityStyle.detailText}`}
                      >
                        "{result.input_text}"
                      </p>
                    </div>
                  )}

                  {isPhoneResult && (
                    <div
                      className={`p-4 rounded-xl mb-5 border ${currentSeverityStyle.detailBox}`}
                    >
                      <p
                        className={`text-sm font-semibold uppercase mb-2 ${currentSeverityStyle.detailLabel}`}
                      >
                        Analyzed phone number
                      </p>

                      <div className="space-y-1">
                        <p className={currentSeverityStyle.detailText}>
                          <strong>Input:</strong> {result.input_phone || "--"}
                        </p>
                        <p className={currentSeverityStyle.detailText}>
                          <strong>Normalized:</strong>{" "}
                          {result.normalized_phone || "--"}
                        </p>
                        <p className={currentSeverityStyle.detailText}>
                          <strong>Display:</strong>{" "}
                          {result.display_phone || "--"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {Array.isArray(result.matched_patterns) &&
                      result.matched_patterns.length > 0 && (
                        <div>
                          <h4
                            className={`text-sm font-bold uppercase mb-3 tracking-widest ${currentSeverityStyle.scoreLabel}`}
                          >
                            Suspicious Elements Found
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {result.matched_patterns.map((item, index) => (
                              <span
                                key={`${item}-${index}`}
                                className={`px-4 py-2 rounded-lg font-medium text-lg flex items-center gap-2 border ${currentSeverityStyle.tagBox}`}
                              >
                                <span
                                  className={`material-symbols-outlined text-xl ${currentSeverityStyle.tagIcon}`}
                                >
                                  warning
                                </span>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    <div
                      className={`p-6 rounded-2xl border space-y-3 ${currentSeverityStyle.recommendationBox}`}
                    >
                      {result.recommendation && (
                        <>
                          <h4
                            className={`text-xl font-bold ${currentSeverityStyle.recommendationTitle}`}
                          >
                            Our Recommendation
                          </h4>
                          <p
                            className={`text-lg leading-relaxed ${currentSeverityStyle.recommendationText}`}
                          >
                            {result.recommendation}
                          </p>
                        </>
                      )}

                      {result.note && (
                        <p
                          className={`text-lg leading-relaxed ${currentSeverityStyle.recommendationText}`}
                        >
                          <strong>Note:</strong> {result.note}
                        </p>
                      )}

                      <div
                        className={`flex flex-wrap gap-x-6 gap-y-2 text-sm ${currentSeverityStyle.metaText}`}
                      >
                        {result.engine && (
                          <span>
                            <strong>Engine:</strong> {result.engine}
                          </span>
                        )}
                        {result.rule_score != null && (
                          <span>
                            <strong>Rule score:</strong> {result.rule_score}
                          </span>
                        )}
                        {!isPhoneResult && result.ml_probability != null && (
                          <span>
                            <strong>ML probability:</strong>{" "}
                            {Math.round(result.ml_probability * 100)}%
                          </span>
                        )}
                        {!isPhoneResult && result.ml_prediction != null && (
                          <span>
                            <strong>ML prediction:</strong>{" "}
                            {result.ml_prediction}
                          </span>
                        )}
                        {isPhoneResult && result.report_count != null && (
                          <span>
                            <strong>Report count:</strong> {result.report_count}
                          </span>
                        )}
                      </div>

                      {result.warning && (
                        <div
                          className={`rounded-xl border p-4 ${currentSeverityStyle.detailBox} ${currentSeverityStyle.detailText}`}
                        >
                          {result.warning}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    {isScam && (
                      <button
                        onClick={handleReportSender}
                        className={`flex-1 border-2 py-4 px-8 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-3 ${
                          severity === "high"
                            ? "border-red-600 text-red-700 hover:bg-red-100"
                            : severity === "medium"
                              ? "border-amber-500 text-amber-700 hover:bg-amber-100"
                              : "border-slate-500 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span
                          className="material-symbols-outlined"
                          data-icon="report"
                        >
                          report
                        </span>
                        {isPhoneResult
                          ? "Report this phone number"
                          : "Report this sender"}
                      </button>
                    )}

                    <button
                      onClick={handleReset}
                      className="flex-1 bg-surface-container-high text-on-surface-variant py-4 px-8 rounded-xl font-bold text-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-3"
                    >
                      <span
                        className="material-symbols-outlined"
                        data-icon="refresh"
                      >
                        refresh
                      </span>
                      {isPhoneResult
                        ? "Check another phone number"
                        : "Scan another message"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-24 mb-12">
          <div className="bg-primary-container text-on-primary rounded-xl p-12 relative overflow-hidden">
            <div className="relative z-10 md:flex items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl font-black mb-4">
                  Not sure what to do?
                </h2>
                <p className="text-xl text-on-primary-container opacity-90 leading-relaxed">
                  Our awareness hub is filled with easy-to-understand guides on
                  how to spot scammers and protect your identity.
                </p>
              </div>
              <Link
                to="/awareness"
                className="mt-8 md:mt-0 bg-white text-primary px-10 py-5 rounded-xl font-black text-xl shadow-xl hover:scale-105 transition-transform inline-block text-center"
              >
                Explore Safety Guides
              </Link>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </section>
        </div>
      </main>

      <footer className="bg-slate-100 dark:bg-slate-950 w-full py-12 px-8 mt-20">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Fraud Scanner AI
            </span>
            <p className="font-['Lexend'] text-lg font-normal text-slate-600 dark:text-slate-400">
              © 2024 Fraud Scanner AI. Your digital concierge for a safer web.
            </p>
          </div>
          <div className="flex gap-8">
            <a
              className="font-['Lexend'] text-lg font-normal text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-200 transition-all opacity-80 hover:opacity-100"
              href="#"
            >
              Safety Guides
            </a>
            <a
              className="font-['Lexend'] text-lg font-normal text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-200 transition-all opacity-80 hover:opacity-100"
              href="#"
            >
              Support
            </a>
            <a
              className="font-['Lexend'] text-lg font-normal text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-200 transition-all opacity-80 hover:opacity-100"
              href="#"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
