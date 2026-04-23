'use client';

import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, FileUp, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface ApplicationFormProps {
  jobId: number;
}

export default function ApplicationForm({ jobId }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experienceSummary: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    if (!file) {
      setGeneralError("Vui lòng đính kèm CV (PDF/Word).");
      return;
    }

    setStatus('loading');
    const data = new FormData();
    data.append('jobId', jobId.toString());
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('experienceSummary', formData.experienceSummary);
    data.append('cv', file);

    try {
      await api.post('/apply', data, true);
      setStatus('success');
    } catch (error: any) {
      console.error("Submit error:", error);
      // Handle validation errors (array of issues)
      if (error.details && Array.isArray(error.details)) {
        const fieldErrors: Record<string, string> = {};
        error.details.forEach((issue: any) => {
          fieldErrors[issue.path[0]] = issue.message;
        });
        setErrors(fieldErrors);
        setStatus('idle');
        return;
      }
      setStatus('error');
      // Handle string error details (like 'File too large')
      const msg = typeof error.details === 'string' ? error.details : (error.message || 'Có lỗi xảy ra');
      setGeneralError(msg);
    }
  };

  if (status === 'success') {
    return (
      <div className="glass-card p-12 text-center space-y-8 animate-in border-apple-bright-blue/30">
        <div className="bg-apple-blue w-24 h-24 rounded-full flex items-center justify-center mx-auto text-white shadow-[0_0_40px_rgba(0,113,227,0.4)]">
            <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-white">Hồ sơ đã gửi.</h2>
          <p className="text-white/60 font-medium max-w-sm mx-auto">Chúng tôi đã tiếp nhận hồ sơ của bạn và sẽ phản hồi qua email sớm nhất.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="btn-primary w-full py-4 text-lg"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-10 lg:p-12 space-y-10 animate-in">
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tighter text-white">Ứng tuyển ngay.</h2>
        <p className="text-white/50 font-medium">Gửi hồ sơ của bạn tới hệ thống tuyển dụng TN.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Họ và Tên</label>
          <input 
            required 
            type="text" 
            placeholder="Nguyen Van A"
            className={`w-full bg-white/5 border ${errors.fullName ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all font-medium text-white placeholder:text-white/20`}
            onChange={e => setFormData({...formData, fullName: e.target.value})}
          />
          {errors.fullName && <p className="text-[11px] text-red-500 font-bold ml-1">{errors.fullName}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Email liên hệ</label>
          <input 
            required 
            type="email" 
            placeholder="example@email.com"
            className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all font-medium text-white placeholder:text-white/20`}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          {errors.email && <p className="text-[11px] text-red-500 font-bold ml-1">{errors.email}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Số điện thoại</label>
            <input 
              type="tel" 
              placeholder="09xxx..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all font-medium text-white placeholder:text-white/20"
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">CV (PDF/Word)</label>
            <div className="relative group">
              <input 
                required
                type="file" 
                accept=".pdf,.doc,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={e => setFile(e.target.files?.[0] || null)}
              />
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-3 group-hover:bg-white/10 transition-all border-dashed">
                <FileUp className="w-5 h-5 text-apple-bright-blue" />
                <span className="text-white/40 text-sm font-bold truncate">
                  {file ? file.name : "Chọn file hồ sơ..."}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 ml-1">Tóm tắt kinh nghiệm</label>
          <textarea 
            rows={4} 
            placeholder="Chia sẻ ngắn gọn về kinh nghiệm của bạn..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all font-medium text-white placeholder:text-white/20 resize-none"
            onChange={e => setFormData({...formData, experienceSummary: e.target.value})}
          ></textarea>
        </div>
      </div>

      {generalError && (
        <div className="bg-red-500/10 text-red-500 p-5 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-500/20">
           <AlertCircle size={20} />
           {generalError}
        </div>
      )}

      <button 
        disabled={status === 'loading'}
        type="submit" 
        className="w-full bg-white text-black py-5 rounded-full text-lg font-black tracking-tight hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <>
            Gửi hồ sơ ngay
            <Send className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
