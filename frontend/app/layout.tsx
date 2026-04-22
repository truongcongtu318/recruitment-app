import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Briefcase, Users, LayoutDashboard, Globe } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "G12 Recruit | Premium AI Talent Platform",
  description: "Secure, AI-powered recruitment solution on AWS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        {/* Top Gradient Blur */}
        <div className="fixed top-0 left-0 w-full h-[500px] bg-blue-600/10 blur-[120px] -z-10 pointer-events-none" />
        
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 glass bg-black/40 px-6 lg:px-12 py-4 flex items-center justify-between backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/30">
              <Briefcase className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tighter">
              G12 <span className="text-blue-500">RECRUIT</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10 font-bold text-sm uppercase tracking-widest">
            <Link href="/" className="flex items-center gap-2 hover:text-blue-500 transition-all opacity-70 hover:opacity-100">
              <Globe className="w-4 h-4" />
              Job Board
            </Link>
            <Link href="/admin" className="flex items-center gap-2 hover:text-blue-500 transition-all opacity-70 hover:opacity-100">
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          </div>

          <div className="flex items-center gap-4">
             <button className="bg-white/5 hover:bg-white/10 px-5 py-2 rounded-full text-xs font-black uppercase transition-all">
                Login
             </button>
             <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-xs font-black uppercase transition-all shadow-lg shadow-blue-600/20">
                Join Network
             </button>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20 min-height-[calc(100vh-160px)]">
          {children}
        </main>
        
        <footer className="border-t border-white/5 mt-20 py-20 px-6 text-center">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-left opacity-40 text-xs font-bold uppercase tracking-widest mb-12">
             <div className="space-y-4">
                <div className="text-white text-sm">Platform</div>
                <div>Browse Jobs</div>
                <div>Advanced Search</div>
                <div>Candidate Dashboard</div>
             </div>
             <div className="space-y-4">
                <div className="text-white text-sm">Resources</div>
                <div>Career Advice</div>
                <div>Market Trends</div>
                <div>Interview Guide</div>
             </div>
             <div className="space-y-4">
                <div className="text-white text-sm">Legal</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Security Compliance</div>
             </div>
          </div>
          <div className="pt-12 border-t border-white/5 opacity-30 text-[10px] uppercase font-black tracking-[0.2em]">
            © 2026 G12 Recruitment Platform. <br/>
            Engineered for High-Performance Talent Acquisition.
          </div>
        </footer>
      </body>
    </html>
  );
}
