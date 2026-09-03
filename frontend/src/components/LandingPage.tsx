import React from 'react';
import { Waves, Play, Upload, BookOpen, ShieldCheck, Compass, Satellite, Anchor, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStartDemo: () => void;
  onOpenUpload: () => void;
  onOpenMethodology: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartDemo,
  onOpenUpload,
  onOpenMethodology
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* HERO SECTION */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-xs font-mono font-bold text-slate-700">
            <Waves className="w-4 h-4 text-teal-600" />
            <span>MARITIME ENVIRONMENTAL INTELLIGENCE PLATFORM</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="flex justify-center items-center py-2">
              <img 
                src="/assets/sagar-drishti-logo.svg" 
                alt="Sagar Drishti Official Logo" 
                className="h-28 sm:h-36 w-auto max-w-full object-contain filter drop-shadow-sm" 
              />
            </div>
            <p className="text-lg sm:text-2xl font-black text-teal-700 tracking-widest font-mono uppercase">
              SEE. TRACE. ATTRIBUTE.
            </p>
            <h2 className="text-base sm:text-lg font-semibold text-slate-700 mt-2">
              AI-powered maritime intelligence for oil-spill detection and source investigation.
            </h2>
          </div>

          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-sans">
            Detect marine oil slicks from satellite imagery, reconstruct probable spill origins using environmental drift modelling, and correlate historical vessel movements to prioritize investigation leads.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onStartDemo}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center space-x-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current text-teal-400" />
              <span>Run Demo Investigation</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm transition-all flex items-center space-x-2"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>New Investigation</span>
            </button>

            <button
              onClick={onOpenMethodology}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>View Methodology</span>
            </button>
          </div>

          <div className="pt-4 text-xs font-mono text-slate-500">
            Pre-loaded with Demonstration Incident <strong className="text-slate-800">SD-001 (Arabian Sea Offshore)</strong>
          </div>
        </div>

        {/* 4 CORE CAPABILITIES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-panel p-6 space-y-3 border-t-4 border-t-blue-600">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <Satellite className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-mono">1. DETECT</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Automated UNet segmentation of dark backscatter anomalies on Sentinel-1 C-Band SAR satellite imagery.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3 border-t-4 border-t-teal-600">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-mono">2. TRACE</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Reverse hydrodynamic drift advection combining surface wind drag and ocean currents to reconstruct the probable origin zone.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3 border-t-4 border-t-amber-600">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <Anchor className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-mono">3. ATTRIBUTE</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              4-stage AIS telemetry filtering funnel evaluating spatial proximity, release window presence, and track alignment.
            </p>
          </div>

          <div className="glass-panel p-6 space-y-3 border-t-4 border-t-rose-600">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-mono">4. EXPLAIN</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Multi-factor correlation scoring engine with transparent evidence checklists and official PDF report exports.
            </p>
          </div>

        </div>

        {/* ABOUT PLATFORM SUMMARY */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 font-mono tracking-tight">
            ABOUT SAGAR DRISHTI
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Sagar Drishti is a maritime environmental intelligence platform designed to connect satellite observations, ocean dynamics, and vessel movement data into a unified oil-spill investigation workflow. Developed for coastguard authorities, marine investigators, and environmental protection agencies to rapidly transition from spill detection to source investigation.
          </p>
        </div>

      </div>
    </div>
  );
};
