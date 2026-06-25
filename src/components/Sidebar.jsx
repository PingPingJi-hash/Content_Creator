import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wand2, ExternalLink, LogOut } from 'lucide-react';

export default function Sidebar({ onSignOut, user }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#8126F4] via-[#2BAA99] to-[#0AACFF] text-transparent bg-clip-text">
          Nexza CMS
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link
          to="/"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            isActive('/') ? 'bg-[#2BAA99]/10 text-[#2BAA99] font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" /> Dashboard (Trace)
        </Link>

        <Link
          to="/build"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
            isActive('/build') ? 'bg-[#8126F4]/10 text-[#8126F4] font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Wand2 className="w-5 h-5" /> Generator (Build)
        </Link>

        <div className="pt-6 pb-2">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">External Links</p>
        </div>
        <a
          href="https://fm-research-hub.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <ExternalLink className="w-5 h-5" /> Research Hub
        </a>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 px-4">
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
