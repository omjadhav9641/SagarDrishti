import React from 'react';
import { X, BookOpen, Layers, ShieldCheck, Compass, Filter, Anchor, FileText } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'SAR Oil-Slick Detection',
      icon: Layers,
      input: 'Sentinel-1 C-Band Synthetic Aperture Radar (SAR) imagery in VV polarization.',
      process: 'Automated thresholding & UNet deep-learning semantic segmentation to isolate dark backscatter slicks.',
      output: 'Binary oil slick mask and confidence percentage.',
      limitation: 'SAR dark slicks can be caused by look-alikes such as low-wind calm sea areas or natural algal blooms.'
    },
    {
      num: '02',
      title: 'Spill Characterization',
      icon: BookOpen,
      input: 'Detected binary slick polygon mask.',
      process: 'Geospatial morphometric analysis extracting area, perimeter, length, width, and compactness ratio.',
      output: 'Quantified slick geometry & geographic centroid coordinates.',
      limitation: 'Sub-pixel slick edges subject to satellite resolution limits (10m grid).'
    },
    {
      num: '03',
      title: 'Ocean Drift Advection',
      icon: Compass,
      input: 'Copernicus ocean surface currents (m/s) & GFS surface wind vector fields (km/h).',
      process: 'Vector advection calculation combining 100% current velocity with 3.5% wind drag factor.',
      output: 'Net advection drift direction & velocity vector (km/h).',
      limitation: 'Assumes uniform surface current over localized search sector.'
    },
    {
      num: '04',
      title: 'Backward Hindcasting',
      icon: Compass,
      input: 'Net advection vector & spill detection timestamp.',
      process: 'Reverse temporal integration stepping backwards in time to reconstruct release path.',
      output: 'Probable Origin Zone centroid and ±2.0 km uncertainty radius.',
      limitation: 'Hindcast uncertainty expands linearly with reverse temporal duration.'
    },
    {
      num: '05',
      title: 'AIS Spatial-Temporal Filtering',
      icon: Filter,
      input: 'Historical AIS vessel track telemetry in sector.',
      process: '4-stage funnel filtering vessels by 50km sector, 25km origin buffer, and release window time.',
      output: 'Refined set of candidate vessels present during spill release.',
      limitation: 'Vessels with disabled or faulty AIS transponders cannot be tracked.'
    },
    {
      num: '06',
      title: 'Vessel Behavioral Analysis',
      icon: Anchor,
      input: 'AIS speed over ground (SOG) & course over ground (COG) time-series.',
      process: 'Anomaly detection for sudden speed drops (>8 knots) and AIS signal transmission gaps near origin.',
      output: 'Behavioral anomaly signals and gap durations.',
      limitation: 'Speed drops may occur for operational reasons unrelated to discharge.'
    },
    {
      num: '07',
      title: 'Correlation Ranking',
      icon: ShieldCheck,
      input: 'Spatial proximity, temporal match, trajectory intersection, behavior anomaly, and drift alignment.',
      process: 'Weighted multi-factor correlation engine calculating overall score (0–100) and priority level.',
      output: 'Ranked list of Potentially Associated Vessels and explainable evidence audit checklist.',
      limitation: 'Score is an investigative prioritization tool, not legal proof of guilt.'
    },
    {
      num: '08',
      title: 'Investigation Reporting',
      icon: FileText,
      input: 'All analytical outputs, evidence checklists, and environmental vectors.',
      process: 'Automated synthesis into official Maritime Investigation PDF Report and CSV evidence exports.',
      output: 'Downloadable publication-ready report.',
      limitation: 'Final legal attribution requires physical sampling & Coast Guard inspection.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-teal-400 tracking-wider uppercase">
              ANALYTICAL WORKFLOW & METHODOLOGY
            </div>
            <h2 className="text-lg font-bold font-mono">
              SAGAR DRISHTI SCIENTIFIC FRAMEWORK
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-xs text-slate-600 font-mono leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            Sagar Drishti integrates satellite Synthetic Aperture Radar (SAR), ocean advection physics, and Automatic Identification System (AIS) telemetry into a transparent 8-stage investigative framework.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {steps.map((s) => {
              const Icon = s.icon;

              return (
                <div key={s.num} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-md bg-slate-900 text-teal-400 font-mono font-bold text-xs flex items-center justify-center">
                        {s.num}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm font-mono">{s.title}</h3>
                    </div>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div>
                      <strong className="text-teal-700 uppercase text-[10px] block">[INPUT]</strong>
                      <span className="text-slate-700">{s.input}</span>
                    </div>

                    <div>
                      <strong className="text-blue-700 uppercase text-[10px] block">[PROCESS]</strong>
                      <span className="text-slate-700">{s.process}</span>
                    </div>

                    <div>
                      <strong className="text-emerald-700 uppercase text-[10px] block">[OUTPUT]</strong>
                      <span className="text-slate-800 font-semibold">{s.output}</span>
                    </div>

                    <div className="bg-amber-50/80 p-2 rounded border border-amber-200 text-amber-900 text-[11px] mt-2">
                      <strong className="uppercase text-[9px] text-amber-700 block">LIMITATION & NOTICE:</strong>
                      {s.limitation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors"
          >
            Close Methodology
          </button>
        </div>

      </div>
    </div>
  );
};
