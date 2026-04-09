import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const Awareness = () => {
  // 1. Quản lý trạng thái Like cho 4 bài viết
  const [likes, setLikes] = useState({
    article1: { count: 142, isLiked: false },
    article2: { count: 389, isLiked: false },
    article3: { count: 256, isLiked: false },
    article4: { count: 512, isLiked: false }
  });

  // Hàm xử lý khi nhấn Like
  const handleToggleLike = (id) => {
    setLikes(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        count: prev[id].isLiked ? prev[id].count - 1 : prev[id].count + 1,
        isLiked: !prev[id].isLiked
      }
    }));
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* TopNavBar */}
      <nav className="bg-white/80 backdrop-blur-xl flex justify-between items-center w-full px-6 h-20 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-extrabold text-primary font-headline tracking-tight">
            Fraud Scanner AI
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/scan" className="text-on-surface-variant font-headline font-bold hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
              Scan Content
            </Link>
            <Link to="/scam-report" className="text-on-surface-variant font-headline font-bold hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
              Report Scam
            </Link>
            <Link to="/awareness" className="text-primary border-b-4 border-primary font-headline font-bold px-3 py-2">
              Awareness Hub
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-primary hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-primary text-3xl cursor-pointer">account_circle</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-16">
          <h1 className="text-5xl font-black font-headline text-primary mb-4 tracking-tight">Awareness Hub</h1>
          <p className="text-[18px] text-on-surface-variant max-w-2xl leading-relaxed">
            Stay informed with the latest fraud intelligence. Our AI curates real-time alerts to keep you and your family safe.
          </p>
        </header>

        <div className="space-y-12">
          {/* Article Card 1: SMS Scam */}
          <article className="bg-white rounded-xl article-card-shadow p-8 border border-gray-100 transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider">SMS Scam</span>
              <span className="text-gray-500 text-sm">2 days ago</span>
            </div>
            <h2 className="text-[28px] font-bold font-headline text-gray-900 mb-4 leading-tight">Warning: Fake Delivery Packages Requiring Payment</h2>
            <p className="text-[18px] text-gray-600 mb-8 leading-relaxed">
              Scammers are sending SMS messages claiming a package is held due to an unpaid shipping fee. Do not click the link.
            </p>
            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={() => handleToggleLike('article1')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold border ${likes.article1.isLiked ? 'bg-primary text-white border-primary' : 'text-primary border-transparent hover:bg-gray-50'
                  }`}
              >
                <span className={`material-symbols-outlined ${likes.article1.isLiked ? 'fill-icon' : ''}`}>thumb_up</span>
                <span>{likes.article1.count}</span>
              </button>
            </div>
          </article>

          {/* Article Card 2: AI Voice Clone */}
          <article className="bg-white rounded-xl article-card-shadow p-8 border border-gray-100 transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-red-100 text-red-700 font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider">AI Voice Clone</span>
              <span className="text-gray-500 text-sm">3 days ago</span>
            </div>
            <h2 className="text-[28px] font-bold font-headline text-gray-900 mb-4 leading-tight">Alert: AI Voice Clone Phone Calls</h2>
            <p className="text-[18px] text-gray-600 mb-8 leading-relaxed">
              Criminals are using AI to mimic relatives' voices to ask for urgent money transfers. Always verify through another channel.
            </p>
            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={() => handleToggleLike('article2')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold border ${likes.article2.isLiked ? 'bg-primary text-white border-primary' : 'text-primary border-transparent hover:bg-gray-50'
                  }`}
              >
                <span className={`material-symbols-outlined ${likes.article2.isLiked ? 'fill-icon' : ''}`}>thumb_up</span>
                <span>{likes.article2.count}</span>
              </button>
            </div>
          </article>

          {/* Article Card 3: Crypto Scam (NEW) */}
          <article className="bg-white rounded-xl article-card-shadow p-8 border border-gray-100 transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-yellow-100 text-yellow-800 font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider">Investment</span>
              <span className="text-gray-500 text-sm">5 days ago</span>
            </div>
            <h2 className="text-[28px] font-bold font-headline text-gray-900 mb-4 leading-tight">New Cryptocurrency Investment "Pig Butchering" Scams</h2>
            <p className="text-[18px] text-gray-600 mb-8 leading-relaxed">
              Be cautious of strangers on social media promising high returns on crypto platforms. These apps are often rigged to steal your deposit.
            </p>
            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={() => handleToggleLike('article3')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold border ${likes.article3.isLiked ? 'bg-primary text-white border-primary' : 'text-primary border-transparent hover:bg-gray-50'
                  }`}
              >
                <span className={`material-symbols-outlined ${likes.article3.isLiked ? 'fill-icon' : ''}`}>thumb_up</span>
                <span>{likes.article3.count}</span>
              </button>
            </div>
          </article>

          {/* Article Card 4: Malicious Apps (NEW) */}
          <article className="bg-white rounded-xl article-card-shadow p-8 border border-gray-100 transition-transform duration-300 hover:scale-[1.01]">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-purple-100 text-purple-700 font-bold px-4 py-1.5 rounded-full text-sm uppercase tracking-wider">Security</span>
              <span className="text-gray-500 text-sm">1 week ago</span>
            </div>
            <h2 className="text-[28px] font-bold font-headline text-gray-900 mb-4 leading-tight">Malicious "Black Credit" Apps Spreading via Social Media</h2>
            <p className="text-[18px] text-gray-600 mb-8 leading-relaxed">
              Dangerous loan apps are requesting excessive permissions to access your contacts and photos for blackmail. Download only from official stores.
            </p>
            <div className="pt-6 border-t border-gray-100">
              <button
                onClick={() => handleToggleLike('article4')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold border ${likes.article4.isLiked ? 'bg-primary text-white border-primary' : 'text-primary border-transparent hover:bg-gray-50'
                  }`}
              >
                <span className={`material-symbols-outlined ${likes.article4.isLiked ? 'fill-icon' : ''}`}>thumb_up</span>
                <span>{likes.article4.count}</span>
              </button>
            </div>
          </article>
        </div>
      </main>

      <footer className="bg-slate-100 w-full py-12 px-8 mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start">
          <div className="max-w-md">
            <span className="font-headline font-black uppercase text-primary text-2xl block mb-4">Fraud Scanner AI</span>
            <p className="text-slate-500 text-lg leading-relaxed">© 2024 Fraud Scanner AI. Your Security, Our Authority.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Awareness;