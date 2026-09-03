import React from 'react';
import { TimelineEvent } from '../types';
import { Clock, CheckCircle } from 'lucide-react';

interface TimelinePanelProps {
  timeline: TimelineEvent[];
  selectedVesselMmsi?: number;
  onSelectEventVessel?: (mmsi: number) => void;
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  timeline,
  selectedVesselMmsi,
  onSelectEventVessel
}) => {
  return (
    <div className="glass-panel p-5 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-slate-800" />
          <h2 className="font-bold text-slate-900 text-sm tracking-wide uppercase font-mono">
            CHRONOLOGICAL INVESTIGATION TIMELINE
          </h2>
        </div>

        <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 font-mono">
          7 Events Logged
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((event, idx) => {
          const isVesselMatch = selectedVesselMmsi && event.vessel_mmsi === selectedVesselMmsi;

          return (
            <div
              key={idx}
              onClick={() => event.vessel_mmsi && onSelectEventVessel && onSelectEventVessel(event.vessel_mmsi)}
              className={`relative p-3 rounded-lg border text-xs font-mono transition-all ${
                isVesselMatch
                  ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              } ${event.vessel_mmsi ? 'cursor-pointer' : ''}`}
            >
              {/* Timeline Bullet */}
              <span
                className={`absolute -left-[23px] top-3.5 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                  isVesselMatch ? 'border-teal-600 bg-teal-600' : 'border-slate-400'
                }`}
              />

              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {event.time}
                </span>

                {event.vessel_mmsi && (
                  <span className="text-[10px] text-slate-500 font-bold">
                    Vessel MMSI: {event.vessel_mmsi}
                  </span>
                )}
              </div>

              <div className="font-bold text-slate-900 mt-1.5 text-sm">{event.title}</div>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{event.description}</p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
