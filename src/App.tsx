import React, { useState } from 'react';
import { ModuleId } from './types';
import { Navbar } from './components/Navbar';
import { AlgebraGeometryModule } from './components/modules/AlgebraGeometryModule';
import { IForest3DModule } from './components/modules/IForest3DModule';
import { OCSVMContourModule } from './components/modules/OCSVMContourModule';
import { RealtimeStreamModule } from './components/modules/RealtimeStreamModule';
import { CaseStudiesModule } from './components/modules/CaseStudiesModule';
import { CodeEngineModule } from './components/modules/CodeEngineModule';
import { PipelineWalkthroughModule } from './components/modules/PipelineWalkthroughModule';
import { ReportExportModule } from './components/modules/ReportExportModule';
import { KnowledgeSlicesModule } from './components/modules/KnowledgeSlicesModule';
import { AIDialogueDrawer } from './components/modules/AIDialogueDrawer';
import { Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('algebra');
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState<boolean>(false);

  // Active laboratory context shared across modules and AI
  const [activeCaseName, setActiveCaseName] = useState<string>('信用卡异地大额刷卡欺诈');
  const [contamination, setContamination] = useState<number>(0.03);
  const [nu, setNu] = useState<number>(0.05);
  const [gamma, setGamma] = useState<number>(0.15);

  const handleLoadCaseToLab = (caseId: string) => {
    if (caseId === 'credit_card_fraud') setActiveCaseName('信用卡异地大额刷卡欺诈');
    else if (caseId === 'money_laundering') setActiveCaseName('洗钱账户异常频转 (Smurfing)');
    else if (caseId === 'hft_spoofing') setActiveCaseName('高频量化交易刷单 (Spoofing)');
    else setActiveCaseName('电商黑产恶意套现');

    // Switch to realtime stream or 3D view
    setActiveModule('stream');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-800">
      {/* Top Navbar */}
      <Navbar
        activeModule={activeModule}
        onSelectModule={(id) => setActiveModule(id)}
        onOpenAIDrawer={() => setIsAIDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeModule === 'algebra' && <AlgebraGeometryModule />}
        {activeModule === 'iforest3d' && <IForest3DModule />}
        {activeModule === 'ocsvm' && <OCSVMContourModule />}
        {activeModule === 'stream' && <RealtimeStreamModule />}
        {activeModule === 'cases' && <CaseStudiesModule onLoadCaseToLab={handleLoadCaseToLab} />}
        {activeModule === 'code' && <CodeEngineModule />}
        {activeModule === 'pipeline' && <PipelineWalkthroughModule />}
        {activeModule === 'reports' && <ReportExportModule />}
        {activeModule === 'knowledge' && <KnowledgeSlicesModule />}
      </main>

      {/* Floating AI Diagnostics Drawer */}
      <AIDialogueDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        currentContext={{
          algorithm: activeModule === 'ocsvm' ? 'One-Class SVM' : 'Isolation Forest',
          caseName: activeCaseName,
          contamination,
          nu,
          gamma,
          sampleCount: 50000,
          falsePositiveRate: '0.12%',
        }}
      />

      {/* Bottom Floating Quick AI Assistant Bubble */}
      {!isAIDrawerOpen && (
        <button
          onClick={() => setIsAIDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-30 group flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-full shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          <span className="text-xs font-semibold">AI 随诊专家</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-800">金融风控异常检测实验室</span>
            <span>· 界面淡雅大方 · 10大核心模块与切片架构</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Powered by iForest & OCSVM Dual Engines</span>
            <span>·</span>
            <span>Gemini 3.8 Flash 随诊诊断</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
