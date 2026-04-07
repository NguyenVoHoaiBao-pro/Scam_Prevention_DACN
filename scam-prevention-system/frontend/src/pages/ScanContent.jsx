import { useState } from "react";
import "../styles.css";

export default function ScanContent() {
  // Quản lý trạng thái
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Hàm gọi API xử lý quét văn bản
  const handleScan = async () => {
    if (!text.trim()) {
      setError("Vui lòng nhập nội dung cần quét!");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/detect-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok)
        throw new Error("Không thể kết nối đến máy chủ quét AI.");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen flex flex-col">
      {/* TopNavBar */}
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
              onClick={() => (window.location.href = "/")}
            >
              Fraud Scanner AI
            </div>
          </div>
          <div className="hidden md:flex items-center gap-12">
            <a
              className="text-blue-800 dark:text-blue-300 font-bold border-b-4 border-blue-800 dark:border-blue-300 pb-1 uppercase tracking-wide text-sm"
              href="/scan"
            >
              Scan Content
            </a>
            <a
              className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-200 transition-colors uppercase tracking-wide text-sm"
              href="/report"
            >
              Report Scam
            </a>
            <a
              className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-200 transition-colors uppercase tracking-wide text-sm"
              href="/awareness"
            >
              Awareness Hub
            </a>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-slate-600 dark:text-slate-400 hover:text-blue-900 transition-colors">
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

      {/* Main Content */}
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

        {/* Khu vực nhập liệu */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-lg border border-outline-variant/30 mb-8">
          <textarea
            className="w-full h-48 p-6 bg-surface-container-highest border-none rounded-2xl text-on-surface text-lg md:text-xl font-medium focus:ring-4 focus:ring-primary/20 resize-none transition-all placeholder:text-on-surface-variant/50"
            placeholder="Dán tin nhắn, SMS, đường link hoặc email đáng ngờ vào đây..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          {error && (
            <p className="text-error mt-4 font-bold animate-pulse">{error}</p>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleScan}
              disabled={loading}
              className={`btn-gradient py-4 px-10 rounded-2xl text-white font-bold text-xl flex items-center gap-3 shadow-md transition-all ${loading ? "opacity-70 cursor-not-allowed" : "hover:brightness-110 active:scale-95"}`}
            >
              <span
                className={`material-symbols-outlined ${loading ? "animate-spin" : ""}`}
                data-icon={loading ? "autorenew" : "document_scanner"}
              >
                {loading ? "autorenew" : "document_scanner"}
              </span>
              {loading ? "Đang phân tích..." : "Bắt đầu quét"}
            </button>
          </div>
        </div>

        {/* Khu vực hiển thị kết quả */}
        {result && (
          <div
            className={`rounded-3xl p-8 md:p-10 shadow-lg border-2 transition-all animate-fade-in ${result.is_scam ? "border-error bg-error-container/10" : "border-green-500 bg-green-500/10"}`}
          >
            <div className="flex items-start gap-6">
              <span
                className={`material-symbols-outlined text-5xl md:text-6xl ${result.is_scam ? "text-error" : "text-green-500"}`}
                data-icon={result.is_scam ? "dangerous" : "verified_user"}
              >
                {result.is_scam ? "dangerous" : "verified_user"}
              </span>
              <div>
                <h3
                  className={`text-2xl md:text-3xl font-extrabold uppercase tracking-tight mb-2 ${result.is_scam ? "text-error" : "text-green-600"}`}
                >
                  {result.is_scam
                    ? "Cảnh báo: Phát hiện Lừa đảo!"
                    : "Trạng thái: An toàn"}
                </h3>
                <p className="text-on-surface text-lg leading-relaxed mb-4">
                  <strong className="font-bold">Nhận định của AI:</strong>{" "}
                  {result.message}
                </p>
                {result.is_scam && (
                  <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl">
                    <p className="text-sm font-semibold text-amber-700 uppercase mb-1">
                      Đoạn văn bản bị tình nghi:
                    </p>
                    <p className="italic text-amber-900">
                      "{result.input_text}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
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
