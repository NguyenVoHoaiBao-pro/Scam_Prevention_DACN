import React from 'react';
import '../index.css';

const Awareness = () => {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* TopNavBar */}
      <nav className="bg-white/80 backdrop-blur-xl flex justify-between items-center w-full px-6 h-20 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-extrabold text-primary font-headline tracking-tight">Guardian Lens</span>
          <div className="hidden md:flex gap-6 items-center">
            <a className="text-on-surface-variant font-headline font-bold hover:bg-blue-50 px-3 py-2 rounded-lg" href="#">Scan Content</a>
            <a className="text-on-surface-variant font-headline font-bold hover:bg-blue-50 px-3 py-2 rounded-lg" href="#">Report Scam</a>
            <a className="text-primary border-b-4 border-primary font-headline font-bold px-3 py-2" href="#">Awareness Hub</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = '/login'}
            className="text-primary"
          >
            <span className="material-symbols-outlined text-primary text-3xl cursor-pointer">account_circle</span>
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-16">
          <h1 className="text-5xl font-black font-headline text-primary mb-4 tracking-tight">Awareness Hub</h1>
          <p className="text-[18px] text-on-surface-variant max-w-2xl leading-relaxed">
            Stay informed with the latest fraud intelligence. Our Digital Concierge curates real-time alerts to keep you and your family safe from evolving digital threats.
          </p>
        </header>

        <div className="space-y-12">
          {/* Article Card 1 */}
          <article className="bg-white rounded-xl article-card-shadow p-8 border border-gray-100 transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-secondary-container text-primary font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider">SMS Scam</span>
              <span className="text-gray-500 text-sm">2 days ago</span>
            </div>
            <h2 className="text-[28px] font-bold font-headline text-gray-900 mb-4 leading-tight">Warning: Fake Delivery Packages Requiring Payment</h2>
            <p className="text-[18px] text-gray-600 mb-8 leading-relaxed">
              Scammers are sending SMS messages claiming a package is held due to an unpaid shipping fee. Do not click the link.
            </p>
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 text-primary font-bold">
                  <span className="material-symbols-outlined">thumb_up</span>
                  <span>142</span>
                </button>
              </div>
              <a className="text-primary font-bold text-lg hover:underline flex items-center gap-1" href="#">
                Read full article <span className="material-symbols-outlined">chevron_right</span>
              </a>
            </div>
          </article>

          {/* Article Card 2 */}
          <article className="bg-white rounded-xl article-card-shadow p-8 border border-gray-100 transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-red-700 text-white font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider animate-pulse">AI Voice Clone</span>
              <span className="text-gray-500 text-sm">2 days ago</span>
            </div>
            <h2 className="text-[28px] font-bold font-headline text-gray-900 mb-4 leading-tight">Alert: AI Voice Clone Phone Calls</h2>
            <p className="text-[18px] text-gray-600 mb-8 leading-relaxed">
              Criminals are using AI to mimic relatives' voices to ask for urgent money transfers. Always verify through another channel.
            </p>
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 text-primary font-bold">
                  <span className="material-symbols-outlined">thumb_up</span>
                  <span>389</span>
                </button>
              </div>
              <a className="text-primary font-bold text-lg hover:underline flex items-center gap-1" href="#">
                Read full article <span className="material-symbols-outlined">chevron_right</span>
              </a>
            </div>
          </article>
        </div>
      </main>

      <footer className="bg-slate-100 w-full py-12 px-8 mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start">
          <div className="max-w-md">
            <span className="font-headline font-black uppercase text-primary text-2xl block mb-4">Guardian Lens</span>
            <p className="text-slate-500 text-lg leading-relaxed">© 2024 The Guardian's Lens. Your Security, Our Authority.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Awareness;