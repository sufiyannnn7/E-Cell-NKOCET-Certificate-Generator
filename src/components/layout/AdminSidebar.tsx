'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  FileCheck, 
  UploadCloud, 
  History, 
  ShieldCheck, 
  LogOut,
  Award,
  UserCheck
} from 'lucide-react';

interface AdminSidebarProps {
  onLogout?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState('admin@nkocet.ac.in');

  useEffect(() => {
    async function loadAdminUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email) {
          setAdminEmail(session.user.email);
        } else {
          const stored = localStorage.getItem('ecell_admin_session');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.email) setAdminEmail(parsed.email);
          }
        }
      } catch (e) {
        // Fallback email
      }
    }
    loadAdminUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('ecell_admin_session');
    if (onLogout) {
      onLogout();
    } else {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Generate Certificate', href: '/admin/generate', icon: FileCheck },
    { name: 'Bulk Generate', href: '/admin/bulk', icon: UploadCloud },
    { name: 'Certificates History', href: '/admin/certificates', icon: History },
    { name: 'Public Verification', href: '/verify/EKNK26-EUR-A7X92K', icon: ShieldCheck, target: '_blank' },
  ];

  return (
    <aside className="w-64 bg-navy text-white min-h-screen flex flex-col justify-between p-4 shadow-xl shrink-0">
      <div>
        {/* Header Branding */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-white/10 mb-6">
          <div className="w-10 h-10 rounded-lg bg-electric-blue flex items-center justify-center font-bold text-white shadow-md">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide text-white leading-tight">E-CELL NKOCET</h1>
            <p className="text-[11px] text-gray-300 font-medium">Certificate Portal 2026</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                target={item.target}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-electric-blue text-white shadow-md font-semibold'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Info & Logout */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg border border-white/5">
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-1 text-xs font-bold text-white">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Administrator</span>
            </div>
            <span className="text-[10px] text-gray-400 truncate" title={adminEmail}>
              {adminEmail}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
