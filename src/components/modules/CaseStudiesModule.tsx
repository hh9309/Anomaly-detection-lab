import React, { useState } from 'react';
import { CASE_STUDIES } from '../../utils/caseData';
import { CaseStudy } from '../../types';
import {
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock,
  Crosshair,
  FileText,
  Workflow,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';

interface CaseStudiesModuleProps {
  onLoadCaseToLab?: (caseId: string) => void;
}

export const CaseStudiesModule: React.FC<CaseStudiesModuleProps> = ({ onLoadCaseToLab }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('credit_card_fraud');
  const [activeTab, setActiveTab] = useState<'overview' | 'radar' | 'topology' | 'records'>('overview');

  const currentCase: CaseStudy =
    CASE_STUDIES.find((c) => c.id === selectedCaseId) || CASE_STUDIES[0];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 font-semibold text-xs tracking-wider uppercase mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>模块 05 · 实战场景矩阵</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              四大金融风控案例库
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              沉淀万级真实金融反欺诈与洗钱对抗样本，全面覆盖信用卡异地大额盗刷、反洗钱结构化频转、高频量化毫秒幌骗及电商黑产群控套现四大核心战场。
            </p>
          </div>
          {onLoadCaseToLab && (
            <button
              onClick={() => onLoadCaseToLab(currentCase.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>加载当前案例至全景仿真</span>
            </button>
          )}
        </div>
      </div>

      {/* Case Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CASE_STUDIES.map((c) => {
          const isSelected = c.id === selectedCaseId;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white/80 border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-500">{c.category}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{c.name}</h3>
              <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-100 pt-2">
                <span>欺诈率: {c.stats.fraudRate}</span>
                <span className="text-emerald-600 font-medium">止付: {c.stats.lossPrevented}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Case Details Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
        {/* Header of Active Case */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentCase.category}
              </span>
              <h2 className="text-lg font-bold text-slate-900">{currentCase.name}</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{currentCase.subtitle}</p>
          </div>

          {/* Sub Navigation Slices */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'overview' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              场景画像与痛点
            </button>
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'radar' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              特征重要度雷达
            </button>
            <button
              onClick={() => setActiveTab('topology')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'topology' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              欺诈行为链与拦截拓扑
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'records' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              真实脱敏样本明细
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">【典型黑产模式剖析】</span>
              {currentCase.description}
            </div>

            {/* Feature Table */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                核心辨识特征维度及正常与欺诈区间对比
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-medium">
                      <th className="pb-2">特征维度名称</th>
                      <th className="pb-2">合规基盘正常区间</th>
                      <th className="pb-2">黑产欺诈异常指征</th>
                      <th className="pb-2 text-right">特征区分度 (IV / Shap)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentCase.features.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="py-2.5 font-semibold text-slate-800">{f.name}</td>
                        <td className="py-2.5 text-emerald-700 font-mono">{f.normalRange}</td>
                        <td className="py-2.5 text-rose-700 font-mono font-medium">{f.fraudPattern}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-indigo-600">
                          {(f.importance * 100).toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Radar Chart Comparison */}
        {activeTab === 'radar' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* SVG Radar Chart */}
            <div className="bg-slate-900 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden shadow-inner">
              <svg viewBox="0 0 320 280" className="w-full max-w-xs h-auto">
                {/* Concentric rings */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => (
                  <circle
                    key={i}
                    cx="160"
                    cy="140"
                    r={scale * 100}
                    fill="none"
                    stroke="#334155"
                    strokeDasharray="2 2"
                  />
                ))}

                {/* 5 Axis lines */}
                {currentCase.radarScores.map((_, i) => {
                  const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
                  const x = 160 + 100 * Math.cos(angle);
                  const y = 140 + 100 * Math.sin(angle);
                  return <line key={i} x1="160" y1="140" x2={x} y2={y} stroke="#475569" strokeWidth="1" />;
                })}

                {/* Normal Polygon (Emerald) */}
                <polygon
                  points={currentCase.radarScores
                    .map((item, i) => {
                      const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
                      const r = (item.normal / 100) * 100;
                      return `${160 + r * Math.cos(angle)},${140 + r * Math.sin(angle)}`;
                    })
                    .join(' ')}
                  fill="#10b981"
                  fillOpacity="0.35"
                  stroke="#10b981"
                  strokeWidth="2"
                />

                {/* Fraud Polygon (Rose) */}
                <polygon
                  points={currentCase.radarScores
                    .map((item, i) => {
                      const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
                      const r = (item.fraud / 100) * 100;
                      return `${160 + r * Math.cos(angle)},${140 + r * Math.sin(angle)}`;
                    })
                    .join(' ')}
                  fill="#f43f5e"
                  fillOpacity="0.4"
                  stroke="#f43f5e"
                  strokeWidth="2"
                />

                {/* Axis Labels */}
                {currentCase.radarScores.map((item, i) => {
                  const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
                  const x = 160 + 120 * Math.cos(angle);
                  const y = 140 + 120 * Math.sin(angle);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y + 4}
                      fill="#e2e8f0"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {item.dimension}
                    </text>
                  );
                })}
              </svg>
            </div>

            {/* Radar Legend and Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-6 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-800">正常基准画像 (Normal Profile)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="font-semibold text-rose-700">欺诈异常画像 (Fraud Profile)</span>
                </div>
              </div>

              <div className="space-y-2">
                {currentCase.radarScores.map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex justify-between font-medium text-slate-800 mb-1">
                      <span>{item.dimension}</span>
                      <span className="font-mono text-rose-600 font-bold">
                        欺诈指数: {item.fraud} / 正常: {item.normal}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${item.normal}%` }}></div>
                      <div className="bg-rose-500 h-full" style={{ width: `${item.fraud}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Topology Attack Chain */}
        {activeTab === 'topology' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 mb-2">
              黑客与黑产团伙实施欺诈的四个离散阶段，以及无监督风控算法在此拓扑中的介入切片：
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {currentCase.topology.map((topo, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {topo.step}
                    </span>
                    <span className="text-[11px] text-slate-500">{topo.actor}</span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{topo.action}</p>

                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-[10px] text-slate-400 block">风险触发切面：</span>
                    <span className="text-xs font-semibold text-rose-700">{topo.riskTrigger}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Sample Records Table */}
        {activeTab === 'records' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-sans font-medium">
                  <th className="pb-2">记录编号</th>
                  <th className="pb-2">业务通道</th>
                  <th className="pb-2">金额/手数</th>
                  <th className="pb-2">特征指征向量</th>
                  <th className="pb-2">综合异常度评分</th>
                  <th className="pb-2 text-right">人工复核标签</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentCase.sampleRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-900">{rec.id}</td>
                    <td className="py-2.5 font-sans text-slate-600">{rec.channel}</td>
                    <td className="py-2.5 font-bold text-slate-900">{rec.amount}</td>
                    <td className="py-2.5 font-sans text-slate-600">
                      {Object.entries(rec.features)
                        .map(([k, v]) => `${k}:${v}`)
                        .join(' · ')}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`font-bold ${rec.score > 0.8 ? 'text-rose-600' : 'text-emerald-700'}`}
                      >
                        {rec.score.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-sans">
                      {rec.status === 'FRAUD' ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
                          确认为欺诈
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                          正常交易
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
