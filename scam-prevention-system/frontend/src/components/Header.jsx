import { Link, useLocation } from "react-router-dom";

import { useState} from "react";
export default function Header() {
    const location = useLocation(); // lấy đường dẫn hiện tại

    const isActive = (path) => location.pathname === path;

    const baseClass =
        "font-['Public_Sans'] font-bold text-lg pb-2 transition-colors";
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
});
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
                <div className="relative">
                {user ? (
                    <>
                    {/* Avatar + username */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                    >
                        <img
                        src={`https://ui-avatars.com/api/?name=${user.username}`}
                        alt="avatar"
                        className="w-8 h-8 rounded-full"
                        />
                        <span className="font-semibold text-sm text-blue-900 dark:text-white">
                        {user.username}
                        </span>
                    </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden z-50">
                    <button
                        onClick={() => {
                        localStorage.removeItem("authUser");
                        setUser(null);
                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    Logout
                                </button>
                                </div>
                            )}
                            </>
                        ) : (
                            <button
                            onClick={() => (window.location.href = "/login")}
                            className="p-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-blue-900 dark:text-blue-100"
                            >
                            <span className="material-symbols-outlined text-2xl">
                                person
                            </span>
                            </button>
                        )}
                </div>
                </div>
            </nav>
     </header>
  );
}