import '../styles.css'; // Import file CSS thuần chứa các biến màu và animation

export default function CommunityScamReport() {
    return (
        <div className="bg-surface text-on-surface selection:bg-primary-fixed min-h-screen">
            {/* TopNavBar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
                <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto h-20">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-900 dark:text-blue-100 text-3xl" data-icon="shield">shield</span>
                        <div className="text-2xl font-bold tracking-tight text-blue-900 dark:text-blue-100 font-headline uppercase">
                            The Guardian's Lens
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-12">
                        <a className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-200 transition-colors uppercase tracking-wide text-sm" href="#">Scan Content</a>
                        <a className="text-blue-800 dark:text-blue-300 font-bold border-b-4 border-blue-800 dark:border-blue-300 pb-1 uppercase tracking-wide text-sm" href="#">Report Scam</a>
                        <a className="text-slate-600 dark:text-slate-400 font-medium hover:text-blue-700 dark:hover:text-blue-200 transition-colors uppercase tracking-wide text-sm" href="#">Awareness Hub</a>
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
                {/* Header Section */}
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-4 leading-tight font-headline">Community Scam Feed</h1>
                    <p className="text-on-surface-variant text-xl md:text-2xl max-w-3xl leading-relaxed">
                        Real-time reports from the community to help you stay one step ahead of digital threats.
                    </p>
                </header>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Community Feed (8 cols) */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Report Card 1: AlexNguyen */}
                        <article className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-sm transition-all hover:shadow-md border border-outline-variant/30">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container">
                                        <span className="material-symbols-outlined text-3xl" data-icon="account_circle">account_circle</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-bold text-on-surface">AlexNguyen_99</span>
                                            <span className="bg-primary-fixed text-on-primary-fixed px-3 py-0.5 rounded-full text-sm font-semibold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm" data-icon="verified" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                                Verified
                                            </span>
                                        </div>
                                        <p className="text-on-surface-variant text-base">Reported 2 hours ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-8">
                                <h3 className="text-on-surface-variant font-semibold text-sm uppercase tracking-widest mb-4">Reported Message Content</h3>
                                <div className="bg-surface-container-highest p-6 rounded-2xl border-l-8 border-primary">
                                    <p className="text-xl md:text-2xl text-on-surface font-medium italic leading-snug">
                                        "URGENT: Your account has been suspended. Click here to verify: https://bit.ly/secure-login-392"
                                    </p>
                                </div>
                            </div>
                            <div className="mb-8 p-6 rounded-2xl border-2 border-error bg-error-container/10 fraud-pulse flex gap-4">
                                <span className="material-symbols-outlined text-error text-3xl" data-icon="warning" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                                <div>
                                    <h4 className="text-error font-bold text-xl mb-1 uppercase font-headline">AI Verdict: Critical Warning</h4>
                                    <p className="text-on-surface text-lg leading-relaxed">Phishing attempt detected. Malicious link and urgent pressure tactics used.</p>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-4 py-5 bg-surface-container-low hover:bg-surface-container-high transition-all rounded-2xl text-primary font-bold text-lg active:scale-95">
                                <span className="material-symbols-outlined text-2xl" data-icon="thumb_up">thumb_up</span>
                                <span>Helpful <span className="font-normal text-on-surface-variant ml-2">(245)</span></span>
                            </button>
                        </article>

                        {/* Report Card 2: Sarah_K */}
                        <article className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-sm transition-all hover:shadow-md border border-outline-variant/30">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
                                        <span className="material-symbols-outlined text-3xl" data-icon="account_circle">account_circle</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-bold text-on-surface">Sarah_K</span>
                                            <span className="bg-primary-fixed text-on-primary-fixed px-3 py-0.5 rounded-full text-sm font-semibold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm" data-icon="shield_person" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
                                                Contributor
                                            </span>
                                        </div>
                                        <p className="text-on-surface-variant text-base">Reported 5 hours ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-8">
                                <h3 className="text-on-surface-variant font-semibold text-sm uppercase tracking-widest mb-4">Reported Message Content</h3>
                                <div className="bg-surface-container-highest p-6 rounded-2xl border-l-8 border-primary">
                                    <p className="text-xl md:text-2xl text-on-surface font-medium italic leading-snug">
                                        "CONGRATULATIONS! You have won a $1,000 Amazon Gift Card. Fill out this form to claim: https://prize-center-xyz.com/claim"
                                    </p>
                                </div>
                            </div>
                            <div className="mb-8 p-6 rounded-2xl border-2 border-error bg-error-container/10 fraud-pulse flex gap-4">
                                <span className="material-symbols-outlined text-error text-3xl" data-icon="error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                                <div>
                                    <h4 className="text-error font-bold text-xl mb-1 uppercase font-headline">AI Verdict: Scam Alert</h4>
                                    <p className="text-on-surface text-lg leading-relaxed">Typical lottery/prize scam. Designed to harvest personal information via unauthorized forms.</p>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-4 py-5 bg-surface-container-low hover:bg-surface-container-high transition-all rounded-2xl text-primary font-bold text-lg active:scale-95">
                                <span className="material-symbols-outlined text-2xl" data-icon="thumb_up">thumb_up</span>
                                <span>Helpful <span className="font-normal text-on-surface-variant ml-2">(182)</span></span>
                            </button>
                        </article>

                        {/* Report Card 3: Mark_Elderly_Guard */}
                        <article className="bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-sm transition-all hover:shadow-md border border-outline-variant/30">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-tertiary-container rounded-full flex items-center justify-center text-on-tertiary">
                                        <span className="material-symbols-outlined text-3xl" data-icon="admin_panel_settings">admin_panel_settings</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-bold text-on-surface">Mark_Elderly_Guard</span>
                                            <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-0.5 rounded-full text-sm font-semibold flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm" data-icon="verified_user" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                                                Top Guardian
                                            </span>
                                        </div>
                                        <p className="text-on-surface-variant text-base">Reported 8 hours ago</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-8">
                                <h3 className="text-on-surface-variant font-semibold text-sm uppercase tracking-widest mb-4">Reported Message Content</h3>
                                <div className="bg-surface-container-highest p-6 rounded-2xl border-l-8 border-primary">
                                    <p className="text-xl md:text-2xl text-on-surface font-medium italic leading-snug">
                                        "Hello, this is your bank. We noticed suspicious activity on your card. Please call (555) 0199-882 immediately."
                                    </p>
                                </div>
                            </div>
                            <div className="mb-8 p-6 rounded-2xl border-2 border-error bg-error-container/10 fraud-pulse flex gap-4">
                                <span className="material-symbols-outlined text-error text-3xl" data-icon="gpp_maybe" style={{ fontVariationSettings: "'FILL' 1" }}>gpp_maybe</span>
                                <div>
                                    <h4 className="text-error font-bold text-xl mb-1 uppercase font-headline">AI Verdict: High Risk</h4>
                                    <p className="text-on-surface text-lg leading-relaxed">Vishing (Voice Phishing) attempt. Banks will never ask you to call a non-official number provided in a text.</p>
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-4 py-5 bg-surface-container-low hover:bg-surface-container-high transition-all rounded-2xl text-primary font-bold text-lg active:scale-95">
                                <span className="material-symbols-outlined text-2xl" data-icon="thumb_up">thumb_up</span>
                                <span>Helpful <span className="font-normal text-on-surface-variant ml-2">(412)</span></span>
                            </button>
                        </article>
                    </div>

                    {/* Right Sidebar (4 cols) */}
                    <aside className="lg:col-span-4 space-y-8">
                        {/* Simplified Sidebar CTA */}
                        <div className="bg-surface-container-lowest rounded-3xl p-10 shadow-sm border border-outline-variant/30 text-center sticky top-28">
                            <span className="material-symbols-outlined text-6xl text-primary mb-6 block" data-icon="fact_check">fact_check</span>
                            <h3 className="text-2xl font-bold text-on-surface mb-4 font-headline">Not Sure About a Message?</h3>
                            <p className="text-on-surface-variant text-lg mb-10 leading-relaxed">
                                Paste any suspicious text, link, or email content into our AI scanner for an instant safety assessment.
                            </p>
                            <button className="btn-gradient w-full py-6 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3 shadow-lg hover:brightness-110 active:scale-95 transition-all">
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
                        <p className="text-slate-600 dark:text-slate-400 font-body text-lg">© 2024 The Guardian's Lens. Your Digital Concierge.</p>
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