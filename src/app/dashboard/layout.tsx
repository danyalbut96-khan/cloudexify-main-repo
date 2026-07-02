'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    </div>
  );
}
