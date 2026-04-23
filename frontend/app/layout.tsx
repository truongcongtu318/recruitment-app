'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

import { AuthProvider } from "./context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased bg-black min-h-screen flex flex-col`}>
        <AuthProvider>
          {!isAdminPage && <Navbar />}
          <main className={`flex-grow ${!isAdminPage ? 'pt-20' : ''}`}>
            {children}
          </main>
          
          {!isAdminPage && (
            <footer className="py-12 border-t border-white/5 bg-black">
              <div className="apple-container flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <div>© 2026 TN Recruitment. Bảo lưu mọi quyền.</div>
                <div className="flex gap-8">
                  <a href="#" className="hover:text-white transition-colors">Bảo mật</a>
                  <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
                  <a href="#" className="hover:text-white transition-colors">Liên hệ</a>
                </div>
              </div>
            </footer>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
