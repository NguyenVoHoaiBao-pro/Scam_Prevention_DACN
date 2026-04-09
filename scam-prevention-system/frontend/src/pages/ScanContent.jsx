import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

export default function ScanContent() {
    const navigate = useNavigate(); // Hook chuyển trang mượt mà
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // State quản lý việc gửi báo cáo
    const [reportStatus, setReportStatus] = useState('idle'); // idle | reporting | success

    const handleScan = async () => {
        if (!text.trim()) {
            setError("Please enter the content you wish to scan!");
            return;
        }
        setLoading(true); setError(null); setResult(null); setReportStatus('idle');

        try {
            const response = await fetch('http://localhost:5000/api/detect-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });
            if (!response.ok) throw new Error('Không thể kết nối đến máy chủ quét AI.');
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Hàm tự động gửi báo cáo lên trang Community Scam Report
    const handleSendReport = async () => {
        setReportStatus('reporting');
        try {
            const response = await fetch('http://localhost:5000/api/warnings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: result.input_text,          // Nội dung tin nhắn
                    content: result.message,           // Kết luận của AI
                    risk_level: result.is_scam ? 'High' : 'Low' // Mức độ
                })
            });

            if (!response.ok) throw new Error('Lỗi khi gửi báo cáo');

            setReportStatus('success');
            // Sau 2 giây tự động nhảy về trang Cộng đồng để xem thành quả
            setTimeout(() => navigate('/report'), 2000);

        } catch (error) {
            alert("Lỗi khi gửi báo cáo: " + error.message);
            setReportStatus('idle');
        }
    };

    return (
        <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen flex flex-col">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
                <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto h-20">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/report')}>
                        <span className="material-symbols-outlined text-blue-900 text-3xl" data-icon="shield">shield</span>
                        <div className="text-3xl font-extrabold tracking-tight text-primary">Fraud Scanner AI</div>
                    </div>
                    <div className="hidden md:flex items-center gap-12">
                        <button onClick={() => navigate('/scan')} className="text-blue-800 font-bold border-b-4 border-blue-800 pb-1 uppercase text-sm">Scan Content</button>
                        <button onClick={() => navigate('/report')} className="text-slate-600 hover:text-blue-700 uppercase text-sm font-medium">Report Scam</button>
                        <a className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-200 transition-colors uppercase tracking-wide text-sm" href="/awareness">Awareness Hub</a>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => window.location.href = '/login'}
                            className="text-slate-600 dark:text-slate-400 hover:text-blue-900 transition-colors"
                        >
                            <span className="material-symbols-outlined text-3xl" data-icon="account_circle">account_circle</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto w-full">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4 font-headline">Instant AI Threat Scanner</h1>
                    <p className="text-on-surface-variant text-lg">Paste any suspicious messages or links here for analysis..</p>
                </header>

                <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-lg border border-outline-variant/30 mb-8">
                    <textarea
                        className="w-full h-48 p-6 bg-surface-container-highest rounded-2xl text-lg outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter content..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                    {error && <p className="text-error mt-4 font-bold animate-pulse">{error}</p>}
                    <div className="mt-8 flex justify-end">
                        <button onClick={handleScan} disabled={loading} className="btn-gradient py-4 px-10 rounded-2xl text-white font-bold text-xl flex items-center gap-3 shadow-md hover:brightness-110 active:scale-95">
                            <span className="material-symbols-outlined">{loading ? "autorenew" : "document_scanner"}</span>
                            {loading ? 'Analyzing...' : 'Start scanning'}
                        </button>
                    </div>
                </div>

                {/* Khu vực hiển thị kết quả */}
                {result && (
                    <div className={`rounded-3xl p-8 shadow-lg border-2 ${result.is_scam ? 'border-error bg-error-container/10' : 'border-green-500 bg-green-500/10'}`}>
                        <div className="flex items-start gap-6">
                            <span className={`material-symbols-outlined text-6xl ${result.is_scam ? 'text-error' : 'text-green-500'}`} data-icon={result.is_scam ? 'dangerous' : 'verified_user'}>
                                {result.is_scam ? 'dangerous' : 'verified_user'}
                            </span>
                            <div className="w-full">
                                <h3 className={`text-3xl font-extrabold uppercase mb-2 ${result.is_scam ? 'text-error' : 'text-green-600'}`}>
                                    {result.is_scam ? 'Warning: Scam detected!' : 'Status: Safe'}
                                </h3>
                                <p className="text-lg mb-4"><strong>AI's assessment:</strong> {result.message}</p>

                                {/* NÚT GỬI BÁO CÁO (Chỉ hiện khi là lừa đảo) */}
                                {result.is_scam && (
                                    <div className="mt-6 pt-6 border-t border-error/20 flex flex-col items-end">
                                        {reportStatus === 'success' ? (
                                            <p className="text-green-600 font-bold flex items-center gap-2">
                                                <span className="material-symbols-outlined">check_circle</span> Submission successful! Removing page...
                                            </p>
                                        ) : (
                                            <button
                                                onClick={handleSendReport}
                                                disabled={reportStatus === 'reporting'}
                                                className="bg-error text-white py-3 px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-error/90 active:scale-95 transition-all shadow-md"
                                            >
                                                <span className="material-symbols-outlined">campaign</span>
                                                {reportStatus === 'reporting' ? 'Sending...' : 'Contribute this alert to the community.'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}