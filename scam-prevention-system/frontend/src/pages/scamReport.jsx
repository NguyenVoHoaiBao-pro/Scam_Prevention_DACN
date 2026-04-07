import { useState, useEffect } from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';

export default function CommunityScamReport() {
    const navigate = useNavigate();
    // 1. Quản lý State
    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedItems, setLikedItems] = useState({}); // Trạng thái lưu các bài viết đã bấm "Helpful"

    // 2. Fetch API dữ liệu từ Backend
    useEffect(() => {
        const fetchWarnings = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/warnings');
                if (!response.ok) throw new Error('Lỗi khi kết nối đến máy chủ');

                const result = await response.json();
                if (result.status === 'success') {
                    setWarnings(result.data);
                } else {
                    throw new Error(result.message);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWarnings();
    }, []);

    // 3. Hàm xử lý khi bấm nút "Helpful"
    const handleToggleLike = (id) => {
        setLikedItems(prev => ({
            ...prev,
            [id]: !prev[id] // Đảo ngược trạng thái like của ID tương ứng
        }));
        // Mở rộng sau: Gọi API lên backend để update số like vào Database
    };

    // 4. Hàm xử lý nút Scan Your Message
    const handleGoToScan = () => {
        navigate('/scan');
    };

    return (
        <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
                <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto h-20">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-900 dark:text-blue-100 text-3xl" data-icon="shield">shield</span>
                        <div className="text-3xl font-extrabold tracking-tight text-primary">
                            Fraud Scanner AI
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-12">
                        <a className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-200 transition-colors uppercase tracking-wide text-sm" href="/scan">Scan Content</a>
                        <a className="text-blue-800 dark:text-blue-300 font-bold border-b-4 border-blue-800 dark:border-blue-300 pb-1 uppercase tracking-wide text-sm" href="/report">Report Scam</a>
                        <a className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-200 transition-colors uppercase tracking-wide text-sm" href="/awareness">Awareness Hub</a>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="text-slate-600 dark:text-slate-400 hover:text-blue-900 transition-colors">
                            <span className="material-symbols-outlined text-3xl" data-icon="account_circle">account_circle</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content Canvas */}
            <main className="pt-32 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto min-h-screen">
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-4 leading-tight font-headline">Community Scam Feed</h1>
                    <p className="text-on-surface-variant text-xl md:text-2xl max-w-3xl leading-relaxed">
                        Real-time reports from the community to help you stay one step ahead of digital threats.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Community Feed (8 cols) */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Hiển thị Loading/Error */}
                        {loading && <div className="text-xl font-bold text-primary animate-pulse p-8 text-center bg-surface-container-lowest rounded-3xl">Đang tải dữ liệu cảnh báo...</div>}
                        {error && <div className="text-xl font-bold text-error p-8 text-center bg-error-container/20 rounded-3xl border border-error">Đã xảy ra lỗi: {error}</div>}

                        {/* Render Dữ liệu Động từ Database */}
                        {!loading && !error && warnings.map((warning, index) => {
                            // Xử lý giao diện động theo mức độ rủi ro (High = Đỏ, Medium = Cam, Thấp = Xanh)
                            const isHighRisk = warning.risk_level.toLowerCase() === 'high';
                            const isLiked = likedItems[warning.id];

                            // Tạo avatar màu ngẫu nhiên cho đẹp giống bản gốc
                            const avatarColors = ["bg-primary-container text-on-primary-container", "bg-secondary-container text-on-secondary-container", "bg-tertiary-container text-on-tertiary"];
                            const avatarBg = avatarColors[index % 3];

                            return (
                                <article key={warning.id} className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-sm transition-all hover:shadow-md border border-outline-variant/30">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 ${avatarBg} rounded-full flex items-center justify-center`}>
                                                <span className="material-symbols-outlined text-3xl" data-icon="account_circle">
                                                    {isHighRisk ? "admin_panel_settings" : "account_circle"}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-bold text-on-surface">Community_Guardian_{warning.id}</span>
                                                    <span className={`px-3 py-0.5 rounded-full text-sm font-semibold flex items-center gap-1 ${isHighRisk ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-on-primary-fixed'}`}>
                                                        <span className="material-symbols-outlined text-sm" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                        Verified
                                                    </span>
                                                </div>
                                                <p className="text-on-surface-variant text-base">Reported {warning.created_at}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-8">
                                        <h3 className="text-on-surface-variant font-semibold text-sm uppercase tracking-widest mb-4">Reported Message Content</h3>
                                        <div className="bg-surface-container-highest p-6 rounded-2xl border-l-8 border-primary">
                                            <p className="text-xl md:text-2xl text-on-surface font-medium italic leading-snug">
                                                "{warning.title}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`mb-8 p-6 rounded-2xl border-2 fraud-pulse flex gap-4 ${isHighRisk ? 'border-error bg-error-container/10' : 'border-orange-500 bg-orange-500/10'}`}>
                                        <span className={`material-symbols-outlined text-3xl ${isHighRisk ? 'text-error' : 'text-orange-500'}`} data-icon="warning" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                        <div>
                                            <h4 className={`font-bold text-xl mb-1 uppercase font-headline ${isHighRisk ? 'text-error' : 'text-orange-500'}`}>
                                                AI Verdict: {warning.risk_level} Risk
                                            </h4>
                                            <p className="text-on-surface text-lg leading-relaxed">{warning.content}</p>
                                        </div>
                                    </div>

                                    {/* Nút Helpful Tương tác */}
                                    <button
                                        onClick={() => handleToggleLike(warning.id)}
                                        className={`w-full flex items-center justify-center gap-4 py-5 transition-all rounded-2xl font-bold text-lg active:scale-95 ${isLiked ? 'bg-primary text-white shadow-md' : 'bg-surface-container-low hover:bg-surface-container-high text-primary'}`}
                                    >
                                        <span className="material-symbols-outlined text-2xl" data-icon="thumb_up">thumb_up</span>
                                        <span>
                                            {isLiked ? 'You found this helpful' : 'Helpful'}
                                            <span className={`font-normal ml-2 ${isLiked ? 'text-white/80' : 'text-on-surface-variant'}`}>
                                                ({isLiked ? 246 : 245})
                                            </span>
                                        </span>
                                    </button>
                                </article>
                            );
                        })}

                        {/* Nếu DB trống */}
                        {!loading && !error && warnings.length === 0 && (
                            <div className="text-center p-12 text-on-surface-variant text-xl bg-surface-container-lowest rounded-3xl">
                                Hiện tại chưa có báo cáo lừa đảo nào trong hệ thống.
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar (4 cols) */}
                    <aside className="lg:col-span-4 space-y-8">
                        <div className="bg-surface-container-lowest rounded-3xl p-10 shadow-sm border border-outline-variant/30 text-center sticky top-28">
                            <span className="material-symbols-outlined text-6xl text-primary mb-6 block" data-icon="fact_check">fact_check</span>
                            <h3 className="text-2xl font-bold text-on-surface mb-4 font-headline">Not Sure About a Message?</h3>
                            <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
                                Paste any suspicious text, link, or email content into our AI scanner for an instant safety assessment.
                            </p>
                            <button
                                onClick={handleGoToScan}
                                className="btn-gradient w-full py-6 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3 shadow-lg hover:brightness-110 active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined" data-icon="search_check">search_check</span>
                                Scan Your Message
                            </button>

                            <div className="mt-12 pt-8 border-t border-outline-variant/30 text-left">
                                <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 font-headline">Recent Trends</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3 text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                                        <span className="w-2 h-2 rounded-full bg-error"></span>
                                        <span className="font-medium">Bank Impersonation (↑ 24%)</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                        <span className="font-medium">Fake Delivery Alerts</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                                        <span className="font-medium">Job Offer Scams</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-slate-100 dark:bg-slate-950 w-full py-12 px-12 mt-24">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 w-full max-w-screen-2xl mx-auto">
                    <div className="text-left">
                        <div className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2 font-headline uppercase tracking-tight">The Guardian's Lens</div>
                        <p className="text-slate-600 dark:text-slate-400 font-body text-lg">© 2026 The Guardian's Lens. Your Digital Concierge.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-10">
                        <a className="text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-100 transition-opacity font-body text-lg" href="#">Privacy Policy</a>
                        <a className="text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-100 transition-opacity font-body text-lg" href="#">Terms of Service</a>
                        <a className="text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-100 transition-opacity font-body text-lg" href="#">Help Center</a>
                        <a className="text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-100 transition-opacity font-body text-lg" href="#">Accessibility</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}