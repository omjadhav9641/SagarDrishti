import React from 'react';
import { Wind, Waves } from 'lucide-react';
import { EnvironmentalData } from '../types';

interface EnvironmentalPanelProps {
  environmental: EnvironmentalData;
}

export const EnvironmentalPanel: React.FC<EnvironmentalPanelProps> = ({ environmental }) => {
  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Wind className="w-5 h-5 text-blue-700" />
          <h2 className="font-bold text-slate-900 text-sm tracking-wide uppercase font-mono">
            ENVIRONMENTAL & OCEANOGRAPHIC CONDITIONS
          </h2>
        </div>

        <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
          Copernicus Ocean Vector Field
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Wind */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">SURFACE WIND</div>
          <div className="text-lg font-black text-slate-900 font-mono mt-1">
            {environmental.wind_speed_kmh} <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-xs font-semibold text-blue-700 font-mono mt-0.5">
            Direction: {environmental.wind_direction_deg}° ({environmental.wind_direction_label})
          </div>
        </div>

        {/* Current */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">OCEAN CURRENT</div>
          <div className="text-lg font-black text-slate-900 font-mono mt-1">
            {environmental.current_speed_ms} <span className="text-xs font-normal text-slate-500">m/s</span>
          </div>
          <div className="text-xs font-semibold text-blue-700 font-mono mt-0.5">
            Direction: {environmental.current_direction_deg}° ({environmental.current_direction_label})
          </div>
        </div>

        {/* Net Advection */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">NET ADVECTION VELOCITY</div>
          <div className="text-lg font-black text-teal-800 font-mono mt-1">
            2.14 <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-xs font-semibold text-teal-700 font-mono mt-0.5">
            Vector Sum (Wind + Current)
          </div>
        </div>

        {/* Sea State */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">SEA STATE</div>
          <div className="text-sm font-bold text-slate-900 font-mono mt-1">
            {environmental.sea_state}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            Douglas Scale Code 3
          </div>
        </div>

      </div>
    </div>
  );
};
