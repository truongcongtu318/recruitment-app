"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Clock, Briefcase, Zap, Calendar, Loader2, ArrowLeft, ShieldCheck, DollarSign } from "lucide-react";
import ApplicationForm from "../components/ApplicationForm";
import Link from "next/link";
import { Job } from "../types";

function JobDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
       setLoading(false);
       return;
    }

    async function fetchJob() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${apiUrl}/jobs/${id}`);
        if (!res.ok) throw new Error('Job not found');
        const data = await res.json();
        setJob(data);
      } catch (err: any) {
        console.error("Fetch job error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 opacity-30 animate-pulse">
        <Loader2 className="w-16 h-16 animate-spin mb-6 text-blue-500" />
        <p className="font-black tracking-[0.3em] uppercase text-xs">Accessing Cloud Records...</p>
      </div>
    );
  }

  if (error || !job || !id) {
    return (
      <div className="text-center py-40 glass rounded-3xl max-w-2xl mx-auto border-red-500/10">
        <h1 className="text-5xl font-black mb-4 text-white">Entry Expired</h1>
        <p className="text-slate-500 mb-8 font-medium">The position has been synchronized or removed by the administrator.</p>
        <Link href="/" className="bg-blue-600 text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
          Back to Terminal
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header Space */}
      <div className="space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-blue-500 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Gateway Registry
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white leading-none">{job.title}</h1>
                {job.is_hot && (
                  <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 border border-red-500/20">
                    <Zap className="w-3 h-3 fill-current" /> TRENDING
                  </span>
                )}
             </div>
             
             <div className="flex flex-wrap gap-8 text-xl font-bold">
                <div className="flex items-center gap-2 text-blue-500">
                   <Briefcase className="w-6 h-6 p-1 bg-blue-600/10 rounded-lg" />
                   {job.company}
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                   <MapPin className="w-6 h-6 p-1 bg-white/5 rounded-lg" />
                   {job.location}
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center p-4 border border-white/5">
                <ShieldCheck className="w-full h-full text-blue-500" />
             </div>
             <div>
                <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Verified Employer</div>
                <div className="text-white font-bold tracking-tight">Security Cleared</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Main Details */}
        <div className="lg:col-span-7 space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Employment', value: job.type, icon: Clock },
                    { label: 'Role Level', value: job.level, icon: Briefcase },
                    { label: 'Remuneration', value: job.salary, icon: DollarSign, highlight: true },
                    { label: 'Deadline', value: new Date(job.deadline).toLocaleDateString(), icon: Calendar }
                ].map((item, idx) => (
                    <div key={idx} className={`glass p-6 rounded-2xl space-y-2 ${item.highlight ? 'border-blue-500/30 bg-blue-600/5' : ''}`}>
                        <item.icon className={`w-5 h-5 mb-2 ${item.highlight ? 'text-blue-400' : 'opacity-30'}`} />
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">{item.label}</div>
                        <div className="font-bold text-white text-sm">{item.value}</div>
                    </div>
                ))}
            </div>

            <div className="glass p-12 rounded-3xl space-y-8">
                <div className="space-y-4">
                    <h2 className="text-3xl font-black text-white">The Opportunity</h2>
                    <div className="w-20 h-1.5 bg-blue-600 rounded-full" />
                </div>
                <div className="prose prose-invert max-w-none">
                    <p className="text-xl text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                        {job.description}
                    </p>
                </div>
                
                <div className="pt-12 border-t border-white/5 grid md:grid-cols-2 gap-8 text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        AWS VPC Secured Environment
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        Encryption at Rest (KMS)
                    </div>
                </div>
            </div>
        </div>

        {/* Floating Sidebar Form */}
        <div className="lg:col-span-5 sticky top-32">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[34px] blur opacity-20" />
                <div className="relative">
                    <ApplicationForm jobId={job.id} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-40 opacity-30">
            <Loader2 className="w-16 h-16 animate-spin mb-6 text-blue-500" />
            <p className="font-black tracking-[0.3em] uppercase text-xs">Redirecting to Registry...</p>
        </div>
    }>
      <JobDetailContent />
    </Suspense>
  );
}
