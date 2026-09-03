import React, { useState, useEffect } from 'react';
import { X, Download, CheckCircle2, Waves, Info, ExternalLink, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { IncidentData } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentData;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  incident
}) => {
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'ready' | 'error'>('idle');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetFilename = `Sagar_Drishti_Investigation_Report_${incident?.incident_id || 'SD-001'}.pdf`;
  const csvFilename = `Sagar_Drishti_Evidence_${incident?.incident_id || 'SD-001'}.csv`;

  useEffect(() => {
    if (isOpen) {
      handleGeneratePDF();
    } else {
      cleanupPdfUrl();
      setPdfStatus('idle');
      setErrorMessage(null);
    }
  }, [isOpen]);

  const cleanupPdfUrl = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
    setPdfBlob(null);
  };

  const getApiUrl = (endpoint: string) => {
    const base = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '') : '';
    return `${base}${endpoint}`;
  };

  const handleGeneratePDF = async () => {
    setPdfStatus('generating');
    setErrorMessage(null);
    cleanupPdfUrl();

    try {
      const response = await fetch(getApiUrl('/api/report/pdf'));

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error(`PDF Endpoint Error [HTTP ${response.status}]:`, text);
        throw new Error('Unable to generate the PDF report.');
      }

      const rawBlob = await response.blob();

      if (!rawBlob || rawBlob.size === 0) {
        console.error('PDF Endpoint returned 0 bytes');
        throw new Error('Unable to generate the PDF report.');
      }

      // Explicitly wrap blob with application/pdf type
      const createdBlob = new Blob([rawBlob], { type: 'application/pdf' });
      const createdUrl = window.URL.createObjectURL(createdBlob);

      setPdfBlob(createdBlob);
      setPdfUrl(createdUrl);
      setPdfStatus('ready');
    } catch (err: any) {
      console.error('PDF Generation Exception:', err);
      setErrorMessage('Unable to generate the PDF report.');
      setPdfStatus('error');
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl) return;

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = targetFilename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleOpenPDF = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch(getApiUrl('/api/report/csv'));
      if (!response.ok) throw new Error('CSV endpoint error');
      const rawBlob = await response.blob();
      const csvBlob = new Blob([rawBlob], { type: 'text/csv' });
      const url = window.URL.createObjectURL(csvBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = csvFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error('CSV Export Exception:', err);
      window.open(getApiUrl('/api/report/csv'), '_blank');
    }
  };

  if (!isOpen) return null;

  const leadVessel = incident.ranked_vessels[0];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-teal-400 tracking-wider uppercase">
                SEE. TRACE. ATTRIBUTE.
              </div>
              <h2 className="text-lg font-bold font-mono">
                MARITIME OIL-SPILL INVESTIGATION REPORT
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Action Header Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            {pdfStatus === 'generating' && (
              <div className="flex items-center space-x-2 text-teal-700 font-bold bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                <span>Generating PDF...</span>
              </div>
            )}

            {pdfStatus === 'ready' && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>✓ PDF Ready</span>
                </div>
                <div className="text-[11px] text-slate-500 font-semibold">
                  Filename: <strong className="text-slate-800">{targetFilename}</strong>
                </div>
              </div>
            )}

            {pdfStatus === 'error' && (
              <div className="flex items-center space-x-2 text-rose-700 font-bold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{errorMessage || 'Unable to generate the PDF report.'}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {pdfStatus === 'error' && (
              <button
                onClick={handleGeneratePDF}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors flex items-center space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Generate PDF</span>
              </button>
            )}

            {pdfStatus === 'ready' && (
              <>
                <button
                  onClick={handleOpenPDF}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors flex items-center space-x-1.5 shadow-sm font-mono"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Open PDF</span>
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors flex items-center space-x-1.5 shadow-sm active:scale-95 font-mono"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </>
            )}

            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors flex items-center space-x-1.5 shadow-sm font-mono"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Evidence CSV</span>
            </button>
          </div>
        </div>

        {/* Report Document Preview Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 font-sans">
          
          {/* Cover Header Banner */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <img 
                  src="/assets/sagar-drishti-logo.svg" 
                  alt="Sagar Drishti Logo" 
                  className="h-16 w-auto max-w-[240px] object-contain"
                />
              </div>

              <div className="text-right text-xs font-mono text-slate-500">
                <div className="font-bold text-slate-900 text-sm tracking-tight">MARITIME OIL-SPILL INVESTIGATION REPORT</div>
                <div className="text-teal-700 font-bold text-[11px] tracking-wider uppercase">SEE. TRACE. ATTRIBUTE.</div>
                <div className="mt-1">Date: {incident.detection_timestamp}</div>
                <div>Status: <span className="text-teal-700 font-bold uppercase tracking-wider">DEMONSTRATION ANALYSIS</span></div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              1. EXECUTIVE INCIDENT SUMMARY
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">INCIDENT ID</span>
                <strong className="text-slate-900 font-bold">{incident.incident_id}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">POTENTIAL SLICK AREA</span>
                <strong className="text-rose-700 font-bold">{incident.detection.area_km2} km²</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">CONFIDENCE SCORE</span>
                <strong className="text-emerald-700 font-bold">{incident.detection.confidence}%</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">RELEASE WINDOW</span>
                <strong className="text-amber-800 font-bold">
                  {(incident.detection.estimated_release_window.start.includes('T') ? incident.detection.estimated_release_window.start.split('T')[1] : incident.detection.estimated_release_window.start).slice(0,5)}–{(incident.detection.estimated_release_window.end.includes('T') ? incident.detection.estimated_release_window.end.split('T')[1] : incident.detection.estimated_release_window.end).slice(0,5)} UTC
                </strong>
              </div>
            </div>
          </div>

          {/* Section 2: Incident Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              2. INCIDENT OVERVIEW
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              Investigation Title: <strong>{incident.title}</strong><br />
              Geographic Sector: <strong>{incident.location_name}</strong><br />
              Detection Time: <strong>{incident.detection_timestamp}</strong>
            </p>
          </div>

          {/* Section 3: Satellite Oil-Slick Analysis */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              3. SATELLITE OIL-SLICK ANALYSIS
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              Sentinel-1 C-Band SAR imagery processed with UNet semantic segmentation identified dark backscatter attenuation anomalies measuring {incident.detection.area_km2} km².
            </p>
          </div>

          {/* Section 4: Spill Characteristics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              4. SPILL CHARACTERISTICS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs font-mono">
              <div><span className="text-slate-500 block text-[10px]">AREA</span><strong>{incident.detection.area_km2} km²</strong></div>
              <div><span className="text-slate-500 block text-[10px]">PERIMETER</span><strong>{incident.detection.perimeter_km} km</strong></div>
              <div><span className="text-slate-500 block text-[10px]">COMPACTNESS</span><strong>{incident.detection.compactness}</strong></div>
            </div>
          </div>

          {/* Section 5: Environmental Conditions */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              5. ENVIRONMENTAL CONDITIONS
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              Surface Wind: {incident.environmental.wind_speed_kmh} km/h ({incident.environmental.wind_direction_label}) | Ocean Current: {incident.environmental.current_speed_ms} m/s ({incident.environmental.current_direction_label}) | Sea State: {incident.environmental.sea_state}
            </p>
          </div>

          {/* Section 6: Probable Origin & Drift Reconstruction */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              6. PROBABLE ORIGIN & DRIFT RECONSTRUCTION
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              Backward advection modeling reconstructed the <strong>Probable Origin Zone</strong> centered at {incident.drift.backcast.probable_origin.lat}° N, {incident.drift.backcast.probable_origin.lon}° E (±{incident.drift.backcast.probable_origin.uncertainty_radius_km} km uncertainty radius).
            </p>
          </div>

          {/* Section 7: AIS Vessel Analysis */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              7. AIS VESSEL ANALYSIS (FUNNEL FILTERING)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              Sector Feed: {incident.ais_summary.total_in_region} vessels → Origin Buffer: {incident.ais_summary.spatially_relevant} → Release Window: {incident.ais_summary.present_in_release_window} → Prioritized Leads: {incident.ais_summary.strongly_correlated}
            </p>
          </div>

          {/* Section 8: Potentially Associated Vessels */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              8. POTENTIALLY ASSOCIATED CANDIDATE VESSELS
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Rank</th>
                    <th className="p-2.5">Vessel Name</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Dist. to Origin</th>
                    <th className="p-2.5">Score</th>
                    <th className="p-2.5">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(incident.ranked_vessels || []).map((v, i) => (
                    <tr key={v.mmsi} className={i === 0 ? 'bg-teal-50/50 font-bold' : ''}>
                      <td className="p-2.5">#{i + 1}</td>
                      <td className="p-2.5">{v.vessel_name} ({v.mmsi})</td>
                      <td className="p-2.5">{v.vessel_type}</td>
                      <td className="p-2.5">{v.min_distance_to_origin_km} km</td>
                      <td className="p-2.5">{v.correlation_score}/100</td>
                      <td className="p-2.5">
                        <span className={v.investigation_priority === 'HIGH' ? 'text-rose-700' : 'text-slate-700'}>
                          {v.investigation_priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 9: Primary Lead Evidence Checklist */}
          {leadVessel && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                9. PRIMARY INVESTIGATION LEAD EVIDENCE AUDIT ({leadVessel.vessel_name})
              </h3>

              <div className="space-y-2">
                {leadVessel.evidence_checklist.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs font-mono flex items-center justify-between">
                    <span className="text-slate-700">{item.text}</span>
                    <span className="font-bold text-teal-700">+{item.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 10: Chronological Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              10. CHRONOLOGICAL INCIDENT TIMELINE
            </h3>
            <div className="space-y-1.5 font-mono text-xs">
              {incident.timeline.map((evt, idx) => (
                <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 flex justify-between">
                  <span><strong>{evt.time}:</strong> {evt.title} — {evt.description}</span>
                  {evt.vessel_mmsi && <span className="font-bold text-teal-700">MMSI {evt.vessel_mmsi}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Section 11: Methodology */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              11. METHODOLOGY
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              8-stage framework combining satellite SAR UNet segmentation, 2D advection hydrodynamic drift physics, AIS spatial-temporal filtering, and multi-factor correlation scoring.
            </p>
          </div>

          {/* Section 12: Limitations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              12. LIMITATIONS
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              1. Satellite SAR look-alikes may occur during low wind conditions (&lt;3 m/s).<br />
              2. Vessels operating with disabled AIS transponders cannot be tracked.<br />
              3. Hydrodynamic drift vectors assume localized current uniformity.
            </p>
          </div>

          {/* Section 13: Mandatory Legal Disclaimer */}
          <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl space-y-1 text-xs font-mono text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-600" />
              13. NON-ATTRIBUTION LEGAL DISCLAIMER
            </div>
            <p className="leading-relaxed">
              Correlation scores and vessel rankings generated by Sagar Drishti represent investigative prioritization indicators based on telemetry analysis. They do not establish legal responsibility or constitute conclusive proof of liability.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-500">
          <div>SAGAR DRISHTI — SEE. TRACE. ATTRIBUTE.</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
