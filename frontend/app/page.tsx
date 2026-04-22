"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Briefcase, MapPin, DollarSign, Clock, ArrowRight, Zap, Search, ShieldCheck, Sparkles, Filter } from "lucide-react";
import { Job } from "./types";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${apiUrl}/jobs`);
        if (!res.ok) throw new Error('API unreachable');
        const data = await res.json();
        setJobs(data);
      } catch (err: any) {
        console.error("Fetch jobs error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="space-y-24 animate-fade-in">
      {/* Hero Section */}
      <section className="relative py-12 text-center space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-400 px-5 py-2.5 rounded-full border border-blue-500/20 text-xs font-black uppercase tracking-widest animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Next-Gen Career Intelligence</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
          Elevate Your <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Potential</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
          The ultimate recruitment nexus for G12 TechTalent. 
          Bridge the gap between skill and success with AI-driven matching.
        </p>
        
        <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="w-full md:w-[500px] relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search roles by title or tech stack..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg font-medium"
                />
            </div>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/30">
                Explore Jobs
            </button>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 grayscale saturate-0 pointer-events-none">
         <div className="flex items-center gap-2 font-black text-xl italic uppercase">G12 Cloud</div>
         <div className="flex items-center gap-2 font-black text-xl italic uppercase font-serif">TechNexus</div>
         <div className="flex items-center gap-2 font-black text-xl italic uppercase font-mono">QuantumDev</div>
         <div className="flex items-center gap-2 font-black text-xl italic uppercase">AWS Partner</div>
      </div>

      {/* Main Content Grid */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
           <div className="space-y-1">
              <h2 className="text-4xl font-black text-white tracking-tight">Active Opportunities</h2>
              <p className="text-slate-500 font-medium tracking-tight">Curated high-growth tech positions from verified partners.</p>
           </div>
           <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider transition-all">
                <Filter className="w-4 h-4" /> All Roles
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-slate-400 text-xs font-black uppercase tracking-wider hover:text-white transition-all">
                Remote Only
              </button>
           </div>
        </div>

        {loading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="glass h-[320px] rounded-3xl animate-pulse"></div>
             ))}
          </div>
        ) : error ? (
          <div className="py-32 text-center glass rounded-3xl border-dashed border-red-500/20 max-w-2xl mx-auto">
             <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-red-500" />
             </div>
             <h3 className="text-2xl font-bold text-white">Cloud Connection Issue</h3>
             <p className="text-slate-500 mt-2">Database temporarily unreachable. Check your AWS network config.</p>
             <button 
                onClick={() => window.location.reload()} 
                className="mt-8 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest transition-all"
             >
                Retry Handshake
             </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job.id} className="glass glass-hover rounded-3xl p-8 flex flex-col justify-between group">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border ${job.is_hot ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-600/10 text-blue-400 border-blue-600/20'}`}>
                      {job.is_hot ? 'Trending Position' : 'New Intake'}
                    </div>
                    <div className="bg-white/5 px-3 py-1 rounded text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {job.level}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight">
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                        <ShieldCheck className="w-4 h-4" />
                        {job.company}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <MapPin className="w-4 h-4 opacity-40 text-blue-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Clock className="w-4 h-4 opacity-40 text-blue-400" />
                      {job.type}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Est. Salary Range</span>
                        <span className="text-2xl font-black text-white">{job.salary}</span>
                    </div>
                    <Link 
                      href={`/job-details?id=${job.id}`}
                      className="bg-blue-600 hover:bg-white hover:text-black p-4 rounded-2xl transition-all duration-300 group-hover:rotate-6 group-active:scale-90"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Section */}
      <section className="grid md:grid-cols-2 gap-12 py-12">
          <div className="glass p-12 rounded-3xl space-y-6 relative overflow-hidden group">
             <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-600/20 blur-3xl rounded-full group-hover:scale-150 transition-all" />
             <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center p-2.5">
                <Briefcase className="text-white w-full h-full" />
             </div>
             <h3 className="text-3xl font-black text-white leading-tight">Post Your Resume<br/>to AWS Databases</h3>
             <p className="text-slate-400 font-medium leading-relaxed">
                Connect your technical portfolio to our high-performance relational backend powered by RDS Multi-AZ.
             </p>
          </div>
          <div className="glass p-12 rounded-3xl space-y-6 relative overflow-hidden group">
             <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-indigo-600/20 blur-3xl rounded-full group-hover:scale-150 transition-all" />
             <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center p-2.5">
                <ShieldCheck className="text-white w-full h-full" />
             </div>
             <h3 className="text-3xl font-black text-white leading-tight">AI Matching with<br/>Amazon Bedrock</h3>
             <p className="text-slate-400 font-medium leading-relaxed">
                Our architecture uses S3-Lambda triggers to analyze your CV and job matching precision in real-time.
             </p>
          </div>
      </section>
    </div>
  );
}
