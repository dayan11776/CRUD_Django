import React from "react";
import { UserPlus, Users } from "lucide-react";

interface NavbarProps {
  profileCount: number;
  onNewProfileClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profileCount,
  onNewProfileClick,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              P
            </div>
            <a
              href="/"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              Profile
            </a>
          </div>
          {/* Zone 2: Navigation / Contextual links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#profile-form"
              className="text-slate-900 hover:text-slate-900 transition-colors"
            >
              Profile Form
            </a>
            <a
              href="#profile-directory"
              className="hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <span>Directory</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-700">
                {profileCount}
              </span>
            </a>
            <span className="text-slate-300">·</span>
          </nav>
        </div>
      </div>
    </header>
  );
};
