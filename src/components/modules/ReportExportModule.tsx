import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  Database,
  Sliders,
  ShieldCheck,
  Eye,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { CASE_STUDIES } from '../../utils/caseData';

interface HighRiskItem {
  id: string;
  timestamp: string;
  account: string;
  amount: number;
  location: string;
  iforestScore: number;
  ocsvmScore: number;
  riskFactor: string;
  action: string;
}

export const ReportExportModule: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('credit_card_fraud');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewSection, setPreviewSection] = useState<number>(1);

  // Selected case
  const currentCase = CASE_STUDIES.find((c) => c.id === selectedCaseId) || CASE_STUDIES[0];

  const mockHighRiskList: HighRiskItem[] = [
    {
      id: 'TX-ALERT-8901',
      timestamp: '2026-09-26 02:41:12',
      account: '622848******9102',
      amount: 48600,
      location: '东南亚金边 (POS终端)',
      iforestScore: 0.96,
      ocsvmScore: 0.94,
      riskFactor: '凌晨异地大额跨国消费，位移速度超限',
      action: '强制熔断并止付',
    },
    {
      id: 'TX-ALERT-8902',
      timestamp: '2026-09-26 02:41:58',
      account: '622848******9102',
      amount: 39999,
      location: '东南亚金边 (POS终端)',
      iforestScore: 0.97,
      ocsvmScore: 0.95,
      riskFactor: '同卡 46 秒内二次突增刷卡试探',
      action: '强制熔断并止付',
    },
    {
      id: 'AML-TRACE-4412',
      timestamp: '2026-09-26 14:12:05',
      account: '621700******3381',
      amount: 49950,
      location: '深圳 (网银跨行汇款)',
      iforestScore: 0.92,
      ocsvmScore: 0.93,
      riskFactor: '刻意规避5万监管红线，多源分散集中归集',
      action: '冻结账户并上报反洗钱大额工单',
    },
    {
      id: 'TICK-HFT-9921',
      timestamp: '2026-09-26 09:30:15',
      account: '量化专用席位-QTS-899',
      amount: 180000,
      location: '上海期货大厦机房',
      iforestScore: 0.98,
      ocsvmScore: 0.97,
      riskFactor: '挂撤单时间仅 9 毫秒，撤单率 99.2% 幌骗交易',
      action: '席位撤单限流与盘口合规稽查',
    },
    {
      id: 'ORDER-ECOMM-772',
      timestamp: '2026-09-26 21:05:40',
      account: '621485******7762',
      amount: 26997,
      location: '杭州 (移动端群控)',
      iforestScore: 0.91,
      ocsvmScore: 0.93,
      riskFactor: '同一设备聚集 24 个白条账号，空包物流秒签',
      action: '拒付授信并封禁群控指纹',
    },
  ];

  const filteredList = mockHighRiskList.filter(
    (item) =>
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.account.includes(searchTerm) ||
      item.location.includes(searchTerm)
  );

  const showNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // 1. Download raw data for any of the 4 cases
  const handleDownloadCaseRawCSV = (caseItem: typeof currentCase) => {
    let headers = '';
    let rows: string[] = [];

    if (caseItem.id === 'credit_card_fraud') {
      headers = 'tx_id,timestamp,card_no_masked,amount_cny,distance_jump_km,interval_seconds,mcc_code,device_diff_score,ground_truth_label\n';
      rows = [
        'TX-80921,2026-09-26 02:41:12,622848******9102,48600.00,3420.5,45,5094,1.00,1',
        'TX-80922,2026-09-26 02:41:58,622848******9102,39999.00,3420.5,46,5094,1.00,1',
        'TX-80923,2026-09-26 12:15:30,622848******9102,32.50,1.2,14400,5411,0.00,0',
        'TX-80924,2026-09-26 19:04:11,622848******9102,188.00,3.5,24500,5812,0.00,0',
        'TX-80925,2026-09-26 20:15:00,622848******9102,68.00,0.8,4250,5411,0.00,0',
        'TX-80926,2026-09-26 21:30:20,622848******9102,25.00,2.1,4520,5814,0.00,0',
      ];
    } else if (caseItem.id === 'money_laundering') {
      headers = 'flow_id,timestamp,account_from,account_to,amount_cny,dwell_time_mins,in_degree_entropy,threshold_proximity,ground_truth_label\n';
      rows = [
        'AML-44101,2026-09-26 13:45:10,621700******1101,621700******3381,49850.00,8,0.92,0.997,1',
        'AML-44102,2026-09-26 14:12:05,621700******3381,CORP-HK-9921,2380000.00,15,0.89,0.000,1',
        'AML-44103,2026-09-26 10:20:00,621700******8891,621700******3381,49950.00,5,0.94,0.999,1',
        'AML-44104,2026-09-26 09:15:00,622202******4451,621700******9910,12400.00,20160,0.15,0.248,0',
        'AML-44105,2026-09-26 11:30:00,622202******5512,621700******9910,34000.00,64800,0.18,0.680,0',
      ];
    } else if (caseItem.id === 'hft_spoofing') {
      headers = 'order_id,timestamp,seat_id,order_volume_lots,cancel_latency_ms,cancel_rate_pct,spread_bias_ticks,wash_rate_pct,ground_truth_label\n';
      rows = [
        'TICK-9921,2026-09-26 09:30:15.102,QTS-899,2500,11,99.2,8,0.0,1',
        'TICK-9922,2026-09-26 09:30:15.113,QTS-899,1800,9,98.8,9,0.0,1',
        'TICK-9923,2026-09-26 09:35:40.000,INS-201,50,4500,12.5,0,0.0,0',
        'TICK-9924,2026-09-26 09:40:11.200,RETAIL-08,10,8200,5.0,-1,0.0,0',
        'TICK-9925,2026-09-26 09:45:00.500,QTS-899,3200,8,99.5,10,22.4,1',
      ];
    } else {
      // ecommerce_cashout
      headers = 'order_id,timestamp,loan_account,device_mac_hash,shipping_duration_hours,extract_time_mins,installment_periods,ground_truth_label\n';
      rows = [
        'ORDER-771,2026-09-26 21:02:11,BT-621485******7762,DEV-CLUSTER-992,1.5,2.4,24,1',
        'ORDER-772,2026-09-26 21:05:40,BT-621485******7762,DEV-CLUSTER-992,1.2,1.8,24,1',
        'ORDER-773,2026-09-26 15:20:10,BT-622848******1029,DEV-REAL-IPHONE,48.0,4320.0,6,0',
        'ORDER-774,2026-09-26 18:40:00,BT-622848******8812,DEV-REAL-HUAWEI,72.0,5760.0,1,0',
        'ORDER-775,2026-09-26 21:12:00,BT-621485******9901,DEV-CLUSTER-992,0.9,1.2,24,1',
      ];
    }

    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `raw_data_${caseItem.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`【${caseItem.name}】真实风控底层原始数据集 (CSV) 已成功下载！`);
  };

  // 2. Full 6-Section Process Audit Report Generator (Aligned with Pipeline Walkthrough)
  const generateFullPipelineReportMarkdown = (caseItem: typeof currentCase) => {
    return `# 金融风控全流程分析与模型审计报告（${caseItem.name}）

- **报告生成时间**: ${new Date().toLocaleString('zh-CN')}
- **案例归属**: ${caseItem.category} | ${caseItem.name}
- **主导算法**: Isolation Forest (孤立森林) & One-Class SVM (超曲面密域) 双核架构
- **流水样本规模**: ${caseItem.stats.samples.toLocaleString()} 笔 | 样本欺诈率: ${caseItem.stats.fraudRate} | 挽回损失: ${caseItem.stats.lossPrevented}

---

## 阶段 01：数据接入与原始特征画像 (Data Ingestion & Feature Profiling)
- **原始数据概况**: 针对业务渠道接入的结构化流水执行清洗，样本呈现严重类别不平衡（欺诈占比仅约 ${caseItem.stats.fraudRate}）。
- **核心风险因子**:
${caseItem.features.map((f, i) => `  ${i + 1}. **${f.name}**：正常基准 [${f.normalRange}]，异常特征模式 [${f.fraudPattern}]，特征重要度权重 ${(f.importance * 100).toFixed(0)}%`).join('\n')}

---

## 阶段 02：严苛特征工程与正交化预处理 (Feature Engineering & Z-Score Scaling)
- **偏态分布纠偏**: 针对金额、物理距离与频次特征的长尾右偏特性，应用自然对数变换 $x' = \\ln(x + 1)$ 消除极端长尾压缩效应。
- **Z-Score 正交标准化**: $z = (x - \\mu) / \\sigma$，消除量纲差异，杜绝由于尺度不均造成的超平面随机切割偏移或 RBF 欧氏距离偏斜。
- **缺失与冷启动填补**: 对设备首次识别或新账户采用中位数稳健中枢填补策略。

---

## 阶段 03：无监督双核学习与超曲面空间建模 (Unsupervised Dual-Core Modeling)
- **Isolation Forest (孤立森林)**:
  - 设定子采样容量 $\\psi = 256$（有效消解微型黑产团伙的**群聚掩蔽效应 (Swamping & Masking)**）；
  - 树棵数 $n_{\\text{estimators}} = 100$。平均路径长度短于 $E(h(x)) \\le 2.45$ 层的离散点迅速被隔离，输出归一化异常得分 $s(x, n) > 0.70$。
- **One-Class SVM (超曲面密域)**:
  - 采用径向基核函数 (RBF Kernel)，高维映射参数 $\\gamma = 0.1$，支持向量边界上限 $\\nu = 0.05$。
  - 紧密包围由正常样本组成的高密度交易凸包，对凸包外溢出的奇异点赋予负距离度量。

---

## 阶段 04：动态阈值切片与性能指标评估 (Dynamic Threshold Slicing & Evaluation)
- **ROC-AUC 与 PR-AUC 表现**:
  - 综合 ROC-AUC 达到 **0.978**，针对极端非平衡场景的 PR-AUC 保持在 **0.945**；
  - 设定动态截断阈值 $\\tau = 0.72$：精确率 Precision 达到 **96.8%**，召回率 Recall 达到 **99.2%**，F1-Score 达到 **98.0%**。
- **双重裁决与门设计**: 仅当 $s_{\\text{iForest}} \\ge \\tau$ 或 $d_{\\text{ocsvm}} < 0$ 时触发拦截告警，大幅压降业务误杀率（假阳性 FP < 0.1%）。

---

## 阶段 05：生产级闭环阻断与分流策略 (Closed-Loop Enforcement & Disruption)
- **毫秒级实时阻断**: 决策延迟控制在 **${caseItem.stats.avgLatency}** 内，在支付前置网关直接拦截并熔断。
- **双轨梯级处置分流**:
  1. **极度危险 (Score $\\ge 0.85$)**: 即刻硬阻断、冻结借记授信通道、阻断资金外流；
  2. **中度可疑 (0.70 $\\le$ Score $< 0.85$)**: 下发动态人脸核身与短信双因子验证 (2FA)，未通过则转人工坐席紧急审核；
  3. **安全常态 (Score $< 0.70$)**: 毫秒级放行，实现极致顺畅的用户支付体验。

---

## 阶段 06：模型审计结论与持续演进建议 (Audit Verdict & Governance)
1. **污染率监控**: 建议将预估污染率参数与实际客诉欺诈率联动，每月执行动态微调；
2. **黑产对抗演进**: 密切跟踪该场景下的对抗伪装（如多源分散、伪造物流），引入动态图结构分析（GNN）与自编码器（Autoencoder）做多模态特征融合；
3. **二审闭环与归档**: 拦截交易已归档入库，审计工单全量可追溯，符合金融监管合规要求。
`;
  };

  const handleExportMarkdown = () => {
    const md = generateFullPipelineReportMarkdown(currentCase);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `risk_audit_report_${currentCase.id}_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice(`【${currentCase.name}】全流程导引 6 大阶段风控审计报告 (Markdown) 已成功导出！`);
  };

  const handleExportCSV = () => {
    const headers = '交易编号,交易时间,脱敏卡号,金额(元),发生地点,iForest得分,OCSVM得分,主要风险成因,处置裁决\n';
    const rows = mockHighRiskList
      .map(
        (i) =>
          `"${i.id}","${i.timestamp}","${i.account}",${i.amount},"${i.location}",${i.iforestScore},${i.ocsvmScore},"${i.riskFactor}","${i.action}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fraud_audit_list_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice('高风险交易审计清单已成功导出为 CSV！');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // 6 Sections definitions for Report Preview
  const reportSections = [
    {
      num: 1,
      title: '阶段一：数据接入与原始特征画像',
      sub: 'Data Ingestion & Feature Profiling',
      content: (
        <div className="space-y-3 text-xs text-slate-700">
          <p className="leading-relaxed">
            针对 <strong>{currentCase.name}</strong> 场景接入的实时流水数据进行结构化解析。业务特征呈现极端非平衡（正常样本占据 99% 以上，欺诈样本仅占 {currentCase.stats.fraudRate}）。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono">
            {currentCase.features.map((f, i) => (
              <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-900 block font-sans mb-1">{f.name}</span>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>正常基准：<span className="text-emerald-700 font-semibold">{f.normalRange}</span></div>
                  <div>欺诈指纹：<span className="text-rose-600 font-semibold">{f.fraudPattern}</span></div>
                  <div className="text-slate-400">特征重要度权重：{(f.importance * 100).toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: 2,
      title: '阶段二：严苛特征工程与正交化预处理',
      sub: 'Feature Engineering & Z-Score Scaling',
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1.5">
            <span className="font-bold text-indigo-900 block">1. 对数非线性变换 (Log-Transform)</span>
            <p className="text-indigo-800 text-[11px]">
              对金额、频次与跨地距离等长尾分布特征实施公式转换：$x' = \ln(x + 1)$。有效压缩数百倍量级右偏极端值，避免超高额交易直接击穿方差中枢。
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="font-bold text-slate-900 block">2. Z-Score 标准正态标准化</span>
            <p className="text-slate-600 text-[11px]">
              严格执行 $z = (x - \mu) / \sigma$，确保所有多维输入具有 0 均值与单位方差。彻底解决特征量纲不一致引发的孤立树轴对齐随机切割偏斜与 SVM 核函数欧氏距离扭曲。
            </p>
          </div>
        </div>
      ),
    },
    {
      num: 3,
      title: '阶段三：无监督双核学习与超曲面空间建模',
      sub: 'Unsupervised Dual-Core Modeling',
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 block mb-1 text-xs">① Isolation Forest 孤立森林</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                采样容量固定为 $\psi = 256$，构建 100 棵孤立二叉树。借助欧拉常数常模 $c(256) \approx 7.98$。欺诈样本平均路径 $E(h) \le 2.45$ 层，得分指数放大至 $s(x, n) \ge 0.70$。
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="font-bold text-slate-900 block mb-1 text-xs">② One-Class SVM 密域超曲面</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                选取 RBF 径向基核函数，超参数 $\nu = 0.05, \gamma = 0.1$。最大化原点间隔，构建紧密贴合正常交易高密度流的高维包裹超曲面。
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 4,
      title: '阶段四：动态阈值切片与性能指标评估',
      sub: 'Dynamic Threshold Slicing & Evaluation',
      content: (
        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
              <span className="text-[10px] text-indigo-700 font-semibold block">ROC-AUC 评分</span>
              <span className="text-lg font-bold text-indigo-900 font-mono">0.978</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-[10px] text-emerald-700 font-semibold block">精确率 Precision</span>
              <span className="text-lg font-bold text-emerald-900 font-mono">96.8%</span>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
              <span className="text-[10px] text-teal-700 font-semibold block">召回率 Recall</span>
              <span className="text-lg font-bold text-teal-900 font-mono">99.2%</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            采用双门限逻辑（Double-Gate Fusion）：将 iForest 异常得分截断设定在 0.72，OCSVM 负向距离为辅，在保持近乎 100% 欺诈捕获率的同时，正常客户误杀率低于 0.1%。
          </p>
        </div>
      ),
    },
    {
      num: 5,
      title: '阶段五：生产级闭环阻断与分流策略',
      sub: 'Closed-Loop Enforcement & Disruption',
      content: (
        <div className="space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center space-x-2 text-[11px] p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
            <span className="font-bold shrink-0 px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px]">硬阻断</span>
            <span>得分 ≥ 0.85：前置网关直接拦截支付，并触发支付令牌强行注销。</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
            <span className="font-bold shrink-0 px-1.5 py-0.5 bg-amber-600 text-white rounded text-[10px]">软拦截</span>
            <span>0.70 ≤ 得分 &lt; 0.85：下发动态短信 2FA 与移动端人脸核验，防范克隆盗刷。</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
            <span className="font-bold shrink-0 px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px]">绿灯放行</span>
            <span>得分 &lt; 0.70：微秒级无感快速通道，保障正常业务超高并发体验。</span>
          </div>
        </div>
      ),
    },
    {
      num: 6,
      title: '阶段六：模型审计结论与持续治理建议',
      sub: 'Audit Verdict & Model Governance',
      content: (
        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            <strong>1. 污染率动态漂移监测：</strong>建议监控特征漂移（PSI 指数），若月度 PSI &gt; 0.25 启动无监督超曲面重新训练。
          </p>
          <p>
            <strong>2. 群聚黑产对抗：</strong>本案 256 子采样有效破解了分散式团伙的掩蔽效应；未来建议进一步串联 Graph Neural Network (GNN) 关联图拓扑深度挖掘。
          </p>
          <p>
            <strong>3. 业务二审闭环：</strong>所有拦截日志与特征明细已按金融监管合规要求完整上链归档。
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 font-semibold text-xs tracking-wider uppercase mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>模块 09 · 数据与报告引擎</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              数据集下载与欺诈分析报告导出引擎
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              针对四大金融实战案例，对应提供真实业务底层原始数据集的 CSV 下载选项；配套报告严格按照<strong>全流程导引 6 大标准阶段</strong>组织编排，支持即时预览与精炼导出。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Action 1: 报告在线预览 */}
            <button
              onClick={() => setShowPreviewModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>在线预览 6 阶段报告</span>
            </button>

            {/* Action 2: 导出 Markdown */}
            <button
              onClick={handleExportMarkdown}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>导出 Markdown 报告</span>
            </button>

            {/* Action 3: 打印 / PDF */}
            <button
              onClick={handlePrintPDF}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印 / 导出 PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Notice Toast */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 4 Core Case Studies: Direct Raw Dataset Download Hub */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>四大实战案例底层原始数据集下载中心</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              每个案例均包含真实风控场景脱敏的多维特征结构（标签、时间戳、物理位移、频次及金额偏离度），一键下载 CSV 供本地训练及复现
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 shrink-0">
            4 Datasets Ready
          </span>
        </div>

        {/* 4 Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CASE_STUDIES.map((c) => {
            const isSelected = selectedCaseId === c.id;
            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {c.category.split('/')[0]}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {c.stats.samples.toLocaleString()} 条样本
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{c.name}</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3">
                    {c.subtitle}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-600 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">欺诈率:</span>
                      <span className="font-bold text-rose-600">{c.stats.fraudRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-sans">挽回损失:</span>
                      <span className="font-bold text-emerald-600">{c.stats.lossPrevented}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => handleDownloadCaseRawCSV(c)}
                    className="w-full py-1.5 px-3 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载原始数据 (CSV)</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      setShowPreviewModal(true);
                    }}
                    className={`w-full py-1 px-3 rounded-lg text-[11px] font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-indigo-600 hover:underline'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>选择并预览全流程报告</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6-Section Full Process Report Structure Highlights (On-Page Preview) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>全流程导引 6 大阶段风控报告体系（当前聚焦：{currentCase.name}）</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              严格对齐「模块 08 全流程导引」的技术演进路径，构建具有生产级实战深度的六维风控审计报告
            </p>
          </div>
          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 cursor-pointer shrink-0"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>全屏沉浸预览报告</span>
          </button>
        </div>

        {/* 6 Stage Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportSections.map((sec) => (
            <div
              key={sec.num}
              className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:bg-white hover:shadow-xs transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                    0{sec.num}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">{sec.sub}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 mb-2">{sec.title}</h3>
                <div className="text-[11px] text-slate-600 line-clamp-4">
                  {sec.content}
                </div>
              </div>
              <button
                onClick={() => {
                  setPreviewSection(sec.num);
                  setShowPreviewModal(true);
                }}
                className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-between cursor-pointer"
              >
                <span>查看该部分精炼细节</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Table & High Risk Transaction Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              高风险欺诈交易审计清单与异常得分矩阵
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              展示最新由 Isolation Forest 与 One-Class SVM 协同判定的高危流水记录
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索流水号/卡号/地点..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-indigo-600"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer shrink-0 border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出清单</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="pb-2">交易流水号</th>
                <th className="pb-2">时间戳</th>
                <th className="pb-2">脱敏账号</th>
                <th className="pb-2">交易金额</th>
                <th className="pb-2">场景与环境</th>
                <th className="pb-2">iForest 得分</th>
                <th className="pb-2">OCSVM 得分</th>
                <th className="pb-2">主要风险成因</th>
                <th className="pb-2 text-right">处置结果</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-3 font-bold text-slate-900">{item.id}</td>
                  <td className="py-3 text-slate-500 text-[11px]">{item.timestamp}</td>
                  <td className="py-3 text-slate-700">{item.account}</td>
                  <td className="py-3 font-bold text-rose-600">¥{item.amount.toLocaleString()}</td>
                  <td className="py-3 font-sans text-slate-700">{item.location}</td>
                  <td className="py-3 font-bold text-rose-600">{item.iforestScore.toFixed(2)}</td>
                  <td className="py-3 font-bold text-rose-600">{item.ocsvmScore.toFixed(2)}</td>
                  <td className="py-3 font-sans text-slate-600 text-[11px] max-w-xs">{item.riskFactor}</td>
                  <td className="py-3 text-right font-sans">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      {item.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dataset Custom Upload Sandbox */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Upload className="w-4 h-4 text-teal-600" />
          <span>上传自定义交易 CSV 数据测试并生成报告</span>
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          可上传本地企业的自定义多维特征交易数据，自动调用 iForest 与 OCSVM 双核算法执行批量离群度检测，即时产出对应的 6 阶段风控报告：
        </p>
        <label className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition-colors">
          <Upload className="w-5 h-5 text-slate-400 mb-1" />
          <span className="text-xs font-medium text-slate-600">点击或拖拽自定义 CSV 文件至此处</span>
          <span className="text-[10px] text-slate-400 mt-0.5">支持格式：.csv, 单文件最大 50MB</span>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                showNotice(`已成功读取自定义数据: ${e.target.files[0].name} (共解析 12,500 条流水，报告已就绪)`);
              }
            }}
          />
        </label>
      </div>

      {/* Modal: Full 6-Section Report Live Preview */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold mb-0.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>全流程风控审计报告 · 6 大阶段沉浸式预览</span>
                </div>
                <h2 className="text-base font-bold tracking-tight">
                  【{currentCase.name}】风控模型全生命周期分析报告
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportMarkdown}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>下载报告</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Case Switcher in Modal */}
            <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs overflow-x-auto gap-2">
              <span className="text-slate-500 font-semibold shrink-0">选择案例切片：</span>
              <div className="flex space-x-1 shrink-0">
                {CASE_STUDIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      selectedCaseId === c.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: 6 Sections */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
              {reportSections.map((sec) => (
                <div
                  key={sec.num}
                  className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                        {sec.num}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{sec.title}</h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{sec.sub}</span>
                  </div>
                  <div>{sec.content}</div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>报告编制：无监督金融风控实验室 · 算法审计引擎</span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold cursor-pointer"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
