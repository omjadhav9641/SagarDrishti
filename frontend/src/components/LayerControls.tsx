import React from 'react';
import { Eye, Layers, Compass, Wind, Navigation } from 'lucide-react';

export interface MapLayerState {
  showSpill: boolean;
  showMask: boolean;
  showOrigin: boolean;
  showBackcast: boolean;
  showForecast: boolean;
  showVessels: boolean;
  showVectors: boolean;
  sarOpacity: number;
}

interface LayerControlsProps {
  layers: MapLayerState;
  setLayers: React.Dispatch<React.SetStateAction<MapLayerState>>;
}

export const LayerControls: React.FC<LayerControlsProps> = ({ layers, setLayers }) => {
  const toggle = (key: keyof MapLayerState) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="glass-panel p-3.5 mb-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800">
          <Layers className="w-4 h-4 text-teal-700" />
          <span>MAP LAYERS & VISUALIZATION CONTROLS</span>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          SAR Mask Opacity: <strong className="text-teal-700">{Math.round(layers.sarOpacity * 100)}%</strong>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs font-mono">
        
        <button
          onClick={() => toggle('showSpill')}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            layers.showSpill
              ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Oil Slick
        </button>

        <button
          onClick={() => toggle('showMask')}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            layers.showMask
              ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          SAR Mask
        </button>

        <button
          onClick={() => toggle('showOrigin')}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            layers.showOrigin
              ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Probable Origin
        </button>

        <button
          onClick={() => toggle('showBackcast')}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            layers.showBackcast
              ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          Hindcast Path
        </button>

        <button
          onClick={() => toggle('showForecast')}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            layers.showForecast
              ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 rotate-180" />
          Forecast Path
        </button>

        <button
          onClick={() => toggle('showVessels')}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            layers.showVessels
              ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Vessel Tracks
        </button>

        <button
          onClick={() => toggle('showVectors')}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all ${
            layers.showVectors
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs'
              : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          Wind / Current
        </button>

      </div>
    </div>
  );
};
