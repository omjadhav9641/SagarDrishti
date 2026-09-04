import React from 'react';
import { VesselCandidate } from '../types';
import { CheckCircle2, XCircle, FileSearch, Sparkles, Info, ShieldAlert } from 'lucide-react';

interface ExplainableAIPanelProps {
  vessel: VesselCandidate | null;
  onOpenWeightsModal: () => void;
}

export const ExplainableAIPanel: React.FC<ExplainableAIPanelProps> = ({
  vessel,
  onOpenWeightsModal
}) => {
  if (!vessel) {
    return (
      <div className="glass-panel p-6 text-center space-y-3">
        <FileSearch className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-700 font-mono uppercase">NO VESSEL SELECTED</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Click on any candidate vessel in the map or ranking table to inspect multi-factor correlation evidence.
        </p>
      </div>
    );
  }

  const sb = vessel.score_breakdown;

  const scoreBars = [
    { label: 'Spatial Proximity', val: sb.spatial, color: 'bg-blue-600' },
    { label: 'Temporal Correlation', val: sb.temporal, color: 'bg-teal-600' },
    { label: 'Trajectory Compatibility', val: sb.trajectory, color: 'bg-teal-700' },
    { label: 'Behavior Anomaly Signal', val: sb.behavior_anomaly, color: 'bg-amber-600' },
    { label: 'AIS Gap Indicator', val: sb.ais_gap, color: 'bg-amber-500' },
    { label: 'Drift Consistency', val: sb.drift_consistency, color: 'bg-blue-700' },
  ];

  return (
    <div className="glass-panel p-5 space-y-4 border-l-4 border-l-teal-600">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-teal-700" />
            <h2 className="font-bold text-slate-900 text-sm tracking-wide uppercase font-mono">
              EXPLAINABLE FEATURE CONTRIBUTION
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase font-mono">
              Demo feature-contribution model
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Multi-factor audit checklist explaining vessel prioritization score.
          </p>
        </div>

        <button
          onClick={onOpenWeightsModal}
          className="px-2.5 py-1 rounded text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-300 font-mono transition-colors"
        >
          Model Settings
        </button>
      </div>

      {/* Primary Vessel Badge Banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-black text-slate-900">{vessel.vessel_name}</span>
            <span className="text-xs font-mono text-slate-500">({vessel.vessel_type})</span>
          </div>
          <div className="text-xs text-slate-600 font-mono mt-0.5">
            MMSI: <strong>{vessel.mmsi}</strong> | Flag: <strong>{vessel.flag || 'Panama'}</strong>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-2xl font-black text-slate-900">
            {vessel.correlation_score} <span className="text-xs text-slate-400">/100</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
              vessel.investigation_priority === 'HIGH'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : vessel.investigation_priority === 'MEDIUM'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-slate-100 text-slate-700 border border-slate-300'
            }`}
          >
            {vessel.investigation_priority} PRIORITY
          </span>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-xs text-slate-700 font-mono leading-relaxed">
        <strong>Investigative Rationale:</strong> {vessel.explainable_summary}
      </div>

      {/* Score Factor Breakdown Progress Bars */}
      <div className="space-y-2 pt-1">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          MULTI-SIGNAL SCORE BREAKDOWN
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {scoreBars.map((bar) => (
            <div key={bar.label} className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-600 font-medium">{bar.label}</span>
                <span className="font-bold text-slate-900">{bar.val}/100</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${bar.color} transition-all duration-300`}
                  style={{ width: `${bar.val}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Checklist */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          INVESTIGATION EVIDENCE CHECKLIST
        </h4>

        <div className="space-y-1.5">
          {vessel.evidence_checklist.map((item, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-lg border text-xs font-mono flex items-start space-x-2.5 ${
                item.fulfilled
                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {item.fulfilled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span>{item.text}</span>
              </div>
              <span className="font-bold text-slate-700 font-mono text-[10px] shrink-0">
                +{item.score} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Non-Attribution Legal Disclaimer */}
      <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-[11px] text-slate-600 flex items-start space-x-2 font-mono mt-3">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Non-Attribution Disclaimer:</strong> Correlation Score is an investigative prioritization metric combining multiple independent telemetry signals. It does not establish legal responsibility or prove that a vessel caused the spill.
        </p>
      </div>

    </div>
  );
};
