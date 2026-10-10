'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { Clock } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showWarning, stayLoggedIn } = useSessionTimeout();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Responsive Sidebar component */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Page Body containing Header and Dynamic Slot */}
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden relative h-full">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
          {children}
        </main>
      </div>

      {/* Inactivity Session Timeout Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl relative select-none">
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-4 animate-bounce">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Session Expiring</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Your session will expire in 2 minutes due to inactivity. Click below to stay logged in.
            </p>
            <button
              onClick={stayLoggedIn}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-900/30"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
