import React from 'react';
import { Waves, Play, FileText, Upload, Sliders, Info, ShieldCheck, Cpu, SlidersHorizontal } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'landing';
  setActiveTab: (tab: 'dashboard' | 'landing') => void;
  viewMode: 'automated' | 'manual';
  setViewMode: (mode: 'automated' | 'manual') => void;
  onOpenUpload: () => void;
  onOpenWeights: () => void;
  onOpenReport: () => void;
  onOpenMethodology: () => void;
  onRunDemo: () => void;
  onLoadDemoData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  viewMode,
  setViewMode,
  onOpenUpload,
  onOpenWeights,
  onOpenReport,
  onOpenMethodology,
  onRunDemo,
  onLoadDemoData
}) => {
  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEFT: Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <img 
              src="/assets/sagar-drishti-logo.svg" 
              alt="Sagar Drishti Logo" 
              className="h-12 w-auto max-h-14 object-contain"
            />
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300 font-mono">
              v1.0
            </span>
          </div>

          {/* CENTER: Navigation & Mode Selection */}
          <nav className="hidden md:flex items-center space-x-1.5 font-mono text-xs">
            <button
              onClick={() => { setActiveTab('dashboard'); setViewMode('automated'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'dashboard' && viewMode === 'automated'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>MODE A: AUTOMATED MONITORING</span>
            </button>

            <button
              onClick={() => { setActiveTab('dashboard'); setViewMode('manual'); }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'dashboard' && viewMode === 'manual'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>MODE B: MANUAL INVESTIGATION</span>
            </button>

            <button
              onClick={onOpenMethodology}
              className="px-2.5 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center space-x-1"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Methodology</span>
            </button>
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center space-x-2.5">
            {/* System Status Indicator */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>● DEMO INGESTION</span>
            </div>

            <button
              onClick={onOpenUpload}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors flex items-center space-x-1"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Import Data</span>
            </button>

            <button
              onClick={onOpenWeights}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors flex items-center space-x-1"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={onOpenReport}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Reports</span>
            </button>

            {/* Primary CTA */}
            <button
              onClick={onRunDemo}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm flex items-center space-x-1.5 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current text-teal-400" />
              <span>RUN DEMO</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
