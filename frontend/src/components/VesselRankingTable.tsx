import React from 'react';
import { VesselCandidate } from '../types';
import { Award, ChevronRight, Anchor, Info } from 'lucide-react';

interface VesselRankingTableProps {
  vessels: VesselCandidate[];
  selectedVessel: VesselCandidate | null;
  onSelectVessel: (vessel: VesselCandidate) => void;
}

export const VesselRankingTable: React.FC<VesselRankingTableProps> = ({
  vessels,
  selectedVessel,
  onSelectVessel
}) => {
  return (
    <div id="vessel-ranking-section" className="glass-panel p-5 space-y-4 scroll-mt-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Anchor className="w-5 h-5 text-slate-800" />
            <h2 className="font-bold text-slate-900 text-sm tracking-wide uppercase font-mono">
              POTENTIALLY ASSOCIATED VESSELS
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Ranked using spatial, temporal, trajectory, and behavioral correlation indicators.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">High</span>
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">Medium</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">Low Priority</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Vessel Candidate</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Distance to Origin</th>
              <th className="py-2.5 px-3">Closest Timestamp</th>
              <th className="py-2.5 px-3 text-center">Score</th>
              <th className="py-2.5 px-3 text-center">Priority</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {vessels.map((vessel, idx) => {
              const isSelected = selectedVessel?.mmsi === vessel.mmsi;
              const isTop = idx === 0;

              let priorityBadge = (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                  LOW
                </span>
              );

              if (vessel.investigation_priority === 'HIGH') {
                priorityBadge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    HIGH
                  </span>
                );
              } else if (vessel.investigation_priority === 'MEDIUM') {
                priorityBadge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    MEDIUM
                  </span>
                );
              }

              return (
                <tr
                  key={vessel.mmsi}
                  onClick={() => onSelectVessel(vessel)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-teal-50/70 border-l-4 border-l-teal-600 font-semibold'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-1">
                      {isTop && <Award className="w-4 h-4 text-amber-500" />}
                      <span className="font-bold text-slate-800">#{idx + 1}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{vessel.vessel_name}</div>
                      <div className="text-[10px] text-slate-500">MMSI: {vessel.mmsi} | Flag: {vessel.flag || 'Panama'}</div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-700">
                    {vessel.vessel_type}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`font-bold ${vessel.min_distance_to_origin_km <= 3 ? 'text-amber-800' : 'text-slate-700'}`}>
                      {vessel.min_distance_to_origin_km} km
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-600">
                    {(vessel.closest_timestamp.includes('T') ? vessel.closest_timestamp.split('T')[1] : vessel.closest_timestamp).slice(0, 5)} UTC
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-black text-slate-900 text-sm">{vessel.correlation_score}</span>
                    <span className="text-[10px] text-slate-400">/100</span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    {priorityBadge}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVessel(vessel);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all flex items-center space-x-1 ml-auto ${
                        isSelected
                          ? 'bg-teal-700 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
