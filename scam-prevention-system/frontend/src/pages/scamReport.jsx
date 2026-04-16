import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles.css';
import Header from "../components/Header";

export default function CommunityScamReport() {
    const location = useLocation();
    const reportData = location.state;
    const navigate = useNavigate();

    const [warnings, setWarnings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likedItems, setLikedItems] = useState({});
    const [showAiAnalysis, setShowAiAnalysis] = useState(false);
    const [newReportHelpful, setNewReportHelpful] = useState(false);

    const API_BASE = useMemo(
        () => (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, ''),
        []
    );
/*
    useEffect(() => {
        const fetchWarnings = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/warnings`);
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
    }, []);*/
    // Fetch API dữ liệu từ Backend (Đã sửa lại để dùng SQLite)
        const hasSavedRef = useRef(false);

        useEffect(() => {
            
            // Tự động lưu report mới vào SQLite nếu có data từ trang Scan truyền sang và chưa được lưu
            const autoSaveReport = async () => {
                // Kiểm tra xem có data từ trang scan truyền sang không và chưa được lưu
                 if (!reportData || hasSavedRef.current) return;

                hasSavedRef.current = true; // Đánh dấu đã lưu để tránh gửi API nhiều lần khi component re-render           
               // if (reportData && !reportData.isSaved) {
                    try {
                        // Backend dùng request.form, nên phải tạo FormData thay vì JSON
                        const formData = new FormData();
                        formData.append('title', reportData.reportContent?.title || 'Báo cáo từ AI Scan');
                        const fullDescription = `
                        Nội dung cảnh báo: ${reportData.userInput || 'Không có'}

                        === KẾT QUẢ PHÂN TÍCH AI ===
                        ${reportData.reportContent?.description || ''}

                        Risk Score: ${reportData.reportContent?.riskScore || '--'} / 100
                        Risk Level: ${reportData.reportContent?.riskLevel || 'low'}
                        Suspicious patterns: ${reportData.reportContent?.suspicious?.join(', ') || 'Không phát hiện'}
                        Recommendation: ${reportData.reportContent?.recommendation || 'Không có khuyến nghị'}

                        Engine: ${reportData.reportContent?.engine || 'Unknown'}
                            `.trim();

                            formData.append('description', fullDescription);
                            formData.append('scam_type', reportData.type || 'AI_Scan');
                            formData.append('reporter_name', 'Anonymous User');   // tên user thật
                           // formData.append('email', ''); // nếu có đăng nhập thì truyền vào
                        const response = await fetch('http://localhost:5000/api/report', {
                            method: 'POST',
                            body: formData,
                        });

                        if (response.ok) {
                            console.log('Đã lưu Report thành công vào SQLite!');
                            reportData.isSaved = true; // Đánh dấu cờ này để React không gửi API lưu nhiều lần khi render lại
                        } else {
                            console.error('Lỗi từ server khi lưu report');
                        }
                    } catch (err) {
                        console.error('Lỗi kết nối khi lưu report:', err);
                    }
                //};
            };

            // Lấy danh sách report mới nhất từ SQLite
            const fetchReports = async () => {
                try {
                   
                    const response = await fetch('http://localhost:5000/api/reports');
                    if (!response.ok) throw new Error('Unable to retrieve the report list.');

                    const data = await response.json();
                    // Vì API /api/reports trả về trực tiếp một mảng (array), không bọc trong result.data
                    setWarnings(data); 
                    
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };

            // Chạy hàm lưu trước, sau đó lấy danh sách mới nhất về
            autoSaveReport().then(() => {
                fetchReports();
            });

        }, [reportData]); // Effect phụ thuộc vào reportData

    const handleToggleLike = (id) => {
        setLikedItems((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    const parseReportFromDB = (report) => {
    const desc = report.description || '';

    const getValue = (label) => {
        const regex = new RegExp(label + ":\\s*(.*)");
        const match = desc.match(regex);
        return match ? match[1].trim() : '';
    };

    return {
        userInput: desc.match(/Nội dung cảnh báo:(.*?)===/s)?.[1]?.trim() || '',
        reportContent: {
            title: report.title,
            description: desc.match(/=== KẾT QUẢ PHÂN TÍCH AI ===([\\s\\S]*?)Risk Score:/)?.[1]?.trim() || '',
            riskScore: getValue('Risk Score'),
            riskLevel: getValue('Risk Level') || 'low',
            suspicious: getValue('Suspicious patterns')?.split(',').map(i => i.trim()) || [],
            recommendation: getValue('Recommendation'),
        }
    };
};
    const handleGoToScan = () => {
        navigate('/scan');
    };

    return (
    <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen">
        <Header />

        <main className="pt-32 pb-24 px-6 md:px-12 max-w-screen-2xl mx-auto min-h-screen">
            <header className="mb-16">
                <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-4 leading-tight font-headline">
                    Community Scam Feed
                </h1>
                <p className="text-on-surface-variant text-xl md:text-2xl max-w-3xl leading-relaxed">
                    Real-time reports from the community to help you stay one step ahead of digital threats.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                    {/* Loading & Error */}
                    {loading && (
                        <div className="text-xl font-bold text-primary animate-pulse p-8 text-center bg-surface-container-lowest rounded-3xl">
                            Đang tải dữ liệu cảnh báo...
                        </div>
                    )}

                    {error && (
                        <div className="text-xl font-bold text-error p-8 text-center bg-error-container/20 rounded-3xl border border-error">
                            Đã xảy ra lỗi: {error}
                        </div>
                    )}

                    {/* Phần hiển thị reportData đơn lẻ */}
                    {reportData && (
                        <article className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-sm border border-outline-variant/30 mb-12">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-error-container text-error rounded-full flex items-center justify-center">
                                        <span
                                            className="material-symbols-outlined text-3xl"
                                            style={{ fontVariationSettings: "'FILL' 1" }}
                                        >
                                            report
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-xl font-bold text-on-surface">
                                                Newly_Reported_User
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-error-container text-error flex items-center gap-1">
                                                <span
                                                    className="material-symbols-outlined text-sm"
                                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                                >
                                                    verified
                                                </span>
                                                New Report
                                            </span>
                                        </div>
                                        <p className="text-on-surface-variant text-base mt-1">
                                            Just reported from scan result
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sender Information */}
                            <div className="mb-8">
                                <h3 className="text-on-surface-variant font-semibold text-sm uppercase tracking-widest mb-4">
                                    Sender Information
                                </h3>
                                <div className="bg-surface-container-highest p-6 rounded-2xl border-l-8 border-error">
                                    <p className="text-lg text-on-surface">
                                        <span className="font-bold text-primary">Type:</span> {reportData.type}
                                    </p>
                                </div>
                            </div>

                            {/* Reported Message Content */}
                            <div className="mb-8">
                                <h3 className="text-on-surface-variant font-semibold text-sm uppercase tracking-widest mb-4">
                                    Reported Message Content
                                </h3>
                                <p className="text-xl md:text-2xl text-on-surface font-medium italic leading-snug whitespace-pre-line break-all">
                                    "{reportData.userInput || 'No message content available.'}"
                                </p>
                            </div>

                            {/* AI Analysis */}
                            {reportData.reportContent && (
                                <div className="mb-8 rounded-2xl border-2 border-error bg-error-container/10 overflow-hidden">
                                    <button
                                        onClick={() => setShowAiAnalysis(!showAiAnalysis)}
                                        className="w-full flex items-center justify-between px-6 py-5 hover:bg-error-container/20 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span
                                                className="material-symbols-outlined text-error text-3xl"
                                                style={{ fontVariationSettings: "'FILL' 1" }}
                                            >
                                                warning
                                            </span>
                                            <div className="text-left">
                                                <h4 className="font-bold text-xl text-error uppercase">
                                                    AI Verdict: {reportData.reportContent.riskLevel?.toUpperCase()}
                                                </h4>
                                                <p className="text-on-surface-variant text-sm mt-1">
                                                    Click to view detailed AI analysis
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`material-symbols-outlined text-3xl text-error transition-transform duration-300 ${showAiAnalysis ? 'rotate-180' : ''}`}
                                        >
                                            expand_more
                                        </span>
                                    </button>

                                    {showAiAnalysis && (
                                        <div className="px-6 pb-6 border-t border-error/20">
                                            <div className="flex items-center justify-between flex-wrap gap-4 mt-6 mb-4">
                                                <h3 className="text-2xl font-black text-error">
                                                    {reportData.reportContent.title}
                                                </h3>
                                               <div className="grid grid-cols-2 gap-6 text-sm">
                                                <div>
                                                    <strong>Risk Score:</strong> {reportData.reportContent.riskScore} / 100
                                                </div>
                                                <div>
                                                    <strong>Risk Level:</strong> <span className="font-bold text-error">{reportData.reportContent.riskLevel?.toUpperCase()}</span>
                                                </div>
                                                </div> 
                                            </div>

                                            <p className="text-lg text-on-surface-variant mb-6 leading-relaxed">
                                                {reportData.reportContent.description}
                                            </p>
                                            
                                            {Array.isArray(reportData.reportContent.suspicious) &&
                                                reportData.reportContent.suspicious.length > 0 && (
                                                    <div className="mb-6">
                                                        <h4 className="font-bold text-on-surface mb-3">
                                                            Suspicious Elements:
                                                        </h4>
                                                        <div className="flex flex-wrap gap-3">
                                                            {reportData.reportContent.suspicious.map((item, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="bg-error-container/30 text-error px-4 py-2 rounded-xl font-semibold"
                                                                >
                                                                    {item}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                            <div className="bg-primary-container rounded-2xl p-5">
                                                <h4 className="font-bold text-primary mb-2">
                                                    Recommendation
                                                </h4>
                                                <p className="text-on-surface leading-relaxed">
                                                    {reportData.reportContent.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Helpful button cho reportData */}
                            <button
                                onClick={() => setNewReportHelpful(!newReportHelpful)}
                                className={`w-full flex items-center justify-center gap-4 py-5 transition-all rounded-2xl font-bold text-lg active:scale-95 ${
                                    newReportHelpful
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-surface-container-low hover:bg-surface-container-high text-primary'
                                }`}
                            >
                                <span className="material-symbols-outlined text-2xl">thumb_up</span>
                                <span>
                                    {newReportHelpful ? 'You found this helpful' : 'Helpful'}
                                    <span className={`font-normal ml-2 ${newReportHelpful ? 'text-white/80' : 'text-on-surface-variant'}`}>
                                        ({newReportHelpful ? 1 : 0})
                                    </span>
                                </span>
                            </button>
                        </article>
                    )}

                    {/* Danh sách warnings từ database */}
                    {!loading && !error && warnings.map((report, index) => {

                        const riskLevel = report.risk_level || report.reportContent?.riskLevel || 'low';
                        const isHighRisk = riskLevel.toLowerCase() === 'high';
                        const isLiked = likedItems[report.id];
                        // Làm sạch description (loại bỏ comment thừa và xuống dòng)
                        const parsed = parseReportFromDB(report);

                        const avatarColors = [
                            "bg-primary-container text-on-primary-container",
                            "bg-secondary-container text-on-secondary-container",
                            "bg-tertiary-container text-on-tertiary"
                        ];
                        const avatarBg = avatarColors[index % 3];
                       // const aiContent = report.reportContent || report;
                        return (
                            <article
                                key={report.id}
                                className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-sm transition-all hover:shadow-md border border-outline-variant/30"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 ${avatarBg} rounded-full flex items-center justify-center`}>
                                            <span className="material-symbols-outlined text-3xl">
                                                {isHighRisk ? "admin_panel_settings" : "account_circle"}
                                            </span>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-xl font-bold text-on-surface">
                                                    Community_Guardian_{report.id}
                                                </span>
                                                <span className={`px-3 py-0.5 rounded-full text-sm font-semibold flex items-center gap-1 ${isHighRisk ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-primary-fixed text-on-primary-fixed'}`}>
                                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                        verified
                                                    </span>
                                                    Verified
                                                </span>
                                            </div>
                                            <p className="text-on-surface-variant text-base">
                                                Reported {new Date(report.created_at).toLocaleString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Reported Message Content */}
                                <div className="mb-8">
                                    
                                    <h3 className="text-on-surface-variant font-semibold text-sm uppercase tracking-widest mb-4">
                                        Reported Message Content
                                    </h3>
                                    <div className="bg-surface-container-highest p-6 rounded-2xl border-l-8 border-primary">
                                        <p className="text-xl md:text-2xl text-on-surface font-medium italic leading-snug">
                                            "{parsed.userInput || 'No message content'}"
                                        </p>
                                    </div>
                                </div>

                                {/* AI Verdict */}
                                <div className={`mb-8 p-6 rounded-2xl border-2 ${isHighRisk ? 'border-error bg-error-container/10' : 'border-amber-500 bg-amber-500/10'}`}>
                                 <h4 className="font-bold text-xl text-error">AI Analysis Result</h4>
                                <div className="flex items-center justify-between flex-wrap gap-4 mt-6 mb-4">
                               
                                    <h3 className="text-2xl font-black text-error">
                                        {parsed.reportContent.title}</h3>
                                    <div className="grid grid-cols-2 gap-6 text-sm">
                                        <div>
                                            <strong>Risk Score:</strong> {parsed.reportContent.riskScore || '50'} 
                                            </div>
                                            <div>
                                            <strong>Risk Level:</strong> <span className="font-bold text-error">{parsed.reportContent.riskLevel?.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-on-surface leading-relaxed mb-6">
                                    {parsed.reportContent.description}
                                </p>
                                {/* Suspicious Elements */}
                                {parsed.reportContent.suspicious && parsed.reportContent.suspicious.length > 0 && (
                                        <div className="mb-6">
                                            <h5 className="font-semibold mb-3">Suspicious Elements</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {parsed.reportContent.suspicious.map((item, i) => (
                                                    <span key={i} className="bg-error-container text-error px-4 py-1 rounded-xl text-sm font-medium">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recommendation */}
                                    <div className="bg-white/70 p-5 rounded-2xl">
                                        <h5 className="font-bold text-primary mb-2">Recommendation</h5>
                                        <p className="text-on-surface">
                                            {parsed.reportContent.recommendation}
                                        </p>
                                    </div>
                                </div>
                                {/* Helpful Button */}
                                <button
                                    onClick={() => handleToggleLike(report.id)}
                                    className={`w-full flex items-center justify-center gap-4 py-5 transition-all rounded-2xl font-bold text-lg active:scale-95 ${
                                        isLiked
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-surface-container-low hover:bg-surface-container-high text-primary'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-2xl">thumb_up</span>
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
                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                    <div className="bg-surface-container-lowest rounded-3xl p-10 shadow-sm border border-outline-variant/30 text-center sticky top-28">
                        <span className="material-symbols-outlined text-6xl text-primary mb-6 block">fact_check</span>
                        <h3 className="text-2xl font-bold text-on-surface mb-4 font-headline">
                            Not Sure About a Message?
                        </h3>
                        <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
                            Paste any suspicious text, link, or email content into our AI scanner for an instant safety assessment.
                        </p>

                        <button
                            onClick={handleGoToScan}
                            className="btn-gradient w-full py-6 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3 shadow-lg hover:brightness-110 active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined">search_check</span>
                            Scan Your Message
                        </button>

                        <div className="mt-12 pt-8 border-t border-outline-variant/30 text-left">
                            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 font-headline">
                                Recent Trends
                            </h4>
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

        <footer className="bg-slate-100 dark:bg-slate-950 w-full py-12 px-12 mt-24">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 w-full max-w-screen-2xl mx-auto">
                <div className="text-left">
                    <div className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2 font-headline uppercase tracking-tight">
                        The Guardian's Lens
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-body text-lg">
                        © 2026 The Guardian's Lens. Your Digital Concierge.
                    </p>
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
)};