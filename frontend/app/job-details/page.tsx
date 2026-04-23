'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Briefcase, MapPin, Clock,
  Calendar, DollarSign, ShieldCheck, Zap, Loader2
} from 'lucide-react';
import ApplicationForm from '../components/ApplicationForm';
import { Job } from '../types';

function JobDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchJob() {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const apiUrl = rawApiUrl.startsWith('http') ? rawApiUrl : `/${rawApiUrl.replace(/^\//, '')}`;
      try {
        const res = await fetch(`${apiUrl}/jobs/${id}`);
        if (!res.ok) throw new Error('Không thể tải thông tin công việc.');
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <Loader2 className="w-12 h-12 animate-spin mb-6 text-apple-blue" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Đang truy xuất dữ liệu...</p>
      </div>
    );
  }

  if (error || !job || !id) {
    return (
      <div className="text-center py-40 apple-container max-w-2xl mx-auto">
        <h1 className="display-hero mb-4 text-apple-near-black">Hết hạn truy cập.</h1>
        <p className="body-text text-slate-500 mb-10">Vị trí này đã được gỡ bỏ hoặc không còn tồn tại trên hệ thống.</p>
        <Link href="/" className="btn-primary">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header Space - Pure Black */}
      <section className="py-24 border-b border-white/5">
        <div className="apple-container animate-in">
          <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all mb-12">
            <ArrowLeft size={14} />
            Quay lại danh sách
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h1 className="display-hero leading-tight text-white">{job.title}</h1>
                {job.is_hot && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full flex items-center gap-1 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    <Zap size={12} fill="currentColor" /> NỔI BẬT
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-10 text-xl font-bold text-white/50">
                <div className="flex items-center gap-2 text-apple-bright-blue">
                  <Briefcase size={24} className="p-1.5 bg-apple-bright-blue/10 rounded-lg" />
                  {job.company}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={24} className="p-1.5 bg-white/5 rounded-lg text-white/80" />
                  {job.location}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 glass-card p-6 border-white/5">
              <ShieldCheck size={32} className="text-apple-bright-blue" />
              <div>
                <div className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Xác thực bởi TN</div>
                <div className="text-white font-bold tracking-tight">An toàn & Bảo mật</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Space - Pure Black */}
      <section className="py-24 bg-black">
        <div className="apple-container">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Main Details */}
            <div className="lg:col-span-7 space-y-12 animate-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Hình thức', value: job.type === 'Full-time' ? 'Toàn thời gian' : job.type, icon: Clock },
                  { label: 'Cấp bậc', value: job.level, icon: Briefcase },
                  { label: 'Mức lương', value: job.salary, icon: DollarSign, highlight: true },
                  { label: 'Hạn cuối', value: new Date(job.deadline).toLocaleDateString('vi-VN'), icon: Calendar }
                ].map((item, idx) => (
                  <div key={idx} className={`glass-card p-6 space-y-3 transition-all hover:border-white/20 ${item.highlight ? 'border-apple-bright-blue/30 bg-apple-bright-blue/5' : 'border-white/5'}`}>
                    <item.icon className={`w-5 h-5 ${item.highlight ? 'text-apple-bright-blue' : 'text-white/30'}`} />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-1">{item.label}</div>
                      <div className="font-bold text-white text-sm">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-card p-10 lg:p-16 space-y-12 border-white/5">
                <div className="space-y-6">
                  <h2 className="text-4xl font-black tracking-tighter text-white">Mô tả công việc.</h2>
                  <div className="w-20 h-1 bg-apple-bright-blue rounded-full" />
                </div>
                <div className="prose prose-invert max-w-none">
                  <p className="text-xl text-white/70 leading-relaxed font-medium whitespace-pre-wrap">
                    {job.description}
                  </p>
                </div>
                
                <div className="pt-12 border-t border-white/5 grid md:grid-cols-2 gap-8 text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-apple-bright-blue" />
                    BẢO MẬT AWS VPC
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={18} className="text-apple-bright-blue" />
                    MÃ HÓA KMS (AES-256)
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Sidebar Form */}
            <div className="lg:col-span-5 sticky top-24 animate-in" style={{ animationDelay: '0.2s' }}>
              <ApplicationForm jobId={parseInt(id)} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function JobDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobDetailsContent />
    </Suspense>
  );
}
