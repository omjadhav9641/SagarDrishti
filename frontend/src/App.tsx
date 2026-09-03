import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardHeader } from './components/DashboardHeader';
import { DemoSequenceBanner } from './components/DemoSequenceBanner';
import { MapContainer } from './components/MapContainer';
import { LayerControls, MapLayerState } from './components/LayerControls';
import { DetectionPanel } from './components/DetectionPanel';
import { EnvironmentalPanel } from './components/EnvironmentalPanel';
import { DriftPanel } from './components/DriftPanel';
import { AISFilterPanel } from './components/AISFilterPanel';
import { VesselRankingTable } from './components/VesselRankingTable';
import { ExplainableAIPanel } from './components/ExplainableAIPanel';
import { TimelinePanel } from './components/TimelinePanel';

import { UploadModal } from './components/UploadModal';
import { ScoringConfigModal } from './components/ScoringConfigModal';
import { ReportModal } from './components/ReportModal';
import { MethodologyModal } from './components/MethodologyModal';

import { fetchHealthStatus, fetchDemoIncident, rankVesselsWithWeights } from './services/api';
import { IncidentData, VesselCandidate, ScoringWeights, DetectionResult } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'landing'>('dashboard');
  const [incident, setIncident] = useState<IncidentData | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<VesselCandidate | null>(null);
  const [systemStatus, setSystemStatus] = useState<string>('ONLINE');

  const [layers, setLayers] = useState<MapLayerState>({
    showSpill: true,
    showMask: true,
    showOrigin: true,
    showBackcast: true,
    showForecast: true,
    showVessels: true,
    showVectors: true,
    sarOpacity: 0.65
  });

  // Modal States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  // Demo Animation States
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Scoring Weights State
  const [weights, setWeights] = useState<ScoringWeights>({
    spatial: 0.25,
    temporal: 0.25,
    trajectory: 0.20,
    anomaly: 0.10,
    ais_gap: 0.10,
    drift: 0.10
  });

  // Initial load
  useEffect(() => {
    fetchHealthStatus().then(res => {
      setSystemStatus(res.status || 'ONLINE');
    });

    loadDemoScenario();
  }, []);

  const loadDemoScenario = async () => {
    const data = await fetchDemoIncident();
    setIncident(data);
    if (data.ranked_vessels.length > 0) {
      setSelectedVessel(data.ranked_vessels[0]);
    }
  };

  const handleRunFullDemo = async () => {
    setActiveTab('dashboard');
    setIsDemoRunning(true);
    setDemoStep(1);

    // Step 1: Satellite SAR Analysis
    await new Promise(r => setTimeout(r, 600));
    setDemoStep(2);

    // Step 2: Spill Characterization
    await new Promise(r => setTimeout(r, 600));
    setDemoStep(3);

    // Step 3: Ocean Drift Model
    await new Promise(r => setTimeout(r, 600));
    setDemoStep(4);

    // Step 4: Probable Origin Reconstruction
    await new Promise(r => setTimeout(r, 600));
    setDemoStep(5);

    // Step 5: AIS Telemetry Funnel
    const data = await fetchDemoIncident();
    setIncident(data);
    await new Promise(r => setTimeout(r, 600));
    setDemoStep(6);

    // Step 6: Multi-Factor Ranking & Evidence Highlight
    if (data.ranked_vessels.length > 0) {
      setSelectedVessel(data.ranked_vessels[0]);
    }
    await new Promise(r => setTimeout(r, 500));
    setIsDemoRunning(false);

    // Celebration Confetti
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleUpdateWeights = async (newWeights: ScoringWeights) => {
    setWeights(newWeights);
    if (!incident) return;

    const ranked = await rankVesselsWithWeights(
      incident.ranked_vessels,
      incident.drift.backcast.probable_origin.lat,
      incident.drift.backcast.probable_origin.lon,
      newWeights
    );

    setIncident(prev => prev ? { ...prev, ranked_vessels: ranked } : null);
    if (ranked.length > 0) {
      setSelectedVessel(ranked[0]);
    }
  };

  const handleSelectVesselByMmsi = (mmsi: number) => {
    if (!incident) return;
    const found = incident.ranked_vessels.find(v => v.mmsi === mmsi);
    if (found) setSelectedVessel(found);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenWeights={() => setIsConfigOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onRunDemo={handleRunFullDemo}
        onLoadDemoData={loadDemoScenario}
      />

      {/* Demo Pipeline Progress Sequence Banner */}
      {isDemoRunning && <DemoSequenceBanner currentStep={demoStep} />}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {activeTab === 'landing' ? (
          <LandingPage
            onStartDemo={handleRunFullDemo}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenMethodology={() => setIsMethodologyOpen(true)}
          />
        ) : incident ? (
          <div className="space-y-6">
            {/* Top Dashboard Metrics Summary */}
            <DashboardHeader
              incident={incident}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenWeights={() => setIsConfigOpen(true)}
              onOpenReport={() => setIsReportOpen(true)}
              onRunDemo={handleRunFullDemo}
            />

            {/* Layer Controls & Opacity Slider */}
            <LayerControls layers={layers} setLayers={setLayers} />

            {/* Centerpiece Map Container */}
            <MapContainer
              incident={incident}
              layers={layers}
              selectedVessel={selectedVessel}
              onSelectVessel={setSelectedVessel}
            />

            {/* Technical Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Satellite & Environmental */}
              <div className="space-y-6">
                <DetectionPanel
                  detection={incident.detection}
                  sarImageB64={incident.sar_image_b64}
                  onOpacityChange={(op) => setLayers(prev => ({ ...prev, sarOpacity: op }))}
                />
                <EnvironmentalPanel environmental={incident.environmental} />
              </div>

              {/* Middle Column: Drift Model & AIS Filtering */}
              <div className="space-y-6">
                <DriftPanel drift={incident.drift.backcast} />
                <AISFilterPanel summary={incident.ais_summary} />
                <TimelinePanel
                  timeline={incident.timeline}
                  selectedVesselMmsi={selectedVessel?.mmsi}
                  onSelectEventVessel={handleSelectVesselByMmsi}
                />
              </div>

              {/* Right Column: Ranked Vessels & Explainable AI */}
              <div className="space-y-6">
                <VesselRankingTable
                  vessels={incident.ranked_vessels}
                  selectedVessel={selectedVessel}
                  onSelectVessel={setSelectedVessel}
                />
                <ExplainableAIPanel
                  vessel={selectedVessel}
                  onOpenWeightsModal={() => setIsConfigOpen(true)}
                />
              </div>

            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500 font-mono">
            Loading Sagar Drishti Maritime Intelligence Platform...
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-bold text-slate-800">
            SAGAR DRISHTI — SEE. TRACE. ATTRIBUTE.
          </div>
          <div>
            Maritime Environmental Intelligence Platform for Spill Detection, Drift Hindcasting & Vessel Correlation
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => loadDemoScenario()}
      />

      <ScoringConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        weights={weights}
        onSaveWeights={handleUpdateWeights}
      />

      {incident && (
        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          incident={incident}
        />
      )}

      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
    </div>
  );
}
export default App;
