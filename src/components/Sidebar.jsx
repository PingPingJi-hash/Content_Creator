import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PenTool, ExternalLink, LogOut, Building2 } from 'lucide-react';

export default function Sidebar({ onLogout }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-gradient-to-r from-[#2BAA99]/20 to-transparent text-[#2BAA99] font-medium border-l-2 border-[#2BAA99]' 
        : 'text-gray-400 hover:text-white hover:bg-[#27272a]'
    }`;

  return (
    <aside className="w-64 bg-[#111111] flex flex-col h-full border-r border-[#27272a]">
      <div className="p-6 mb-4 flex items-center gap-3">
        <Building2 className="text-[#8126F4] w-8 h-8" />
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#8126F4] via-[#2BAA99] to-[#0AACFF] bg-clip-text text-transparent">
          Nexza CMS
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        <NavLink to="/" className={linkClass}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard (Trace)
        </NavLink>
        <NavLink to="/build" className={linkClass}>
          <PenTool className="w-5 h-5" />
          Generator (Build)
        </NavLink>
        
        <div className="pt-4 mt-4 border-t border-[#27272a]">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">External Links</p>
          <a 
            href="https://fm-research-hub.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[#27272a] transition-colors duration-200"
          >
            <ExternalLink className="w-5 h-5" />
            Research Hub
          </a>
        </div>
      </nav>

      <div className="p-4 border-t border-[#27272a]">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
