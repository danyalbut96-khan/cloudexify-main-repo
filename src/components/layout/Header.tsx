'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Menu, LogOut, User, Bell, Check, UserPlus, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Button } from '../ui/Button';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const router = useRouter();
  const supabase = createClient();
  const [adminEmail, setAdminEmail] = useState<string>('admin@cloudexify.com');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setAdminEmail(user.email);
      }
    };
    fetchUser();

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setNotifications(data);
    };
    fetchNotifications();

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
        (payload: any) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 10));
          toast.success(`New Alert: ${payload.new.title}`, { icon: '🔔' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAsRead = async (id: string) => {
    await supabase.from('admin_notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  
  const markAllAsRead = async () => {
    const unreadIds = notifications.map(n => n.id);
    if (unreadIds.length > 0) {
      await supabase.from('admin_notifications').update({ is_read: true }).in('id', unreadIds);
      setNotifications([]);
    }
  };

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
        {/* Notification bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-50 transition-colors relative"
          >
            <Bell className="h-4.5 w-4.5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 border-2 border-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] font-semibold text-blue-500 hover:text-blue-600">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs font-medium">
                    No new notifications.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map(n => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'registration' ? 'bg-green-100 text-green-600' : n.type === 'project_submission' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                            {n.type === 'registration' ? <UserPlus className="w-4 h-4" /> : n.type === 'project_submission' ? <FileCode className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800">{n.title}</p>
                            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{n.message}</p>
                          </div>
                          <button onClick={() => markAsRead(n.id)} className="text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
