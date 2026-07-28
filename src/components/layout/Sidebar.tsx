'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderGit2,
  FileSignature,
  Receipt,
  History,
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  TrendingUp,
  BrainCircuit,
  LifeBuoy,
  CalendarRange,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    interns: pathname.startsWith('/dashboard/interns') || pathname.startsWith('/dashboard/documents'),
    leadgen: pathname.startsWith('/dashboard/leadgen'),
  });

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      name: 'Interns',
      icon: Users,
      path: '/dashboard/interns',
      hasSubmenu: true,
      submenuKey: 'interns',
      submenu: [
        { name: 'All Interns', path: '/dashboard/interns', icon: Users },
        { name: 'Batch Management', path: '/dashboard/batches', icon: CalendarRange },
        { name: 'Intern Analysis', path: '/dashboard/intern-analysis', icon: BrainCircuit },
        { name: 'Intern Projects (Manual)', path: '/dashboard/intern-projects', icon: FolderGit2 },
        { name: 'Tasks', path: '/dashboard/tasks', icon: FolderGit2 },
        { name: 'Feedback', path: '/dashboard/feedback', icon: FileText },
        { name: 'Testimonials', path: '/dashboard/testimonials', icon: FileText },
        { name: 'Generate Offer Letter', path: '/dashboard/documents/offer-letter', icon: FileText },
        { name: 'Generate Certificate', path: '/dashboard/documents/certificate', icon: FileText },
        { name: 'Generate Experience Cert', path: '/dashboard/documents/experience-certificate', icon: FileText },
        { name: 'Generate Rec Letter', path: '/dashboard/documents/recommendation-letter', icon: FileText },
      ],
    },
    {
      name: 'Lead Generation',
      icon: TrendingUp,
      path: '/dashboard/leadgen',
    },
    {
      name: 'Employees',
      icon: Briefcase,
      path: '#',
      isComingSoon: true,
    },
    {
      name: 'Proposals',
      icon: FileSignature,
      path: '/dashboard/documents/proposal',
    },
    {
      name: 'Invoices',
      icon: Receipt,
      path: '/dashboard/documents/invoice',
    },
    {
      name: 'Audit Log',
      icon: History,
      path: '/dashboard/audit-log',
    },
    {
      name: 'Support Tickets',
      icon: LifeBuoy,
      path: '/dashboard/support',
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/dashboard/settings',
    },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white flex items-center">
                CloudExify<span className="text-blue-500 font-extrabold text-2xl ml-0.5">.</span>
              </span>
              <Badge variant="blue" className="text-[9px] px-1.5 py-0 bg-blue-900/30 text-blue-400 border-blue-900/50">ADMIN</Badge>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isSubActive = item.hasSubmenu && (pathname.startsWith('/dashboard/documents') || pathname.startsWith('/dashboard/leadgen/'));
              const isActive =
                pathname === item.path ||
                (item.path !== '/dashboard' && pathname.startsWith(item.path)) ||
                isSubActive;

              if (item.isComingSoon) {
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-500 cursor-not-allowed select-none text-sm font-medium"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4.5 w-4.5" />
                      <span>{item.name}</span>
                    </div>
                    <Badge variant="neutral" className="text-[9px] px-1.5 py-0 bg-slate-800 text-slate-400 border-none">Soon</Badge>
                  </div>
                );
              }

              if (item.hasSubmenu) {
                const sKey = item.submenuKey || '';
                const isSubOpen = openSubmenus[sKey];
                return (
                  <div key={idx} className="space-y-1">
                    <button
                      onClick={() => toggleSubmenu(sKey)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors text-sm font-medium text-left',
                        isActive
                          ? 'bg-blue-600/10 text-blue-400 font-semibold'
                          : 'hover:bg-slate-800/60 hover:text-white'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-4.5 w-4.5" />
                        <span>{item.name}</span>
                      </div>
                      {isSubOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {isSubOpen && (
                      <div className="pl-6 pr-2 py-1 space-y-1.5 border-l border-slate-800 ml-6 mt-1">
                        {item.submenu?.map((subItem, subIdx) => {
                          const SubIcon = subItem.icon;
                          const isSubItemActive = pathname === subItem.path;
                          return (
                            <Link
                              key={subIdx}
                              href={subItem.path}
                              onClick={() => {
                                if (window.innerWidth < 1024) setIsOpen(false);
                              }}
                              className={cn(
                                'flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                                isSubItemActive
                                  ? 'bg-slate-800 text-white font-semibold'
                                  : 'hover:bg-slate-800/40 hover:text-white text-slate-400'
                              )}
                            >
                              <SubIcon className="h-3.5 w-3.5 text-slate-500" />
                              <span>{subItem.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={idx}
                  href={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/20'
                      : 'hover:bg-slate-800/60 hover:text-white'
                  )}
                >
                  <Icon className={cn('h-4.5 w-4.5', isActive ? 'text-white' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500">
          <p>© 2025 CloudExify Admin</p>
          <p className="mt-0.5 text-[10px]">Version 1.0.0 (Production)</p>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
