import React, { useState, useEffect, useRef } from 'react';
import { UserArtifact, AnnotationItem } from '../types';
import { uploadSketch, fetchArtifacts } from '../services/api';
import { Upload, Feather, CheckCircle2, AlertTriangle, Info, Plus, X, Tag } from 'lucide-react';

interface SketchExplorerPageProps {
  onGoToFlightLab: () => void;
}

export const SketchExplorerPage: React.FC<SketchExplorerPageProps> = ({ onGoToFlightLab }) => {
  const [artifacts, setArtifacts] = useState<UserArtifact[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<UserArtifact | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('Codex Flight Study');
  const [category, setCategory] = useState<string>('flight');
  const [notes, setNotes] = useState<string>('Studies of flapping mechanisms with bat-wing struts.');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Annotation interactive state
  const [newAnnotationText, setNewAnnotationText] = useState<string>('');
  const [pendingAnnotationPos, setPendingAnnotationPos] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    loadArtifacts();
  }, []);

  const loadArtifacts = async () => {
    try {
      const data = await fetchArtifacts();
      setArtifacts(data);
      if (data.length > 0 && !selectedArtifact) {
        setSelectedArtifact(data[0]);
      }
    } catch (err) {
      console.warn('Artifacts load failed:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a sketch or drawing image to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('category', category);
    formData.append('notes', notes);

    try {
      const newArtifact = await uploadSketch(formData);
      setArtifacts([newArtifact, ...artifacts]);
      setSelectedArtifact(newArtifact);
      setFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload sketch.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    setPendingAnnotationPos({ x: xPct, y: yPct });
  };

  const handleAddAnnotation = () => {
    if (!pendingAnnotationPos || !newAnnotationText.trim() || !selectedArtifact) return;

    const newAnno: AnnotationItem = {
      x: pendingAnnotationPos.x,
      y: pendingAnnotationPos.y,
      label: newAnnotationText.trim()
    };

    const updated = {
      ...selectedArtifact,
      annotations: [...selectedArtifact.annotations, newAnno]
    };

    setSelectedArtifact(updated);
    setArtifacts(artifacts.map((a) => (a.id === updated.id ? updated : a)));
    setPendingAnnotationPos(null);
    setNewAnnotationText('');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="border-b border-[#9A7447]/30 pb-6">
        <span className="font-serif text-xs font-bold uppercase tracking-widest text-[#9A7447] block mb-1">
          Intake Meccanico e Analisi di Disegni
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#171714]">
          Sketch Explorer & Intake
        </h1>
        <p className="font-sans text-sm text-[#5E5D57] max-w-2xl mt-1">
          Upload any historical sketch, technical diagram, or handwritten codex drawing. Inspect components, annotate anatomical mechanics, and evaluate capability matches against our simulation engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Upload Form & Saved Artifacts List */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Upload Card */}
          <div className="parchment-card p-6 corner-ticks border border-[#9A7447]/40 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#171714] flex items-center gap-2 mb-4">
              <Upload size={18} className="text-[#9A7447]" />
              <span>Upload Invention Drawing</span>
            </h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-serif text-xs font-bold text-[#171714] mb-1">
                  Sketch Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#FAF6EF] border border-[#9A7447]/40 focus:outline-none focus:border-[#785630]"
                  placeholder="e.g. Wing Hinge Codex"
                  required
                />
              </div>

              <div>
                <label className="block font-serif text-xs font-bold text-[#171714] mb-1">
                  Machine Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#FAF6EF] border border-[#9A7447]/40 focus:outline-none focus:border-[#785630] font-sans"
                >
                  <option value="flight">Flying Machine (Ornithopter / Wings)</option>
                  <option value="automata">Automata / Mechanical Knight</option>
                  <option value="rotorcraft">Helical Rotor / Aerial Screw</option>
                  <option value="hydraulic">Hydraulic Pump / Siphon</option>
                  <option value="structural">Bridge / Military Architecture</option>
                  <option value="other">Other Renaissance Invention</option>
                </select>
              </div>

              <div>
                <label className="block font-serif text-xs font-bold text-[#171714] mb-1">
                  Scholar Notes / Folio Reference
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded bg-[#FAF6EF] border border-[#9A7447]/40 focus:outline-none focus:border-[#785630]"
                  placeholder="Notes regarding pulleys, materials, or provenance..."
                />
              </div>

              <div>
                <label className="block font-serif text-xs font-bold text-[#171714] mb-1">
                  Image File (JPG, PNG, WebP)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#5E5D57] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#9A7447]/40 file:text-xs file:font-serif file:bg-[#E8DDC3] file:text-[#171714] hover:file:bg-[#FAF6EF]"
                  required
                />
              </div>

              {previewUrl && (
                <div className="relative aspect-video rounded overflow-hidden border border-[#9A7447]/30 bg-[#E8DDC3]">
                  <img src={previewUrl} alt="Upload preview" className="w-full h-full object-contain" />
                </div>
              )}

              {uploadError && (
                <div className="p-2.5 rounded bg-[#A94330]/15 border border-[#A94330]/40 text-[#8C2F20] text-xs flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>{uploadError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading}
                className="btn-renaissance btn-renaissance-primary w-full text-xs py-2.5"
              >
                <Feather size={14} />
                <span>{isUploading ? 'Registering Drawing...' : 'Submit Sketch to Registry'}</span>
              </button>
            </form>
          </div>

          {/* Quick Select Preset Sketches */}
          <div className="parchment-card p-5 corner-ticks border border-[#9A7447]/40">
            <h4 className="font-serif text-sm font-bold text-[#171714] mb-3">
              Preset Codices in Archive
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setSelectedArtifact({
                    id: 'preset_ornithopter',
                    title: 'Ornithopter Wing Mechanism Study',
                    category: 'flight',
                    notes: 'Codex on the Flight of Birds, Folio 8v. Articulated wooden spars and tendon pulleys.',
                    filename: 'wing_linkage.jpg',
                    image_url: '/assets/illustrations/wing_linkage.jpg',
                    created_at: 'Historical Record',
                    matched_machine_id: 'ornithopter_codex',
                    is_simulation_supported: true,
                    capability_diagnostics: {
                      status: 'fully_supported',
                      message: 'Matched with 1505 Ornithopter physics simulator. Flapping flight dynamics and 3D WebGL kinematics active.',
                      available_features: ['2D Aerodynamic Engine', 'Continuous PPO Control', '3D Flapping WebGL']
                    },
                    annotations: [
                      { x: 32, y: 38, label: 'Membrana alaris (Linen bat-wing)' },
                      { x: 74, y: 22, label: 'Articulatio Berrua (Elbow hinge)' },
                      { x: 82, y: 72, label: 'Trochlea & Corda (Winch pulley)' }
                    ]
                  });
                }}
                className="w-full text-left p-2.5 rounded border border-[#9A7447]/30 bg-[#FAF6EF] hover:bg-[#E8DDC3] transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-serif text-xs font-bold text-[#171714]">Bat Wing & Cam Linkage Study</div>
                  <div className="font-mono text-[10px] text-[#4B7B6B] font-semibold">● Supported Simulator</div>
                </div>
                <Feather size={14} className="text-[#9A7447]" />
              </button>

              <button
                onClick={() => {
                  setSelectedArtifact({
                    id: 'preset_knight',
                    title: 'Automaton Knight Armor & Cables',
                    category: 'automata',
                    notes: 'Codex Atlanticus, Folio 579r. Humanoid mechanical soldier with wire tendon system.',
                    filename: 'mechanical_knight.jpg',
                    image_url: '/assets/archive/mechanical_knight.jpg',
                    created_at: 'Historical Record',
                    matched_machine_id: 'mechanical_knight',
                    is_simulation_supported: false,
                    capability_diagnostics: {
                      status: 'concept_only',
                      message: 'Matched to historical Automaton Knight. Dynamic joint kinematics solver planned for next release.',
                      missing_capabilities: ['Multi-link Forward Kinematics', 'Tendon Cable Physics']
                    },
                    annotations: [
                      { x: 30, y: 22, label: 'Elmo con visiera mobile' },
                      { x: 56, y: 30, label: 'Ingranaggi interni (Pulleys)' },
                      { x: 62, y: 70, label: 'Articolazione del ginocchio' }
                    ]
                  });
                }}
                className="w-full text-left p-2.5 rounded border border-[#9A7447]/30 bg-[#FAF6EF] hover:bg-[#E8DDC3] transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-serif text-xs font-bold text-[#171714]">Automaton Knight Codex</div>
                  <div className="font-mono text-[10px] text-[#9A7447] font-semibold">○ Concept (Unsupported)</div>
                </div>
                <Feather size={14} className="text-[#9A7447]" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Sketch Viewer, Annotations & Capability Diagnostics */}
        <div className="lg:col-span-7 space-y-6">
          {selectedArtifact ? (
            <div className="parchment-card p-6 corner-ticks border border-[#9A7447]/40 shadow-sm space-y-6">
              
              {/* Artifact Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#9A7447]/20 gap-2">
                <div>
                  <span className="font-mono text-xs text-[#9A7447] uppercase tracking-wider">
                    {selectedArtifact.category.toUpperCase()} • {selectedArtifact.created_at}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#171714]">
                    {selectedArtifact.title}
                  </h3>
                </div>

                <div>
                  {selectedArtifact.is_simulation_supported ? (
                    <span className="badge-renaissance badge-success">
                      <CheckCircle2 size={13} />
                      Simulator Connected
                    </span>
                  ) : (
                    <span className="badge-renaissance badge-warning">
                      <Info size={13} />
                      Concept Only
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive Image Canvas with Annotation Pins */}
              <div className="relative rounded overflow-hidden border border-[#9A7447]/40 bg-[#E8DDC3] shadow-inner select-none cursor-crosshair">
                <img
                  ref={imageRef}
                  src={selectedArtifact.image_url}
                  alt={selectedArtifact.title}
                  onClick={handleImageClick}
                  className="w-full h-auto object-contain block max-h-[460px] mx-auto"
                />

                {/* Render Existing Annotations */}
                {selectedArtifact.annotations.map((anno, idx) => (
                  <div
                    key={idx}
                    style={{ left: `${anno.x}%`, top: `${anno.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#A94330] text-white flex items-center justify-center font-mono text-[10px] font-bold shadow-md cursor-pointer border border-white">
                      {idx + 1}
                    </div>

                    {/* Annotation Tooltip */}
                    <div className="absolute left-6 top-0 hidden group-hover:block z-30 bg-[#171714] text-[#F7F2E8] text-xs font-serif px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap border border-[#9A7447]/40">
                      <strong>{anno.label}</strong>
                    </div>
                  </div>
                ))}

                {/* Pending Click Pin */}
                {pendingAnnotationPos && (
                  <div
                    style={{ left: `${pendingAnnotationPos.x}%`, top: `${pendingAnnotationPos.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#D4AF37] border-2 border-white animate-ping pointer-events-none"
                  />
                )}
              </div>

              {/* Instruction banner */}
              <div className="text-center font-mono text-[11px] text-[#5E5D57]">
                Click anywhere on the manuscript above to pin a mechanical annotation
              </div>

              {/* Input for adding new annotation label */}
              {pendingAnnotationPos && (
                <div className="p-3 bg-[#FAF6EF] rounded border border-[#9A7447]/40 flex items-center gap-2">
                  <Tag size={16} className="text-[#9A7447]" />
                  <input
                    type="text"
                    value={newAnnotationText}
                    onChange={(e) => setNewAnnotationText(e.target.value)}
                    placeholder="Enter annotation label (e.g. Tendon cord, wing joint)..."
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#9A7447]/30 rounded focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleAddAnnotation}
                    className="btn-renaissance btn-renaissance-primary text-xs py-1.5 px-3"
                  >
                    Save Pin
                  </button>
                  <button
                    onClick={() => setPendingAnnotationPos(null)}
                    className="p-1.5 text-[#5E5D57] hover:text-[#171714]"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Annotation List */}
              {selectedArtifact.annotations.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="font-serif text-xs font-bold text-[#171714] uppercase tracking-wider">
                    Manuscript Callouts ({selectedArtifact.annotations.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                    {selectedArtifact.annotations.map((anno, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded bg-[#FAF6EF] border border-[#9A7447]/20 flex items-center gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#9A7447] text-white flex items-center justify-center font-mono text-[9px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="text-[#34332E]">{anno.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Honest Capability Diagnostic Box */}
              <div className={`p-4 rounded border ${
                selectedArtifact.is_simulation_supported
                  ? 'bg-[#4B7B6B]/10 border-[#4B7B6B]/40'
                  : 'bg-[#9A7447]/10 border-[#9A7447]/40'
              }`}>
                <div className="flex items-start gap-3">
                  {selectedArtifact.is_simulation_supported ? (
                    <CheckCircle2 className="w-5 h-5 text-[#4B7B6B] flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#9A7447] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-2 text-xs">
                    <strong className="font-serif text-sm block text-[#171714]">
                      {selectedArtifact.is_simulation_supported
                        ? 'Simulated Machine Architecture'
                        : 'Historical Drawing Diagnostics'}
                    </strong>
                    <p className="text-[#34332E] leading-relaxed">
                      {selectedArtifact.capability_diagnostics.message}
                    </p>

                    {selectedArtifact.capability_diagnostics.missing_capabilities && (
                      <div className="pt-1">
                        <span className="font-mono font-bold text-[#8C2F20] block">
                          Unimplemented Dynamics Modules:
                        </span>
                        <ul className="list-disc list-inside text-[#5E5D57] font-mono text-[11px] mt-0.5">
                          {selectedArtifact.capability_diagnostics.missing_capabilities.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedArtifact.is_simulation_supported && (
                      <div className="pt-2">
                        <button
                          onClick={onGoToFlightLab}
                          className="btn-renaissance btn-renaissance-primary text-xs py-1.5 px-4"
                        >
                          <span>Launch in Flight Laboratory</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="parchment-card p-12 text-center text-[#5E5D57] font-serif">
              Select or upload a manuscript drawing to begin inspection.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
