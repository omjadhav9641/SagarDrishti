import React, { useState } from 'react';
import { X, Sliders, RotateCcw, CheckCircle } from 'lucide-react';
import { ScoringWeights } from '../types';

interface ScoringConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: ScoringWeights;
  onSaveWeights: (weights: ScoringWeights) => void;
}

export const ScoringConfigModal: React.FC<ScoringConfigModalProps> = ({
  isOpen,
  onClose,
  weights,
  onSaveWeights
}) => {
  const [currentWeights, setCurrentWeights] = useState<ScoringWeights>({ ...weights });

  if (!isOpen) return null;

  const defaultWeights: ScoringWeights = {
    spatial: 0.25,
    temporal: 0.25,
    trajectory: 0.20,
    anomaly: 0.10,
    ais_gap: 0.10,
    drift: 0.10
  };

  const handleSliderChange = (key: keyof ScoringWeights, val: number) => {
    setCurrentWeights((prev) => ({
      ...prev,
      [key]: val
    }));
  };

  const handleReset = () => {
    setCurrentWeights(defaultWeights);
  };

  const sumWeights = Object.values(currentWeights).reduce((a, b) => a + b, 0);
  const sumPercent = Math.round(sumWeights * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWeights(currentWeights);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-teal-400" />
            <h2 className="font-bold text-sm font-mono tracking-wide uppercase">CORRELATION MODEL SETTINGS</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono text-xs">
          
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-700">Total Weight Allocation:</span>
            <span className={`font-black text-sm ${sumPercent === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {sumPercent}%
            </span>
          </div>

          <div className="space-y-3">
            
            {/* Spatial */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Spatial Proximity</span>
                <span className="text-teal-700 font-bold">{Math.round(currentWeights.spatial * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={currentWeights.spatial}
                onChange={(e) => handleSliderChange('spatial', parseFloat(e.target.value))}
                className="w-full accent-teal-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Temporal */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Temporal Correlation</span>
                <span className="text-teal-700 font-bold">{Math.round(currentWeights.temporal * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={currentWeights.temporal}
                onChange={(e) => handleSliderChange('temporal', parseFloat(e.target.value))}
                className="w-full accent-teal-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Trajectory */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Trajectory Compatibility</span>
                <span className="text-teal-700 font-bold">{Math.round(currentWeights.trajectory * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={currentWeights.trajectory}
                onChange={(e) => handleSliderChange('trajectory', parseFloat(e.target.value))}
                className="w-full accent-teal-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Behavior Anomaly */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Behavior Anomaly Signal</span>
                <span className="text-teal-700 font-bold">{Math.round(currentWeights.anomaly * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={currentWeights.anomaly}
                onChange={(e) => handleSliderChange('anomaly', parseFloat(e.target.value))}
                className="w-full accent-teal-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* AIS Gap */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>AIS Signal Gap</span>
                <span className="text-teal-700 font-bold">{Math.round(currentWeights.ais_gap * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={currentWeights.ais_gap}
                onChange={(e) => handleSliderChange('ais_gap', parseFloat(e.target.value))}
                className="w-full accent-teal-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Drift Consistency */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Drift Vector Consistency</span>
                <span className="text-teal-700 font-bold">{Math.round(currentWeights.drift * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={currentWeights.drift}
                onChange={(e) => handleSliderChange('drift', parseFloat(e.target.value))}
                className="w-full accent-teal-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm"
            >
              Recalculate Rankings
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
