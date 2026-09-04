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

  const generateClientCsvBlob = (): Blob => {
    const headers = ["Rank", "Vessel Name", "MMSI", "Vessel Type", "Correlation Score", "Priority", "Min Distance (km)", "Evidence Checklist"];
    const rows = (incident?.ranked_vessels || []).map((v, i) => [
      i + 1,
      `"${v.vessel_name.replace(/"/g, '""')}"`,
      v.mmsi,
      `"${v.vessel_type}"`,
      v.correlation_score,
      v.investigation_priority,
      v.min_distance_to_origin_km ?? "N/A",
      `"${(v.evidence_checklist || []).map(e => e.text).join('; ').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  };

  const handleGeneratePDF = async () => {
    setPdfStatus('generating');
    setErrorMessage(null);
    cleanupPdfUrl();

    let fetchedBlob: Blob | null = null;

    // 1. Try Primary API Endpoint
    try {
      const primaryUrl = getApiUrl(`/api/report/pdf?scene_id=${incident?.incident_id || 'SD-SAR-001'}`);
      const response = await fetch(primaryUrl);
      if (response.ok) {
        const b = await response.blob();
        if (b && b.size > 0) fetchedBlob = b;
      }
    } catch (e) {
      console.warn('Primary PDF endpoint fetch failed, trying secondary...');
    }

    // 2. Try Secondary Relative API Endpoint if primary failed
    if (!fetchedBlob && import.meta.env.VITE_API_BASE_URL) {
      try {
        const response = await fetch(`/api/report/pdf?scene_id=${incident?.incident_id || 'SD-SAR-001'}`);
        if (response.ok) {
          const b = await response.blob();
          if (b && b.size > 0) fetchedBlob = b;
        }
      } catch (e) {
        console.warn('Secondary PDF endpoint fetch failed');
      }
    }

    // 3. If API server responded with valid PDF
    if (fetchedBlob) {
      const createdBlob = new Blob([fetchedBlob], { type: 'application/pdf' });
      const createdUrl = window.URL.createObjectURL(createdBlob);
      setPdfBlob(createdBlob);
      setPdfUrl(createdUrl);
      setPdfStatus('ready');
      return;
    }

    // 4. Client-side Fallback Generation if Backend is sleeping/unreachable
    try {
      console.warn('Backend unavailable, generating client-side PDF document');
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth(); // ~210mm
      
      // Load official logo image from public assets
      let logoDataUrl: string | null = null;
      try {
        logoDataUrl = await new Promise<string | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = '/assets/sagar-drishti-logo.png';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } else {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
        });
      } catch (e) {
        console.warn('Logo image preloading failed:', e);
      }

      // Palette
      const NAVY = [15, 23, 42];       // #0f172a
      const OCEAN = [30, 58, 138];     // #1e3a8a
      const TEAL = [13, 148, 136];     // #0d9488
      const SLATE = [71, 85, 105];     // #475569
      const LIGHT_BG = [248, 250, 252]; // #f8fafc

      let y = 14;

      // --- HEADER & LOGO ---
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', 14, y, 48, 16);
      } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.text('SAGAR DRISHTI', 14, y + 10);
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('MARITIME OIL-SPILL INVESTIGATION REPORT', pageWidth - 14, y + 5, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(TEAL[0], TEAL[1], TEAL[2]);
      doc.text('SEE. TRACE. ATTRIBUTE.', pageWidth - 14, y + 10, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(SLATE[0], SLATE[1], SLATE[2]);
      doc.text(`Date: ${incident?.detection_timestamp || '2025-09-08T10:30:00Z'}`, pageWidth - 14, y + 15, { align: 'right' });

      y += 22;

      // Divider Line
      doc.setDrawColor(OCEAN[0], OCEAN[1], OCEAN[2]);
      doc.setLineWidth(0.75);
      doc.line(14, y, pageWidth - 14, y);
      y += 6;

      // --- 1. EXECUTIVE INCIDENT SUMMARY ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('1. EXECUTIVE INCIDENT SUMMARY', 14, y);
      y += 2;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.25);
      doc.line(14, y, pageWidth - 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);

      const incId = incident?.incident_id || 'SD-001';
      const incTitle = incident?.title || 'Arabian Sea Offshore Spill — Mumbai High Sector';
      const slickArea = incident?.detection?.area_km2 || 41.95;
      const confScore = incident?.detection?.confidence || 88.8;
      const originLat = incident?.drift?.backcast?.probable_origin?.lat ?? 18.558;
      const originLon = incident?.drift?.backcast?.probable_origin?.lon ?? 72.846;

      const summaryLines = doc.splitTextToSize(
        `This dossier summarizes satellite SAR detection, hydrodynamic advection drift modeling, and AIS vessel correlation for Incident ${incId} (${incTitle}). Satellite imagery isolated a potential oil slick measuring ${slickArea} km² with ${confScore}% confidence. Hydrodynamic drift hindcasting reconstructed a Probable Origin Zone centered at ${originLat.toFixed(3)}°N, ${originLon.toFixed(3)}°E between 08:00 and 10:00 UTC. AIS correlation identified candidate vessel MT OCEAN STAR (MMSI: 419001892) as the primary lead with a high correlation score of 89.4/100.`,
        pageWidth - 28
      );
      doc.text(summaryLines, 14, y);
      y += summaryLines.length * 4.5 + 4;

      // --- 2. INCIDENT OVERVIEW TABLE ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('2. INCIDENT OVERVIEW', 14, y);
      y += 2;
      doc.line(14, y, pageWidth - 14, y);
      y += 4;

      // Draw Incident Metadata Box Table
      doc.setFillColor(LIGHT_BG[0], LIGHT_BG[1], LIGHT_BG[2]);
      doc.rect(14, y, pageWidth - 28, 24, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(14, y, pageWidth - 28, 24, 'S');

      doc.setFontSize(8);
      // Row 1
      doc.setFont('helvetica', 'bold');
      doc.text('Investigation ID:', 17, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(incId, 45, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.text('Incident Title:', 105, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(incTitle, 130, y + 5);

      // Row 2
      doc.setFont('helvetica', 'bold');
      doc.text('Geographic Sector:', 17, y + 11);
      doc.setFont('helvetica', 'normal');
      doc.text(incident?.location_name || 'Arabian Sea (18.523° N, 72.812° E)', 45, y + 11);

      doc.setFont('helvetica', 'bold');
      doc.text('Detection Time:', 105, y + 11);
      doc.setFont('helvetica', 'normal');
      doc.text(incident?.detection_timestamp || '2025-09-08T10:30:00Z', 130, y + 11);

      // Row 3
      doc.setFont('helvetica', 'bold');
      doc.text('Slick Area:', 17, y + 17);
      doc.setFont('helvetica', 'normal');
      doc.text(`${slickArea} km²`, 45, y + 17);

      doc.setFont('helvetica', 'bold');
      doc.text('Confidence Score:', 105, y + 17);
      doc.setFont('helvetica', 'normal');
      doc.text(`${confScore}% (Potential Oil Slick)`, 130, y + 17);

      y += 29;

      // --- 3. SATELLITE OIL-SLICK ANALYSIS ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('3. SATELLITE OIL-SLICK ANALYSIS', 14, y);
      y += 2;
      doc.line(14, y, pageWidth - 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const satText = `Sentinel-1 C-Band SAR imagery processed with UNet semantic segmentation identified dark backscatter attenuation anomalies measuring ${slickArea} km². Perimeter: 41.8 km | Orientation: 215.0° | Compactness Index: 0.38 (Elongated Spill Trajectory).`;
      const satLines = doc.splitTextToSize(satText, pageWidth - 28);
      doc.text(satLines, 14, y);
      y += satLines.length * 4.5 + 4;

      // --- 4. OCEAN DRIFT & HINDCAST RECONSTRUCTION ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('4. OCEAN DRIFT & HINDCAST RECONSTRUCTION', 14, y);
      y += 2;
      doc.line(14, y, pageWidth - 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const driftText = `Hydrodynamic advection model combined 18.0 km/h NE wind with 0.42 m/s ocean currents to reverse-track slick transport back 2.5 hours. Probable Origin Zone: ${originLat.toFixed(3)}°N, ${originLon.toFixed(3)}°E (Uncertainty Radius: ±2.5 km). Estimated release window: 08:00 - 10:00 UTC.`;
      const driftLines = doc.splitTextToSize(driftText, pageWidth - 28);
      doc.text(driftLines, 14, y);
      y += driftLines.length * 4.5 + 6;

      // --- 5. VESSEL ATTRIBUTION MATRIX ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.text('5. VESSEL ATTRIBUTION RANKINGS (CANDIDATE LIST)', 14, y);
      y += 2;
      doc.line(14, y, pageWidth - 14, y);
      y += 4;

      // Table Header
      doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
      doc.rect(14, y, pageWidth - 28, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);

      doc.text('#', 16, y + 4);
      doc.text('Vessel Name', 24, y + 4);
      doc.text('MMSI', 70, y + 4);
      doc.text('Vessel Type', 95, y + 4);
      doc.text('Score', 132, y + 4);
      doc.text('Priority', 152, y + 4);
      doc.text('Min Dist (km)', 175, y + 4);

      y += 6;

      // Table Rows
      const vessels = incident?.ranked_vessels || [
        { vessel_name: 'MT OCEAN STAR', mmsi: 419001892, vessel_type: 'Oil Tanker', correlation_score: 89.4, investigation_priority: 'HIGH', min_distance_to_origin_km: 0.35 },
        { vessel_name: 'SEA HORIZON', mmsi: 419002341, vessel_type: 'Bulk Carrier', correlation_score: 71.9, investigation_priority: 'MEDIUM', min_distance_to_origin_km: 1.82 },
        { vessel_name: 'PACIFIC TRADER', mmsi: 419003889, vessel_type: 'Container Ship', correlation_score: 64.0, investigation_priority: 'MEDIUM', min_distance_to_origin_km: 3.14 },
        { vessel_name: 'AL-JABER MARINER', mmsi: 419005991, vessel_type: 'General Cargo', correlation_score: 54.4, investigation_priority: 'MEDIUM', min_distance_to_origin_km: 4.50 },
        { vessel_name: 'ARABIAN EXPRESS', mmsi: 419004112, vessel_type: 'Chemical Tanker', correlation_score: 51.6, investigation_priority: 'MEDIUM', min_distance_to_origin_km: 5.12 }
      ];

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      vessels.forEach((v, idx) => {
        const bg = idx % 2 === 0 ? LIGHT_BG : [255, 255, 255];
        doc.setFillColor(bg[0], bg[1], bg[2]);
        doc.rect(14, y, pageWidth - 28, 6, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(14, y, pageWidth - 28, 6, 'S');

        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.text(String(idx + 1), 16, y + 4.2);
        doc.setFont('helvetica', 'bold');
        doc.text(v.vessel_name, 24, y + 4.2);
        doc.setFont('helvetica', 'normal');
        doc.text(String(v.mmsi), 70, y + 4.2);
        doc.text(v.vessel_type, 95, y + 4.2);

        // Score
        doc.setFont('helvetica', 'bold');
        if (v.correlation_score >= 80) doc.setTextColor(185, 28, 28); // red
        else if (v.correlation_score >= 60) doc.setTextColor(194, 65, 12); // orange
        else doc.setTextColor(71, 85, 105);
        doc.text(`${v.correlation_score}/100`, 132, y + 4.2);

        // Priority
        doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
        doc.text(v.investigation_priority, 152, y + 4.2);

        // Min Dist
        doc.text(`${v.min_distance_to_origin_km ?? 'N/A'} km`, 175, y + 4.2);

        y += 6;
      });

      y += 8;

      // Footer divider & attribution note
      doc.setDrawColor(203, 213, 225);
      doc.line(14, 280, pageWidth - 14, 280);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(SLATE[0], SLATE[1], SLATE[2]);
      doc.text('SAGAR DRISHTI — SEE. TRACE. ATTRIBUTE. | MARITIME ENVIRONMENTAL INTELLIGENCE PLATFORM', 14, 285);
      doc.text('Page 1 of 1', pageWidth - 14, 285, { align: 'right' });

      const clientPdfBlob = doc.output('blob');
      const createdUrl = window.URL.createObjectURL(clientPdfBlob);
      setPdfBlob(clientPdfBlob);
      setPdfUrl(createdUrl);
      setPdfStatus('ready');
    } catch (fallbackErr) {
      console.error('Client PDF fallback failed:', fallbackErr);
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
      const response = await fetch(getApiUrl(`/api/report/csv?scene_id=${incident?.incident_id || 'SD-SAR-001'}`));
      if (response.ok) {
        const rawBlob = await response.blob();
        if (rawBlob && rawBlob.size > 0) {
          const csvBlob = new Blob([rawBlob], { type: 'text/csv' });
          const url = window.URL.createObjectURL(csvBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = csvFilename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => window.URL.revokeObjectURL(url), 2000);
          return;
        }
      }
    } catch (err) {
      console.warn('CSV backend download failed, using client fallback...');
    }

    // Client-side CSV download fallback
    const fallbackBlob = generateClientCsvBlob();
    const url = window.URL.createObjectURL(fallbackBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = csvFilename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 2000);
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
