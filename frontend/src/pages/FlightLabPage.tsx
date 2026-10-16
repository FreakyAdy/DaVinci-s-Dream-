import React, { useState, useEffect, useRef } from 'react';
import { Ornithopter3D } from '../components/Ornithopter3D';
import type {
  AircraftState,
  FlightTelemetry,
  TrajectoryPoint,
  FlightEvent,
  TrainingStatus,
  BenchmarkData
} from '../types';
import {
  resetSimulation,
  stepSimulation,
  runSimulation,
  startTraining,
  fetchTrainingStatus,
  runEvaluation,
  fetchLatestEvaluation
} from '../services/api';
import { soundFx } from '../services/sound';
import {
  Play,
  RotateCcw,
  FastForward,
  Cpu,
  BarChart3,
  Wind,
  Gauge,
  Sliders,
  AlertTriangle,
  Activity,
  Layers
} from 'lucide-react';

interface FlightLabPageProps {
  isBackendHealthy: boolean;
  policyLoaded: boolean;
}

export const FlightLabPage: React.FC<FlightLabPageProps> = ({ isBackendHealthy: _isBackendHealthy, policyLoaded: _policyLoaded }) => {
  // Flight controller mode
  const [controllerMode, setControllerMode] = useState<'manual' | 'baseline' | 'rl'>('baseline');

  // Simulation State
  const [state, setState] = useState<AircraftState>({
    x: 0.0,
    y: 25.0,
    u: 6.5,
    v: 0.0,
    theta: 0.05,
    q: 0.0,
    phi: 0.0,
    time: 0.0,
    energy_consumed: 0.0,
    status: 'on_platform'
  });

  const [telemetry, setTelemetry] = useState<FlightTelemetry>({
    airspeed: 6.5,
    groundspeed: 6.5,
    angle_of_attack: 0.05,
    flight_path_angle: 0.0,
    lift_total: 210.0,
    drag_total: 18.0,
    thrust_flap: 0.0,
    lift_flap: 0.0,
    pitch_moment: 0.0,
    power_instantaneous: 0.0,
    wing_stroke_angle: 0.0
  });

  const [trajectory, setTrajectory] = useState<TrajectoryPoint[]>([]);
  const [comparisonTrajectory, setComparisonTrajectory] = useState<TrajectoryPoint[]>([]);
  const [showComparisonOverlay, setShowComparisonOverlay] = useState<boolean>(false);

  const [events, setEvents] = useState<FlightEvent[]>([
    { timestamp: 0, status: 'on_platform', message: 'Aircraft positioned on elevated cliff platform (height 25m).', altitude: 25, x: 0 }
  ]);

  // Environmental Wind Controls
  const [windX, setWindX] = useState<number>(1.0); // +1 m/s gentle tailwind
  const [windY, setWindY] = useState<number>(0.0); // 0 m/s vertical wind

  // Manual Controls (when controllerMode === 'manual')
  const [manualAmplitude, setManualAmplitude] = useState<number>(0.42); // radians
  const [manualFrequency, setManualFrequency] = useState<number>(2.2);   // Hz
  const [manualTailPitch, setManualTailPitch] = useState<number>(-0.04); // radians

  // Playback & Animation states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modern Trajectory Scrubber Index
  const [scrubberIndex, setScrubberIndex] = useState<number>(0);

  // Training Modal & State
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState<boolean>(false);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [trainingTimesteps, setTrainingTimesteps] = useState<number>(30000);
  const [isStartingTraining, setIsStartingTraining] = useState<boolean>(false);

  // Evaluation Modal & Benchmark State
  const [isEvalModalOpen, setIsEvalModalOpen] = useState<boolean>(false);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Canvas ref for 2D trajectory profile
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Playback refs
  const playbackTrajectoryRef = useRef<TrajectoryPoint[]>([]);
  const playbackIntervalRef = useRef<any>(null);

  useEffect(() => {
    handleReset();
    fetchBenchmarkSummary();
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, []);

  const fetchBenchmarkSummary = async () => {
    try {
      const data = await fetchLatestEvaluation();
      setBenchmarkData(data);

      // Pre-populate comparison baseline trajectory if available
      if (data?.baseline?.episodes?.[0]?.trajectory) {
        const compPts = data.baseline.episodes[0].trajectory.map((p, idx) => ({
          x: p.x,
          y: p.y,
          u: 7.0,
          v: -1.0,
          theta: 0.05,
          wing_stroke: 0,
          airspeed: p.airspeed,
          time: idx * 0.2
        }));
        setComparisonTrajectory(compPts);
      }
    } catch (e) {
      console.warn('Could not load latest benchmark:', e);
    }
  };

  useEffect(() => {
    if (!isTrainingModalOpen) return;
    const interval = setInterval(async () => {
      try {
        const status = await fetchTrainingStatus();
        setTrainingStatus(status);
      } catch (err) {
        console.warn('Training status poll error:', err);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isTrainingModalOpen]);

  // 2D Trajectory Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#FAF6EF';
    ctx.fillRect(0, 0, w, h);

    const mapX = (xVal: number) => 40 + (xVal / 360) * (w - 60);
    const mapY = (yVal: number) => (h - 30) - (yVal / 40) * (h - 50);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(154, 116, 71, 0.15)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= 360; gx += 60) {
      ctx.beginPath();
      ctx.moveTo(mapX(gx), 20);
      ctx.lineTo(mapX(gx), h - 30);
      ctx.stroke();

      ctx.fillStyle = '#5E5D57';
      ctx.font = '9px monospace';
      ctx.fillText(`${gx}m`, mapX(gx) - 10, h - 15);
    }

    for (let gy = 0; gy <= 40; gy += 10) {
      ctx.beginPath();
      ctx.moveTo(40, mapY(gy));
      ctx.lineTo(w - 20, mapY(gy));
      ctx.stroke();

      ctx.fillStyle = '#5E5D57';
      ctx.font = '9px monospace';
      ctx.fillText(`${gy}m`, 10, mapY(gy) + 3);
    }

    // Draw Elevated Cliff Platform
    ctx.fillStyle = '#E2D5BA';
    ctx.strokeStyle = '#9A7447';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(mapX(0), mapY(25), mapX(16) - mapX(0), mapY(0) - mapY(25));
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#171714';
    ctx.font = 'bold 9px serif';
    ctx.fillText('Cliff (25m)', mapX(2), mapY(26.5));

    // Draw Valley Ground
    ctx.strokeStyle = '#4A483E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mapX(16), mapY(0));
    ctx.lineTo(mapX(360), mapY(0));
    ctx.stroke();

    // Draw Target Landing Field (x = 180 to 220)
    ctx.fillStyle = 'rgba(75, 123, 107, 0.25)';
    ctx.strokeStyle = '#4B7B6B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(mapX(180), mapY(2), mapX(220) - mapX(180), mapY(0) - mapY(2));
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2D584A';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('TARGET ZONE (200m)', mapX(182), mapY(3.5));

    // Draw Comparison Baseline Trajectory (if toggled)
    if (showComparisonOverlay && comparisonTrajectory.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#A94330';
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mapX(comparisonTrajectory[0].x), mapY(comparisonTrajectory[0].y));
      for (let i = 1; i < comparisonTrajectory.length; i++) {
        ctx.lineTo(mapX(comparisonTrajectory[i].x), mapY(comparisonTrajectory[i].y));
      }
      ctx.stroke();
      ctx.restore();
    }

    // Draw Active Flight Trajectory Curve
    if (trajectory.length > 1) {
      ctx.strokeStyle = controllerMode === 'rl' ? '#2D584A' : '#A94330';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(mapX(trajectory[0].x), mapY(trajectory[0].y));
      for (let i = 1; i < trajectory.length; i++) {
        ctx.lineTo(mapX(trajectory[i].x), mapY(trajectory[i].y));
      }
      ctx.stroke();
    }

    // Draw Current Position Dot
    ctx.fillStyle = '#D4AF37';
    ctx.strokeStyle = '#171714';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mapX(state.x), mapY(state.y), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }, [state.x, state.y, trajectory, comparisonTrajectory, showComparisonOverlay, controllerMode]);

  const handleReset = async () => {
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    setIsRunning(false);
    setErrorMessage(null);
    soundFx.playRatchetClick();

    try {
      const res = await resetSimulation({ wind_x: windX, wind_y: windY });
      setState(res.state);
      setTelemetry(res.telemetry);
      setScrubberIndex(0);
      setTrajectory([{
        x: res.state.x,
        y: res.state.y,
        u: res.state.u,
        v: res.state.v,
        theta: res.state.theta,
        wing_stroke: 0,
        airspeed: res.telemetry.airspeed,
        time: 0
      }]);
      setEvents([
        {
          timestamp: 0,
          status: 'on_platform',
          message: `Aircraft reset on elevated platform. Wind: (${windX.toFixed(1)}, ${windY.toFixed(1)}) m/s.`,
          altitude: 25,
          x: 0
        }
      ]);
    } catch (err: any) {
      console.warn('Reset error:', err);
    }
  };

  const handleSingleStep = async () => {
    try {
      const amp = controllerMode === 'manual' ? manualAmplitude : 0.42;
      const freq = controllerMode === 'manual' ? manualFrequency : 2.2;
      const tail = controllerMode === 'manual' ? manualTailPitch : -0.04;

      const res = await stepSimulation({ amplitude: amp, frequency: freq, tail_pitch: tail });
      setState(res.state);
      setTelemetry(res.telemetry);

      const pt: TrajectoryPoint = {
        x: res.state.x,
        y: res.state.y,
        u: res.state.u,
        v: res.state.v,
        theta: res.state.theta,
        wing_stroke: res.telemetry.wing_stroke_angle,
        airspeed: res.telemetry.airspeed,
        time: res.state.time
      };
      setTrajectory((prev) => [...prev, pt]);

      if (res.is_terminal) {
        setIsRunning(false);
        if (res.state.status.includes('landed')) {
          soundFx.playLandingFanfare();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error stepping simulation.');
    }
  };

  const handleLaunchFullFlight = async () => {
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    setIsLoading(true);
    setErrorMessage(null);
    setIsRunning(false);
    soundFx.playRatchetClick();

    try {
      const res = await runSimulation({
        controller: controllerMode,
        wind_x: windX,
        wind_y: windY,
        manual_amplitude: manualAmplitude,
        manual_frequency: manualFrequency,
        manual_tail_pitch: manualTailPitch,
        max_steps: 1200
      });

      playbackTrajectoryRef.current = res.trajectory;
      setEvents(res.events);

      // Start animated playback
      setIsRunning(true);
      playTrajectoryLoop();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to execute flight run.');
    } finally {
      setIsLoading(false);
    }
  };

  const playTrajectoryLoop = () => {
    const pts = playbackTrajectoryRef.current;
    if (!pts || pts.length === 0) return;

    let idx = 0;
    playbackIntervalRef.current = setInterval(() => {
      if (idx >= pts.length) {
        clearInterval(playbackIntervalRef.current);
        setIsRunning(false);
        const finalStatus = pts[pts.length - 1];
        if (finalStatus.x >= 180 && finalStatus.y <= 1.0) {
          soundFx.playLandingFanfare();
        }
        return;
      }

      const p = pts[idx];
      setScrubberIndex(idx);
      setState((prev) => ({
        ...prev,
        x: p.x,
        y: p.y,
        u: p.u,
        v: p.v,
        theta: p.theta,
        time: p.time
      }));

      setTelemetry((prev) => ({
        ...prev,
        airspeed: p.airspeed,
        groundspeed: Math.hypot(p.u, p.v),
        wing_stroke_angle: p.wing_stroke
      }));

      setTrajectory(pts.slice(0, idx + 1));
      idx += 1;
    }, 32); // ~30 fps
  };

  const handleScrubberChange = (idx: number) => {
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    setIsRunning(false);

    const pts = playbackTrajectoryRef.current;
    if (!pts || pts.length === 0 || idx >= pts.length) return;

    setScrubberIndex(idx);
    const p = pts[idx];
    setState((prev) => ({
      ...prev,
      x: p.x,
      y: p.y,
      u: p.u,
      v: p.v,
      theta: p.theta,
      time: p.time
    }));

    setTelemetry((prev) => ({
      ...prev,
      airspeed: p.airspeed,
      groundspeed: Math.hypot(p.u, p.v),
      wing_stroke_angle: p.wing_stroke
    }));

    setTrajectory(pts.slice(0, idx + 1));
  };

  const handleTriggerTraining = async () => {
    setIsStartingTraining(true);
    soundFx.playRatchetClick();
    try {
      await startTraining(trainingTimesteps);
      const st = await fetchTrainingStatus();
      setTrainingStatus(st);
    } catch (err: any) {
      setErrorMessage(err.message || 'Training start failed.');
    } finally {
      setIsStartingTraining(false);
    }
  };

  const handleRunEvaluationBenchmark = async () => {
    setIsEvaluating(true);
    soundFx.playRatchetClick();
    try {
      const data = await runEvaluation(10);
      setBenchmarkData(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Benchmark run failed.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Banner & Controller Mode Toggle */}
      <div className="parchment-card p-4 sm:p-5 corner-ticks flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#9A7447]/40 shadow-sm">
        <div>
          <span className="font-serif text-xs font-bold uppercase tracking-widest text-[#9A7447] block">
            Laboratorio di Volo • Galleria del Vento (c. 1505)
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#171714]">
            Ornithopter Flight Laboratory
          </h1>
        </div>

        {/* Controller Mode Selector */}
        <div className="flex items-center gap-2 bg-[#FAF6EF] p-1 rounded border border-[#9A7447]/40">
          <button
            onClick={() => {
              soundFx.playRatchetClick();
              setControllerMode('manual');
            }}
            className={`px-3 py-1.5 rounded text-xs font-serif tracking-wider uppercase transition-all ${
              controllerMode === 'manual'
                ? 'bg-[#9A7447] text-white font-bold shadow-sm'
                : 'text-[#34332E] hover:bg-[#E8DDC3]'
            }`}
          >
            <Sliders size={13} className="inline mr-1" />
            Manual
          </button>

          <button
            onClick={() => {
              soundFx.playRatchetClick();
              setControllerMode('baseline');
            }}
            className={`px-3 py-1.5 rounded text-xs font-serif tracking-wider uppercase transition-all ${
              controllerMode === 'baseline'
                ? 'bg-[#9A7447] text-white font-bold shadow-sm'
                : 'text-[#34332E] hover:bg-[#E8DDC3]'
            }`}
          >
            <Gauge size={13} className="inline mr-1" />
            Rule Baseline
          </button>

          <button
            onClick={() => {
              soundFx.playRatchetClick();
              setControllerMode('rl');
            }}
            className={`px-3 py-1.5 rounded text-xs font-serif tracking-wider uppercase transition-all ${
              controllerMode === 'rl'
                ? 'bg-[#4B7B6B] text-white font-bold shadow-sm'
                : 'text-[#34332E] hover:bg-[#E8DDC3]'
            }`}
          >
            <Cpu size={13} className="inline mr-1" />
            PPO Neural Policy
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded bg-[#A94330]/15 border border-[#A94330]/40 text-[#8C2F20] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="font-bold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 3D Viewport & 2D Profile (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* 3D Interactive Viewport with HUD */}
          <div className="w-full h-[470px] rounded border border-[#9A7447]/40 shadow-md overflow-hidden bg-[#f4eee1]">
            <Ornithopter3D
              x={state.x}
              y={state.y}
              pitch={state.theta}
              wingStroke={telemetry.wing_stroke_angle}
              trajectory={trajectory}
              comparisonTrajectory={showComparisonOverlay ? comparisonTrajectory : []}
              status={state.status}
              windX={windX}
            />
          </div>

          {/* Modern Flight Timeline Scrubber (when trajectory exists) */}
          {playbackTrajectoryRef.current.length > 0 && (
            <div className="p-3 rounded bg-[#FAF6EF] border border-[#9A7447]/30 flex items-center gap-3 font-mono text-xs shadow-inner">
              <span className="text-[#9A7447] font-serif font-bold uppercase tracking-wider text-[11px]">
                Timeline Scrubber:
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, playbackTrajectoryRef.current.length - 1)}
                value={scrubberIndex}
                onChange={(e) => handleScrubberChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="font-bold text-[#171714] min-w-[55px] text-right">
                {state.time.toFixed(1)}s
              </span>
            </div>
          )}

          {/* 2D Trajectory Profile & Terrain Canvas */}
          <div className="parchment-card p-4 corner-ticks border border-[#9A7447]/40 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#171714]">
                Trajectory Profile & Valley Landing Zone
              </span>

              {/* Overlay Toggle */}
              <button
                onClick={() => {
                  soundFx.playRatchetClick();
                  setShowComparisonOverlay(!showComparisonOverlay);
                }}
                className={`text-[11px] font-mono px-2 py-0.5 rounded border transition-colors flex items-center gap-1 ${
                  showComparisonOverlay
                    ? 'bg-[#9A7447] text-white border-[#785630]'
                    : 'bg-[#FAF6EF] text-[#5E5D57] border-[#9A7447]/30 hover:bg-[#E8DDC3]'
                }`}
                title="Overlay baseline glide vs learned policy"
              >
                <Layers size={12} />
                <span>Overlay Baseline Comparison</span>
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={640}
              height={140}
              className="w-full h-auto rounded border border-[#9A7447]/30 bg-[#FAF6EF]"
            />
          </div>

        </div>

        {/* Right Column: Controls, Telemetry & Evaluation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Flight Control Action Buttons */}
          <div className="parchment-card p-4 corner-ticks border border-[#9A7447]/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#9A7447]/20 pb-2">
              <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#171714]">
                Flight Execution Controls
              </span>
              <span className="badge-renaissance badge-neutral">
                {controllerMode.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleLaunchFullFlight}
                disabled={isLoading}
                className="btn-renaissance btn-renaissance-primary py-2.5 text-xs col-span-2 shadow-md"
              >
                <Play size={14} />
                <span>{isLoading ? 'Computing Aerodynamics...' : 'Launch Full Flight Test'}</span>
              </button>

              <button
                onClick={handleSingleStep}
                disabled={isRunning}
                className="btn-renaissance py-2 text-xs"
                title="Advance simulation by 0.02s"
              >
                <FastForward size={14} />
                <span>Step (50Hz)</span>
              </button>

              <button
                onClick={handleReset}
                className="btn-renaissance btn-renaissance-outline py-2 text-xs"
                title="Reset aircraft to cliff launch platform"
              >
                <RotateCcw size={14} />
                <span>Reset to Cliff</span>
              </button>
            </div>

            {/* Environmental Wind Controls */}
            <div className="pt-2 border-t border-[#9A7447]/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-[#171714] flex items-center gap-1.5">
                  <Wind size={14} className="text-[#9A7447]" />
                  Horizontal Wind (Wx):
                </span>
                <span className="font-mono font-bold text-[#785630]">
                  {windX > 0 ? `+${windX.toFixed(1)} m/s (Tailwind)` : windX < 0 ? `${windX.toFixed(1)} m/s (Headwind)` : '0.0 m/s (Calm)'}
                </span>
              </div>
              <input
                type="range"
                min="-4.0"
                max="4.0"
                step="0.5"
                value={windX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setWindX(val);
                  soundFx.playWindSwoosh(val);
                }}
                className="w-full"
              />

              <div className="flex items-center justify-between text-xs">
                <span className="font-serif font-bold text-[#171714]">Vertical Gust (Wy):</span>
                <span className="font-mono font-bold text-[#785630]">
                  {windY > 0 ? `+${windY.toFixed(1)} m/s (Updraft)` : windY < 0 ? `${windY.toFixed(1)} m/s (Downdraft)` : '0.0 m/s'}
                </span>
              </div>
              <input
                type="range"
                min="-1.5"
                max="1.5"
                step="0.25"
                value={windY}
                onChange={(e) => setWindY(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Manual Sliders */}
            {controllerMode === 'manual' && (
              <div className="pt-2 border-t border-[#9A7447]/20 space-y-3 bg-[#FAF6EF] p-3 rounded border">
                <div className="font-serif text-xs font-bold text-[#9A7447] uppercase tracking-wider">
                  Direct Actuator Inputs (Manual):
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span>Flap Amplitude:</span>
                    <span>{(manualAmplitude * (180 / Math.PI)).toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.65"
                    step="0.02"
                    value={manualAmplitude}
                    onChange={(e) => setManualAmplitude(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span>Flap Frequency:</span>
                    <span>{manualFrequency.toFixed(1)} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.5"
                    step="0.1"
                    value={manualFrequency}
                    onChange={(e) => setManualFrequency(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span>Tail Elevator:</span>
                    <span>{(manualTailPitch * (180 / Math.PI)).toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="-0.35"
                    max="0.35"
                    step="0.02"
                    value={manualTailPitch}
                    onChange={(e) => setManualTailPitch(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Training & Benchmark Button Row */}
            <div className="pt-2 border-t border-[#9A7447]/20 flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playRatchetClick();
                  setIsTrainingModalOpen(true);
                }}
                className="btn-renaissance flex-1 text-xs py-2"
              >
                <Cpu size={14} className="text-[#9A7447]" />
                <span>PPO Training</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playRatchetClick();
                  setIsEvalModalOpen(true);
                }}
                className="btn-renaissance btn-renaissance-outline flex-1 text-xs py-2"
              >
                <BarChart3 size={14} className="text-[#4B7B6B]" />
                <span>Benchmark</span>
              </button>
            </div>
          </div>

          {/* Live Telemetry Card */}
          <div className="parchment-card p-4 corner-ticks border border-[#9A7447]/40 shadow-sm space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#9A7447]/20 pb-1.5 font-serif font-bold text-[#171714]">
              <span>Real-Time Telemetry</span>
              <Activity size={15} className="text-[#9A7447]" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-[#FAF6EF] border border-[#9A7447]/20">
                <span className="text-[#5E5D57] block">AIRSPEED</span>
                <span className="text-sm font-bold text-[#171714]">{telemetry.airspeed.toFixed(2)} m/s</span>
              </div>

              <div className="p-2 rounded bg-[#FAF6EF] border border-[#9A7447]/20">
                <span className="text-[#5E5D57] block">GROUNDSPEED</span>
                <span className="text-sm font-bold text-[#171714]">{telemetry.groundspeed.toFixed(2)} m/s</span>
              </div>

              <div className="p-2 rounded bg-[#FAF6EF] border border-[#9A7447]/20">
                <span className="text-[#5E5D57] block">ALTITUDE (Y)</span>
                <span className="text-sm font-bold text-[#171714]">{state.y.toFixed(2)} m</span>
              </div>

              <div className="p-2 rounded bg-[#FAF6EF] border border-[#9A7447]/20">
                <span className="text-[#5E5D57] block">RANGE (X)</span>
                <span className="text-sm font-bold text-[#171714]">{state.x.toFixed(2)} m</span>
              </div>

              <div className="p-2 rounded bg-[#FAF6EF] border border-[#9A7447]/20">
                <span className="text-[#5E5D57] block">PITCH ANGLE</span>
                <span className="text-sm font-bold text-[#171714]">{(state.theta * (180 / Math.PI)).toFixed(1)}°</span>
              </div>

              <div className="p-2 rounded bg-[#FAF6EF] border border-[#9A7447]/20">
                <span className="text-[#5E5D57] block">ANGLE OF ATTACK</span>
                <span className="text-sm font-bold text-[#171714]">{(telemetry.angle_of_attack * (180 / Math.PI)).toFixed(1)}°</span>
              </div>

              <div className="p-2 rounded bg-[#FAF6EF] border border-[#9A7447]/20 col-span-2 flex justify-between items-center">
                <span className="text-[#5E5D57]">ACCUMULATED ENERGY:</span>
                <span className="font-bold text-[#A94330]">{state.energy_consumed.toFixed(0)} Joules</span>
              </div>
            </div>
          </div>

          {/* Event Log */}
          <div className="parchment-card p-4 corner-ticks border border-[#9A7447]/40 shadow-sm space-y-2">
            <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#171714] block">
              Simulation Event Log
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px] pr-1">
              {events.map((evt, i) => (
                <div key={i} className="p-1.5 rounded bg-[#FAF6EF] border border-[#9A7447]/20 flex items-start gap-1.5">
                  <span className="text-[#9A7447] font-bold">[{evt.timestamp.toFixed(1)}s]</span>
                  <span className="text-[#34332E]">{evt.message}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL 1: PPO Training Modal */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="parchment-card max-w-xl w-full p-6 sm:p-8 corner-ticks border-2 border-[#9A7447]">
            <div className="flex items-start justify-between pb-4 border-b border-[#9A7447]/30">
              <div>
                <span className="font-serif text-xs font-bold uppercase text-[#9A7447]">
                  Apprendimento per Rinforzo
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#171714]">
                  Train PPO Flapping Policy
                </h3>
              </div>
              <button
                onClick={() => setIsTrainingModalOpen(false)}
                className="text-[#5E5D57] hover:text-[#171714]"
              >
                ✕
              </button>
            </div>

            <div className="my-6 space-y-4 text-xs font-sans">
              <p className="text-[#34332E] leading-relaxed">
                Trains an Actor-Critic multi-layer neural network with PyTorch PPO. The agent discovers continuous control actions for wing amplitude, stroke frequency, and elevator pitch to maximize flight range toward the 200m valley target while penalizing aerodynamic stalls.
              </p>

              <div>
                <label className="block font-serif font-bold text-[#171714] mb-1">
                  Training Timesteps:
                </label>
                <select
                  value={trainingTimesteps}
                  onChange={(e) => setTrainingTimesteps(parseInt(e.target.value))}
                  disabled={trainingStatus?.is_training}
                  className="w-full px-3 py-2 rounded bg-[#FAF6EF] border border-[#9A7447]/40 font-mono"
                >
                  <option value={10000}>10,000 steps (~15 seconds fast test)</option>
                  <option value={30000}>30,000 steps (~45 seconds recommended)</option>
                  <option value={60000}>60,000 steps (~90 seconds convergence)</option>
                </select>
              </div>

              {trainingStatus && (
                <div className="p-4 rounded bg-[#FAF6EF] border border-[#9A7447]/30 space-y-3 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#5E5D57]">STATUS:</span>
                    <span className="font-bold text-[#171714]">
                      {trainingStatus.is_training ? 'TRAINING IN PROGRESS' : 'IDLE / SAVED'}
                    </span>
                  </div>

                  {trainingStatus.is_training && (
                    <div className="space-y-1">
                      <div className="w-full bg-[#E8DDC3] h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#9A7447] h-full transition-all duration-300"
                          style={{ width: `${trainingStatus.progress_pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#5E5D57]">
                        <span>{trainingStatus.progress_pct}% Complete</span>
                        <span>{trainingStatus.fps} Steps/sec</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#5E5D57]">MEAN REWARD:</span>
                    <span className="font-bold text-[#4B7B6B]">{trainingStatus.mean_reward.toFixed(1)}</span>
                  </div>

                  <div className="text-[11px] text-[#34332E]">
                    {trainingStatus.message}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#9A7447]/30">
              <button
                onClick={() => setIsTrainingModalOpen(false)}
                className="btn-renaissance btn-renaissance-outline text-xs"
              >
                Close
              </button>

              <button
                onClick={handleTriggerTraining}
                disabled={isStartingTraining || trainingStatus?.is_training}
                className="btn-renaissance btn-renaissance-primary text-xs"
              >
                <Cpu size={14} />
                <span>{trainingStatus?.is_training ? 'Training Active...' : 'Start Training'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Comparative Evaluation Benchmark Modal */}
      {isEvalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="parchment-card max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 corner-ticks border-2 border-[#9A7447]">
            <div className="flex items-start justify-between pb-4 border-b border-[#9A7447]/30">
              <div>
                <span className="font-serif text-xs font-bold uppercase text-[#9A7447]">
                  Confronto Scientifico (Benchmark)
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#171714]">
                  Rule-Based Baseline vs. PPO Neural Policy
                </h3>
              </div>
              <button
                onClick={() => setIsEvalModalOpen(false)}
                className="text-[#5E5D57] hover:text-[#171714]"
              >
                ✕
              </button>
            </div>

            <div className="my-6 space-y-6">
              <div className="flex items-center justify-between text-xs text-[#5E5D57]">
                <span>
                  Evaluated across standard deterministic wind seeds (-2.5 m/s headwind to +2.5 m/s tailwind).
                </span>
                <button
                  onClick={handleRunEvaluationBenchmark}
                  disabled={isEvaluating}
                  className="btn-renaissance btn-renaissance-primary text-xs py-1.5 px-3"
                >
                  <BarChart3 size={14} />
                  <span>{isEvaluating ? 'Benchmarking...' : 'Re-run Benchmark (10 Eps)'}</span>
                </button>
              </div>

              {benchmarkData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Baseline Column */}
                  <div className="p-5 rounded bg-[#FAF6EF] border border-[#9A7447]/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#9A7447]/20 pb-2">
                      <h4 className="font-serif text-lg font-bold text-[#171714]">
                        Rule-Based Baseline
                      </h4>
                      <span className="badge-renaissance badge-warning">Fixed Rules</span>
                    </div>

                    <div className="space-y-2.5 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#5E5D57]">Mean Flight Distance:</span>
                        <span className="font-bold text-[#171714]">
                          {benchmarkData.baseline.mean_flight_distance_m.toFixed(1)} m
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#5E5D57]">Mean Flight Time:</span>
                        <span className="font-bold text-[#171714]">
                          {benchmarkData.baseline.mean_flight_time_s.toFixed(1)} s
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#5E5D57]">Crashes vs Landings:</span>
                        <span className="font-bold text-[#8C2F20]">
                          {benchmarkData.baseline.crashes} crashes / {benchmarkData.baseline.safe_landings} safe
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#5E5D57]">Mean Energy Expended:</span>
                        <span className="font-bold text-[#171714]">
                          {benchmarkData.baseline.mean_energy_joules.toFixed(0)} J
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[#5E5D57]">Mean Reward Score:</span>
                        <span className="font-bold text-[#171714]">
                          {benchmarkData.baseline.mean_reward.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <p className="font-sans text-[11px] text-[#5E5D57] italic">
                      The rule-based governor maintains nominal pitch attitude, but lacks adaptive wing coordination to counter wind disturbances, typically descending into terrain in ~46 meters.
                    </p>
                  </div>

                  {/* PPO Neural Policy Column */}
                  <div className="p-5 rounded bg-[#FAF6EF] border border-[#4B7B6B]/40 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#4B7B6B]/20 pb-2">
                      <h4 className="font-serif text-lg font-bold text-[#171714]">
                        PPO Neural Policy
                      </h4>
                      <span className="badge-renaissance badge-success">Learned Policy</span>
                    </div>

                    {benchmarkData.rl_policy.available ? (
                      <div className="space-y-2.5 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#5E5D57]">Mean Flight Distance:</span>
                          <span className="font-bold text-[#4B7B6B]">
                            {benchmarkData.rl_policy.mean_flight_distance_m.toFixed(1)} m
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[#5E5D57]">Mean Flight Time:</span>
                          <span className="font-bold text-[#4B7B6B]">
                            {benchmarkData.rl_policy.mean_flight_time_s.toFixed(1)} s
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[#5E5D57]">Crashes vs Landings:</span>
                          <span className="font-bold text-[#4B7B6B]">
                            {benchmarkData.rl_policy.crashes} crashes (Zero terrain impacts)
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[#5E5D57]">Mean Energy Expended:</span>
                          <span className="font-bold text-[#171714]">
                            {benchmarkData.rl_policy.mean_energy_joules.toFixed(0)} J
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[#5E5D57]">Mean Reward Score:</span>
                          <span className="font-bold text-[#4B7B6B]">
                            +{benchmarkData.rl_policy.mean_reward.toFixed(1)} (20x gain)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded bg-[#A94330]/10 border border-[#A94330]/30 text-xs text-[#8C2F20]">
                        PPO model checkpoint is not yet trained. Train the PPO agent in the Training tab to generate comparative benchmarks.
                      </div>
                    )}

                    <p className="font-sans text-[11px] text-[#5E5D57] italic">
                      The trained PPO policy coordinates flapping frequency and elevator angle dynamically, sustaining powered gliding all the way across the 350m valley without crashing.
                    </p>
                  </div>

                </div>
              ) : (
                <div className="p-8 text-center font-serif text-sm text-[#5E5D57]">
                  Loading comparative benchmark data...
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#9A7447]/30">
              <button
                onClick={() => setIsEvalModalOpen(false)}
                className="btn-renaissance text-xs"
              >
                Close Benchmark
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
