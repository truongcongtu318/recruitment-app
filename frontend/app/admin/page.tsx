"use client";

import { useState, useEffect } from "react";
import { Users, FileText, Calendar, CheckCircle2, Search, LayoutDashboard, Loader2, Server, ShieldAlert } from "lucide-react";
import { Application } from "../types";

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApplications() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${apiUrl}/admin/applications`);
        if (!res.ok) throw new Error('Security Registry Unreachable');
        const data = await res.json();
        setApplications(data);
      } catch (err: any) {
        console.error("Fetch applications error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchApplications();
  }, []);

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-white">Security Command</h1>
          <p className="text-slate-500 font-medium tracking-tight flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-500" />
            Infrastructure Tier: Private VPC Subnet Access
          </p>
        </div>
        <div className="flex bg-blue-600/10 border border-blue-600/20 px-8 py-4 rounded-3xl gap-6 items-center">
             <div className="text-center border-r border-white/5 pr-6">
                <div className="text-2xl font-black text-white">{applications.length}</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-blue-500">Total Entries</div>
             </div>
             <div className="text-center">
                <div className="text-2xl font-black text-white">Active</div>
                <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">System State</div>
             </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
         <div className="glass p-8 rounded-3xl space-y-4">
            <div className="bg-blue-600/20 w-10 h-10 rounded-xl flex items-center justify-center p-2 text-blue-500">
               <Users className="w-full h-full" />
            </div>
            <div className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Candidate Volume</div>
            <div className="text-3xl font-black text-white">High Capacity</div>
         </div>
         <div className="glass p-8 rounded-3xl space-y-4">
            <div className="bg-indigo-600/20 w-10 h-10 rounded-xl flex items-center justify-center p-2 text-indigo-500">
               <FileText className="w-full h-full" />
            </div>
            <div className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Database State</div>
            <div className="text-3xl font-black text-white">RDS Primary</div>
         </div>
         <div className="glass p-8 rounded-3xl space-y-4">
            <div className="bg-green-600/20 w-10 h-10 rounded-xl flex items-center justify-center p-2 text-green-500">
               <ShieldAlert className="w-full h-full" />
            </div>
            <div className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Security Posture</div>
            <div className="text-3xl font-black text-white">OAC Enabled</div>
         </div>
      </div>

      {/* Table Section */}
      <div className="glass rounded-[2rem] overflow-hidden">
        <div className="p-8 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3 font-black text-sm uppercase tracking-widest text-blue-500">
            <LayoutDashboard className="w-5 h-5" />
            Registry Management (Relational JOIN Query)
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search registry..."
              className="bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-blue-500 transition-all w-64 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 opacity-30">
               <Loader2 className="w-12 h-12 animate-spin mb-6 text-blue-500" />
               <p className="font-black text-xs tracking-widest uppercase">Deciphering Encrypted Data...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-500 font-black bg-red-500/5 uppercase tracking-widest text-xs">
               Critical: {error}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500">
                  <th className="px-8 py-6">IDENTIFIER</th>
                  <th className="px-8 py-6">TARGET POSITION</th>
                  <th className="px-8 py-6">TIMESTAMP</th>
                  <th className="px-8 py-6">ENCRYPTION</th>
                  <th className="px-8 py-6 text-right">PROTOCOL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-white/[0.03] transition-all group">
                      <td className="px-8 py-6">
                        <div className="font-black text-white text-lg group-hover:text-blue-400 transition-colors">{app.full_name}</div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-tight">{app.email}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-blue-400">{app.job_title}</div>
                        <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{app.job_company}</div>
                      </td>
                      <td className="px-8 py-6 text-slate-400 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 opacity-30" />
                          {new Date(app.submitted_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-blue-600/10 text-blue-400 text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-blue-500/10">
                          {app.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="bg-white/5 hover:bg-blue-600 hover:text-white p-3 rounded-xl transition-all">
                          <FileText className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center text-slate-600">
                      <div className="space-y-4">
                        <CheckCircle2 className="w-12 h-12 mx-auto opacity-20" />
                        <p className="font-black uppercase tracking-[0.2em] text-xs">Waiting for Incoming Transmissions...</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
