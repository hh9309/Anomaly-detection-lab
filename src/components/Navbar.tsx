import React from 'react';
import { ModuleId } from '../types';
import {
  ShieldAlert,
  Binary,
  Layers,
  Activity,
  Workflow,
  Sparkles,
  BookOpen,
  FileSpreadsheet,
  Code2,
  FolderGit2,
  Cpu
} from 'lucide-react';

interface NavbarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  onOpenAIDrawer: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onSelectModule,
  onOpenAIDrawer,
}) => {
  const modules: Array<{ id: ModuleId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'algebra', label: '1. 代数与空间', icon: Binary },
    { id: 'iforest3d', label: '2. iForest 3D', icon: Layers },
    { id: 'ocsvm', label: '3. OCSVM 密域', icon: Cpu },
    { id: 'stream', label: '4. 实时流监控', icon: Activity },
    { id: 'cases', label: '5. 四大案例库', icon: ShieldAlert },
    { id: 'code', label: '6. 代码引擎', icon: Code2 },
    { id: 'pipeline', label: '7. 全流程导引', icon: Workflow },
    { id: 'reports', label: '8. 数据与报告', icon: FileSpreadsheet },
    { id: 'knowledge', label: '9. 知识导引', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Top Banner: Brand & Global Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-black/5">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">异常检测实验室</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full">
                  金融风控与机器学习
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded">
                  v2.6 稳定版
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                代数推导 · 3D空间分割 · OCSVM超曲面 · 实时流监控阻断 · Scikit-Learn/NumPy双引擎
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Realtime Status Indicator */}
            <div className="hidden lg:flex items-center space-x-4 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>风控引擎：就绪</span>
              </div>
              <div className="text-slate-300">|</div>
              <div>延迟：<span className="font-mono text-slate-900 font-medium">12ms</span></div>
              <div className="text-slate-300">|</div>
              <div>核函数：<span className="font-mono text-indigo-600">RBF / iTree</span></div>
            </div>

            {/* AI Assistant Quick Trigger */}
            <button
              onClick={onOpenAIDrawer}
              className="group flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100/70 hover:from-indigo-100 hover:to-indigo-200/70 text-indigo-700 border border-indigo-200/80 transition-all text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>AI 诊断随诊</span>
              <span className="px-1.5 py-0.2 bg-indigo-600 text-white text-[10px] rounded-full">Q&A</span>
            </button>
          </div>
        </div>

        {/* Modular Navigation Bar (10 Modules represented cleanly) */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none text-xs font-medium">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectModule(m.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
