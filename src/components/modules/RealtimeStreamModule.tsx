import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TransactionStreamItem } from '../../types';
import {
  Activity,
  Play,
  Pause,
  AlertTriangle,
  ShieldAlert,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sliders,
  DollarSign,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { MOCK_STREAM_CITIES, MOCK_DEVICES } from '../../utils/caseData';

export const RealtimeStreamModule: React.FC = () => {
  // Stream state
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speedInterval, setSpeedInterval] = useState<number>(800); // ms per transaction
  const [streamData, setStreamData] = useState<TransactionStreamItem[]>([]);
  const [activeAlert, setActiveAlert] = useState<TransactionStreamItem | null>(null);
  const [hasPulseAlert, setHasPulseAlert] = useState<boolean>(false);
  const alertTimeoutRef = useRef<any>(null);

  // Aggregated Counters
  const [totalProcessed, setTotalProcessed] = useState<number>(342);
  const [totalBlocked, setTotalBlocked] = useState<number>(14);
  const [totalReviewed, setTotalReviewed] = useState<number>(29);
  const [savedAmount, setSavedAmount] = useState<number>(684200);

  // Score History for Smooth Animated Waveform (last 25 ticks)
  const [scoreHistory, setScoreHistory] = useState<Array<{ time: string; iforest: number; ocsvm: number; isBlocked: boolean }>>([]);

  const nextTxIdRef = useRef<number>(totalProcessed + 1);

  // Generate a random normal transaction or occasional noise
  const generateRandomTx = (): TransactionStreamItem => {
    const isRareSpike = Math.random() < 0.08;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);

    const city = isRareSpike ? '曼谷' : MOCK_STREAM_CITIES[Math.floor(Math.random() * 5)];
    const device = isRareSpike ? 'Simulator-Cloner-X' : MOCK_DEVICES[Math.floor(Math.random() * 4)];
    const amount = isRareSpike
      ? Math.round(18000 + Math.random() * 32000)
      : Math.round(15 + Math.random() * 480);

    const distance = isRareSpike ? 3200 + Math.random() * 1200 : Math.random() * 18;
    const freq = isRareSpike ? 8 + Math.floor(Math.random() * 5) : 1 + Math.floor(Math.random() * 2);

    // Compute synthetic scores
    const iforest = isRareSpike
      ? 0.78 + Math.random() * 0.19
      : 0.12 + Math.random() * 0.35;
    const ocsvm = isRareSpike
      ? 0.75 + Math.random() * 0.22
      : 0.15 + Math.random() * 0.32;

    const maxScore = Math.max(iforest, ocsvm);
    let decision: 'PASS' | 'REVIEW' | 'BLOCK' = 'PASS';
    const riskFactors: string[] = [];

    if (maxScore > 0.75) {
      decision = 'BLOCK';
      if (amount > 10000) riskFactors.push('单笔交易突增超阈值 (¥' + amount.toLocaleString() + ')');
      if (distance > 2000) riskFactors.push('不可能的人类位移速度 (' + Math.round(distance) + 'km)');
      if (device.includes('Simulator')) riskFactors.push('高危模拟器设备指纹');
    } else if (maxScore > 0.55) {
      decision = 'REVIEW';
      riskFactors.push('10分钟内频次异动偏高 (' + freq + '次)');
    }

    const tx: TransactionStreamItem = {
      id: `TX-88${nextTxIdRef.current++}`,
      timestamp: timeStr,
      account: `622202******${Math.floor(1000 + Math.random() * 9000)}`,
      amount,
      city,
      deviceType: device,
      distanceKm: Math.round(distance),
      frequency10m: freq,
      iForestScore: Math.round(iforest * 100) / 100,
      ocsvmDistance: Math.round(ocsvm * 100) / 100,
      decision,
      riskFactors,
    };

    return tx;
  };

  // Helper to trigger edge red pulse glow and alert card
  const triggerPulseAlert = (tx: TransactionStreamItem) => {
    setActiveAlert(tx);
    setHasPulseAlert(true);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    // Pulse animation stays active for 3 seconds per trigger
    alertTimeoutRef.current = setTimeout(() => {
      setHasPulseAlert(false);
    }, 3200);
  };

  // Timer for Realtime Streaming
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        const newTx = generateRandomTx();

        setStreamData((prev) => [newTx, ...prev.slice(0, 40)]);
        setTotalProcessed((prev) => prev + 1);

        if (newTx.decision === 'BLOCK') {
          setTotalBlocked((prev) => prev + 1);
          setSavedAmount((prev) => prev + newTx.amount);
          triggerPulseAlert(newTx);
        } else if (newTx.decision === 'REVIEW') {
          setTotalReviewed((prev) => prev + 1);
        }

        setScoreHistory((prev) => [
          ...prev.slice(-24),
          {
            time: newTx.timestamp.slice(-5),
            iforest: newTx.iForestScore,
            ocsvm: newTx.ocsvmDistance,
            isBlocked: newTx.decision === 'BLOCK',
          },
        ]);
      }, speedInterval);
    }
    return () => clearInterval(interval);
  }, [isRunning, speedInterval]);

  // Inject specific fraud patterns
  const handleInjectFraud = (type: 'overseas' | 'smurfing' | 'spoofing' | 'cashout') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);

    let tx: TransactionStreamItem;

    if (type === 'overseas') {
      tx = {
        id: `TX-ALERT-${nextTxIdRef.current++}`,
        timestamp: timeStr,
        account: '622848******9102',
        amount: 48900,
        city: '东南亚金边 (POS终端)',
        deviceType: 'Cloned MagStripe POS',
        distanceKm: 3480,
        frequency10m: 6,
        iForestScore: 0.96,
        ocsvmDistance: 0.94,
        decision: 'BLOCK',
        riskFactors: [
          '凌晨 02:40 跨国突发超大额消费',
          '与上笔微信交易（上海）仅间隔 12 分钟 (位移违背物理定律)',
          'iForest 路径深度仅 2.1 层 (极小体素孤立)',
        ],
        isManualInjected: true,
      };
    } else if (type === 'smurfing') {
      tx = {
        id: `TX-ALERT-${nextTxIdRef.current++}`,
        timestamp: timeStr,
        account: '621700******3381',
        amount: 49950,
        city: '深圳 (网银接口)',
        deviceType: 'Multi-Tor Proxy',
        distanceKm: 1200,
        frequency10m: 14,
        iForestScore: 0.92,
        ocsvmDistance: 0.95,
        decision: 'BLOCK',
        riskFactors: [
          '刻意规避5万监管红线 (连续打款 ¥49,950)',
          '入账分散度熵值 0.94 (数十个边缘人头账户集中归集)',
          '资金驻留时长不足 8 分钟 (快进快出清洗特征)',
        ],
        isManualInjected: true,
      };
    } else if (type === 'spoofing') {
      tx = {
        id: `TX-ALERT-${nextTxIdRef.current++}`,
        timestamp: timeStr,
        account: '席位-QTS-899',
        amount: 180000,
        city: '上海期货大厦机房',
        deviceType: 'FPGA DMA极速网卡',
        distanceKm: 0,
        frequency10m: 48,
        iForestScore: 0.98,
        ocsvmDistance: 0.97,
        decision: 'BLOCK',
        riskFactors: [
          '挂撤单时间间隔仅 9 毫秒 (幌骗诱导买盘)',
          '撤单率高达 99.2% (非真实成交意图)',
          '盘口买卖失衡度瞬时扭曲 +8.4 档位',
        ],
        isManualInjected: true,
      };
    } else {
      tx = {
        id: `TX-ALERT-${nextTxIdRef.current++}`,
        timestamp: timeStr,
        account: '621485******7762',
        amount: 29990,
        city: '杭州 (电商收银台)',
        deviceType: 'Android Emulator Farm #12',
        distanceKm: 850,
        frequency10m: 9,
        iForestScore: 0.91,
        ocsvmDistance: 0.93,
        decision: 'BLOCK',
        riskFactors: [
          '同设备指纹/MAC 关联多达 24 个白条分期账号',
          '虚拟空包物流签收耗时仅 1.2 小时',
          '极速套现离线取款',
        ],
        isManualInjected: true,
      };
    }

    setStreamData((prev) => [tx, ...prev.slice(0, 40)]);
    setTotalProcessed((prev) => prev + 1);
    setTotalBlocked((prev) => prev + 1);
    setSavedAmount((prev) => prev + tx.amount);
    triggerPulseAlert(tx);

    setScoreHistory((prev) => [
      ...prev.slice(-24),
      {
        time: tx.timestamp.slice(-5),
        iforest: tx.iForestScore,
        ocsvm: tx.ocsvmDistance,
        isBlocked: true,
      },
    ]);
  };

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6 relative">
      {/* Screen Edge Red Pulse Halo Animation via Motion */}
      <AnimatePresence>
        {hasPulseAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.75, 0.35, 0.7, 0],
              boxShadow: [
                'inset 0 0 0px 0px rgba(239, 68, 68, 0)',
                'inset 0 0 80px 24px rgba(239, 68, 68, 0.45)',
                'inset 0 0 45px 12px rgba(239, 68, 68, 0.25)',
                'inset 0 0 75px 20px rgba(239, 68, 68, 0.4)',
                'inset 0 0 0px 0px rgba(239, 68, 68, 0)',
              ],
            }}
            exit={{ opacity: 0, transition: { duration: 0.6 } }}
            transition={{
              duration: 3.0,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            className="fixed inset-0 pointer-events-none z-50 ring-2 ring-red-500/40"
          />
        )}
      </AnimatePresence>

      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-700 font-semibold text-xs tracking-wider uppercase mb-1">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>模块 04 · 高频秒级拦截</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              实时交易流监控与阻断报警
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              动态模拟高频信用卡与支付交易流 <code className="font-mono text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">stream[:N]</code>；同屏平滑演播双算法异常得分实时波动折线，超限触发毫秒级熔断阻断与多维风险归因归纳。
            </p>
          </div>
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? '暂停流水' : '继续流式监控'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>处理交易总量</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalProcessed} 笔</div>
          <span className="text-[11px] text-slate-500">毫秒级平均延迟 12ms</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>智能熔断阻断</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 mt-1">{totalBlocked} 笔</div>
          <span className="text-[11px] text-rose-600/90">拦截率 {((totalBlocked / Math.max(1, totalProcessed)) * 100).toFixed(1)}%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>存疑二审转人工</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 mt-1">{totalReviewed} 笔</div>
          <span className="text-[11px] text-amber-600/90">OTP短信双因子复核</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>累计挽回资金损失</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            ¥{(savedAmount / 10000).toFixed(1)}万
          </div>
          <span className="text-[11px] text-emerald-600/90">止付准确率 99.4%</span>
        </div>
      </div>

      {/* Main Stream Ticker & Waveform View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Realtime Score Fluctuation Waveform */}
        <div className="lg:col-span-2 space-y-5">
          {/* Animated Anomaly Score Waveform Chart */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-white shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
                  异常得分 (Anomaly Score) 实时波动演播
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs font-mono">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-0.5 bg-indigo-400"></span>
                  <span className="text-indigo-300">iForest 孤立评分</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-0.5 bg-teal-400"></span>
                  <span className="text-teal-300">OCSVM 密域距离</span>
                </span>
                <span className="text-rose-400">熔断阈值: 0.75</span>
              </div>
            </div>

            {/* SVG Waveform Line */}
            <div className="h-44 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 540 160" preserveAspectRatio="none">
                {/* Horizontal Threshold lines */}
                {/* 0.75 Red alert line */}
                <line x1="0" y1="40" x2="540" y2="40" stroke="#f43f5e" strokeDasharray="3 3" strokeWidth="1.5" />
                <text x="535" y="35" fill="#f87171" fontSize="9" textAnchor="end" fontFamily="monospace">
                  阻断阈值 s=0.75
                </text>

                {/* 0.55 Yellow warning line */}
                <line x1="0" y1="72" x2="540" y2="72" stroke="#f59e0b" strokeDasharray="2 2" strokeWidth="1" />
                <text x="535" y="67" fill="#fbbf24" fontSize="9" textAnchor="end" fontFamily="monospace">
                  预警核验 s=0.55
                </text>

                {/* Background Grid */}
                <line x1="0" y1="120" x2="540" y2="120" stroke="#334155" strokeWidth="0.5" />

                {/* iForest Path */}
                {scoreHistory.length > 1 && (
                  <path
                    d={scoreHistory.reduce((acc, pt, idx) => {
                      const x = (idx / Math.max(1, scoreHistory.length - 1)) * 540;
                      const y = 150 - pt.iforest * 140;
                      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                    }, '')}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2.5"
                  />
                )}

                {/* OCSVM Path */}
                {scoreHistory.length > 1 && (
                  <path
                    d={scoreHistory.reduce((acc, pt, idx) => {
                      const x = (idx / Math.max(1, scoreHistory.length - 1)) * 540;
                      const y = 150 - pt.ocsvm * 140;
                      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                    }, '')}
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="1.8"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Markers for Blocked ticks */}
                {scoreHistory.map((pt, idx) => {
                  if (!pt.isBlocked) return null;
                  const x = (idx / Math.max(1, scoreHistory.length - 1)) * 540;
                  const y = 150 - pt.iforest * 140;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                      <line x1={x} y1={y} x2={x} y2="155" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
              <span>← 历史滑动窗口 (最近 25 笔交易)</span>
              <span>实时吞吐量：{(1000 / speedInterval).toFixed(1)} TPS</span>
              <span>最新监测点 →</span>
            </div>
          </div>

          {/* Realtime Stream List (stream[:N]) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>实时信用卡与支付交易流 stream[:N]</span>
              </h3>
              <span className="text-xs font-mono text-slate-500">Live Transaction Feeds</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="pb-2">交易流水号</th>
                    <th className="pb-2">脱敏卡号</th>
                    <th className="pb-2">金额 (CNY)</th>
                    <th className="pb-2">商户与地点</th>
                    <th className="pb-2">iForest 得分</th>
                    <th className="pb-2">OCSVM 置信度</th>
                    <th className="pb-2 text-right">熔断裁决</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {streamData.slice(0, 8).map((tx) => (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        tx.decision === 'BLOCK' ? 'bg-rose-50/50' : tx.decision === 'REVIEW' ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 font-semibold text-slate-900 flex items-center space-x-1.5">
                        {tx.isManualInjected && (
                          <span className="px-1 py-0.2 bg-rose-600 text-white text-[9px] rounded font-sans">
                            注入
                          </span>
                        )}
                        <span>{tx.id}</span>
                      </td>
                      <td className="py-2.5 text-slate-600">{tx.account}</td>
                      <td className="py-2.5 font-bold text-slate-900">¥{tx.amount.toLocaleString()}</td>
                      <td className="py-2.5 font-sans text-slate-700">
                        {tx.city} · {tx.distanceKm}km
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`font-bold ${
                            tx.iForestScore > 0.75
                              ? 'text-rose-600'
                              : tx.iForestScore > 0.55
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {tx.iForestScore.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`font-bold ${
                            tx.ocsvmDistance > 0.75
                              ? 'text-rose-600'
                              : tx.ocsvmDistance > 0.55
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {tx.ocsvmDistance.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-sans">
                        {tx.decision === 'BLOCK' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 mr-1" />
                            即刻阻断
                          </span>
                        ) : tx.decision === 'REVIEW' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            二次校验
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            合规放行
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Active Alert Modal & Fraud Injector Panel */}
        <div className="space-y-5">
          {/* Active Alert Card with Framer Motion Fade In / Fade Out */}
          <AnimatePresence mode="wait">
            {activeAlert && (
              <motion.div
                key={activeAlert.id}
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="bg-white rounded-2xl p-5 border-2 border-rose-400 shadow-xl shadow-rose-500/10 space-y-3 relative overflow-hidden ring-4 ring-rose-500/15"
              >
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-100 rounded-full opacity-40 pointer-events-none"></div>
                <div className="flex items-center justify-between pb-2 border-b border-rose-100">
                  <div className="flex items-center space-x-1.5 text-rose-700 font-bold text-xs uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4 text-rose-600 animate-bounce" />
                    <span>风险拦截预警通知 (Alarm Triggered)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-rose-600 text-white px-2 py-0.5 rounded font-bold">
                    毫秒熔断
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">涉案流水号:</span>
                    <span className="font-mono font-bold text-slate-900">{activeAlert.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">涉案卡号:</span>
                    <span className="font-mono text-slate-700">{activeAlert.account}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">拦截金额:</span>
                    <span className="font-mono font-bold text-rose-600 text-sm">
                      ¥{activeAlert.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">商户与环境:</span>
                    <span className="text-slate-800 font-medium">{activeAlert.city}</span>
                  </div>
                </div>

                {/* Risk Factors Breakdown */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-700">风险归因雷达触发项：</span>
                  <ul className="mt-1 space-y-1">
                    {activeAlert.riskFactors.map((f, i) => (
                      <li key={i} className="text-[11px] text-rose-800 bg-rose-50/80 p-1.5 rounded flex items-start space-x-1.5">
                        <span className="text-rose-500 mt-0.5 font-bold">▪</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveAlert(null);
                      setHasPulseAlert(false);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    关闭此弹窗
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Injection Tool */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>主动注入典型极端欺诈交易</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Fraud Injector</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              点击以下按钮，向当前流式队列实时注入经由黑产特征伪造的高危样本，验证 iForest 与 OCSVM 的毫秒级阻断闸门响应能力：
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => handleInjectFraud('overseas')}
                className="w-full text-left p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 transition-all text-xs cursor-pointer group"
              >
                <div className="font-bold text-indigo-900 flex items-center justify-between">
                  <span>① 凌晨跨国异地刷卡 (¥48,900)</span>
                  <span className="text-[10px] text-indigo-600 font-mono group-hover:translate-x-1 transition-transform">
                    注入 →
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  12分钟前在上海喝咖啡，凌晨在东南亚POS机突发大额珠宝消费
                </p>
              </button>

              <button
                onClick={() => handleInjectFraud('smurfing')}
                className="w-full text-left p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition-all text-xs cursor-pointer group"
              >
                <div className="font-bold text-emerald-900 flex items-center justify-between">
                  <span>② 洗钱分散频转打款 (¥49,950)</span>
                  <span className="text-[10px] text-emerald-600 font-mono group-hover:translate-x-1 transition-transform">
                    注入 →
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  数十个傀儡账户刻意规避5万监管红线，快进快出集中归集
                </p>
              </button>

              <button
                onClick={() => handleInjectFraud('spoofing')}
                className="w-full text-left p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 transition-all text-xs cursor-pointer group"
              >
                <div className="font-bold text-amber-900 flex items-center justify-between">
                  <span>③ 9毫秒高频撤单幌骗交易</span>
                  <span className="text-[10px] text-amber-600 font-mono group-hover:translate-x-1 transition-transform">
                    注入 →
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  虚假挂出大额买单诱导散户，9毫秒内光速撤单并在高位反手抛售
                </p>
              </button>

              <button
                onClick={() => handleInjectFraud('cashout')}
                className="w-full text-left p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 transition-all text-xs cursor-pointer group"
              >
                <div className="font-bold text-rose-900 flex items-center justify-between">
                  <span>④ 电商黑产同机群控套现 (¥29,990)</span>
                  <span className="text-[10px] text-rose-600 font-mono group-hover:translate-x-1 transition-transform">
                    注入 →
                  </span>
                </div>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  同设备批量登录白卡账号，利用虚构物流虚假发货完成资金套现
                </p>
              </button>
            </div>

            {/* Speed Control Slider */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-700 font-medium mb-1">
                <span>流式刷新间隔 (流水速度)</span>
                <span className="font-mono text-indigo-600 font-bold">{speedInterval} ms</span>
              </div>
              <input
                type="range"
                min="200"
                max="1600"
                step="100"
                value={speedInterval}
                onChange={(e) => setSpeedInterval(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>200ms (高频流水)</span>
                <span>800ms</span>
                <span>1600ms (慢速观察)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
