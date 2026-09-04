import React from 'react';
import { Compass, Navigation, ShieldAlert, Info, Sparkles } from 'lucide-react';
import { DriftData, MonteCarloCone } from '../types';

interface DriftPanelProps {
  drift: DriftData;
  monteCarloCone?: MonteCarloCone;
}

export const DriftPanel: React.FC<DriftPanelProps> = ({ drift, monteCarloCone }) => {
  const origin = drift.probable_origin;

  return (
    <div className="glass-panel p-5 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="text-[10px] font-bold tracking-wider text-amber-700 font-mono block">MODULE 2</span>
            <h2 className="font-bold text-slate-900 text-sm tracking-wide uppercase font-mono">
              PRAVAHA-HINDCAST — DRIFT & ORIGIN RECONSTRUCTION
            </h2>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Hindcast: -{drift.hindcast_hours}h Advection
        </span>
      </div>

      {/* Monte Carlo Ensemble Probability Cone Card */}
      {monteCarloCone && (
        <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold font-mono tracking-wide text-teal-300">
                MONTE CARLO ENSEMBLE PROBABILITY CONE
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
              {monteCarloCone.num_realizations || 15} Particles Realized
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Origin Confidence</div>
              <div className="text-sm font-bold text-emerald-400">{monteCarloCone.origin_confidence_pct || 78.5}%</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Ensemble Radius</div>
              <div className="text-sm font-bold text-amber-300">±{monteCarloCone.uncertainty_radius_km || 2.0} km</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Hydrodynamic Model</div>
              <div className="text-sm font-bold text-teal-300">2D Advection + 3.5% Drag</div>
            </div>
          </div>
        </div>
      )}

      {/* Origin Highlight Box */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 font-mono flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            PROBABLE ORIGIN ZONE
          </span>
          <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
            ±{origin.uncertainty_radius_km} km Uncertainty
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="text-[10px] text-amber-700 font-mono uppercase font-semibold">Origin Centroid</div>
            <div className="text-base font-black text-amber-950 font-mono">{origin.lat}° N, {origin.lon}° E</div>
          </div>

          <div>
            <div className="text-[10px] text-amber-700 font-mono uppercase font-semibold">Estimated Release Window</div>
            <div className="text-sm font-bold text-amber-950 font-mono">{origin.estimated_release_window}</div>
          </div>
        </div>
      </div>

      {/* Drift Physics Details */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">DRIFT SPEED</div>
          <div className="text-sm font-bold text-slate-900 font-mono">{drift.drift_speed_kmh} km/h</div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">DRIFT HEADING</div>
          <div className="text-sm font-bold text-slate-900 font-mono">{drift.drift_direction_deg}° (SW)</div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">REVERSE BEARING</div>
          <div className="text-sm font-bold text-slate-900 font-mono">{drift.reverse_bearing_deg}° (NE)</div>
        </div>
      </div>

    </div>
  );
};
