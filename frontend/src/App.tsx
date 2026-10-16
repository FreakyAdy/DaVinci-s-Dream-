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
    const healthInterval = setInterval(checkHealth, 6000);
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendHealthy={isBackendHealthy}
        policyLoaded={policyLoaded}
      />

      <main className="flex-1 w-full">
        {activeTab === 'discover' && (
          <DiscoverPage
            onEnterLab={() => setActiveTab('lab')}
            onExploreArchive={() => setActiveTab('archive')}
          />
        )}
        {activeTab === 'archive' && (
          <ArchivePage
            machines={machines}
            onSelectMachineForLab={() => setActiveTab('lab')}
          />
        )}
        {activeTab === 'sketch' && (
          <SketchExplorerPage onGoToFlightLab={() => setActiveTab('lab')} />
        )}
        {activeTab === 'lab' && (
          <FlightLabPage isBackendHealthy={isBackendHealthy} policyLoaded={policyLoaded} />
        )}
      </main>

      <footer style={{ borderTop: '1px solid rgba(212,168,48,0.15)', background: 'var(--bg-elevated)', padding: '1.5rem 2rem' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--gold-400)', textTransform: 'uppercase' }}>
            DA VINCI'S DREAM &bull; Il Sogno di Leonardo &bull; c.&nbsp;1505&nbsp;–&nbsp;2026
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-faint)', letterSpacing: '0.06em' }}>
            FastAPI &bull; PyTorch CUDA &bull; Stable-Baselines3 PPO &bull; Three.js WebGL &bull; React 18
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;