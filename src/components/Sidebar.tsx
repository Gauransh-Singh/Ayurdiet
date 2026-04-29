import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Apple, 
  BarChart3, 
  LogOut,
  HeartPulse,
  Calendar,
  UserCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Role } from '@/types';

interface SidebarProps {
  role: Role;
  currentView: string;
  onViewChange: (view: string) => void;
  onSignOut: () => void;
}

export default function Sidebar({ role, currentView, onViewChange, onSignOut }: SidebarProps) {
  const dietitianLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patient Management', icon: Users },
    { id: 'analysis', label: 'Clinical Analysis', icon: Stethoscope },
    { id: 'diet-builder', label: 'Diet Builder', icon: Apple },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const patientLinks = [
    { id: 'dashboard', label: 'Health Center', icon: LayoutDashboard },
    { id: 'diet-plan', label: 'My Diet Plan', icon: Apple },
    { id: 'progress', label: 'My Progress', icon: BarChart3 },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
  ];

  const links = role === 'dietitian' ? dietitianLinks : patientLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#00966d] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-100">
          <HeartPulse className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-[#00966d] tracking-tight">AyurDiet Pro</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onViewChange(link.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              currentView === link.id 
                ? "bg-green-50 text-[#00966d]" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <link.icon className={cn("w-5 h-5", currentView === link.id ? "text-[#00966d]" : "text-gray-400")} />
            {link.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
