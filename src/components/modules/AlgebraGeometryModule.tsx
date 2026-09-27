import React, { useState } from 'react';
import { calculateAveragePathLength, calculateIForestScore } from '../../utils/mathEngine';
import { Calculator, ArrowRight, Lightbulb, Compass, HelpCircle } from 'lucide-react';

export const AlgebraGeometryModule: React.FC = () => {
  // Interactive parameters for Isolation Forest formula
  const [sampleSizeN, setSampleSizeN] = useState<number>(256);
  const [observedDepth, setObservedDepth] = useState<number>(3.5);

  // Interactive parameters for OCSVM formula
  const [nuParam, setNuParam] = useState<number>(0.05);
  const [gammaParam, setGammaParam] = useState<number>(0.15);
  const [slackWeight, setSlackWeight] = useState<number>(0.2);

  // Computed values
  const cn = calculateAveragePathLength(sampleSizeN);
  const iForestScore = calculateIForestScore(observedDepth, sampleSizeN);

  // Determine score interpretation
  let scoreVerdict = {
    level: 'normal',
    text: '正常核心样本 (Normal Inlier)',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    desc: '路径深度接近或超过 c(n)，深居于密集聚类内部，需要大量随机切割才能被隔离。',
  };
  if (iForestScore >= 0.7) {
    scoreVerdict = {
      level: 'high_anomaly',
      text: '极高危异常 (Extreme Anomaly)',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      desc: '路径极短 (h(x) ≪ c(n))，在特征空间极其稀疏或偏远，仅需极少切割即被完全孤立！',
    };
  } else if (iForestScore >= 0.5) {
    scoreVerdict = {
      level: 'suspicious',
      text: '存疑/过渡带 (Suspicious / Boundary)',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      desc: '路径长度接近期望值 c(n)，处于正常聚类边缘或无明显群落结构，建议结合业务规则二审。',
    };
  }

  // Pre-generate curve points for s(x,n) = 2^(-h/c(n))
  const maxH = Math.ceil(cn * 2.2);
  const curvePoints: Array<{ h: number; score: number }> = [];
  for (let h = 0; h <= maxH; h += 0.5) {
    curvePoints.push({
      h,
      score: calculateIForestScore(h, sampleSizeN),
    });
  }

  // SVG coordinate transformation for the curve
  const svgWidth = 560;
  const svgHeight = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const plotW = svgWidth - padding.left - padding.right;
  const plotH = svgHeight - padding.top - padding.bottom;

  const toSvgX = (h: number) => padding.left + (h / maxH) * plotW;
  const toSvgY = (s: number) => padding.top + (1 - s) * plotH;

  const pathD = curvePoints.reduce((acc, pt, idx) => {
    const x = toSvgX(pt.h);
    const y = toSvgY(pt.score);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const currX = toSvgX(observedDepth);
  const currY = toSvgY(iForestScore);
  const cnX = toSvgX(cn);

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 font-semibold text-xs tracking-wider uppercase mb-1">
              <Compass className="w-4 h-4" />
              <span>模块 01 · 严谨数理基石</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              代数建模与异常评分机理
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              形式化推导孤立森林二叉树二项分布期望路径 $s(x,n)$ 与 One-Class SVM 希尔伯特高维再生核空间（RKHS）超平面最大间隔准则，透析低密度离群点的几何投影本质。
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-3 py-1.5 bg-slate-100 text-slate-700 font-mono text-xs rounded-lg border border-slate-200">
              Euler Constant γ ≈ 0.577216
            </span>
          </div>
        </div>
      </div>

      {/* Slices Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slice 1: Isolation Forest Mathematical Deduction & Interactive Curve */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                <h2 className="text-base font-bold text-slate-900">
                  【切片一】孤立森林路径长度评分形式化
                </h2>
              </div>
              <span className="text-xs font-mono text-indigo-600 font-semibold">iForest Formulation</span>
            </div>

            {/* Math Card */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 font-mono text-xs space-y-3">
              <div className="text-slate-500 font-sans text-xs font-medium">异常得分定义公式：</div>
              <div className="text-center py-2 px-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs text-indigo-900 text-sm font-bold tracking-wide">
                s(x, n) = 2^(- E(h(x)) / c(n))
              </div>
              <div className="text-slate-500 font-sans text-xs font-medium">二叉查找树不成功查找平均深度：</div>
              <div className="text-center py-1.5 px-3 bg-white rounded-lg border border-slate-200/90 text-slate-800 text-xs">
                c(n) = 2 · (ln(n - 1) + 0.5772156649) - 2(n - 1) / n
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600 font-sans border-t border-slate-200/60">
                <div>
                  <span className="font-semibold text-rose-600">E(h) → 0:</span> s → 1 极高危异常
                </div>
                <div>
                  <span className="font-semibold text-amber-600">E(h) → c(n):</span> s → 0.5 模糊带
                </div>
                <div>
                  <span className="font-semibold text-emerald-600">E(h) → n-1:</span> s → 0 密集核心
                </div>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                  <span>子采样样本容量 n (Sub-sample Size)</span>
                  <span className="font-mono text-indigo-600 font-bold">{sampleSizeN}</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="1024"
                  step="32"
                  value={sampleSizeN}
                  onChange={(e) => setSampleSizeN(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>32 (微样本)</span>
                  <span>推荐: 256 (兼顾消除掩蔽与精度)</span>
                  <span>1024</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                  <span>观测样本平均路径深度 E(h(x))</span>
                  <span className="font-mono text-indigo-600 font-bold">{observedDepth.toFixed(2)} 层</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max={Math.min(25, maxH)}
                  step="0.1"
                  value={observedDepth}
                  onChange={(e) => setObservedDepth(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>0.5 (浅层立断，如异地大额)</span>
                  <span>期望 c(n) = {cn.toFixed(2)}</span>
                  <span>{Math.min(25, maxH).toFixed(1)} (深层叶节点)</span>
                </div>
              </div>
            </div>

            {/* Live SVG Curve Plot */}
            <div className="mt-5 bg-slate-900 rounded-xl p-3 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-2 font-mono">
                <span>s(x,n) 指数衰减曲线图解</span>
                <span className="text-emerald-400">c(n)={cn.toFixed(2)}</span>
              </div>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto select-none">
                {/* Axes and grid */}
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={svgHeight - padding.bottom} stroke="#334155" strokeWidth="1" />
                <line x1={padding.left} y1={svgHeight - padding.bottom} x2={svgWidth - padding.right} y2={svgHeight - padding.bottom} stroke="#334155" strokeWidth="1" />
                
                {/* Horizontal reference at s = 0.5 */}
                <line
                  x1={padding.left}
                  y1={toSvgY(0.5)}
                  x2={svgWidth - padding.right}
                  y2={toSvgY(0.5)}
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text x={padding.left - 8} y={toSvgY(0.5) + 3} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">
                  s=0.5
                </text>

                {/* Vertical reference at h = c(n) */}
                <line
                  x1={cnX}
                  y1={padding.top}
                  x2={cnX}
                  y2={svgHeight - padding.bottom}
                  stroke="#06b6d4"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text x={cnX} y={padding.top + 12} fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  E(h)=c(n)
                </text>

                {/* Score zone fills */}
                <rect
                  x={padding.left}
                  y={padding.top}
                  width={plotW}
                  height={toSvgY(0.6) - padding.top}
                  fill="#f43f5e"
                  fillOpacity="0.08"
                />
                <text x={svgWidth - padding.right - 8} y={padding.top + 14} fill="#f43f5e" fontSize="10" textAnchor="end">
                  高危异常区 (s &gt; 0.6)
                </text>

                {/* Main exponential decay curve */}
                <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" />

                {/* Current point marker */}
                <circle cx={currX} cy={currY} r="6" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                <line x1={currX} y1={currY} x2={currX} y2={svgHeight - padding.bottom} stroke="#f43f5e" strokeDasharray="2 2" strokeWidth="1" />
                <line x1={padding.left} y1={currY} x2={currX} y2={currY} stroke="#f43f5e" strokeDasharray="2 2" strokeWidth="1" />

                {/* Labels */}
                <text x={padding.left - 8} y={padding.top + 8} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">
                  s=1.0
                </text>
                <text x={padding.left - 8} y={svgHeight - padding.bottom} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">
                  s=0.0
                </text>
                <text x={currX} y={svgHeight - padding.bottom + 16} fill="#f87171" fontSize="10" textAnchor="middle" fontFamily="monospace">
                  h={observedDepth.toFixed(1)}
                </text>
                <text x={svgWidth / 2} y={svgHeight - 8} fill="#64748b" fontSize="11" textAnchor="middle">
                  树切割路径深度 E(h(x))
                </text>
              </svg>
            </div>
          </div>

          {/* Current Score Verdict Display */}
          <div className={`mt-5 p-4 rounded-xl border ${scoreVerdict.color} flex items-center justify-between`}>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-semibold">当前演算得分 s(x,n)：</span>
                <span className="text-lg font-mono font-bold">{iForestScore.toFixed(4)}</span>
              </div>
              <p className="text-xs mt-0.5 opacity-90 leading-tight">{scoreVerdict.desc}</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white/80 border shadow-2xs whitespace-nowrap">
              {scoreVerdict.text}
            </span>
          </div>
        </div>

        {/* Slice 2: One-Class SVM Margin Maximization & Dual Geometry */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                <h2 className="text-base font-bold text-slate-900">
                  【切片二】One-Class SVM 超平面最大化间隔准则
                </h2>
              </div>
              <span className="text-xs font-mono text-teal-600 font-semibold">Schölkopf OCSVM</span>
            </div>

            {/* Math Card for OCSVM */}
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 font-mono text-xs space-y-3">
              <div className="text-slate-500 font-sans text-xs font-medium">原问题 (Primal Problem) 最大化与原点间隔：</div>
              <div className="text-center py-2 px-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs text-teal-900 text-xs font-bold tracking-wide">
                min(ω, ξ, ρ)  1/2 ||ω||² + 1/(νn) ∑ξ_i - ρ
              </div>
              <div className="text-center text-[11px] text-slate-600">
                s.t.  ⟨ω, Φ(x_i)⟩ ≥ ρ - ξ_i,  ξ_i ≥ 0
              </div>
              <div className="text-slate-500 font-sans text-xs font-medium">对偶判定函数 (Dual Decision Function)：</div>
              <div className="text-center py-1.5 px-3 bg-white rounded-lg border border-slate-200/90 text-slate-800 text-xs">
                f(x) = sign( ∑ α_i · k(x_i, x) - ρ )
              </div>
              <div className="text-center text-[11px] text-slate-500 font-sans">
                RBF 高斯核：k(x_i, x) = exp( -γ ||x_i - x||² )
              </div>
            </div>

            {/* Parameter Adjustment */}
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                  <span>异常点比例上限 ν (Nu Parameter)</span>
                  <span className="font-mono text-teal-700 font-bold">{nuParam.toFixed(3)} ({(nuParam * 100).toFixed(1)}%)</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.25"
                  step="0.01"
                  value={nuParam}
                  onChange={(e) => setNuParam(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>0.01 (紧包络，少容忍)</span>
                  <span>0.05 (推荐默认风控基准)</span>
                  <span>0.25 (宽容松弛)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                  <span>RBF 核函数宽度 γ (Gamma Parameter)</span>
                  <span className="font-mono text-teal-700 font-bold">{gammaParam.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.80"
                  step="0.02"
                  value={gammaParam}
                  onChange={(e) => setGammaParam(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>0.02 (平滑全局超球面)</span>
                  <span>0.15 (平衡拟合)</span>
                  <span>0.80 (紧凑多峰岛状过拟合)</span>
                </div>
              </div>
            </div>

            {/* Geometric Physical Intuition Interactive Schematic */}
            <div className="mt-5 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-xl p-4 text-white relative overflow-hidden">
              <div className="text-xs text-teal-300 font-semibold mb-2 flex items-center justify-between">
                <span>高维空间几何映射与原点分离图解</span>
                <span className="font-mono text-[11px] text-teal-400">间隔距离 = ρ / ||ω||</span>
              </div>
              
              <div className="h-44 relative border border-slate-700/60 rounded-lg bg-black/30 p-2 flex items-center justify-center">
                {/* SVG Geometric Mapping */}
                <svg className="w-full h-full" viewBox="0 0 400 160">
                  {/* Origin 0 */}
                  <circle cx="50" cy="130" r="5" fill="#f43f5e" />
                  <text x="50" y="150" fill="#f87171" fontSize="10" textAnchor="middle" fontFamily="monospace">
                    原点 (0,0)
                  </text>

                  {/* Hyperplane Line separating normal data from origin */}
                  <line x1="120" y1="20" x2="60" y2="150" stroke="#2dd4bf" strokeWidth="2.5" />
                  <text x="110" y="25" fill="#2dd4bf" fontSize="10" fontWeight="bold">
                    决策超平面 ⟨ω, Φ(x)⟩ = ρ
                  </text>

                  {/* Margin vector from origin */}
                  <line x1="50" y1="130" x2="85" y2="95" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="80" y="125" fill="#fbbf24" fontSize="9" textAnchor="middle">
                    最大间隔 ρ/||ω||
                  </text>

                  {/* Normal High-Density Data points wrapped in Hilbert space */}
                  <g>
                    {[
                      [220, 50], [250, 40], [240, 70], [270, 55], [290, 80],
                      [210, 85], [235, 95], [260, 110], [300, 65], [320, 90]
                    ].map((pt, i) => (
                      <circle key={i} cx={pt[0]} cy={pt[1]} r="4" fill="#38bdf8" fillOpacity="0.8" />
                    ))}
                    {/* Support Vectors (on margin) */}
                    <circle cx="150" cy="70" r="5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="170" cy="110" r="5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="180" cy="45" r="5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="175" y="32" fill="#fbbf24" fontSize="10" fontWeight="600">
                      支持向量 SV (边界约束点)
                    </text>
                  </g>

                  {/* Outlier Fraud point on negative side */}
                  <circle cx="85" cy="50" r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                  <text x="85" y="40" fill="#f87171" fontSize="9" textAnchor="middle">
                    异常离群点 (ξ_i &gt; 0)
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-300">
                <div className="bg-white/5 p-2 rounded border border-white/10">
                  <span className="text-teal-300 font-semibold">ν 的双重角色：</span>
                  <p className="mt-0.5 text-slate-400">是异常样本比例的<strong className="text-slate-200">上界</strong>，同时也是支持向量（SV）数目的<strong className="text-slate-200">下界</strong>。</p>
                </div>
                <div className="bg-white/5 p-2 rounded border border-white/10">
                  <span className="text-teal-300 font-semibold">低密度映射机理：</span>
                  <p className="mt-0.5 text-slate-400">通过非线性映射 Φ(x) 将正常密集点推向高维半空间，令原点代表全空间“虚无/异常”。</p>
                </div>
              </div>
            </div>
          </div>

          {/* OCSVM Diagnostic State */}
          <div className="mt-5 p-4 rounded-xl border border-teal-200 bg-teal-50/70 flex items-center justify-between text-teal-900">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-semibold">预计支持向量保留率：</span>
                <span className="text-base font-mono font-bold">≥ {(nuParam * 100).toFixed(1)}%</span>
              </div>
              <p className="text-xs text-teal-700 mt-0.5">
                γ={gammaParam.toFixed(2)} 时高斯核有效感知半径 r ≈ √(1/(2γ)) = {(Math.sqrt(1 / (2 * gammaParam))).toFixed(2)}。
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white text-teal-800 border border-teal-200 shadow-2xs">
              密域超曲面就绪
            </span>
          </div>
        </div>
      </div>

      {/* Deep Deduction Breakdown Slice */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">
            【切片三】低密度异常点的几何映射机理与工程落地准则
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <h3 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              <span>1. 孤立森林为何具备 O(1) 浅层截断能力？</span>
            </h3>
            <p>
              低密度点在特征空间周围的“虚空体积”极大。任意维度上的均匀随机切割值有极高概率落在该虚空带内，从而以 $O(\log_2 1) \sim 1$ 步迅速将其从主干样本集中剥离。这是其能在毫秒级检测高危交易的几何本质。
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <h3 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
              <span>2. OCSVM 为何无需负样本标签？</span>
            </h3>
            <p>
              传统二分类 SVM 需要负样本支撑超平面两翼，但真实金融反欺诈中欺诈标签不足 0.1%。OCSVM 将坐标原点视为唯一的虚拟负类，在高维流形中构建围绕正常点集的最小闭包超曲面，从物理上隔绝了离群欺诈行为。
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <h3 className="font-bold text-slate-900 mb-1.5 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              <span>3. 特征标准化的不可妥协性</span>
            </h3>
            <p>
              若交易金额（0 ~ 1,000,000）未进行标准化，与频次（1 ~ 10）混用，iForest 随机切割在金额轴上的有效信息熵将被严重稀释，OCSVM 的欧氏核距离也将被金额单维度主导，导致空间各向异性畸变。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
