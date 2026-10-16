import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { TrajectoryPoint } from '../types';
import { Eye, RotateCcw, Box, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../services/sound';

interface Ornithopter3DProps {
  x: number;
  y: number;
  pitch: number;
  wingStroke: number;
  trajectory?: TrajectoryPoint[];
  comparisonTrajectory?: TrajectoryPoint[];
  status: string;
  windX?: number;
}

export const Ornithopter3D: React.FC<Ornithopter3DProps> = ({
  x,
  y,
  pitch,
  wingStroke,
  trajectory = [],
  comparisonTrajectory = [],
  status,
  windX = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [sideViewMode, setSideViewMode] = useState<boolean>(false);
  const [followMode, setFollowMode] = useState<boolean>(true);
  const [particlesEnabled, setParticlesEnabled] = useState<boolean>(true);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // References to keep Three.js objects across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const aircraftGroupRef = useRef<THREE.Group | null>(null);
  const leftWingRef = useRef<THREE.Group | null>(null);
  const rightWingRef = useRef<THREE.Group | null>(null);
  const leftElbowRef = useRef<THREE.Group | null>(null);
  const rightElbowRef = useRef<THREE.Group | null>(null);
  const trajectoryLineRef = useRef<THREE.Line | null>(null);
  const comparisonLineRef = useRef<THREE.Line | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Sound throttling
  const lastFlapSoundTimeRef = useRef<number>(0);

  // Mouse interaction state
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const cameraAngleRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: Math.PI / 4,
    phi: Math.PI / 6,
    radius: 35
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(wireframeMode ? 0x10151a : 0xf4eee1);
    scene.fog = new THREE.FogExp2(wireframeMode ? 0x10151a : 0xf4eee1, 0.0035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffecd0, 1.5);
    dirLight.position.set(50, 80, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x7890a8, 0.55);
    fillLight.position.set(-50, 40, -50);
    scene.add(fillLight);

    // Materials
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a2b,
      roughness: 0.75,
      metalness: 0.15,
      wireframe: wireframeMode
    });

    const wingFabricMat = new THREE.MeshStandardMaterial({
      color: wireframeMode ? 0x64b5f6 : 0xdec69a,
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
      wireframe: wireframeMode
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xc89b3c,
      roughness: 0.35,
      metalness: 0.8,
      wireframe: wireframeMode
    });

    // 5. Environment
    // Cliff Platform (x: 0 to 16, y: 0 to 25)
    const cliffGeo = new THREE.BoxGeometry(16, 25, 20);
    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0x5a564c,
      roughness: 0.95,
      wireframe: wireframeMode
    });
    const cliff = new THREE.Mesh(cliffGeo, cliffMat);
    cliff.position.set(7.5, 12.5, 0);
    cliff.receiveShadow = true;
    scene.add(cliff);

    // Launch ramp plank on top of cliff
    const rampGeo = new THREE.BoxGeometry(12, 0.6, 6);
    const ramp = new THREE.Mesh(rampGeo, woodMat);
    ramp.position.set(7.5, 25.3, 0);
    ramp.receiveShadow = true;
    scene.add(ramp);

    // Valley ground floor (y = 0)
    const groundGeo = new THREE.PlaneGeometry(800, 300, 40, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3d4432,
      roughness: 0.9,
      wireframe: wireframeMode
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(180, 0, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    // Ground Grid
    const grid = new THREE.GridHelper(600, 60, 0x9a7447, 0x4a5a6a);
    grid.position.set(150, 0.05, 0);
    scene.add(grid);

    // Target Landing Zone (x = 200)
    const targetRingGeo = new THREE.RingGeometry(8, 14, 32);
    const targetRingMat = new THREE.MeshBasicMaterial({
      color: 0x4b7b6b,
      side: THREE.DoubleSide
    });
    const targetRing = new THREE.Mesh(targetRingGeo, targetRingMat);
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.set(200, 0.1, 0);
    scene.add(targetRing);

    const targetCenterGeo = new THREE.CircleGeometry(5, 24);
    const targetCenterMat = new THREE.MeshBasicMaterial({
      color: 0x9a7447,
      side: THREE.DoubleSide
    });
    const targetCenter = new THREE.Mesh(targetCenterGeo, targetCenterMat);
    targetCenter.rotation.x = -Math.PI / 2;
    targetCenter.position.set(200, 0.12, 0);
    scene.add(targetCenter);

    // 6. Build Leonardo's Ornithopter Model
    const aircraft = new THREE.Group();
    aircraftGroupRef.current = aircraft;
    scene.add(aircraft);

    // Main Fuselage Truss
    const fuselageGeo = new THREE.CylinderGeometry(0.2, 0.45, 6.5, 8);
    const fuselage = new THREE.Mesh(fuselageGeo, woodMat);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.castShadow = true;
    aircraft.add(fuselage);

    // Cockpit Pilot Basket / Frame
    const basketGeo = new THREE.BoxGeometry(1.6, 1.2, 1.2);
    const basket = new THREE.Mesh(basketGeo, woodMat);
    basket.position.set(-0.2, -0.6, 0);
    basket.castShadow = true;
    aircraft.add(basket);

    // Central Drive Gears / Pulleys (Bronze)
    const gearGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 16);
    const gear = new THREE.Mesh(gearGeo, brassMat);
    gear.position.set(0.2, 0.2, 0);
    aircraft.add(gear);

    // Wingspan root
    const wingspanM = 10.5;
    const halfSpan = wingspanM / 2.0;

    // LEFT WING HINGE ASSEMBLY
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(0.5, 0.4, 0.6);
    aircraft.add(leftWingGroup);
    leftWingRef.current = leftWingGroup;

    const innerSparGeo = new THREE.CylinderGeometry(0.12, 0.16, halfSpan * 0.45, 8);
    const leftInnerSpar = new THREE.Mesh(innerSparGeo, woodMat);
    leftInnerSpar.position.set(0, 0, (halfSpan * 0.45) / 2);
    leftInnerSpar.rotation.x = Math.PI / 2;
    leftInnerSpar.castShadow = true;
    leftWingGroup.add(leftInnerSpar);

    const elbowBrassGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const leftElbowJoint = new THREE.Mesh(elbowBrassGeo, brassMat);
    leftElbowJoint.position.set(0, 0, halfSpan * 0.45);
    leftWingGroup.add(leftElbowJoint);

    const leftElbowGroup = new THREE.Group();
    leftElbowGroup.position.set(0, 0, halfSpan * 0.45);
    leftWingGroup.add(leftElbowGroup);
    leftElbowRef.current = leftElbowGroup;

    const outerSparGeo = new THREE.CylinderGeometry(0.06, 0.12, halfSpan * 0.55, 8);
    const leftOuterSpar = new THREE.Mesh(outerSparGeo, woodMat);
    leftOuterSpar.position.set(0, 0, (halfSpan * 0.55) / 2);
    leftOuterSpar.rotation.x = Math.PI / 2;
    leftOuterSpar.castShadow = true;
    leftElbowGroup.add(leftOuterSpar);

    // Left Wing Fabric Membrane
    const leftWingShape = new THREE.Shape();
    leftWingShape.moveTo(0, 0);
    leftWingShape.lineTo(-1.8, 0.2);
    leftWingShape.lineTo(-2.2, halfSpan * 0.45);
    leftWingShape.lineTo(-1.4, halfSpan);
    leftWingShape.lineTo(0.2, halfSpan);
    leftWingShape.lineTo(0, 0);

    const leftWingMeshGeo = new THREE.ShapeGeometry(leftWingShape);
    const leftWingMesh = new THREE.Mesh(leftWingMeshGeo, wingFabricMat);
    leftWingMesh.rotation.x = Math.PI / 2;
    leftWingMesh.rotation.y = -Math.PI / 2;
    leftWingMesh.position.set(0, 0, 0);
    leftWingMesh.castShadow = true;
    leftWingGroup.add(leftWingMesh);

    // RIGHT WING HINGE ASSEMBLY
    const rightWingGroup = new THREE.Group();
    rightWingGroup.position.set(0.5, 0.4, -0.6);
    aircraft.add(rightWingGroup);
    rightWingRef.current = rightWingGroup;

    const rightInnerSpar = new THREE.Mesh(innerSparGeo, woodMat);
    rightInnerSpar.position.set(0, 0, -(halfSpan * 0.45) / 2);
    rightInnerSpar.rotation.x = -Math.PI / 2;
    rightInnerSpar.castShadow = true;
    rightWingGroup.add(rightInnerSpar);

    const rightElbowJoint = new THREE.Mesh(elbowBrassGeo, brassMat);
    rightElbowJoint.position.set(0, 0, -halfSpan * 0.45);
    rightWingGroup.add(rightElbowJoint);

    const rightElbowGroup = new THREE.Group();
    rightElbowGroup.position.set(0, 0, -halfSpan * 0.45);
    rightWingGroup.add(rightElbowGroup);
    rightElbowRef.current = rightElbowGroup;

    const rightOuterSpar = new THREE.Mesh(outerSparGeo, woodMat);
    rightOuterSpar.position.set(0, 0, -(halfSpan * 0.55) / 2);
    rightOuterSpar.rotation.x = -Math.PI / 2;
    rightOuterSpar.castShadow = true;
    rightElbowGroup.add(rightOuterSpar);

    const rightWingShape = new THREE.Shape();
    rightWingShape.moveTo(0, 0);
    rightWingShape.lineTo(-1.8, -0.2);
    rightWingShape.lineTo(-2.2, -halfSpan * 0.45);
    rightWingShape.lineTo(-1.4, -halfSpan);
    rightWingShape.lineTo(0.2, -halfSpan);
    rightWingShape.lineTo(0, 0);

    const rightWingMeshGeo = new THREE.ShapeGeometry(rightWingShape);
    const rightWingMesh = new THREE.Mesh(rightWingMeshGeo, wingFabricMat);
    rightWingMesh.rotation.x = -Math.PI / 2;
    rightWingMesh.rotation.y = -Math.PI / 2;
    rightWingMesh.position.set(0, 0, 0);
    rightWingMesh.castShadow = true;
    rightWingGroup.add(rightWingMesh);

    // Tail Assembly
    const tailGroup = new THREE.Group();
    tailGroup.position.set(-3.2, 0.2, 0);
    aircraft.add(tailGroup);

    const elevatorGeo = new THREE.BoxGeometry(1.6, 0.08, 3.2);
    const elevator = new THREE.Mesh(elevatorGeo, wingFabricMat);
    elevator.position.set(-0.6, 0, 0);
    tailGroup.add(elevator);

    const rudderGeo = new THREE.BoxGeometry(1.4, 1.8, 0.08);
    const rudder = new THREE.Mesh(rudderGeo, woodMat);
    rudder.position.set(-0.6, 0.9, 0);
    tailGroup.add(rudder);

    // 7. Atmospheric Air Motes / Wind Particles
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      particlePos[p * 3] = (Math.random() - 0.5) * 120 + 30;
      particlePos[p * 3 + 1] = Math.random() * 40;
      particlePos[p * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.6,
      transparent: true,
      opacity: 0.65
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 8. Primary Trajectory Line (Active Flight)
    const maxTrajPoints = 1200;
    const trajPositions = new Float32Array(maxTrajPoints * 3);
    const trajGeo = new THREE.BufferGeometry();
    trajGeo.setAttribute('position', new THREE.BufferAttribute(trajPositions, 3));
    const trajMat = new THREE.LineBasicMaterial({
      color: wireframeMode ? 0x64b5f6 : 0xa94330,
      linewidth: 3
    });
    const trajectoryLine = new THREE.Line(trajGeo, trajMat);
    scene.add(trajectoryLine);
    trajectoryLineRef.current = trajectoryLine;

    // 9. Comparison Trajectory Line (e.g. Baseline / Secondary)
    const compPositions = new Float32Array(maxTrajPoints * 3);
    const compGeo = new THREE.BufferGeometry();
    compGeo.setAttribute('position', new THREE.BufferAttribute(compPositions, 3));
    const compMat = new THREE.LineDashedMaterial({
      color: 0x4b7b6b,
      dashSize: 1.5,
      gapSize: 0.8,
      linewidth: 2
    });
    const comparisonLine = new THREE.Line(compGeo, compMat);
    scene.add(comparisonLine);
    comparisonLineRef.current = comparisonLine;

    // Mouse Drag & Orbit Listeners
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(0.05, Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi + deltaY * 0.008));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(12, Math.min(130, cameraAngleRef.current.radius + e.deltaY * 0.05));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElem.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Flow atmospheric particles
      if (particlesRef.current && particlesEnabled) {
        const positions = (particlesRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        const driftSpeed = 0.25 - windX * 0.08;
        for (let p = 0; p < particleCount; p++) {
          positions[p * 3] -= driftSpeed;
          if (positions[p * 3] < (aircraftGroupRef.current?.position.x || 0) - 50) {
            positions[p * 3] = (aircraftGroupRef.current?.position.x || 0) + 70;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Camera Positioning
      if (cameraRef.current && aircraftGroupRef.current) {
        const target = followMode
          ? aircraftGroupRef.current.position.clone()
          : new THREE.Vector3(x, y, 0);

        if (sideViewMode) {
          // Pure 2D Engineering Ortho-like Side View
          cameraRef.current.position.set(target.x, target.y + 2, 45);
          cameraRef.current.lookAt(target.x, target.y, 0);
        } else {
          // Smooth Perspective Orbit View
          const { theta, phi, radius } = cameraAngleRef.current;
          const cx = target.x + radius * Math.cos(phi) * Math.sin(theta);
          const cy = target.y + radius * Math.sin(phi);
          const cz = target.z + radius * Math.cos(phi) * Math.cos(theta);

          cameraRef.current.position.set(cx, cy, cz);
          cameraRef.current.lookAt(target.x, target.y, target.z);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElem.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [wireframeMode, sideViewMode, particlesEnabled]);

  // Synchronize dynamic physics position, pitch, and wing articulation
  useEffect(() => {
    if (!aircraftGroupRef.current) return;

    // 1. Position in world space (x, y)
    aircraftGroupRef.current.position.set(x, y, 0);

    // 2. Aircraft Pitch (rotation around Z axis)
    aircraftGroupRef.current.rotation.z = pitch;

    // 3. Dynamic Wing Flapping
    if (leftWingRef.current && rightWingRef.current) {
      leftWingRef.current.rotation.x = -wingStroke;
      rightWingRef.current.rotation.x = wingStroke;
    }

    if (leftElbowRef.current && rightElbowRef.current) {
      const elbowFlex = wingStroke * 0.45;
      leftElbowRef.current.rotation.x = -elbowFlex;
      rightElbowRef.current.rotation.x = elbowFlex;
    }

    // Audio cue on peak downstroke
    const now = Date.now();
    if (wingStroke < -0.3 && now - lastFlapSoundTimeRef.current > 380) {
      lastFlapSoundTimeRef.current = now;
      soundFx.playFlapSound(Math.abs(wingStroke));
    }

    // 4. Update Active Trajectory
    if (trajectoryLineRef.current && trajectory.length > 0) {
      const geo = trajectoryLineRef.current.geometry as THREE.BufferGeometry;
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      const ptsToRender = Math.min(trajectory.length, 1200);
      for (let i = 0; i < ptsToRender; i++) {
        array[i * 3] = trajectory[i].x;
        array[i * 3 + 1] = trajectory[i].y;
        array[i * 3 + 2] = 0;
      }
      posAttr.needsUpdate = true;
      geo.setDrawRange(0, ptsToRender);
    }

    // 5. Update Comparison Trajectory (if available)
    if (comparisonLineRef.current && comparisonTrajectory.length > 0) {
      const compGeo = comparisonLineRef.current.geometry as THREE.BufferGeometry;
      const compAttr = compGeo.getAttribute('position') as THREE.BufferAttribute;
      const compArr = compAttr.array as Float32Array;

      const ptsToRender = Math.min(comparisonTrajectory.length, 1200);
      for (let i = 0; i < ptsToRender; i++) {
        compArr[i * 3] = comparisonTrajectory[i].x;
        compArr[i * 3 + 1] = comparisonTrajectory[i].y;
        compArr[i * 3 + 2] = -0.2; // Slightly offset depth to avoid z-fighting
      }
      compAttr.needsUpdate = true;
      compGeo.setDrawRange(0, ptsToRender);
    }
  }, [x, y, pitch, wingStroke, trajectory, comparisonTrajectory]);

  const handleResetCamera = () => {
    soundFx.playRatchetClick();
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 6, radius: 35 };
    setSideViewMode(false);
    setFollowMode(true);
  };

  const toggleSound = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    soundFx.setMuted(nextMuted);
    if (!nextMuted) soundFx.playRatchetClick();
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#f4eee1] rounded border border-[#9A7447]/30 overflow-hidden shadow-inner select-none">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Modern Renaissance HUD Overlays */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xs font-bold uppercase tracking-wider text-[#9A7447] bg-[#FAF6EF]/85 px-2 py-0.5 rounded border border-[#9A7447]/30 backdrop-blur-sm">
            Prospettiva 3D • Leonardo Flight HUD
          </span>
        </div>
        <div className="font-mono text-[10px] text-[#34332E] bg-[#FAF6EF]/80 px-2 py-1 rounded border border-[#9A7447]/20 backdrop-blur-sm flex items-center gap-3">
          <span>X: <strong className="text-[#171714]">{x.toFixed(1)}m</strong></span>
          <span>ALT: <strong className="text-[#171714]">{y.toFixed(1)}m</strong></span>
          <span>PITCH: <strong className="text-[#171714]">{(pitch * (180 / Math.PI)).toFixed(1)}°</strong></span>
        </div>
      </div>

      {/* Viewport Action Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#FAF6EF]/90 backdrop-blur-sm p-1 rounded border border-[#9A7447]/40 shadow-sm">
        <button
          onClick={() => {
            soundFx.playRatchetClick();
            setSideViewMode(!sideViewMode);
          }}
          className={`p-1.5 rounded text-xs flex items-center gap-1 font-serif transition-colors ${
            sideViewMode ? 'bg-[#9A7447] text-white' : 'hover:bg-[#E8DDC3] text-[#171714]'
          }`}
          title="Toggle Side Profile View"
        >
          <Eye size={14} />
          <span className="hidden sm:inline">Side View</span>
        </button>

        <button
          onClick={() => {
            soundFx.playRatchetClick();
            setWireframeMode(!wireframeMode);
          }}
          className={`p-1.5 rounded text-xs flex items-center gap-1 font-serif transition-colors ${
            wireframeMode ? 'bg-[#3A5A78] text-white' : 'hover:bg-[#E8DDC3] text-[#171714]'
          }`}
          title="Toggle Blueprint Wireframe Mode"
        >
          <Box size={14} />
          <span className="hidden sm:inline">Blueprint</span>
        </button>

        <button
          onClick={() => {
            soundFx.playRatchetClick();
            setParticlesEnabled(!particlesEnabled);
          }}
          className={`p-1.5 rounded text-xs flex items-center gap-1 font-serif transition-colors ${
            particlesEnabled ? 'text-[#9A7447]' : 'text-[#5E5D57]'
          }`}
          title="Toggle Atmospheric Air Particles"
        >
          <Sparkles size={14} />
        </button>

        <button
          onClick={toggleSound}
          className="p-1.5 rounded hover:bg-[#E8DDC3] text-[#171714] text-xs transition-colors"
          title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isAudioMuted ? <VolumeX size={14} /> : <Volume2 size={14} className="text-[#9A7447]" />}
        </button>

        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded hover:bg-[#E8DDC3] text-[#171714] text-xs transition-colors"
          title="Reset Camera"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Artificial Attitude Pitch Ladder (HUD Center Overlay) */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-none hidden sm:flex flex-col items-center">
        <div className="font-mono text-[9px] text-[#9A7447] font-bold mb-1">PITCH LADDER</div>
        <div className="w-12 h-20 border-l-2 border-[#9A7447]/40 relative flex items-center">
          <div
            className="absolute left-0 w-8 h-0.5 bg-[#A94330] transition-all duration-75"
            style={{
              top: `${Math.max(10, Math.min(90, 50 - pitch * 60))}%`
            }}
          />
          <div className="absolute -left-1 w-2 h-2 rounded-full bg-[#9A7447]" />
        </div>
      </div>

      {/* Bottom Status Ribbon */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="bg-[#FAF6EF]/90 backdrop-blur-sm px-2.5 py-1 rounded border border-[#9A7447]/30 shadow-sm font-mono text-[11px] text-[#171714] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4B7B6B] animate-pulse" />
          <span>Target Landing Field: <strong className="text-[#4B7B6B]">X=200m</strong></span>
        </div>
        <div className="bg-[#FAF6EF]/90 backdrop-blur-sm px-2.5 py-1 rounded border border-[#9A7447]/30 shadow-sm font-mono text-[11px] text-[#5E5D57]">
          Status: <strong className="text-[#171714] uppercase">{status.replace('_', ' ')}</strong>
        </div>
      </div>
    </div>
  );
};
