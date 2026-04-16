import { Link, useLocation } from "react-router-dom";

export default function Header() {
    const location = useLocation(); // lấy đường dẫn hiện tại

    const isActive = (path) => location.pathname === path;

    const baseClass =
        "font-['Public_Sans'] font-bold text-lg pb-2 transition-colors";
  return (
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
                        to="/"
                        className={`${baseClass} ${
                        isActive("/")
                            ? "text-blue-600 dark:text-blue-400 border-b-4 border-blue-600"
                            : "text-slate-600 dark:text-slate-400 hover:text-blue-800"
                        }`}
                    >
                      Risk Scan
                    </Link>
                    <Link
                        to="/scam-report"
                        className={`${baseClass} ${
                        isActive("/scam-report")
                            ? "text-blue-600 dark:text-blue-400 border-b-4 border-blue-600"
                            : "text-slate-600 dark:text-slate-400 hover:text-blue-800"
                        }`}
                    >
                      Report Scam
                    </Link>
                    <Link
                        to="/awareness"
                        className={`${baseClass} ${
                        isActive("/awareness")
                            ? "text-blue-600 dark:text-blue-400 border-b-4 border-blue-600"
                            : "text-slate-600 dark:text-slate-400 hover:text-blue-800"
                        }`}
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
  );
}