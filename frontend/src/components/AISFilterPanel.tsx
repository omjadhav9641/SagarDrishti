import React from 'react';
import { Filter, ArrowRight, Ship, ShieldCheck, EyeOff, Radio } from 'lucide-react';
import { DarkVesselStats } from '../types';

interface AISFilterPanelProps {
  summary: {
    total_in_region: number;
    spatially_relevant: number;
    present_in_release_window: number;
    strongly_correlated: number;
  };
  darkVessels?: DarkVesselStats;
}

export const AISFilterPanel: React.FC<AISFilterPanelProps> = ({ summary, darkVessels }) => {
  return (
    <div className="glass-panel p-5 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-teal-700 shrink-0" />
          <div>
            <span className="text-[10px] font-bold tracking-wider text-teal-800 font-mono block">MODULE 3</span>
            <h2 className="font-bold text-slate-900 text-sm tracking-wide uppercase font-mono">
              RAKSHAK-TRACE — AIS VESSEL ATTRIBUTION
            </h2>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
          4-Stage Candidate Reduction
        </span>
      </div>

      {/* Dark Vessel Analysis Card */}
      {darkVessels && (
        <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <EyeOff className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold font-mono tracking-wide text-amber-300">
                DARK-VESSEL & NON-AIS TRANSMISSION ANALYSIS
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              {darkVessels.unmatched_sar_echoes} Unmatched SAR Echoes
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">SAR Ship Echoes</div>
              <div className="text-sm font-bold text-slate-200">{darkVessels.sar_echoes_detected || 7} Detected</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">AIS Matched Echoes</div>
              <div className="text-sm font-bold text-teal-300">{darkVessels.ais_matched_echoes || 5} Transmitting</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Dark Vessel Candidates</div>
              <div className="text-sm font-bold text-rose-400">{darkVessels.unmatched_sar_echoes || 2} Potential Non-AIS</div>
            </div>
          </div>
        </div>
      )}

      {/* Funnel Graphic Workflow */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
        
        {/* Stage 1 */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 relative flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">STAGE 1: SECTOR MONITORING</div>
          <div className="my-2">
            <div className="text-3xl font-black text-slate-800 font-mono">{summary.total_in_region}</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">Vessels Tracked in Sector</div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-1.5 font-mono">
            Raw AIS telemetry feed within 50 km sector radius.
          </div>
        </div>

        {/* Stage 2 */}
        <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200 relative flex flex-col justify-between">
          <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider font-mono">STAGE 2: SPATIAL BUFFER</div>
          <div className="my-2">
            <div className="text-3xl font-black text-blue-900 font-mono">{summary.spatially_relevant}</div>
            <div className="text-xs font-semibold text-blue-800 mt-0.5">Within Origin Buffer (25 km)</div>
          </div>
          <div className="text-[10px] text-blue-700 border-t border-blue-200/60 pt-1.5 font-mono">
            Vessels whose track passed origin buffer.
          </div>
        </div>

        {/* Stage 3 */}
        <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 relative flex flex-col justify-between">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono">STAGE 3: TEMPORAL MATCH</div>
          <div className="my-2">
            <div className="text-3xl font-black text-amber-950 font-mono">{summary.present_in_release_window}</div>
            <div className="text-xs font-semibold text-amber-900 mt-0.5">Present in Release Window</div>
          </div>
          <div className="text-[10px] text-amber-800 border-t border-amber-200/70 pt-1.5 font-mono">
            In region between 08:00–10:00 UTC.
          </div>
        </div>

        {/* Stage 4: High Correlated Leads */}
        <div className="bg-teal-50 p-3.5 rounded-xl border border-teal-300 relative flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider font-mono flex items-center justify-between">
            <span>STAGE 4: PRIORITIZED LEADS</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-teal-900 font-mono">{summary.strongly_correlated}</div>
            <div className="text-xs font-bold text-teal-800 mt-0.5">Prioritized Lead Candidates</div>
          </div>
          <div className="text-[10px] text-teal-700 border-t border-teal-200 pt-1.5 font-mono">
            Scored & ranked via multi-factor correlation engine.
          </div>
        </div>

      </div>

    </div>
  );
};
