import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { DiscoverPage } from './pages/DiscoverPage';
import { ArchivePage } from './pages/ArchivePage';
import { SketchExplorerPage } from './pages/SketchExplorerPage';
import { FlightLabPage } from './pages/FlightLabPage';
import { checkBackendHealth, fetchMachines } from './services/api';
import type { Machine } from './types';
import './styles/renaissance.css';

export function App() {
  const [activeTab, setActiveTab] = useState<'discover' | 'archive' | 'sketch' | 'lab'>('discover');
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);
  const [policyLoaded, setPolicyLoaded] = useState<boolean>(false);
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    checkHealth();
    loadMachines();

    const healthInterval = setInterval(checkHealth, 5000);
    return () => clearInterval(healthInterval);
  }, []);

  const checkHealth = async () => {
    try {
      const health = await checkBackendHealth();
      setIsBackendHealthy(health.status === 'healthy');
      setPolicyLoaded(health.policy_loaded);
    } catch {
      setIsBackendHealthy(false);
      setPolicyLoaded(false);
    }
  };

  const loadMachines = async () => {
    try {
      const data = await fetchMachines();
      setMachines(data);
    } catch (err) {
      console.warn('Machines fetch error:', err);
    }
  };

  const handleSelectMachineForLab = () => {
    setActiveTab('lab');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F2E8] text-[#171714]">
      {/* Top Renaissance Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendHealthy={isBackendHealthy}
        policyLoaded={policyLoaded}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'discover' && (
          <DiscoverPage
            onEnterLab={() => setActiveTab('lab')}
            onExploreArchive={() => setActiveTab('archive')}
          />
        )}

        {activeTab === 'archive' && (
          <ArchivePage
            machines={machines}
            onSelectMachineForLab={handleSelectMachineForLab}
          />
        )}

        {activeTab === 'sketch' && (
          <SketchExplorerPage
            onGoToFlightLab={() => setActiveTab('lab')}
          />
        )}

        {activeTab === 'lab' && (
          <FlightLabPage
            isBackendHealthy={isBackendHealthy}
            policyLoaded={policyLoaded}
          />
        )}
      </main>

      {/* Editorial Renaissance Footer */}
      <footer className="border-t border-[#9A7447]/30 bg-[#EFE6D2]/60 py-8 mt-16 font-serif text-xs text-[#5E5D57]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left space-y-1">
            <span className="font-bold text-[#171714] tracking-wider block">
              DA VINCI'S DREAM • IL SOGNO DI LEONARDO
            </span>
            <span className="italic">
              An AI-Powered Renaissance Invention Laboratory • c. 1505 – 2026
            </span>
          </div>

          <div className="text-center md:text-right font-mono text-[11px] text-[#785630]">
            <span>FastAPI • PyTorch CUDA • Stable-Baselines3 • Three.js WebGL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
