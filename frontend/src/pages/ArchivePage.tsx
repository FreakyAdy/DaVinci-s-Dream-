import React, { useState } from 'react';
import type { Machine } from '../types';
import { CheckCircle2, XCircle, ArrowUpRight, X, Compass } from 'lucide-react';

interface ArchivePageProps {
  machines: Machine[];
  onSelectMachineForLab: (machineId: string) => void;
}

export const ArchivePage: React.FC<ArchivePageProps> = ({ machines, onSelectMachineForLab }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectModalMachine, setInspectModalMachine] = useState<Machine | null>(null);

  const categories = ['all', 'flight', 'automata', 'rotorcraft'];

  const filteredMachines = selectedCategory === 'all'
    ? machines
    : machines.filter((m) => m.category.toLowerCase() === selectedCategory);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#9A7447]/30 pb-6 gap-4">
        <div>
          <span className="font-serif text-xs font-bold uppercase tracking-widest text-[#9A7447] block mb-1">
            Archivio delle Macchine e Disegni Storici
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#171714]">
            The Invention Archive
          </h1>
          <p className="font-sans text-sm text-[#5E5D57] max-w-2xl mt-1">
            Explore verified folios from Leonardo’s codices. Each machine specifies an explicit capability contract indicating which features are simulated and which remain historical concepts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded font-serif text-xs uppercase tracking-wider transition-all border ${
                selectedCategory === cat
                  ? 'bg-[#9A7447] text-white border-[#785630] font-bold shadow-sm'
                  : 'bg-[#FAF6EF] text-[#34332E] border-[#9A7447]/30 hover:bg-[#E8DDC3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Inventions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMachines.map((machine) => {
          const isSimSupported = machine.capabilities.simulation;

          return (
            <div
              key={machine.id}
              className="parchment-card flex flex-col justify-between overflow-hidden border border-[#9A7447]/40 group"
            >
              {/* Card Image Thumbnail */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#E8DDC3] border-b border-[#9A7447]/20">
                <img
                  src={machine.cutout_url || machine.image_url}
                  alt={machine.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Capability Badge */}
                <div className="absolute top-3 right-3">
                  {isSimSupported ? (
                    <span className="badge-renaissance badge-success shadow-sm">
                      <CheckCircle2 size={12} />
                      Sim Ready
                    </span>
                  ) : (
                    <span className="badge-renaissance badge-warning shadow-sm">
                      Historical Folio
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2 left-2 bg-[#FAF6EF]/90 backdrop-blur-sm px-2 py-0.5 rounded font-mono text-[10px] text-[#5E5D57] border border-[#9A7447]/30">
                  {machine.historical_period}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#171714] group-hover:text-[#9A7447] transition-colors">
                    {machine.name}
                  </h3>
                  <div className="font-mono text-xs text-[#9A7447] mt-0.5">
                    {machine.source_folio}
                  </div>
                  <p className="font-sans text-xs text-[#34332E] mt-3 line-clamp-3 leading-relaxed">
                    {machine.description}
                  </p>
                </div>

                {/* Capability Matrix Badges */}
                <div className="pt-3 border-t border-[#9A7447]/20 space-y-2">
                  <div className="font-mono text-[10px] text-[#5E5D57] uppercase tracking-wider">
                    Machine Capabilities:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    <span className={`inline-flex items-center gap-1 ${machine.capabilities.drawing_display ? 'text-[#2D584A]' : 'text-[#8C2F20]'}`}>
                      {machine.capabilities.drawing_display ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      Drawing
                    </span>
                    <span className={`inline-flex items-center gap-1 ${machine.capabilities.reconstruction_3d ? 'text-[#2D584A]' : 'text-[#8C2F20]'}`}>
                      {machine.capabilities.reconstruction_3d ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      3D Model
                    </span>
                    <span className={`inline-flex items-center gap-1 ${machine.capabilities.simulation ? 'text-[#2D584A]' : 'text-[#8C2F20]'}`}>
                      {machine.capabilities.simulation ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      2D Physics
                    </span>
                    <span className={`inline-flex items-center gap-1 ${machine.capabilities.rl_training ? 'text-[#2D584A]' : 'text-[#8C2F20]'}`}>
                      {machine.capabilities.rl_training ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      RL Policy
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setInspectModalMachine(machine)}
                    className="btn-renaissance flex-1 text-xs py-2"
                  >
                    <span>Inspect Folio</span>
                    <ArrowUpRight size={14} />
                  </button>

                  {isSimSupported && (
                    <button
                      onClick={() => onSelectMachineForLab(machine.id)}
                      className="btn-renaissance btn-renaissance-primary text-xs py-2 px-3"
                      title="Load directly into Flight Laboratory"
                    >
                      <span>Simulate</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Inspecting Folio Details */}
      {inspectModalMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="parchment-card max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 corner-ticks border-2 border-[#9A7447]">
            
            <div className="flex items-start justify-between pb-4 border-b border-[#9A7447]/30">
              <div>
                <span className="font-mono text-xs text-[#9A7447] uppercase tracking-wider">
                  {inspectModalMachine.source_folio} • {inspectModalMachine.historical_period}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#171714]">
                  {inspectModalMachine.name}
                </h2>
              </div>
              <button
                onClick={() => setInspectModalMachine(null)}
                className="p-1 rounded text-[#5E5D57] hover:text-[#171714] hover:bg-[#E8DDC3]"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 items-center">
              <div className="rounded overflow-hidden border border-[#9A7447]/40 shadow-sm bg-[#E8DDC3]">
                <img
                  src={inspectModalMachine.image_url}
                  alt={inspectModalMachine.name}
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#171714] uppercase tracking-wide">
                    Historical Description
                  </h4>
                  <p className="font-sans text-xs sm:text-sm text-[#34332E] mt-1 leading-relaxed">
                    {inspectModalMachine.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-serif text-sm font-bold text-[#171714] uppercase tracking-wide">
                    Technical Specifications
                  </h4>
                  <div className="mt-2 space-y-1.5 font-mono text-xs bg-[#FAF6EF] p-3 rounded border border-[#9A7447]/30">
                    {Object.entries(inspectModalMachine.specifications).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b border-[#9A7447]/10 pb-1">
                        <span className="text-[#5E5D57]">{key}:</span>
                        <span className="text-[#171714] font-semibold text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-serif text-sm font-bold text-[#171714] uppercase tracking-wide">
                    Simulation Capabilities Status
                  </h4>
                  <p className="font-sans text-xs text-[#5E5D57] mt-1">
                    {inspectModalMachine.capabilities.simulation
                      ? 'Fully supported! Dynamic 2D aerodynamic physics and interactive 3D WebGL flapping kinematics are active.'
                      : 'Conceptual archive folio. Kinematics model and dynamic simulator scheduled for future milestone.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#9A7447]/30">
              <button
                onClick={() => setInspectModalMachine(null)}
                className="btn-renaissance btn-renaissance-outline text-xs"
              >
                Close
              </button>

              {inspectModalMachine.capabilities.simulation && (
                <button
                  onClick={() => {
                    onSelectMachineForLab(inspectModalMachine.id);
                    setInspectModalMachine(null);
                  }}
                  className="btn-renaissance btn-renaissance-primary text-xs"
                >
                  <Compass size={14} />
                  <span>Launch in Flight Laboratory</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
