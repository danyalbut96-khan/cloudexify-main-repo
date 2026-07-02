'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Menu, LogOut, User, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const supabase = createClient();
  const [adminEmail, setAdminEmail] = useState<string>('admin@cloudexify.com');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setAdminEmail(user.email);
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const logoutToast = toast.loading('Signing out...');
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      
      toast.success('Signed out successfully!', { id: logoutToast });
      router.push('/login');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Logout failed', { id: logoutToast });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Toggle & Page context */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">CloudExify Admin</p>
          <h1 className="text-sm font-semibold text-slate-800 -mt-0.5">Internal Portal</h1>
        </div>
      </div>

      {/* Right: Notification, Profile Info, Logout */}
      <div className="flex items-center space-x-4">
        {/* Notification bell placeholder */}
        <button className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-50 transition-colors relative">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
        </button>

        {/* User Email tag */}
        <div className="flex items-center space-x-2 border-l border-slate-100 pl-4">
          <div className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="hidden md:inline-block text-xs font-semibold text-slate-600">{adminEmail}</span>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          isLoading={isLoggingOut}
          className="text-slate-500 hover:text-red-600 hover:border-red-200 pl-2.5 pr-3 py-1.5 h-8 font-semibold rounded-lg text-xs"
        >
          <LogOut className="h-3.5 w-3.5 mr-1.5" />
          Logout
        </Button>
      </div>
    </header>
  );
};
export default Header;
