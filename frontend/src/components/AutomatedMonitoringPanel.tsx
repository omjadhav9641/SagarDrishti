import React, { useState } from 'react';
import { Cpu, Play, CheckCircle2, AlertCircle, RefreshCw, Satellite, Radio, Compass, Layers, ArrowRight } from 'lucide-react';
import { DataSourcesStatus, SARScene, PipelineLogStep } from '../types';

interface AutomatedMonitoringPanelProps {
  dataSourcesStatus: DataSourcesStatus | null;
  scenes: SARScene[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onRunPipeline: (sceneId: string) => Promise<void>;
  isRunning: boolean;
  logs: PipelineLogStep[];
}

export const AutomatedMonitoringPanel: React.FC<AutomatedMonitoringPanelProps> = ({
  dataSourcesStatus,
  scenes,
  activeSceneId,
  onSelectScene,
  onRunPipeline,
  isRunning,
  logs
}) => {
  const [selectedScene, setSelectedScene] = useState<string>(activeSceneId || 'SD-SAR-001');

  React.useEffect(() => {
    if (activeSceneId) {
      setSelectedScene(activeSceneId);
    }
  }, [activeSceneId]);

  const handleTrigger = async () => {
    onSelectScene(selectedScene);
    await onRunPipeline(selectedScene);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 font-mono font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-wider">
                MODE A — AUTOMATED MONITORING PIPELINE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 font-mono">
                AUTOMATED QUEUE
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Satellite Scene Ingestion & Data Feed Status
            </h2>
          </div>
        </div>

        {/* Primary Pipeline CTA */}
        <button
          onClick={handleTrigger}
          disabled={isRunning}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-md ${
            isRunning
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
          }`}
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>EXECUTING PIPELINE...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-white" />
              <span>RUN DEMO AUTO-PIPELINE</span>
            </>
          )}
        </button>
      </div>

      {/* Honest Data Source Status Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        
        {/* Source 1: SAR Satellite */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-blue-600" />
              SAR Satellite Feed
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900">
              {dataSourcesStatus?.sar_source?.status || 'DEMO INGESTION'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            {dataSourcesStatus?.sar_source?.message || 'Sentinel-1 demonstration scenes queue.'}
          </p>
        </div>

        {/* Source 2: AIS Telemetry */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-amber-600" />
              AIS Vessel Telemetry
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-amber-900">
              {dataSourcesStatus?.ais_source?.status || 'DEMO AIS / LIVE PROVIDER NOT CONNECTED'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            {dataSourcesStatus?.ais_source?.message || 'Using deterministic demonstration AIS telemetry dataset.'}
          </p>
        </div>

        {/* Source 3: Environmental Feed */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              Environmental Feed
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-xs font-bold text-teal-900">
              {dataSourcesStatus?.environmental_source?.status || 'DEMO ENVIRONMENTAL DATA'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            {dataSourcesStatus?.environmental_source?.message || 'Loaded demonstration wind/current vectors.'}
          </p>
        </div>

        {/* Source 4: Pipeline Status */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Automated Engine
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-900 uppercase">
              {isRunning ? 'PROCESSING PIPELINE' : 'PIPELINE READY'}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 leading-tight">
            End-to-end ingestion, drift, and correlation pipeline available.
          </p>
        </div>

      </div>

      {/* Ingestion Scene Selector Queue */}
      <div className="space-y-3">
        <label className="text-xs font-bold font-mono text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
          <Satellite className="w-3.5 h-3.5 text-slate-400" />
          SELECT SAR SCENE FROM INGESTION QUEUE:
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenes.map((sc) => {
            const isSelected = selectedScene === sc.scene_id;
            return (
              <div
                key={sc.scene_id}
                onClick={() => {
                  setSelectedScene(sc.scene_id);
                  onSelectScene(sc.scene_id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-teal-500/50'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isSelected ? 'text-teal-400' : 'text-slate-900'}`}>
                      {sc.scene_id}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isSelected ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {sc.satellite}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold mt-1.5 line-clamp-1">
                    {sc.region_name}
                  </h4>
                  <p className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    Acquired: {sc.acquisition_timestamp}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-700/30 flex items-center justify-between text-[11px] font-mono">
                  <span className={isSelected ? 'text-teal-300' : 'text-slate-600'}>
                    {sc.center_lat}°N, {sc.center_lon}°E
                  </span>
                  <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-teal-400' : 'text-slate-700'}`}>
                    Select <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time Pipeline Logs */}
      {logs && logs.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 space-y-2 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-teal-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              PIPELINE EXECUTION LOG (DETERMINISTIC ANALYSIS)
            </span>
            <span className="text-[10px] text-slate-400">
              Steps Completed: {logs.length} / 10
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
            {logs.map((log) => (
              <div key={log.step} className="flex items-start space-x-2.5 text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-slate-400 font-bold">[{log.stage}]</span>{' '}
                  <span className="text-slate-200">{log.message}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{log.timestamp_utc.slice(11, 19)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
