import React, { useState, useEffect } from 'react';
import { Compass, Wind, ArrowRight, BookOpen, Layers, Cpu, ShieldCheck, Box, Eye } from 'lucide-react';
import { Ornithopter3D } from '../components/Ornithopter3D';

interface DiscoverPageProps {
  onEnterLab: () => void;
  onExploreArchive: () => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ onEnterLab, onExploreArchive }) => {
  const [heroViewMode, setHeroViewMode] = useState<'3d' | 'blueprint'>('3d');
  const [previewFlap, setPreviewFlap] = useState<number>(0.0);

  // Gentle idle wing flapping for live 3D showcase
  useEffect(() => {
    if (heroViewMode !== '3d') return;
    let frameId: number;
    const startTime = Date.now();
    const loop = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setPreviewFlap(Math.sin(elapsed * 2.8) * 0.38);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [heroViewMode]);

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-md border border-[#9A7447]/40 bg-[#FAF6EF] shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#E8DDC3] border border-[#9A7447]/40 font-serif text-xs font-bold tracking-widest text-[#785630] uppercase">
              <Compass size={14} />
              Codice sul volo degli uccelli • Folio 8v
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#171714] leading-[1.15] tracking-tight">
              What if Renaissance inventions could learn to fly?
            </h1>

            <p className="font-serif italic text-lg sm:text-xl text-[#9A7447] leading-relaxed">
              « Piglierà il primo volo il grande uccello sopra del dosso del suo magno cecero, empierà l'universo di stupore. »
            </p>

            <p className="font-sans text-sm sm:text-base text-[#34332E] leading-relaxed">
              In 1505, Leonardo da Vinci drafted intricate blueprints of an articulated mechanical flapping ornithopter. Constrained by the limits of human muscle power, his dream of sustained flight remained trapped on parchment. 
              <br /><br />
              <strong>Da Vinci’s Dream</strong> breathes life into these Renaissance folios. Step into an interactive computational laboratory combining a 2D aerodynamic physics engine, continuous Gymnasium reinforcement learning, and real-time 3D WebGL kinematics.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onEnterLab}
                className="btn-renaissance btn-renaissance-primary text-sm px-6 py-3 flex items-center gap-2 shadow-md"
              >
                <Box size={18} />
                <span>Enter 3D Flight Laboratory</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onExploreArchive}
                className="btn-renaissance btn-renaissance-outline text-sm px-6 py-3"
              >
                <BookOpen size={16} />
                <span>Browse Codices</span>
              </button>
            </div>
          </div>

          {/* Right Hero Column: Interactive 3D Model & Manuscript Blueprint */}
          <div className="lg:col-span-6 space-y-3">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1 bg-[#E8DDC3] p-1 rounded border border-[#9A7447]/40 text-xs font-serif shadow-inner">
                <button
                  onClick={() => setHeroViewMode('3d')}
                  className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
                    heroViewMode === '3d'
                      ? 'bg-[#9A7447] text-white font-bold shadow-sm'
                      : 'text-[#34332E] hover:text-[#171714]'
                  }`}
                >
                  <Box size={14} />
                  <span>3D Interactive Model</span>
                </button>
                <button
                  onClick={() => setHeroViewMode('blueprint')}
                  className={`px-3 py-1 rounded flex items-center gap-1.5 transition-all ${
                    heroViewMode === 'blueprint'
                      ? 'bg-[#9A7447] text-white font-bold shadow-sm'
                      : 'text-[#34332E] hover:text-[#171714]'
                  }`}
                >
                  <Eye size={14} />
                  <span>Codex Blueprint</span>
                </button>
              </div>

              {heroViewMode === '3d' && (
                <span className="font-mono text-[11px] text-[#785630] font-semibold bg-[#E8DDC3]/60 px-2 py-0.5 rounded border border-[#9A7447]/30">
                  Drag: Orbit • Scroll: Zoom
                </span>
              )}
            </div>

            {/* Display Container */}
            <div className="parchment-card p-2 corner-ticks overflow-hidden border border-[#9A7447]/50 shadow-lg">
              {heroViewMode === '3d' ? (
                <div className="w-full h-[380px] rounded overflow-hidden border border-[#9A7447]/30 bg-[#f4eee1] relative">
                  <Ornithopter3D
                    x={0}
                    y={25}
                    pitch={0.04}
                    wingStroke={previewFlap}
                    status="on_platform"
                    windX={0}
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="bg-[#FAF6EF]/90 backdrop-blur-sm px-2.5 py-1 rounded font-mono text-[10px] text-[#171714] border border-[#9A7447]/30 shadow-sm">
                      3D Kinematic Rig • Dual-Joint Wings & Linen
                    </span>
                    <button
                      onClick={onEnterLab}
                      className="pointer-events-auto bg-[#9A7447] text-white text-[11px] font-serif font-bold px-3 py-1 rounded shadow hover:bg-[#785630] transition-colors flex items-center gap-1"
                    >
                      <span>Full 3D Flight Lab</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <img
                    src="/assets/hero/ornithopter_blueprint.jpg"
                    alt="Leonardo da Vinci Ornithopter Blueprint"
                    className="w-full h-[380px] object-cover rounded shadow-inner filter contrast-[1.03]"
                  />
                  <div className="mt-2 text-center font-mono text-[11px] text-[#5E5D57]">
                    Fig. 1 — Reconstructio Schematis: Volatilio Meccanica (c. 1505)
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Distinction Banner: Fact vs Computational Speculation */}
      <section className="bg-[#EFE6D2]/80 border-y border-[#9A7447]/30 py-6 px-4 sm:px-8 rounded">
        <div className="max-w-4xl mx-auto flex items-start gap-4">
          <ShieldCheck className="w-8 h-8 text-[#9A7447] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#34332E]">
            <strong className="font-serif text-[#171714] block text-base mb-1">
              Scientific Integrity & Historical Transparency
            </strong>
            Leonardo’s human-powered ornithopter could not achieve sustained flight in real life because human pectoral muscles produce only ~3 W/kg, whereas heavy flapping flight requires ~100 W/kg. In this laboratory, our simulation launches from an elevated cliff platform and pairs mechanical power with a continuous PPO reinforcement learning agent to answer: <em>What kinematics allow an articulated flapping wing to achieve aerodynamic stability and reach the target valley field?</em>
          </div>
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="parchment-card p-6 corner-ticks">
          <div className="w-10 h-10 rounded bg-[#9A7447]/15 border border-[#9A7447]/40 flex items-center justify-center mb-4 text-[#9A7447]">
            <Wind size={22} />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#171714] mb-2">
            2D Physics Engine
          </h3>
          <p className="font-sans text-xs text-[#5E5D57] leading-relaxed">
            Semi-implicit symplectic integration at 50Hz. Simulates lift, drag, stall limits, flapping-induced propulsive thrust, pitch damping, and wind gusts.
          </p>
        </div>

        <div className="parchment-card p-6 corner-ticks">
          <div className="w-10 h-10 rounded bg-[#9A7447]/15 border border-[#9A7447]/40 flex items-center justify-center mb-4 text-[#9A7447]">
            <Cpu size={22} />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#171714] mb-2">
            Reinforcement Learning
          </h3>
          <p className="font-sans text-xs text-[#5E5D57] leading-relaxed">
            Continuous Gymnasium environment (`OrnithopterEnv-v0`) trained with PyTorch PPO. The agent learns to govern amplitude, frequency, and elevator pitch.
          </p>
        </div>

        <div className="parchment-card p-6 corner-ticks">
          <div className="w-10 h-10 rounded bg-[#9A7447]/15 border border-[#9A7447]/40 flex items-center justify-center mb-4 text-[#9A7447]">
            <Compass size={22} />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#171714] mb-2">
            Interactive 3D WebGL
          </h3>
          <p className="font-sans text-xs text-[#5E5D57] leading-relaxed">
            Articulated wooden lattice fuselage, shoulder and elbow joints with cloth membranes that flap in direct synchronization with dynamic aerodynamics.
          </p>
        </div>

        <div className="parchment-card p-6 corner-ticks">
          <div className="w-10 h-10 rounded bg-[#9A7447]/15 border border-[#9A7447]/40 flex items-center justify-center mb-4 text-[#9A7447]">
            <Layers size={22} />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#171714] mb-2">
            Capability Registry
          </h3>
          <p className="font-sans text-xs text-[#5E5D57] leading-relaxed">
            Rigorous machine contract system. Unsupported or historical sketches provide honest capability diagnostics instead of fake simulation claims.
          </p>
        </div>

      </section>

      {/* Workshop Gallery Preview */}
      <section className="parchment-card p-6 sm:p-8 corner-ticks border border-[#9A7447]/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#9A7447]/20 gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#171714]">
              Inside Leonardo's Laboratory
            </h2>
            <p className="font-serif italic text-sm text-[#9A7447]">
              Original computational manuscript reconstructions from the workshop
            </p>
          </div>
          <button onClick={onExploreArchive} className="btn-renaissance text-xs">
            <span>Explore All Inventions</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="space-y-2">
            <div className="aspect-[4/3] rounded overflow-hidden border border-[#9A7447]/40 shadow-sm">
              <img
                src="/assets/illustrations/workshop_lab.jpg"
                alt="Renaissance Workshop Environment"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="font-serif text-sm font-bold text-[#171714]">The Inventor's Desk</div>
            <div className="font-sans text-xs text-[#5E5D57]">Chiaroscuro workshop with armillary spheres and folios.</div>
          </div>

          <div className="space-y-2">
            <div className="aspect-[4/3] rounded overflow-hidden border border-[#9A7447]/40 shadow-sm">
              <img
                src="/assets/illustrations/wing_linkage.jpg"
                alt="Bat Wing Anatomy Study"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="font-serif text-sm font-bold text-[#171714]">Wing Linkage Study</div>
            <div className="font-sans text-xs text-[#5E5D57]">Anatomical bat wing comparison with wooden cam hinges.</div>
          </div>

          <div className="space-y-2">
            <div className="aspect-[4/3] rounded overflow-hidden border border-[#9A7447]/40 shadow-sm">
              <img
                src="/assets/illustrations/ornithopter_side.jpg"
                alt="Ornithopter Side Profile"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="font-serif text-sm font-bold text-[#171714]">Ornithopter Profile</div>
            <div className="font-sans text-xs text-[#5E5D57]">Isolated mechanical cross section referenced for 3D model.</div>
          </div>
        </div>
      </section>

    </div>
  );
};
