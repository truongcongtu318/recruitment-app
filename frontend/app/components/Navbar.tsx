'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, User, LogOut, Menu, X, ChevronRight, LogIn } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className={`apple-nav transition-all duration-700 ${scrolled ? 'h-16 bg-black/90' : 'h-24 bg-transparent'}`}>
      <div className="apple-container w-full flex items-center justify-between">
        <Link href="/" className="flex items-center group relative scale-110 origin-left transition-transform duration-500">
          <div className="flex items-baseline relative">
            <span className="text-4xl font-black text-white tracking-tighter">T</span>
            <span className="text-4xl font-black text-apple-blue tracking-tighter -ml-2.5">N</span>
          </div>
          <div className="h-5 w-[1px] bg-white/20 mx-5"></div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">Recruitment</span>
        </Link>

        {/* Center Menu */}
        <div className="hidden md:flex items-center gap-12">
          <Link href="/" className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors">Sự nghiệp</Link>
          <Link href="/jobs" className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors">Cơ hội</Link>
          <Link href="/about" className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors">Về chúng tôi</Link>
          <Link href="/support" className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors">Hỗ trợ</Link>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6">
              {user.role === 'admin' && (
                <Link href="/admin" className="text-[11px] font-black uppercase tracking-widest text-apple-blue hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-apple-blue/20">
                  Quản lý
                </Link>
              )}
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{user.fullName}</span>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-white/40 hover:text-red-500 transition-colors group"
              >
                <LogOut size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-3 px-6 py-2.5 rounded-xl border border-white/20 hover:bg-white hover:text-black transition-all group">
              <span className="text-[11px] font-bold uppercase tracking-widest">Đăng nhập</span>
              <LogIn size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black z-50 p-10 flex flex-col justify-center gap-10">
          <button className="absolute top-8 right-8 text-white" onClick={() => setIsMenuOpen(false)}>
            <X size={32} />
          </button>
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-white">Sự nghiệp</Link>
          <Link href="/jobs" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-white">Cơ hội</Link>
          {!user && (
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black text-apple-blue">Đăng nhập</Link>
          )}
        </div>
      )}
    </nav>
  );
}
