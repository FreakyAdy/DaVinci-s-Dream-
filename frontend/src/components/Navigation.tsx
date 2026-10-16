import React, { useState } from 'react';
import { Feather, Compass, Layers, Wind, BookOpen, Menu, X, Cpu } from 'lucide-react';

interface NavigationProps {
  activeTab: 'discover' | 'archive' | 'sketch' | 'lab';
  setActiveTab: (tab: 'discover' | 'archive' | 'sketch' | 'lab') => void;
  isBackendHealthy: boolean;
  policyLoaded: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isBackendHealthy,
  policyLoaded
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'discover', label: 'Discover', icon: BookOpen, desc: 'Workshop Vision' },
    { id: 'archive', label: 'Invention Archive', icon: Layers, desc: 'Historical Codices' },
    { id: 'sketch', label: 'Sketch Explorer', icon: Feather, desc: 'Drawing Intake & Diagnostics' },
    { id: 'lab', label: '3D Flight Lab', icon: Wind, desc: '3D WebGL Simulation & RL', is3D: true },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-[#F7F2E8]/95 backdrop-blur-md border-b border-[#9A7447]/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Editorial Title */}
          <div 
            onClick={() => setActiveTab('discover')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded border border-[#9A7447] bg-gradient-to-b from-[#F9F4EB] to-[#E8DDC3] flex items-center justify-center shadow-inner group-hover:border-[#785630] transition-colors">
              <Compass className="w-6 h-6 text-[#9A7447] group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#171714] block leading-none">
                DA VINCI’S DREAM
              </span>
              <span className="font-serif italic text-xs tracking-widest text-[#9A7447] block mt-1">
                Laboratorio di Invenzioni Meccaniche (c. 1505)
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2 rounded text-sm font-serif tracking-wider transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'bg-[#E8DDC3] text-[#171714] border-[#9A7447] font-bold shadow-inner'
                      : 'border-transparent text-[#34332E] hover:bg-[#EFE6D2]/60 hover:text-[#171714]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-[#9A7447]' : 'text-[#5E5D57]'} />
                  <span>{item.label}</span>
                  {'is3D' in item && item.is3D && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#9A7447]/20 text-[#785630] border border-[#9A7447]/40 tracking-wider">
                      3D
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* System Status Indicators */}
          <div className="hidden lg:flex items-center gap-3 border-l border-[#9A7447]/20 pl-4 font-mono text-xs">
            <div className="flex items-center gap-1.5" title="Backend Server Status">
              <span className={`w-2 h-2 rounded-full ${isBackendHealthy ? 'bg-[#4B7B6B]' : 'bg-[#A94330]'}`} />
              <span className="text-[#5E5D57]">
                {isBackendHealthy ? 'API Active' : 'Offline Mode'}
              </span>
            </div>
            <div className="flex items-center gap-1.5" title="RL Policy Model Checkpoint">
              <Cpu size={13} className={policyLoaded ? 'text-[#4B7B6B]' : 'text-[#9A7447]'} />
              <span className="text-[#5E5D57]">
                {policyLoaded ? 'PPO Loaded' : 'Untrained'}
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded border border-[#9A7447]/40 text-[#171714] hover:bg-[#E8DDC3]"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#9A7447]/30 bg-[#F7F2E8] px-4 pt-3 pb-5 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded font-serif text-sm flex items-center gap-3 ${
                  isActive
                    ? 'bg-[#E8DDC3] font-bold text-[#171714] border border-[#9A7447]'
                    : 'text-[#34332E] hover:bg-[#EFE6D2]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#9A7447]' : 'text-[#5E5D57]'} />
                <div>
                  <div className="font-bold">{item.label}</div>
                  <div className="font-sans text-xs text-[#5E5D57]">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
