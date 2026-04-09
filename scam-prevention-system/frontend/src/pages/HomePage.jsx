import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../HomePage.css'

const HomePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('text');

    const [textMessage, setTextMessage] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [audioFile, setAudioFile] = useState(null);

    const [result, setResult] = useState(null);

    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from storage");
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authUser');
        sessionStorage.removeItem('authUser');
        setUser(null);
        setShowProfileMenu(false);
        navigate('/login');
    };

    const handleScan = () => {
        // Sau này thay bằng gọi API Python/Flask
        setResult({
            riskScore: 85,
            level: 'High Risk Detected',
            title: 'Danger! Potential Fraud Alert.',
            description:
                'This message mimics a bank notification and contains common phishing signatures often used to steal login credentials.',
            suspicious: [
                'Account Locked',
                'Click link below',
                'Urgent action required'
            ],
            recommendation:
                'Do not click any links or provide personal information. Block the sender immediately and contact your bank using the official number on the back of your card.'
        });
    };
    const handleReportSender = () => {
        const senderInfo = {
            type: activeTab,
            sender:
                activeTab === 'phone'
                    ? phoneNumber
                    : activeTab === 'bank'
                        ? bankAccount
                        : 'Unknown Sender',

            message:
                activeTab === 'text'
                    ? textMessage
                    : result?.description || '',
            reportContent: result
                ? {
                    title: result.title,
                    description: result.description,
                    suspicious: result.suspicious,
                    recommendation: result.recommendation,
                    riskScore: result.riskScore,
                    level: result.level,
                }
                : null,
        };

        navigate('/scam-report', {
            state: senderInfo,
        });
    };

    const handleReset = () => {
        setActiveTab('text');

        setTextMessage('');
        setPhoneNumber('');
        setBankAccount('');
        setAudioFile(null);

        setResult(null);
    };

    return (
        <div className="bg-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen text-on-surface">
            {/* TopNavBar */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm docked full-width top-0 sticky z-50">
                <nav className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                        <span className="text-2xl font-black text-blue-900 dark:text-blue-50 tracking-tight">Fraud Scanner AI</span>
                    </div>
                    <div className="hidden md:flex items-center gap-10">
                        <Link className="font-['Public_Sans'] font-bold text-lg text-blue-900 dark:text-blue-400 border-b-4 border-blue-900 dark:border-blue-400 pb-2" to="/">Scan Text</Link>
                        <Link className="font-['Public_Sans'] font-bold text-lg text-slate-600 dark:text-slate-400 hover:text-blue-800 pb-2 transition-colors" to="/scam-report">Report Scam</Link>
                        <Link className="font-['Public_Sans'] font-bold text-lg text-slate-600 dark:text-slate-400 hover:text-blue-800 pb-2 transition-colors" to="/awareness">Awareness Hub</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-blue-900 dark:text-blue-100">
                            <span className="material-symbols-outlined text-2xl" data-icon="help">help</span>
                        </button>
                        <button className="p-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-blue-900 dark:text-blue-100">
                            <span className="material-symbols-outlined text-2xl" data-icon="settings">settings</span>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => {
                                    if (!user) navigate('/login');
                                    else setShowProfileMenu(!showProfileMenu);
                                }}
                                onBlur={(e) => {
                                    setTimeout(() => setShowProfileMenu(false), 200);
                                }}
                                className="p-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-blue-900 dark:text-blue-100 flex items-center justify-center cursor-pointer"
                            >
                                {user ? (
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase transform transition-transform hover:scale-105 shadow-sm">
                                        {user.username ? user.username.charAt(0) : 'U'}
                                    </div>
                                ) : (
                                    <span className="material-symbols-outlined text-2xl" data-icon="person">person</span>
                                )}
                            </button>

                            {/* Dropdown Menu - appears on click when logged in */}
                            {user && showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg shadow-black/5 border border-slate-100 dark:border-slate-700 transition-all duration-200 z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.username || 'User'}</p>
                                    </div>
                                    <div className="py-1">
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>logout</span>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            <main className="max-w-screen-xl mx-auto px-8 py-12 md:py-20">
                {/* Hero Section */}
                <section className="mb-16">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-6xl font-black text-on-surface mb-6 tracking-tight leading-tight">Check Suspicious Messages</h1>
                        <p className="text-xl md:text-2xl text-on-surface-variant font-light leading-relaxed">Choose an input type and paste details below to instantly check for scams with our Digital Concierge AI.</p>
                    </div>
                </section>

                {/* Main Interaction Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Input Card */}
                    <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-8 shadow-sm">
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-primary mb-6 uppercase tracking-widest">Input Analysis Field</label>

                            {/* Toggle Tabs */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                                <button
                                    className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all border-2 ${activeTab === 'text' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline'}`}
                                    onClick={() => setActiveTab('text')}
                                >
                                    <span className="material-symbols-outlined text-2xl" data-icon="chat">chat</span>
                                    <span className="text-sm md:text-base">Text Message</span>
                                </button>
                                <button
                                    className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all border-2 ${activeTab === 'phone' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline'}`}
                                    onClick={() => setActiveTab('phone')}
                                >
                                    <span className="material-symbols-outlined text-2xl" data-icon="phone">phone</span>
                                    <span className="text-sm md:text-base">Phone Number</span>
                                </button>
                                <button
                                    className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all border-2 ${activeTab === 'bank' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline'}`}
                                    onClick={() => setActiveTab('bank')}
                                >
                                    <span className="material-symbols-outlined text-2xl" data-icon="credit_card">credit_card</span>
                                    <span className="text-sm md:text-base">Bank Account</span>
                                </button>
                                <button
                                    className={`p-4 rounded-xl flex flex-col items-center gap-2 font-bold transition-all border-2 ${activeTab === 'audio' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-high text-on-surface-variant border-transparent hover:border-outline'}`}
                                    onClick={() => setActiveTab('audio')}
                                >
                                    <span className="material-symbols-outlined text-2xl" data-icon="mic">mic</span>
                                    <span className="text-sm md:text-base">Audio Recording</span>
                                </button>
                            </div>

                            {/* Input Contents */}
                            {activeTab === 'text' && (
                                <div>
                                    <textarea className="w-full p-6 text-xl bg-surface-container-highest border-none rounded-xl focus:ring-4 focus:ring-primary-fixed outline-none transition-all placeholder:text-outline" placeholder="Paste your message here..." rows="8"
                                        value={textMessage}
                                        onChange={(e) => setTextMessage(e.target.value)}></textarea>
                                </div>
                            )}

                            {activeTab === 'phone' && (
                                <div>
                                    <input className="w-full p-6 text-2xl bg-surface-container-highest border-none rounded-xl focus:ring-4 focus:ring-primary-fixed outline-none transition-all placeholder:text-outline font-bold" placeholder="Enter phone number..." type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)} />
                                    <p className="mt-4 text-on-surface-variant text-base">We check for reported scam numbers and international spoofing patterns.</p>
                                </div>
                            )}

                            {activeTab === 'bank' && (
                                <div>
                                    <input className="w-full p-6 text-2xl bg-surface-container-highest border-none rounded-xl focus:ring-4 focus:ring-primary-fixed outline-none transition-all placeholder:text-outline font-bold" placeholder="Enter bank account number..." type="text"
                                        value={bankAccount}
                                        onChange={(e) => setBankAccount(e.target.value)} />
                                    <p className="mt-4 text-on-surface-variant text-base">We verify if the account has been flagged in recent fraudulent transfers.</p>
                                </div>
                            )}

                            {activeTab === 'audio' && (
                                <div>
                                    <div className="w-full p-12 bg-surface-container-highest border-4 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-4 text-center group cursor-pointer hover:bg-surface-container-high transition-colors">
                                        <span className="material-symbols-outlined text-6xl text-outline group-hover:text-primary transition-colors" data-icon="upload_file">upload_file</span>
                                        <div>
                                            <p className="text-xl font-bold text-on-surface">Drag and drop audio file here</p>
                                            <p className="text-on-surface-variant mt-2">Supports .mp3, .wav, .m4a (Max 10MB)</p>
                                            <input type="file"
                                                value={audioFile}
                                                accept=".mp3,.wav,.m4a"
                                                onChange={(e) => setAudioFile(e.target.files[0])}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={handleScan} className="signature-gradient w-full py-6 rounded-xl flex items-center justify-center gap-4 text-on-primary text-2xl font-bold shadow-lg transform active:scale-95 transition-all">
                            <span className="material-symbols-outlined text-3xl" data-icon="security">security</span>
                            Scan for Risk
                        </button>
                    </div>

                    {/* Context Info / Illustration */}
                    <div className="lg:col-span-5 h-full">
                        <div className="bg-surface-container-low rounded-xl p-8 h-full flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-primary mb-6">How it works</h2>
                                <ul className="space-y-6">
                                    <li className="flex gap-4">
                                        <span className="bg-primary-fixed text-primary w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold">1</span>
                                        <p className="text-lg text-on-surface-variant">Our AI scans for known phishing patterns and linguistic tricks used by fraudsters.</p>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="bg-primary-fixed text-primary w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold">2</span>
                                        <p className="text-lg text-on-surface-variant">We verify URLs and data against global databases of malicious activity.</p>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="bg-primary-fixed text-primary w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold">3</span>
                                        <p className="text-lg text-on-surface-variant">You receive a clear safety rating and step-by-step guidance.</p>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 rounded-xl overflow-hidden shadow-inner">
                                <img alt="close-up of hands holding a smartphone with safe checkmark" className="w-full h-48 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUBN4OwRx3EWG3_WyEUo9sXDEaO9GatDXkYcwBfqI1_gjs4TdFB65MbXl3-Bw7K62gNKwjYY6a9LkA5etFskk92yLiPGwCHTS_nrUSOjWBmGPODNelxsQfY7lrnQC-1Bk-JuTYBIyqKjDomnf6hC4DOLyKcjnx0yNOj8j1d3ANA-3S__fX-A-B2eDoNxPGjkjI9jX9i19qQoiJH8zMBgaK7MGnbQFAm9jvOa80jlS-raCzIZVNRqUxYD-RrxxW8VyystlFMxboWLo" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mock Analysis Result Section */}
                {result && (
                    <section className="mt-20">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-1 flex-grow bg-surface-container-high"></div>
                            <h2 className="text-3xl font-black text-on-surface px-4">Analysis Result</h2>
                            <div className="h-1 flex-grow bg-surface-container-high"></div>
                        </div>

                        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-xl border-l-8 border-error">
                            <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                                {/* Risk Gauge Column */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border-[12px] border-surface-container-high"></div>
                                        <div className="absolute inset-0 rounded-full border-[12px] border-error" style={{ clipPath: 'polygon(50% 50%, -10% -10%, 110% -10%, 110% 50%)', transform: 'rotate(45deg)' }}></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-5xl font-black text-error">{result.riskScore}</span>
                                            <span className="text-lg font-bold text-outline uppercase tracking-widest">Risk Score</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 bg-tertiary-container text-on-tertiary px-6 py-2 rounded-full font-bold flex items-center gap-2 animate-pulse">
                                        <span className="material-symbols-outlined text-xl" data-icon="warning" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                        {result.level}
                                    </div>
                                </div>

                                {/* Information Column */}
                                <div className="md:col-span-2">
                                    <h3 className="text-3xl font-black text-error mb-4 leading-tight">{result.title}</h3>
                                    <p className="text-xl text-on-surface-variant mb-8 leading-relaxed">{result.description}</p>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-sm font-bold text-outline uppercase mb-3 tracking-widest">Suspicious Elements Found</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {result.suspicious.map((item, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-medium text-lg flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-error text-xl">
                                                            warning
                                                        </span>
                                                        "{item}"
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-surface-container-low p-6 rounded-xl">
                                            <h4 className="text-xl font-bold text-primary mb-3">Our Recommendation</h4>
                                            <p className="text-lg text-on-surface leading-relaxed"> {result.recommendation}</p>
                                        </div>
                                    </div>

                                    {/* Result Actions */}
                                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                        <button onClick={handleReportSender} className="flex-1 border-2 border-error text-error py-4 px-8 rounded-xl font-bold text-lg hover:bg-error-container/20 transition-colors flex items-center justify-center gap-3">
                                            <span className="material-symbols-outlined" data-icon="report">report</span>
                                            Report this sender
                                        </button>
                                        <button onClick={handleReset} className="flex-1 bg-surface-container-high text-on-surface-variant py-4 px-8 rounded-xl font-bold text-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-3">
                                            <span className="material-symbols-outlined" data-icon="refresh">refresh</span>
                                            Scan another message
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>)}

                {/* Help Center CTA */}
                <section className="mt-24 mb-12">
                    <div className="bg-primary-container text-on-primary rounded-xl p-12 relative overflow-hidden">
                        <div className="relative z-10 md:flex items-center justify-between gap-8">
                            <div className="max-w-2xl">
                                <h2 className="text-4xl font-black mb-4">Not sure what to do?</h2>
                                <p className="text-xl text-on-primary-container opacity-90 leading-relaxed">Our awareness hub is filled with easy-to-understand guides on how to spot scammers and protect your identity.</p>
                            </div>
                            <Link to="/awareness" className="mt-8 md:mt-0 bg-white text-primary px-10 py-5 rounded-xl font-black text-xl shadow-xl hover:scale-105 transition-transform inline-block text-center">
                                Explore Safety Guides
                            </Link>
                        </div>
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-100 dark:bg-slate-950 w-full py-12 px-8 mt-20">
                <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-xl font-bold text-blue-900 dark:text-blue-100">Fraud Scanner AI</span>
                        <p className="font-['Lexend'] text-lg font-normal text-slate-600 dark:text-slate-400">© 2024 Fraud Scanner AI. Your digital concierge for a safer web.</p>
                    </div>
                    <div className="flex gap-8">
                        <a className="font-['Lexend'] text-lg font-normal text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-200 transition-all opacity-80 hover:opacity-100" href="#">Safety Guides</a>
                        <a className="font-['Lexend'] text-lg font-normal text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-200 transition-all opacity-80 hover:opacity-100" href="#">Support</a>
                        <a className="font-['Lexend'] text-lg font-normal text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-200 transition-all opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
