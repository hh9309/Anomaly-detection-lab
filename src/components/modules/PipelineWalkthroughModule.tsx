import React, { useState } from 'react';
import {
  Workflow,
  CheckCircle2,
  ChevronRight,
  Database,
  Cpu,
  Sliders,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { generateROCCurve } from '../../utils/mathEngine';

export const PipelineWalkthroughModule: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [thresholdCutoff, setThresholdCutoff] = useState<number>(0.72);
  const [useLogTransform, setUseLogTransform] = useState<boolean>(true);

  // Generate synthetic sample evaluation metrics based on thresholdCutoff
  const simulatedScores = [
    // 20 normal scores
    0.12, 0.15, 0.18, 0.22, 0.25, 0.28, 0.31, 0.35, 0.38, 0.42,
    0.45, 0.48, 0.51, 0.53, 0.56, 0.58, 0.62, 0.64, 0.68, 0.71,
    // 5 fraud scores
    0.74, 0.81, 0.86, 0.92, 0.97
  ];
  const simulatedLabels = [
    false, false, false, false, false, false, false, false, false, false,
    false, false, false, false, false, false, false, false, false, false,
    true, true, true, true, true
  ];

  const roc = generateROCCurve(simulatedScores, simulatedLabels, 25);

  // Confusion matrix at current cutoff
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  for (let i = 0; i < simulatedScores.length; i++) {
    const isPredAnomaly = simulatedScores[i] >= thresholdCutoff;
    const isActual = simulatedLabels[i];
    if (isPredAnomaly && isActual) tp++;
    else if (isPredAnomaly && !isActual) fp++;
    else if (!isPredAnomaly && isActual) fn++;
    else tn++;
  }

  const precision = tp + fp > 0 ? (tp / (tp + fp)) * 100 : 100;
  const recall = tp + fn > 0 ? (tp / (tp + fn)) * 100 : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const steps = [
    {
      id: 1,
      title: '第 1 阶段：数据接入与特征严苛预处理',
      subtitle: '偏态分布平滑、Log 变换与 Z-Score 正交化归一化',
      icon: Database,
    },
    {
      id: 2,
      title: '第 2 阶段：无监督超曲面与孤立树构建',
      subtitle: '256 微样本子采样抗掩蔽 + RBF 密域映射',
      icon: Cpu,
    },
    {
      id: 3,
      title: '第 3 阶段：动态阈值切片与性能评估',
      subtitle: 'ROC-AUC 演进、PR-AUC 调优与 F1-Score 黄金截断',
      icon: Sliders,
    },
    {
      id: 4,
      title: '第 4 阶段：闭环阻断策略与生产级落地',
      subtitle: '双轨分流闸门：毫秒熔断 + 短信双因子复核 + 风险报告',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 font-semibold text-xs tracking-wider uppercase mb-1">
              <Workflow className="w-4 h-4" />
              <span>模块 08 · 生产落地闭环</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              数据 → 预处理 → 建模 → 风控全流程导引
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              沉浸式演练从原始金融交易流接入、特征偏态矫正、无监督双核学习、动态阈值切片裁量，到最终毫秒级熔断阻断的全生命周期流水线。
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-mono text-xs rounded-lg border border-emerald-200">
              Pipeline Stage: {currentStep} / 4
            </span>
          </div>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((st) => {
          const Icon = st.icon;
          const isActive = currentStep === st.id;
          const isDone = currentStep > st.id;

          return (
            <button
              key={st.id}
              onClick={() => setCurrentStep(st.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/20'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100/60'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold">
                  {isDone ? 'COMPLETED' : `STEP 0${st.id}`}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
                )}
              </div>
              <h3 className="text-xs font-bold leading-tight mb-1">{st.title.split('：')[1]}</h3>
              <p
                className={`text-[11px] leading-tight line-clamp-2 ${
                  isActive ? 'text-indigo-100' : 'text-slate-500'
                }`}
              >
                {st.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Slice */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
        {/* Step 1: Preprocessing & Log Normalization */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  【第 1 阶段】交易特征长尾偏态平滑与严苛标准化
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  交易金额天然呈现严重右偏的重尾分布（Power-law Distribution），必须实施对数变换与 Z-Score 标准化。
                </p>
              </div>
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useLogTransform}
                  onChange={(e) => setUseLogTransform(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>启用 Log1p 变换平滑偏态</span>
              </label>
            </div>

            {/* Distribution Comparison Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Raw skewed amount */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
                  <span>原始交易金额分布 (未处理，极度右偏)</span>
                  <span className="text-rose-600 font-mono">Skewness: +6.82</span>
                </div>
                {/* SVG Histogram */}
                <div className="h-36 flex items-end space-x-1.5 pt-4">
                  {[95, 30, 12, 6, 3, 2, 1, 1, 0, 1].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-slate-400 rounded-t"
                        style={{ height: `${(h / 95) * 110}px` }}
                      ></div>
                      <span className="text-[9px] text-slate-500 font-mono mt-1">
                        {i === 0 ? '¥50' : i === 9 ? '¥5万+' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  ⚠️ 致命后果：极端大额将霸占 99% 的切割空间，使频次、位移等低维特征彻底失效。
                </p>
              </div>

              {/* Log transformed & Z-Score */}
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-950 mb-2">
                  <span>Log1p 变换 + Z-Score 标准化后高斯对称分布</span>
                  <span className="text-emerald-700 font-mono">Skewness: +0.14</span>
                </div>
                {/* SVG Histogram Gaussian */}
                <div className="h-36 flex items-end space-x-1.5 pt-4">
                  {[6, 18, 48, 85, 96, 78, 52, 22, 8, 3].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-indigo-600 rounded-t"
                        style={{ height: `${(h / 96) * 110}px` }}
                      ></div>
                      <span className="text-[9px] text-indigo-800 font-mono mt-1">
                        {i === 0 ? '-3σ' : i === 4 ? 'μ' : i === 9 ? '+3σ' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-indigo-900 font-medium mt-2">
                  ✅ 矫正收益：孤立树在金额轴与距离轴上具备均衡的信息切割熵，OCSVM 欧氏核距离恢复球对称性。
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <span>下一步：无监督双核学习</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Unsupervised Model Training */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  【第 2 阶段】无监督孤立树与密域超曲面双重构建
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  无需任何欺诈标注，利用“少且不同”拓扑构建 100 棵孤立二叉树，并求解 OCSVM 凸二次规划。
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Unsupervised Dual Training
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <span>孤立森林 (Isolation Forest) 超参数配方：</span>
                </span>
                <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                  <li>• n_estimators = 100 (保证期望平均路径方差平稳)</li>
                  <li>• max_samples = 256 (核心：破坏多账号聚集掩蔽)</li>
                  <li>• max_depth = ceil(log2(256)) = 8 层 (浅层早停节约算力)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  <span>One-Class SVM 超参数配方：</span>
                </span>
                <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                  <li>• kernel = 'rbf' (高斯核投射到无限维希尔伯特空间)</li>
                  <li>• nu = 0.05 (最多容忍 5% 异常，确保支持向量数 ≥ 5%)</li>
                  <li>• gamma = 0.15 (平衡核函数感知半径，杜绝孤立岛状过拟合)</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                上一步
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                <span>下一步：动态阈值切片</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Dynamic Threshold Tuning */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  【第 3 阶段】动态阈值切片与 ROC-AUC / PR 决策评估
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  拖动截断阈值滑块，观察混淆矩阵、Precision、Recall 与 F1-Score 动态博弈。
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700">
                综合 AUC: {roc.auc.toFixed(3)}
              </span>
            </div>

            {/* Threshold Slider */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs text-slate-800 font-semibold mb-1">
                <span>阻断判定截断阈值 (Threshold Cutoff)</span>
                <span className="font-mono text-indigo-600 font-bold">{thresholdCutoff.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.40"
                max="0.95"
                step="0.02"
                value={thresholdCutoff}
                onChange={(e) => setThresholdCutoff(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0.40 (严格拦截，召回率 100%，但误杀高)</span>
                <span>推荐黄金平衡点: 0.72</span>
                <span>0.95 (极度宽松，可能漏报)</span>
              </div>
            </div>

            {/* Dynamic Confusion Matrix & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Confusion Matrix Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-100 p-2 font-bold text-slate-700 text-center">
                  实时混淆矩阵 (Confusion Matrix)
                </div>
                <div className="grid grid-cols-2 gap-px bg-slate-200">
                  <div className="bg-white p-3 text-center">
                    <span className="text-slate-400 text-[10px] block">真阴性 (TN 正常放行)</span>
                    <span className="font-mono font-bold text-emerald-700 text-base">{tn}</span>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <span className="text-slate-400 text-[10px] block">假阳性 (FP 正常误杀)</span>
                    <span className="font-mono font-bold text-rose-600 text-base">{fp}</span>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <span className="text-slate-400 text-[10px] block">假阴性 (FN 欺诈漏网)</span>
                    <span className="font-mono font-bold text-amber-600 text-base">{fn}</span>
                  </div>
                  <div className="bg-white p-3 text-center">
                    <span className="text-slate-400 text-[10px] block">真阳性 (TP 欺诈拦截)</span>
                    <span className="font-mono font-bold text-indigo-700 text-base">{tp}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Rates */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200/70 flex justify-between items-center">
                  <span className="text-indigo-900 font-medium">查准率 (Precision):</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">{precision.toFixed(1)}%</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/70 flex justify-between items-center">
                  <span className="text-emerald-900 font-medium">欺诈拦截率 (Recall):</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{recall.toFixed(1)}%</span>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 flex justify-between items-center">
                  <span className="text-amber-900 font-medium">F1-Score 综合权衡:</span>
                  <span className="font-mono font-bold text-amber-700 text-sm">{f1.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                上一步
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                <span>下一步：闭环阻断策略</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Closed-Loop Strategy */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  【第 4 阶段】生产级风控双轨分流闭环处置策略
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  将纯粹的算法离散得分转化为高鲁棒性的业务处置流：硬规则预筛 + 模型分级 + 人工复核。
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                双轨闸门已激活
              </span>
            </div>

            {/* Tri-color Decision Gates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>绿色通道 · 毫秒级静默放行</span>
                </div>
                <div className="text-[11px] font-mono text-emerald-700">条件：s(x,n) &lt; 0.55</div>
                <p className="text-emerald-900/90 leading-relaxed text-[11px]">
                  覆盖 96.8% 的日常正常消费，零感知通过，保证最佳支付体验与超低系统延迟。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-amber-800 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>黄色通道 · 多因子短信核验</span>
                </div>
                <div className="text-[11px] font-mono text-amber-700">条件：0.55 ≤ s(x,n) &lt; 0.72</div>
                <p className="text-amber-900/90 leading-relaxed text-[11px]">
                  处于过渡带或偶发异动，即刻下发 OTP 短信动态码或活体人脸识别，避免直接拒付引发客诉。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-rose-800 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>红色通道 · 毫秒熔断阻断</span>
                </div>
                <div className="text-[11px] font-mono text-rose-700">条件：s(x,n) ≥ 0.72</div>
                <p className="text-rose-900/90 leading-relaxed text-[11px]">
                  确认为极端欺诈，直接拒付并对卡片执行瞬时临时止付，同时向风控坐席派发紧急工单。
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                上一步
              </button>
              <div className="flex items-center space-x-2 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>全流程导引验证完毕</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
