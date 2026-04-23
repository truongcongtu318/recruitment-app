'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    try {
      const data = await api.post('/auth/login', { email, password });
      
      login(data.token, data.user);
      
      console.log('[Auth] Đăng nhập thành công, User Role:', data.user.role);

      // Role-based redirection
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      if (err.details) {
        const fieldErrors: Record<string, string> = {};
        err.details.forEach((issue: any) => {
          fieldErrors[issue.path[0]] = issue.message;
        });
        setErrors(fieldErrors);
      } else {
        setGeneralError(err.message || 'Đăng nhập thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-md w-full animate-in">
        <div className="text-center space-y-6 mb-12 flex flex-col items-center">
          <div className="flex items-baseline relative scale-150 mb-4">
            <span className="text-5xl font-black text-white tracking-tighter">T</span>
            <span className="text-5xl font-black text-apple-blue tracking-tighter -ml-3">N</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white">Chào mừng trở lại.</h1>
            <p className="text-white/40 text-lg font-medium">Đăng nhập vào hệ thống tuyển dụng TN</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-10 space-y-8 border-white/5">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Địa chỉ Email</label>
              <input 
                required 
                type="email" 
                placeholder="name@company.com"
                className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all font-medium text-white placeholder:text-white/20`}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-[11px] text-red-500 font-bold ml-1 uppercase">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Mật khẩu</label>
              <input 
                required 
                type="password" 
                placeholder="••••••••"
                className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all font-medium text-white placeholder:text-white/20`}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.password}</p>}
            </div>
          </div>

          {generalError && (
            <div className="bg-red-500/10 text-red-500 p-5 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-500/20">
              <AlertCircle className="w-5 h-5" />
              {generalError}
            </div>
          )}

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-white text-black py-5 rounded-full text-lg font-black tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Đăng nhập
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-white/40 font-medium">
          Chưa có tài khoản? <Link href="/register" className="text-apple-blue font-bold hover:text-apple-bright-blue transition-colors">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
