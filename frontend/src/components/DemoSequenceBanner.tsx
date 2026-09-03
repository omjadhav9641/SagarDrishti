import React from 'react';
import { CheckCircle2, Loader2, Play } from 'lucide-react';

interface DemoSequenceBannerProps {
  currentStep: number;
}

const STEPS = [
  'Satellite SAR Analysis',
  'Spill Characterization',
  'Ocean Drift Analysis',
  'Origin Reconstruction',
  'AIS Vessel Correlation',
  'Explainable Vessel Ranking'
];

export const DemoSequenceBanner: React.FC<DemoSequenceBannerProps> = ({ currentStep }) => {
  return (
    <div className="w-full bg-slate-900 border-b border-slate-700 px-4 py-2.5 text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        <div className="flex items-center gap-2 text-teal-400 font-mono text-xs font-bold">
          <Play className="w-4 h-4 fill-teal-400 animate-pulse" />
          <span>AUTOMATED INVESTIGATION PIPELINE EXECUTING:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
          {STEPS.map((stepName, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div key={idx} className="flex items-center gap-1.5 whitespace-nowrap">
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all ${
                    isCompleted
                      ? 'bg-teal-900 text-teal-200 border border-teal-600'
                      : isCurrent
                      ? 'bg-teal-600 text-white font-bold ring-2 ring-teal-400 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-teal-300" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  ) : (
                    <span className="text-[10px]">0{stepNum}</span>
                  )}
                  <span>{stepName}</span>
                </div>
                {idx < STEPS.length - 1 && <span className="text-slate-600 font-mono text-xs">→</span>}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
