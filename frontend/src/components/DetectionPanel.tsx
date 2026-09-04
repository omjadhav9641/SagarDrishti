import React, { useState } from 'react';
import { Satellite, Info, Eye, Layers, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { DetectionResult, LookAlikeFilterResult } from '../types';

interface DetectionPanelProps {
  detection: DetectionResult;
  lookAlike?: LookAlikeFilterResult;
  sarImageB64: string;
  onOpacityChange: (opacity: number) => void;
}

export const DetectionPanel: React.FC<DetectionPanelProps> = ({
  detection,
  lookAlike,
  sarImageB64,
  onOpacityChange
}) => {
  const [maskOpacity, setMaskOpacity] = useState<number>(0.75);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMaskOpacity(val);
    onOpacityChange(val);
  };

  return (
    <div className="glass-panel p-5 space-y-4">
      
      {/* Header with Product Module Name */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <Satellite className="w-5 h-5 text-teal-700 shrink-0" />
          <div>
            <span className="text-[10px] font-bold tracking-wider text-teal-800 font-mono block">MODULE 1</span>
            <h2 className="font-bold text-slate-900 text-sm tracking-wide uppercase font-mono">
              DRISHTI-SCAN — SATELLITE DETECTION
            </h2>
          </div>
        </div>

        {/* Scientific Classification Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Potential Oil Slick ({detection.confidence}%)
          </span>
        </div>
      </div>

      {/* Look-Alike Filter Card */}
      {lookAlike && (
        <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold font-mono tracking-wide text-emerald-400">
                LOOK-ALIKE FILTER ANALYSIS
              </span>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              {lookAlike.verdict} ({lookAlike.confidence})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {(lookAlike.checks || []).map((chk, cIdx) => (
              <div key={cIdx} className="flex items-start space-x-2 bg-slate-800/60 p-2 rounded border border-slate-700/50">
                {chk.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-slate-200">{chk.name}:</span>
                  <span className="text-slate-400 ml-1">{chk.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Dual Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Original SAR Image */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 font-mono">
            <span>Sentinel-1 C-Band SAR (Original)</span>
            <span className="text-slate-400">VV Polarization</span>
          </div>
          <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shadow-inner">
            <img
              src={sarImageB64 || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzBmMTcyYSIvPjwvc3ZnPg=='}
              alt="Sentinel-1 SAR Satellite Imagery"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* AI Mask Overlay */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 font-mono">
            <span>AI UNet Segmentation Overlay</span>
            <span className="text-teal-700 font-bold">{Math.round(maskOpacity * 100)}% Opacity</span>
          </div>
          <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shadow-inner">
            <img
              src={sarImageB64 || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzBmMTcyYSIvPjwvc3ZnPg=='}
              alt="Base SAR"
              className="w-full h-full object-cover"
            />
            <img
              src={detection.mask_base64}
              alt="AI Mask"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150"
              style={{ opacity: maskOpacity }}
            />
          </div>
        </div>

      </div>

      {/* Opacity Control Slider */}
      <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
        <Layers className="w-4 h-4 text-slate-500" />
        <span className="font-medium text-slate-700 font-mono">Mask Opacity:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={maskOpacity}
          onChange={handleSliderChange}
          className="w-full accent-teal-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />
        <span className="font-mono font-bold text-slate-800 w-10 text-right">
          {Math.round(maskOpacity * 100)}%
        </span>
      </div>

      {/* Morphometric Feature Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">ESTIMATED AREA</div>
          <div className="text-sm font-bold text-slate-900 font-mono">{detection.area_km2} km²</div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">PERIMETER</div>
          <div className="text-sm font-bold text-slate-900 font-mono">{detection.perimeter_km} km</div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">LENGTH × WIDTH</div>
          <div className="text-sm font-bold text-slate-900 font-mono">{detection.length_km} × {detection.width_km} km</div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">COMPACTNESS RATIO</div>
          <div className="text-sm font-bold text-slate-900 font-mono">{detection.compactness}</div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 sm:col-span-2">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono">SPILL CENTROID</div>
          <div className="text-sm font-bold text-slate-900 font-mono">{detection.centroid.lat}° N, {detection.centroid.lon}° E</div>
        </div>
      </div>

    </div>
  );
};
