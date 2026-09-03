import React from 'react';
import { Compass, Navigation, ShieldAlert, Info } from 'lucide-react';
import { DriftData } from '../types';

interface DriftPanelProps {
  drift: DriftData;
}

export const DriftPanel: React.FC<DriftPanelProps> = ({ drift }) => {
  const origin = drift.probable_origin;

  return (
    <div className="glass-panel p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Compass className="w-5 h-5 text-amber-600" />
          <h2 className="font-bold text-slate-900 text-sm tracking-wide uppercase font-mono">
            OCEAN DRIFT & PROBABLE ORIGIN RECONSTRUCTION
          </h2>
        </div>

        <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Hindcast: -{drift.hindcast_hours}h
        </span>
      </div>

      {/* Model Note */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start space-x-2 font-mono">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          Drift reconstruction is a simplified advection model using available current and wind vectors. Uncertainty increases with hindcast duration and environmental data uncertainty.
        </p>
      </div>

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
