import React from 'react';
import { AlertTriangle, Ship, Maximize2, Clock, MapPin, ShieldAlert, Sparkles } from 'lucide-react';
import { IncidentData } from '../types';

interface DashboardHeaderProps {
  incident: IncidentData;
  onOpenUpload: () => void;
  onOpenWeights: () => void;
  onOpenReport: () => void;
  onRunDemo: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  incident,
  onOpenUpload,
  onOpenWeights,
  onOpenReport,
  onRunDemo
}) => {
  const isDemo = incident.incident_id === 'SD-001';

  return (
    <div className="bg-white border-b border-slate-200 py-5 px-4 sm:px-6 lg:px-8 mb-6 shadow-sm">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* Incident Identity Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase font-mono">
                {isDemo ? 'DEMO INVESTIGATION' : 'REAL INCIDENT'}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {isDemo ? 'Demo Incident ID:' : 'Investigation ID:'} <strong className="text-slate-800 font-bold">{incident.incident_id}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Detection: {incident.detection_timestamp}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {incident.title}
            </h1>

            <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 font-mono">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {incident.location_name}
            </p>
          </div>

          {/* Quick Action Bar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onRunDemo}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Simulate Pipeline</span>
            </button>

            <button
              onClick={onOpenReport}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-colors shadow-sm"
            >
              Generate PDF Report
            </button>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          
          {/* Card 1: Spill Area */}
          <div className="glass-panel p-3.5 border-l-4 border-l-rose-500">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              ESTIMATED SLICK AREA
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {incident.detection.area_km2} <span className="text-sm font-semibold text-slate-500">km²</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Perimeter: <span className="text-slate-700 font-medium">{incident.detection.perimeter_km} km</span>
            </div>
          </div>

          {/* Card 2: Detection Confidence */}
          <div className="glass-panel p-3.5 border-l-4 border-l-emerald-500">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              DETECTION CONFIDENCE
            </div>
            <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
              {incident.detection.confidence}%
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Status: <span className="text-emerald-800 font-medium">Potential Oil Slick</span>
            </div>
          </div>

          {/* Card 3: Release Window */}
          <div className="glass-panel p-3.5 border-l-4 border-l-amber-500">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              RELEASE WINDOW
            </div>
            <div className="text-sm font-bold text-slate-800 font-mono mt-1">
              {(incident.detection.estimated_release_window.start.includes('T') ? incident.detection.estimated_release_window.start.split('T')[1] : incident.detection.estimated_release_window.start).slice(0,5)}–{(incident.detection.estimated_release_window.end.includes('T') ? incident.detection.estimated_release_window.end.split('T')[1] : incident.detection.estimated_release_window.end).slice(0,5)} UTC
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Est. Age: <span className="text-slate-700 font-medium">{incident.detection.estimated_release_window.estimated_age_hours}</span>
            </div>
          </div>

          {/* Card 4: Vessels Analyzed */}
          <div className="glass-panel p-3.5 border-l-4 border-l-blue-500">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              VESSELS ANALYZED
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">
              {incident.ais_summary.total_in_region}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              In Spatial Radius: <span className="text-slate-700 font-medium">{incident.ais_summary.spatially_relevant}</span>
            </div>
          </div>

          {/* Card 5: Prioritized Leads */}
          <div className="glass-panel p-3.5 border-l-4 border-l-teal-600">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              INVESTIGATION LEADS
            </div>
            <div className="text-2xl font-black text-teal-700 font-mono mt-1">
              {incident.ais_summary.strongly_correlated}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              High Priority: <span className="text-rose-600 font-bold">1 Vessel</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
