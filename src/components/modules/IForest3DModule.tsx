import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, ChevronRight, Eye, Sparkles, Sliders, Info } from 'lucide-react';
import { DataPoint3D, SplitPlane } from '../../types';

export const IForest3DModule: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [maxCutSteps, setMaxCutSteps] = useState<number>(6);
  const [selectedPointId, setSelectedPointId] = useState<string>('outlier-1');
  const [clusterDensity, setClusterDensity] = useState<number>(180);
  const [showWireframe, setShowWireframe] = useState<boolean>(true);

  // Three.js scene refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const planesGroupRef = useRef<THREE.Group | null>(null);
  const focusSphereRef = useRef<THREE.Mesh | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Data Points (Normal cluster at center, outliers on edges)
  const dataPointsRef = useRef<DataPoint3D[]>([]);
  const planesRef = useRef<SplitPlane[]>([]);

  // Generate data points
  useEffect(() => {
    const points: DataPoint3D[] = [];
    // Normal dense transactions around (0, 0, 0)
    for (let i = 0; i < clusterDensity; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 2.2;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = (r * Math.sin(phi) * Math.sin(theta)) * 0.7; // slight flatten
      const z = r * Math.cos(phi);

      points.push({
        id: `normal-${i}`,
        x,
        y,
        z,
        isAnomaly: false,
        score: 0.15 + Math.random() * 0.25,
        depth: 7 + Math.floor(Math.random() * 6),
        label: `正常交易 #${i + 1}`,
        amount: Math.round(50 + Math.random() * 450),
      });
    }

    // Extreme anomalies (e.g. 异地大额 POS 盗刷, 离散空包等)
    const anomalies: DataPoint3D[] = [
      {
        id: 'outlier-1',
        x: 4.8,
        y: 3.9,
        z: 4.2,
        isAnomaly: true,
        score: 0.94,
        depth: 2,
        isolatedAtStep: 2,
        label: '异地大额海外盗刷 (¥48,600 / 距常驻地 3400km)',
        amount: 48600,
      },
      {
        id: 'outlier-2',
        x: -4.5,
        y: 4.1,
        z: -3.8,
        isAnomaly: true,
        score: 0.91,
        depth: 2,
        isolatedAtStep: 1,
        label: '暗网克隆卡微额探针连击 (连续12次试探)',
        amount: 12000,
      },
      {
        id: 'outlier-3',
        x: 4.2,
        y: -4.0,
        z: -4.6,
        isAnomaly: true,
        score: 0.88,
        depth: 3,
        isolatedAtStep: 3,
        label: '洗钱快进快出账户 (¥2,400,000 / 驻留 8min)',
        amount: 2400000,
      },
      {
        id: 'outlier-4',
        x: -4.8,
        y: -3.5,
        z: 3.9,
        isAnomaly: true,
        score: 0.89,
        depth: 3,
        isolatedAtStep: 3,
        label: '电商黑产同机群控套现 (30台设备同IMEI)',
        amount: 36000,
      },
    ];

    dataPointsRef.current = [...points, ...anomalies];

    // Pre-determine cutting hyperplanes for demonstration
    planesRef.current = [
      {
        id: 1,
        axis: 'x',
        value: 3.2,
        step: 1,
        color: '#6366f1',
        bounds: { minX: 3.2, maxX: 3.2, minY: -6, maxY: 6, minZ: -6, maxZ: 6 },
      },
      {
        id: 2,
        axis: 'y',
        value: 2.5,
        step: 2,
        color: '#06b6d4',
        bounds: { minX: -6, maxX: 6, minY: 2.5, maxY: 2.5, minZ: -6, maxZ: 6 },
      },
      {
        id: 3,
        axis: 'z',
        value: 2.8,
        step: 3,
        color: '#f59e0b',
        bounds: { minX: -6, maxX: 6, minY: -6, maxY: 6, minZ: 2.8, maxZ: 2.8 },
      },
      {
        id: 4,
        axis: 'x',
        value: -2.8,
        step: 4,
        color: '#ec4899',
        bounds: { minX: -2.8, maxX: -2.8, minY: -6, maxY: 6, minZ: -6, maxZ: 6 },
      },
      {
        id: 5,
        axis: 'y',
        value: -2.4,
        step: 5,
        color: '#10b981',
        bounds: { minX: -6, maxX: 6, minY: -2.4, maxY: -2.4, minZ: -6, maxZ: 6 },
      },
      {
        id: 6,
        axis: 'z',
        value: -2.5,
        step: 6,
        color: '#8b5cf6',
        bounds: { minX: -6, maxX: 6, minY: -6, maxY: 6, minZ: -2.5, maxZ: -2.5 },
      },
    ];

    setCurrentStep(0);
  }, [clusterDensity]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 640;
    const height = 480;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Deep slate dark tone for high-contrast crisp visualization
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(11, 9, 13);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x6366f1, 2, 20);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Bounding Box Frame (Feature Space [-5, 5]^3)
    const boxGeo = new THREE.BoxGeometry(10, 10, 10);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxLine = new THREE.LineSegments(
      boxEdges,
      new THREE.LineBasicMaterial({ color: 0x334155, linewidth: 1 })
    );
    scene.add(boxLine);

    // Coordinate Grid Helper on ground
    const grid = new THREE.GridHelper(10, 10, 0x475569, 0x1e293b);
    grid.position.y = -5;
    scene.add(grid);

    // Group for Cutting Planes
    const planesGroup = new THREE.Group();
    scene.add(planesGroup);
    planesGroupRef.current = planesGroup;

    // Instanced Mesh for Transaction Points
    const totalPoints = dataPointsRef.current.length;
    const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.2,
    });
    const instancedMesh = new THREE.InstancedMesh(sphereGeo, sphereMat, totalPoints);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    dataPointsRef.current.forEach((pt, i) => {
      dummy.position.set(pt.x, pt.y, pt.z);
      dummy.scale.set(pt.isAnomaly ? 1.6 : 1.0, pt.isAnomaly ? 1.6 : 1.0, pt.isAnomaly ? 1.6 : 1.0);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);

      if (pt.isAnomaly) {
        color.setHex(0xf43f5e); // Bright Rose red for anomalies
      } else {
        color.setHex(0x10b981); // Emerald green for normal cluster
      }
      instancedMesh.setColorAt(i, color);
    });
    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

    scene.add(instancedMesh);
    pointsMeshRef.current = instancedMesh;

    // Glowing Target Focus Marker
    const focusGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const focusMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    });
    const focusSphere = new THREE.Mesh(focusGeo, focusMat);
    scene.add(focusSphere);
    focusSphereRef.current = focusSphere;

    // Mouse Controls (Rotate & Zoom)
    let isMouseDown = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = new THREE.Spherical().setFromVector3(camera.position);

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };

      spherical.theta -= deltaX * 0.008;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaY * 0.008));
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
    };

    const onMouseUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(5, Math.min(25, spherical.radius + e.deltaY * 0.015));
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Gentle auto-rotation when playing
      if (focusSphereRef.current) {
        focusSphereRef.current.rotation.y += 0.02;
        focusSphereRef.current.rotation.x += 0.01;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [clusterDensity]);

  // Update cutting planes in scene when currentStep changes
  useEffect(() => {
    if (!planesGroupRef.current) return;
    const group = planesGroupRef.current;
    // Clear existing planes
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Render active planes up to currentStep
    for (let i = 0; i < currentStep && i < planesRef.current.length; i++) {
      const planeData = planesRef.current[i];
      let planeGeo: THREE.PlaneGeometry;
      const planeSize = 10;

      if (planeData.axis === 'x') {
        planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(planeData.color),
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
          roughness: 0.2,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.y = Math.PI / 2;
        mesh.position.set(planeData.value, 0, 0);
        group.add(mesh);

        // Edge wireframe for crisp slice boundary
        const edges = new THREE.EdgesGeometry(planeGeo);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
        );
        line.rotation.y = Math.PI / 2;
        line.position.set(planeData.value, 0, 0);
        group.add(line);
      } else if (planeData.axis === 'y') {
        planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(planeData.color),
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.rotation.x = Math.PI / 2;
        mesh.position.set(0, planeData.value, 0);
        group.add(mesh);

        const edges = new THREE.EdgesGeometry(planeGeo);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
        );
        line.rotation.x = Math.PI / 2;
        line.position.set(0, planeData.value, 0);
        group.add(line);
      } else {
        planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(planeData.color),
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.position.set(0, 0, planeData.value);
        group.add(mesh);

        const edges = new THREE.EdgesGeometry(planeGeo);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })
        );
        line.position.set(0, 0, planeData.value);
        group.add(line);
      }
    }
  }, [currentStep]);

  // Update focus marker on selected point
  useEffect(() => {
    if (!focusSphereRef.current) return;
    const pt = dataPointsRef.current.find((p) => p.id === selectedPointId);
    if (pt) {
      focusSphereRef.current.position.set(pt.x, pt.y, pt.z);
      focusSphereRef.current.visible = true;
    } else {
      focusSphereRef.current.visible = false;
    }
  }, [selectedPointId]);

  // Auto-play timer
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxCutSteps) {
            return 0; // loop
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxCutSteps]);

  const selectedPoint = dataPointsRef.current.find((p) => p.id === selectedPointId);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>模块 02 · 空间超平面剖分</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Isolation Forest 随机分割 3D 演播室
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              支持鼠标拖拽 3D 自由手势旋转与滚轮缩放。3D 空间动态演示超平面随机切割（Random Hyperplane Partitions），平滑高亮易被孤立（平均路径极短 $h(x) \ll E(h)$）的极端欺诈交易点。
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-ping"></span>
              离群点路径深度: 1 ~ 3 层
            </span>
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
              核心点路径深度: 8 ~ 14 层
            </span>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas & Controls Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Canvas Container */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg relative flex flex-col">
          {/* Top floating toolbar inside 3D canvas */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 pointer-events-auto text-xs text-slate-200">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>当前树深/切割轮次：</span>
              <span className="font-mono font-bold text-indigo-300 text-sm">
                第 {currentStep} / {maxCutSteps} 次切割
              </span>
            </div>

            <div className="flex items-center space-x-2 pointer-events-auto">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? '暂停演播' : '自动连播'}</span>
              </button>

              <button
                onClick={() => setCurrentStep((prev) => (prev >= maxCutSteps ? 0 : prev + 1))}
                className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-medium transition-all cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>单步切割</span>
              </button>

              <button
                onClick={() => {
                  setCurrentStep(0);
                  setIsPlaying(false);
                }}
                className="p-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 cursor-pointer"
                title="复位空间"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Three.js viewport */}
          <div ref={mountRef} className="w-full h-[480px] cursor-grab active:cursor-grabbing select-none" />

          {/* Bottom legend & gesture hint */}
          <div className="bg-slate-950/90 border-t border-slate-800/80 px-4 py-3 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></span>
                <span className="text-slate-300">红色：极端异常离群点 (极易被超平面孤立)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300">绿色：正常密集聚类点</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 border border-amber-400 border-dashed rounded-full"></span>
                <span className="text-amber-300">金光圈：跟踪样本</span>
              </div>
            </div>
            <div className="text-slate-500 font-mono hidden sm:block">
              鼠标按住拖拽可3D全向旋转 · 滚轮缩放
            </div>
          </div>
        </div>

        {/* Right Inspection & Param Controls */}
        <div className="space-y-5">
          {/* Target Tracking Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>目标点孤立路径监控</span>
              </h3>
              <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Path Tracer
              </span>
            </div>

            {/* Target Select */}
            <div className="space-y-2">
              <label className="text-xs text-slate-600 font-medium">选择聚光灯观测样本：</label>
              <select
                value={selectedPointId}
                onChange={(e) => setSelectedPointId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:outline-indigo-600"
              >
                <optgroup label="⚠️ 极端欺诈离群样本 (短路径)">
                  <option value="outlier-1">异地大额海外盗刷 (¥48,600 / 距离 3400km)</option>
                  <option value="outlier-2">暗网克隆卡微额探针 (连续12次试探)</option>
                  <option value="outlier-3">洗钱快进快出账户 (¥2,400,000 / 驻留 8min)</option>
                  <option value="outlier-4">电商黑产同机群控套现 (30台设备)</option>
                </optgroup>
                <optgroup label="✅ 正常密集核心交易样本 (长路径)">
                  <option value="normal-0">日常早餐微信支付 (¥18.50 / 常住地)</option>
                  <option value="normal-10">商超生鲜刷卡 (¥168.00 / 常住地)</option>
                </optgroup>
              </select>
            </div>

            {/* Live Observation Stats for Selected Point */}
            {selectedPoint && (
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">样本标签：</span>
                  <span className={`font-semibold ${selectedPoint.isAnomaly ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {selectedPoint.isAnomaly ? '欺诈异常离群' : '正常合规交易'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">交易金额：</span>
                  <span className="font-mono font-bold text-slate-900">
                    ¥{selectedPoint.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">空间三维坐标 (X,Y,Z)：</span>
                  <span className="font-mono text-slate-700">
                    ({selectedPoint.x.toFixed(1)}, {selectedPoint.y.toFixed(1)}, {selectedPoint.z.toFixed(1)})
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500">被彻底孤立所需切割步数：</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">
                    {selectedPoint.isAnomaly ? `仅需 ${selectedPoint.depth} 次切割！` : `需 > ${selectedPoint.depth} 次切割`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">当前切割状态：</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      currentStep >= (selectedPoint.isolatedAtStep || selectedPoint.depth)
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {currentStep >= (selectedPoint.isolatedAtStep || selectedPoint.depth)
                      ? '已完全陷入单样本叶节点'
                      : '尚处于多样本子空间'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Density & Hyperplane Parameter Slice */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>空间模拟参数</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Hyperplane Tuner</span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>正常基盘交易点密度</span>
                <span className="font-mono text-indigo-600 font-bold">{clusterDensity} 点</span>
              </div>
              <input
                type="range"
                min="80"
                max="300"
                step="20"
                value={clusterDensity}
                onChange={(e) => setClusterDensity(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>80 (稀疏)</span>
                <span>180 (标准)</span>
                <span>300 (密集)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>最大演播切割面层数</span>
                <span className="font-mono text-indigo-600 font-bold">{maxCutSteps} 面</span>
              </div>
              <input
                type="range"
                min="3"
                max="6"
                step="1"
                value={maxCutSteps}
                onChange={(e) => setMaxCutSteps(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Intuition Box */}
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-1">
              <div className="font-semibold flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                <span>孤立森林 3D 几何精髓：</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-800">
                正常交易点密密麻麻挤在中心区域，无论超平面怎么切，落入同一盒体（Voxel）内的样本数依然众多；而边缘异常点在空间周围是一片荒漠，随机切平面几乎毫不费力就能把它单独“包围隔绝”。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
