import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function ScanContent() {
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [reportStatus, setReportStatus] = useState("idle");

  const apiBaseUrl = useMemo(
    () =>
      (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(
        /\/$/,
        "",
      ),
    [],
  );

  const handleScan = async () => {
    if (!text.trim()) {
      setError("Vui lòng nhập nội dung cần quét!");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setReportStatus("idle");

    try {
      const response = await fetch(`${apiBaseUrl}/api/detect-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Không thể kết nối đến máy chủ quét AI.",
        );
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi không xác định.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReport = async () => {
    if (!result) return;

    setReportStatus("reporting");

    try {
      const response = await fetch(`${apiBaseUrl}/api/warnings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: result.input_text || text,
          content: result.message || "",
          risk_level: result.risk_level || (result.is_scam ? "high" : "low"),
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi gửi báo cáo");
      }

      setReportStatus("success");

      setTimeout(() => {
        navigate("/scam-report");
      }, 1200);
    } catch (err) {
      alert("Lỗi khi gửi báo cáo: " + (err.message || "Unknown error"));
      setReportStatus("idle");
    }
  };

  const levelStyles = {
    high: "bg-red-100 text-red-700 border border-red-200",
    medium: "bg-amber-100 text-amber-700 border border-amber-200",
    low: "bg-green-100 text-green-700 border border-green-200",
  };

  const currentLevel = result?.risk_level?.toLowerCase?.() || "low";

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen flex flex-col">
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto h-20">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-blue-900 dark:text-blue-100 text-3xl"
              data-icon="shield"
            >
              shield
            </span>
            <div
              className="text-3xl font-extrabold tracking-tight text-primary cursor-pointer"
              onClick={() => navigate("/")}
            >
              Fraud Scanner AI
            </div>
          </div>

          <div className="hidden md:flex items-center gap-12">
            <button
              className="text-blue-800 dark:text-blue-300 font-bold border-b-4 border-blue-800 dark:border-blue-300 pb-1 uppercase tracking-wide text-sm"
              onClick={() => navigate("/scan")}
            >
              Scan Content
            </button>
            <button
              className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-200 transition-colors uppercase tracking-wide text-sm"
              onClick={() => navigate("/scam-report")}
            >
              Report Scam
            </button>
            <a
              className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-200 transition-colors uppercase tracking-wide text-sm"
              href="/awareness"
            >
              Awareness Hub
            </a>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => (window.location.href = "/login")}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-900 transition-colors"
            >
              <span
                className="material-symbols-outlined text-3xl"
                data-icon="account_circle"
              >
                account_circle
              </span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4 leading-tight font-headline">
            Instant AI Threat Scanner
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed">
            Nghi ngờ một tin nhắn, email hoặc đường link? Hãy dán nó vào bên
            dưới để hệ thống AI của chúng tôi phân tích rủi ro ngay lập tức.
          </p>
        </header>

        <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-lg border border-outline-variant/30 mb-8">
          <textarea
            className="w-full h-48 p-6 bg-surface-container-highest border-none rounded-2xl text-on-surface text-lg md:text-xl font-medium focus:ring-4 focus:ring-primary/20 resize-none transition-all placeholder:text-on-surface-variant/50"
            placeholder="Dán tin nhắn, SMS, đường link hoặc email đáng ngờ vào đây..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleScan}
              disabled={loading}
              className={`btn-gradient py-4 px-10 rounded-2xl text-white font-bold text-xl flex items-center gap-3 shadow-md transition-all ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:brightness-110 active:scale-95"
              }`}
            >
              <span
                className={`material-symbols-outlined ${
                  loading ? "animate-spin" : ""
                }`}
                data-icon={loading ? "autorenew" : "document_scanner"}
              >
                {loading ? "autorenew" : "document_scanner"}
              </span>
              {loading ? "Đang phân tích..." : "Bắt đầu quét"}
            </button>
          </div>
        </div>

        {result && (
          <div
            className={`rounded-3xl p-8 md:p-10 shadow-lg border-2 transition-all animate-fade-in ${
              result.is_scam
                ? "border-error bg-error-container/10"
                : "border-green-500 bg-green-500/10"
            }`}
          >
            <div className="flex items-start gap-6">
              <span
                className={`material-symbols-outlined text-5xl md:text-6xl ${
                  result.is_scam ? "text-error" : "text-green-500"
                }`}
                data-icon={result.is_scam ? "dangerous" : "verified_user"}
              >
                {result.is_scam ? "dangerous" : "verified_user"}
              </span>

              <div className="w-full">
                <h3
                  className={`text-2xl md:text-3xl font-extrabold uppercase tracking-tight mb-3 ${
                    result.is_scam ? "text-error" : "text-green-600"
                  }`}
                >
                  {result.is_scam
                    ? "Cảnh báo: Phát hiện Lừa đảo!"
                    : "Trạng thái: An toàn"}
                </h3>

                <p className="text-on-surface text-lg leading-relaxed mb-5">
                  <strong className="font-bold">Nhận định của AI:</strong>{" "}
                  {result.message}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <div className="bg-white/70 rounded-2xl p-4 border border-slate-200">
                    <p className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-1">
                      Risk Score
                    </p>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {result.risk_score ?? "--"}/100
                    </p>
                  </div>

                  <div className="bg-white/70 rounded-2xl p-4 border border-slate-200">
                    <p className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2">
                      Risk Level
                    </p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                        levelStyles[currentLevel] || levelStyles.low
                      }`}
                    >
                      {(result.risk_level || "low").toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-white/70 rounded-2xl p-4 border border-slate-200">
                    <p className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-1">
                      ML Probability
                    </p>
                    <p className="text-2xl font-extrabold text-slate-900">
                      {result.ml_probability != null
                        ? `${Math.round(result.ml_probability * 100)}%`
                        : "--"}
                    </p>
                  </div>
                </div>

                {result.input_text && (
                  <div
                    className={`p-4 rounded-xl mb-5 border ${
                      result.is_scam
                        ? "bg-amber-50 border-amber-300"
                        : "bg-green-50 border-green-200"
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold uppercase mb-1 ${
                        result.is_scam ? "text-amber-700" : "text-green-700"
                      }`}
                    >
                      Nội dung được phân tích:
                    </p>
                    <p
                      className={`italic ${
                        result.is_scam ? "text-amber-900" : "text-green-900"
                      }`}
                    >
                      "{result.input_text}"
                    </p>
                  </div>
                )}

                {Array.isArray(result.matched_patterns) &&
                  result.matched_patterns.length > 0 && (
                    <div className="mb-5">
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Dấu hiệu phát hiện
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.matched_patterns.map((pattern) => (
                          <span
                            key={pattern}
                            className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {(result.recommendation ||
                  result.engine ||
                  result.rule_score != null) && (
                  <div className="bg-white/70 rounded-2xl p-5 border border-slate-200 space-y-3">
                    {result.recommendation && (
                      <p className="text-on-surface leading-relaxed">
                        <strong>Khuyến nghị:</strong> {result.recommendation}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
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
                      {result.ml_prediction != null && (
                        <span>
                          <strong>ML prediction:</strong> {result.ml_prediction}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {result.warning && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    {result.warning}
                  </div>
                )}

                {result.is_scam && (
                  <div className="mt-6 pt-6 border-t border-error/20 flex flex-col items-end">
                    {reportStatus === "success" ? (
                      <p className="text-green-600 font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined">
                          check_circle
                        </span>
                        Gửi báo cáo thành công! Đang chuyển trang...
                      </p>
                    ) : (
                      <button
                        onClick={handleSendReport}
                        disabled={reportStatus === "reporting"}
                        className="bg-error text-white py-3 px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-error/90 active:scale-95 transition-all shadow-md"
                      >
                        <span className="material-symbols-outlined">
                          campaign
                        </span>
                        {reportStatus === "reporting"
                          ? "Đang gửi..."
                          : "Đóng góp cảnh báo này cho cộng đồng"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-100 dark:bg-slate-950 w-full py-8 px-12 mt-auto border-t border-outline-variant/30">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 font-body">
            © 2026 The Guardian's Lens. Your Digital Concierge.
          </p>
        </div>
      </footer>
    </div>
  );
}