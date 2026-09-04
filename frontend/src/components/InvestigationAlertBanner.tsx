import React from 'react';
import { AlertTriangle, ShieldAlert, Ship, ArrowRight, FileText, Compass, ExternalLink } from 'lucide-react';
import { IncidentData } from '../types';

interface InvestigationAlertBannerProps {
  incident: IncidentData;
  onOpenReport: () => void;
  onScrollToVessels: () => void;
}

export const InvestigationAlertBanner: React.FC<InvestigationAlertBannerProps> = ({
  incident,
  onOpenReport,
  onScrollToVessels
}) => {
  const topVessel = incident.ranked_vessels[0];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 border border-slate-700/60 shadow-xl space-y-4">
      
      {/* Alert Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-mono font-bold">
            <AlertTriangle className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase font-mono tracking-wider">
                AUTOMATED ALERT DISPATCH
              </span>
              <span className="text-xs font-mono text-slate-300">
                Incident ID: <strong className="text-white font-bold">{incident.incident_id}</strong>
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight mt-0.5">
              POTENTIAL OIL SPILL DETECTED — {incident.title}
            </h2>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>STATUS: REQUIRES INVESTIGATION</span>
          </div>
        </div>
      </div>

      {/* Grid Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
        
        {/* Metric 1 */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase block">SLICK AREA</span>
          <span className="text-lg font-extrabold text-teal-400">{incident.detection.area_km2} km²</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase block">DETECTION CONFIDENCE</span>
          <span className="text-lg font-extrabold text-emerald-400">{incident.detection.confidence}%</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase block">RELEASE WINDOW</span>
          <span className="text-sm font-bold text-amber-300 truncate block">
            {(incident.detection.estimated_release_window.start.includes('T') ? incident.detection.estimated_release_window.start.split('T')[1] : incident.detection.estimated_release_window.start).slice(0,5)}–{(incident.detection.estimated_release_window.end.includes('T') ? incident.detection.estimated_release_window.end.split('T')[1] : incident.detection.estimated_release_window.end).slice(0,5)} UTC
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase block">PROBABLE ORIGIN</span>
          <span className="text-xs font-bold text-teal-300 block truncate">
            {incident.drift.backcast.probable_origin.lat}°N, {incident.drift.backcast.probable_origin.lon}°E
          </span>
        </div>

        {/* Metric 5 & 6: Top Lead Vessel */}
        {topVessel && (
          <div className="col-span-2 bg-slate-900/90 p-3 rounded-xl border border-teal-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-teal-300 text-[10px] font-bold uppercase block flex items-center gap-1">
                <Ship className="w-3.5 h-3.5 text-teal-400" />
                PRIMARY CANDIDATE LEAD
              </span>
              <div className="text-sm font-extrabold text-white">
                {topVessel.vessel_name} <span className="text-slate-400 text-xs font-normal">({topVessel.vessel_type})</span>
              </div>
              <div className="text-[11px] text-teal-200">
                Min Dist to Origin: <strong className="text-white">{topVessel.min_distance_to_origin_km} km</strong>
              </div>
            </div>

            <div className="text-right pl-3 border-l border-slate-700/60">
              <span className="text-[10px] text-slate-400 block uppercase">SCORE</span>
              <span className="text-xl font-black text-amber-400">{topVessel.correlation_score}<span className="text-xs font-semibold text-slate-400">/100</span></span>
            </div>
          </div>
        )}

      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 font-mono text-xs">
        <p className="text-[11px] text-slate-400 leading-normal max-w-2xl">
          <strong className="text-slate-200">Non-Attributive Note:</strong> Telemetry correlation ranks candidate vessels by spatio-temporal likelihood for investigative focus. It does not establish legal guilt or liability.
        </p>

        <div className="flex items-center space-x-2">
          <button
            onClick={onScrollToVessels}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors flex items-center space-x-1.5 border border-slate-700 active:scale-95"
          >
            <Ship className="w-3.5 h-3.5 text-teal-400" />
            <span>Audit Evidence</span>
          </button>

          <button
            onClick={onOpenReport}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-md flex items-center space-x-1.5 active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

    </div>
  );
};
