import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, Database } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (data: any) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess
}) => {
  const [sarFile, setSarFile] = useState<File | null>(null);
  const [aisFile, setAisFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate backend file processing
      await new Promise((resolve) => setTimeout(resolve, 1200));
      onUploadSuccess(null); // Triggers demo re-load or updated data
      onClose();
    } catch (err) {
      console.error('Upload processing failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-teal-400" />
            <h2 className="font-bold text-sm font-mono tracking-wide uppercase">IMPORT INVESTIGATION DATA</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono text-xs">
          
          {/* File Upload 1: SAR Image */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">1. SATELLITE SAR IMAGE (GEOTIFF / PNG)</label>
            <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-teal-600 bg-slate-50 transition-colors text-center cursor-pointer">
              <input
                type="file"
                accept="image/*,.tif,.tiff"
                onChange={(e) => setSarFile(e.target.files?.[0] || null)}
                className="hidden"
                id="sar-input"
              />
              <label htmlFor="sar-input" className="cursor-pointer space-y-1 block">
                <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="text-slate-700 font-semibold block">
                  {sarFile ? sarFile.name : 'Click to select SAR satellite file'}
                </span>
                <span className="text-[10px] text-slate-400">Supports GeoTIFF, PNG, JPEG up to 50MB</span>
              </label>
            </div>
          </div>

          {/* File Upload 2: AIS Telemetry CSV */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">2. AIS TELEMETRY TRACKS (CSV)</label>
            <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-teal-600 bg-slate-50 transition-colors text-center cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setAisFile(e.target.files?.[0] || null)}
                className="hidden"
                id="ais-input"
              />
              <label htmlFor="ais-input" className="cursor-pointer space-y-1 block">
                <Database className="w-6 h-6 text-slate-400 mx-auto" />
                <span className="text-slate-700 font-semibold block">
                  {aisFile ? aisFile.name : 'Click to select AIS telemetry CSV file'}
                </span>
                <span className="text-[10px] text-slate-400">Must contain MMSI, Timestamp, Lat, Lon, SOG, COG</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing Dataset...' : 'Execute Analysis'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
