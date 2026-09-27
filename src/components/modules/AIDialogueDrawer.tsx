import React, { useState, useEffect } from 'react';
import { AIMessage } from '../../types';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Settings,
  Key,
  Cpu,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';
import {
  LLMConfig,
  loadSavedLLMConfig,
  saveLLMConfig,
  callClientLLM
} from '../../utils/llmClient';

interface AIDialogueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext: {
    algorithm: string;
    caseName: string;
    contamination: number;
    nu: number;
    gamma: number;
    sampleCount: number;
    falsePositiveRate: string;
  };
}

export const AIDialogueDrawer: React.FC<AIDialogueDrawerProps> = ({
  isOpen,
  onClose,
  currentContext,
}) => {
  // LLM Model & API-Key Configuration state
  const [llmConfig, setLlmConfig] = useState<LLMConfig>(loadSavedLLMConfig);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [tempModel, setTempModel] = useState<'gemini-3.8-flash' | 'deepseek-v4-pro'>('gemini-3.8-flash');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Initialize config into temp form whenever modal opens or llmConfig updates
  useEffect(() => {
    setTempApiKey(llmConfig.apiKey);
    setTempModel(llmConfig.model);
  }, [llmConfig, isConfigOpen]);

  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `您好！我是您的**金融风控与异常检测算法随诊专家**。
我已经同步获取了您当前的实验室上下文：
- **当前算法**：${currentContext.algorithm}
- **选定场景**：${currentContext.caseName}
- **预设污染率**：${(currentContext.contamination * 100).toFixed(1)}% (Contamination)
- **核超参数**：nu=${currentContext.nu}, gamma=${currentContext.gamma}

💡 **提示**：为适配 GitHub Pages 静态部署与浏览器直调，请先点击右上角小齿轮 ⚙️ 设置对应大模型（Gemini 3 Flash 或 DeepSeek-V4-Pro）并输入 API-Key，确认后即可随时向我发起专业风控诊断！`,
      timestamp: '刚刚',
      suggestedTags: [
        '当前污染率设置是否偏高？',
        '极度不平衡(10000:1)如何优化？',
        '何时升级到 LOF 或 Autoencoder？',
        '如何有效打破群聚掩蔽效应？',
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempApiKey.trim();
    if (!trimmed) {
      alert('请输入有效的 API-Key！大模型调用必须配置专属 Key 后方可调用。');
      return;
    }
    const newConfig: LLMConfig = {
      provider: tempModel === 'deepseek-v4-pro' ? 'deepseek' : 'gemini',
      model: tempModel,
      apiKey: trimmed,
    };
    saveLLMConfig(newConfig);
    setLlmConfig(newConfig);
    setSaveSuccessNotice(`已成功配置模型 [${tempModel === 'gemini-3.8-flash' ? 'Gemini 3 Flash' : 'DeepSeek-V4-Pro'}] 并已保存密钥！`);
    setTimeout(() => {
      setSaveSuccessNotice(null);
      setIsConfigOpen(false);
    }, 1200);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    // Check if API-Key is configured
    if (!llmConfig.apiKey.trim()) {
      setIsConfigOpen(true);
      const reminderMsg: AIMessage = {
        id: `sys-${Date.now()}`,
        sender: 'assistant',
        content: `⚠️ **未检测到 API-Key**：
本项目适配 GitHub Pages 静态部署与浏览器直接调用大模型。所有调用必须先输入对应 API-Key 后方可调用。
已自动为您打开齿轮设置面板，请选择模型并填入您的 API-Key 后确认！`,
        timestamp: new Date().toTimeString().slice(0, 5),
      };
      setMessages((prev) => [...prev, reminderMsg]);
      return;
    }

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toTimeString().slice(0, 5),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Direct browser-side LLM call (compatible with GitHub deployment)
      const result = await callClientLLM(query, currentContext, llmConfig);

      const botMsg: AIMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: result.text || '已收到您的诊断请求。',
        timestamp: new Date().toTimeString().slice(0, 5),
        source: result.source,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || '大模型调用失败，请检查网络或 API-Key 是否正确。';
      const fallbackMsg: AIMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: `❌ **调用失败**：\n${errMsg}\n\n建议点击标题栏右侧小齿轮 ⚙️ 核验 API-Key 与模型配额设置。`,
        timestamp: new Date().toTimeString().slice(0, 5),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const quickQuestions = [
    '当前污染率设置是否偏高？如何避免误杀 VIP？',
    '面对 1:10000 极度不平衡欺诈，iForest 表现如何优化？',
    '何时应该从 iForest 切换到 LOF 或 Autoencoder？',
    '如何量化掩蔽效应 (Masking) 对风控漏报的影响？',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] bg-white shadow-2xl border-l border-slate-200/90 flex flex-col justify-between animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">AI 风控算法随诊与诊断专家</h2>
              <span className={`px-1.5 py-0.2 text-[10px] font-mono border rounded ${
                llmConfig.model === 'deepseek-v4-pro'
                  ? 'bg-teal-500/20 text-teal-300 border-teal-400/30'
                  : 'bg-indigo-500/30 text-indigo-300 border-indigo-400/40'
              }`}>
                {llmConfig.model === 'deepseek-v4-pro' ? 'DeepSeek-V4-Pro' : 'Gemini 3 Flash'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
              <span>当前场景：{currentContext.caseName}</span>
              <span>·</span>
              <span className={llmConfig.apiKey ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                {llmConfig.apiKey ? '● Key已配置' : '○ 待填Key'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Settings Gear Icon to Configure LLM & API-Key */}
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              isConfigOpen
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="大模型与 API-Key 设置 (Gemini / DeepSeek)"
          >
            <Settings className={`w-4 h-4 ${isConfigOpen ? 'rotate-90' : ''} transition-transform duration-300`} />
          </button>

          {/* Close Drawer Button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="关闭抽屉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Modal Overlay: API-Key and Model Switcher */}
      {isConfigOpen && (
        <div className="bg-slate-900 border-b border-slate-800 p-4 animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSaveConfig} className="space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span>大模型调用与 API-Key 专属配置</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                纯浏览器客户端安全直连
              </span>
            </div>

            {/* Model Selection: Gemini 3 Flash vs DeepSeek-V4-Pro */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                选择大模型引擎 (Select Model)：
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempModel('gemini-3.8-flash')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    tempModel === 'gemini-3.8-flash'
                      ? 'bg-indigo-600/30 border-indigo-400 text-white ring-2 ring-indigo-500/30'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>1. Gemini 3 Flash</span>
                    {tempModel === 'gemini-3.8-flash' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Google 最新极速大模型</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTempModel('deepseek-v4-pro')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    tempModel === 'deepseek-v4-pro'
                      ? 'bg-teal-600/30 border-teal-400 text-white ring-2 ring-teal-500/30'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>2. DeepSeek-V4-Pro</span>
                    {tempModel === 'deepseek-v4-pro' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">深度风控推理专业版</p>
                </button>
              </div>
            </div>

            {/* Manual API-Key Input */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-300 font-medium mb-1">
                <span className="flex items-center space-x-1">
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>手工输入 API-Key (API-Key Required)：</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {tempModel === 'gemini-3.8-flash' ? 'Google AI Studio Key' : 'DeepSeek API Key'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder={
                    tempModel === 'gemini-3.8-flash'
                      ? '请输入 AIzaSy... (Gemini API-Key)'
                      : '请输入 sk-... (DeepSeek API-Key)'
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-indigo-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                🔒 为满足部署到 GitHub 后的静态免服务端运行要求，密钥将加密暂存在当前浏览器 localStorage 中，直接由前端向官方接口发起安全请求。
              </p>
            </div>

            {/* Notice banner */}
            {saveSuccessNotice && (
              <div className="p-2 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-300 text-xs flex items-center space-x-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessNotice}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsConfigOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>确认大模型与保存设置</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin">
        {/* If no API key configured, show top warning pill */}
        {!llmConfig.apiKey && (
          <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">尚未输入 API-Key</div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                本项目已准备好直接部署到 GitHub。根据需求，所有大模型调用必须先输入 API-Key。
              </p>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="mt-1.5 inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-700 hover:underline cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>立即点击此处设置 API-Key 与大模型 →</span>
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-slate-400">
              {msg.sender === 'assistant' ? (
                <>
                  <Bot className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold text-slate-700">风控智能大脑</span>
                  {msg.source && <span className="font-mono text-[10px]">({msg.source})</span>}
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-700">算法工程师 (您)</span>
                </>
              )}
              <span>· {msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[92%] relative group ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.sender === 'assistant' && (
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-opacity cursor-pointer text-[10px] flex items-center space-x-1"
                  title="复制回答"
                >
                  {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Suggested Tags on welcome or response */}
            {msg.suggestedTags && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {msg.suggestedTags.map((tag, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(tag)}
                    className="text-[11px] bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200/70 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200/80 max-w-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
            <span>AI 风控大脑正在深度分析拓扑与切片...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts & Bottom Input */}
      <div className="p-4 bg-white border-t border-slate-200 space-y-3">
        {/* Quick questions list */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-slate-400 shrink-0 mr-1 flex items-center">
            <Lightbulb className="w-3 h-3 text-amber-500 mr-1" />
            快速提问:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              {q.slice(0, 16)}...
            </button>
          ))}
        </div>

        {/* Input box */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              llmConfig.apiKey
                ? `使用 ${llmConfig.model === 'deepseek-v4-pro' ? 'DeepSeek-V4-Pro' : 'Gemini 3 Flash'} 提问...`
                : '请先在右上角 ⚙️ 输入 API-Key...'
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-indigo-600 focus:bg-white transition-colors"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            title="发送提问"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
