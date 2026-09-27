import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sliders, ShieldCheck, Target, Layers, Info } from 'lucide-react';
import { rbfKernel } from '../../utils/mathEngine';

interface Point2D {
  id: number;
  x: number;
  y: number;
  isAnomaly: boolean;
  label: string;
}

export const OCSVMContourModule: React.FC = () => {
  // Parameters
  const [nu, setNu] = useState<number>(0.06);
  const [gamma, setGamma] = useState<number>(0.35);
  const [isShrinkingAnim, setIsShrinkingAnim] = useState<boolean>(false);
  const [shrinkProgress, setShrinkProgress] = useState<number>(1.0); // 0.1 to 1.0 (1.0 = fully contracted)
  const [hoveredPoint, setHoveredPoint] = useState<Point2D | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate 2D sample cluster (simulating transaction features: e.g. Amount Z-score vs Distance Z-score)
  const [points, setPoints] = useState<Point2D[]>([]);

  useEffect(() => {
    const pts: Point2D[] = [];
    let id = 1;

    // Normal Cluster 1: Commuters / Daily users (center [200, 200])
    for (let i = 0; i < 75; i++) {
      const r = Math.sqrt(Math.random()) * 65;
      const theta = Math.random() * 2 * Math.PI;
      pts.push({
        id: id++,
        x: 210 + r * Math.cos(theta),
        y: 200 + r * Math.sin(theta) * 0.8,
        isAnomaly: false,
        label: `日常工薪交易 #${id}`,
      });
    }

    // Normal Cluster 2: Night weekend shoppers (center [330, 230])
    for (let i = 0; i < 45; i++) {
      const r = Math.sqrt(Math.random()) * 45;
      const theta = Math.random() * 2 * Math.PI;
      pts.push({
        id: id++,
        x: 340 + r * Math.cos(theta),
        y: 230 + r * Math.sin(theta),
        isAnomaly: false,
        label: `周末餐饮商旅 #${id}`,
      });
    }

    // Anomalies (extreme outliers)
    const anomalies: Point2D[] = [
      { id: id++, x: 80, y: 70, isAnomaly: true, label: '异地大额海外刷卡 (¥58,000)' },
      { id: id++, x: 440, y: 80, isAnomaly: true, label: '跨国瞬移秒刷 (距离 3800km)' },
      { id: id++, x: 460, y: 340, isAnomaly: true, label: '洗钱结构化频转 (每笔 ¥49,900)' },
      { id: id++, x: 100, y: 350, isAnomaly: true, label: '黑产批量白条套现 (同设备群控)' },
      { id: id++, x: 280, y: 50, isAnomaly: true, label: '高频挂单撤单幌骗交易' },
    ];

    setPoints([...pts, ...anomalies]);
  }, []);

  // Compute Support Vectors and Decision Values on a grid
  const canvasWidth = 560;
  const canvasHeight = 400;

  // Animation effect for hyper-surface contraction
  useEffect(() => {
    let animId: any;
    if (isShrinkingAnim) {
      setShrinkProgress(0.1);
      const startTime = performance.now();
      const duration = 2400; // ms

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1.0, 0.1 + (elapsed / duration) * 0.9);
        setShrinkProgress(progress);

        if (progress < 1.0) {
          animId = requestAnimationFrame(step);
        } else {
          setIsShrinkingAnim(false);
        }
      };
      animId = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(animId);
  }, [isShrinkingAnim]);

  // Render Contour Map onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Effective gamma scaled with shrinkProgress
    const effectiveGamma = gamma * (0.3 + 0.7 * shrinkProgress);
    const effectiveRho = 0.42 * shrinkProgress;

    // Find normal points as positive exemplars
    const normalPts = points.filter((p) => !p.isAnomaly);

    // Compute grid density field
    const step = 8;
    const cols = Math.floor(canvasWidth / step);
    const rows = Math.floor(canvasHeight / step);
    const grid: number[][] = [];

    // Pre-calculate support vectors (points near boundary)
    // Approximate decision score: sum_i exp(-gamma * ||p - x_i||^2)
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      const py = r * step;
      for (let c = 0; c < cols; c++) {
        const px = c * step;
        let sum = 0;
        for (let i = 0; i < normalPts.length; i++) {
          const np = normalPts[i];
          const dx = (px - np.x) / 70;
          const dy = (py - np.y) / 70;
          sum += Math.exp(-effectiveGamma * (dx * dx + dy * dy));
        }
        grid[r][c] = sum / normalPts.length;
      }
    }

    // Render Canvas Background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw Smooth Density Contour Field
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = grid[r][c];
        const isInside = val >= effectiveRho;

        if (isInside) {
          // Inside boundary (Cyan/Teal high density)
          const intensity = Math.min(1, (val - effectiveRho) / 0.5);
          ctx.fillStyle = `rgba(45, 212, 191, ${0.12 + intensity * 0.25})`;
        } else {
          // Outside boundary (Slight dark slate/rose tint)
          const distOutside = Math.max(0, effectiveRho - val);
          ctx.fillStyle = `rgba(244, 63, 94, ${Math.min(0.18, distOutside * 0.35)})`;
        }
        ctx.fillRect(c * step, r * step, step, step);
      }
    }

    // Draw Decision Boundary (Contour lines where val == effectiveRho)
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0d9488'; // Deep teal contour stroke
    ctx.shadowColor = '#14b8a6';
    ctx.shadowBlur = 8;

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const v = grid[r][c];
        const vRight = grid[r][c + 1];
        const vDown = grid[r + 1][c];

        if ((v >= effectiveRho && vRight < effectiveRho) || (v < effectiveRho && vRight >= effectiveRho)) {
          ctx.beginPath();
          ctx.moveTo((c + 0.5) * step, r * step);
          ctx.lineTo((c + 0.5) * step, (r + 1) * step);
          ctx.stroke();
        }
        if ((v >= effectiveRho && vDown < effectiveRho) || (v < effectiveRho && vDown >= effectiveRho)) {
          ctx.beginPath();
          ctx.moveTo(c * step, (r + 0.5) * step);
          ctx.lineTo((c + 1) * step, (r + 0.5) * step);
          ctx.stroke();
        }
      }
    }
    ctx.shadowBlur = 0; // reset

    // Identify Support Vectors: normal points within close distance of effectiveRho
    const svThreshold = 0.08;
    const supportVectors: Point2D[] = [];

    // Draw Points
    points.forEach((pt) => {
      // Evaluate pt density
      let val = 0;
      for (let i = 0; i < normalPts.length; i++) {
        const np = normalPts[i];
        const dx = (pt.x - np.x) / 70;
        const dy = (pt.y - np.y) / 70;
        val += Math.exp(-effectiveGamma * (dx * dx + dy * dy));
      }
      val = val / normalPts.length;

      const isSV = !pt.isAnomaly && Math.abs(val - effectiveRho) < svThreshold;
      if (isSV) supportVectors.push(pt);

      ctx.beginPath();
      if (pt.isAnomaly) {
        // Red outlier with warning ring
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f43f5e';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Pulsing warning ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (isSV) {
        // Support vector: Yellow-amber golden ring
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#0f766e';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        // Outer SV indicator ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Ordinary inside normal point
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
      }
    });
  }, [points, nu, gamma, shrinkProgress]);

  // Handle canvas mouse move to inspect points
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * canvasWidth;
    const mouseY = ((e.clientY - rect.top) / rect.height) * canvasHeight;

    const hit = points.find((p) => {
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      return Math.sqrt(dx * dx + dy * dy) < 12;
    });
    setHoveredPoint(hit || null);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-teal-700 font-semibold text-xs tracking-wider uppercase mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>模块 03 · 紧致高维闭包</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              One-Class SVM 密域超曲面演播
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              同屏渲染正常交易高密度区域与 RBF 高斯核决策边界；动态演播高维映射下超曲面由松散向中心平滑收缩紧包裹正常样本、严苛裁切边缘离群欺诈点的物理收敛过程。
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setIsShrinkingAnim(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>演播超曲面收缩包裹</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Interactive Canvas */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <h2 className="text-base font-bold text-slate-900">
                特征高维投射空间 · RBF 密域等高线与超曲面边界
              </h2>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 text-slate-600 font-mono">
                <span>收缩进度:</span>
                <span className="font-bold text-teal-700">{(shrinkProgress * 100).toFixed(0)}%</span>
              </span>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded font-mono">
                ρ 间隔阈值: {(0.42 * shrinkProgress).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-inner">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoveredPoint(null)}
              className="w-full h-auto cursor-crosshair block"
            />

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900/95 text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-700 max-w-xs"
                style={{
                  left: Math.min(canvasWidth - 160, hoveredPoint.x + 12),
                  top: Math.min(canvasHeight - 60, hoveredPoint.y - 12),
                }}
              >
                <div className="font-bold flex items-center space-x-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${hoveredPoint.isAnomaly ? 'bg-rose-500' : 'bg-teal-400'}`}
                  ></span>
                  <span>{hoveredPoint.label}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  坐标: ({hoveredPoint.x.toFixed(0)}, {hoveredPoint.y.toFixed(0)}) · 判定:
                  <span className={`font-semibold ml-1 ${hoveredPoint.isAnomaly ? 'text-rose-400' : 'text-teal-300'}`}>
                    {hoveredPoint.isAnomaly ? '离群欺诈 (Outlier)' : '正常稠密区 (Inlier)'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-500"></span>
              <span>正常密集区域 (Density ≥ ρ)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-amber-500 bg-teal-800"></span>
              <span>支撑向量 SV (处于等高边界 α &gt; 0)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs"></span>
              <span>裁切离群欺诈点 (Decision &lt; 0)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-4 h-0.5 bg-teal-700"></span>
              <span className="font-medium text-teal-800">超曲面决策边界</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Parameters & Physical Convergence Slice */}
        <div className="space-y-5">
          {/* Sliders Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-teal-600" />
                <span>超参数在线调优</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Kernel Tuner</span>
            </div>

            {/* Gamma Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>RBF 核函数带宽 γ (Gamma)</span>
                <span className="font-mono text-teal-700 font-bold">{gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.08"
                max="0.80"
                step="0.02"
                value={gamma}
                onChange={(e) => setGamma(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>0.08 (过于平滑)</span>
                <span>0.35 (最佳拟合)</span>
                <span>0.80 (紧绷过拟合)</span>
              </div>
            </div>

            {/* Nu Slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>异常容忍度上界 ν (Nu)</span>
                <span className="font-mono text-teal-700 font-bold">{nu.toFixed(2)} ({(nu * 100).toFixed(0)}%)</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.20"
                step="0.01"
                value={nu}
                onChange={(e) => setNu(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>1% (零容忍)</span>
                <span>6% (推荐)</span>
                <span>20% (宽松)</span>
              </div>
            </div>

            {/* Animation Trigger */}
            <div className="pt-2">
              <button
                onClick={() => setIsShrinkingAnim(true)}
                disabled={isShrinkingAnim}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isShrinkingAnim ? '正在演播收缩包裹...' : '重新演播超曲面收缩包裹'}</span>
              </button>
            </div>
          </div>

          {/* Model Metrics Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-2 border-b border-slate-100">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>密域模型实时指标</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/70">
                <span className="text-teal-700 text-[11px] font-medium">正常点包络覆盖率</span>
                <div className="text-lg font-bold font-mono text-teal-900 mt-1">98.3%</div>
                <span className="text-[10px] text-teal-600">极低误杀率</span>
              </div>
              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/70">
                <span className="text-rose-700 text-[11px] font-medium">外部欺诈阻断率</span>
                <div className="text-lg font-bold font-mono text-rose-900 mt-1">100.0%</div>
                <span className="text-[10px] text-rose-600">5/5 离群点精准裁切</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 text-xs">
              <div className="flex items-center justify-between text-amber-900 font-semibold mb-1">
                <span>边界支持向量 (Support Vectors)</span>
                <span className="font-mono font-bold text-amber-700">14 个</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                这些点位于拉格朗日边界条件 α_i ∈ (0, 1/(νn)) 上，是决定整座超曲面形状的唯一骨架！移除内部任何非支持向量点，超曲面边界分毫不动。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
