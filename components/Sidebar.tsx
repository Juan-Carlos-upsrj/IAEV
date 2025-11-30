import React from 'react';
import { User, BookOpen, UploadCloud, FileText, LogOut, GraduationCap, LayoutDashboard } from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  user: UserType | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, setActiveTab, onLogout }) => {
  if (!user) return null;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'courses', label: 'My Courses', icon: <BookOpen size={20} /> },
    { id: 'portfolio', label: 'Community & Portfolio', icon: <UploadCloud size={20} /> },
    { id: 'kardex', label: 'Academic Kardex', icon: <FileText size={20} /> },
  ];

  return (
    <div className="w-64 h-screen fixed left-0 top-0 glass flex flex-col z-50 transition-all duration-300">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
          <GraduationCap className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          IAEV Online
        </h1>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <img 
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-purple-500/50 object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
