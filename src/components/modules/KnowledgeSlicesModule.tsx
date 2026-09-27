import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  HelpCircle,
  Sparkles,
  Search,
  Sliders,
  Database,
  Crosshair,
  TrendingUp,
  Zap,
} from 'lucide-react';

export const KnowledgeSlicesModule: React.FC = () => {
  const [activeSlice, setActiveSlice] = useState<number>(1); // Default to Slice 1 (一 二 三 四 五 六 严格顺排)

  const slices = [
    {
      id: 1,
      tag: '经典切片',
      title: '切片一：两大核心算法机理差异',
      sub: 'iForest 与 OCSVM 几何映射对比',
      desc: '“易孤立”随机切割 vs “包围正常”核域闭包',
    },
    {
      id: 2,
      tag: '经典切片',
      title: '切片二：适用条件与空间表示',
      sub: '数据吞吐、维度与模式分布匹配',
      desc: '海量流式高维流水 vs 小样本高密非线性',
    },
    {
      id: 3,
      tag: '风控红线',
      title: '切片三：三大致命风控陷阱',
      sub: '真实风控踩坑与工程教训',
      desc: '污染率偏离、掩蔽群聚效应与标准化偏斜',
    },
    {
      id: 4,
      tag: '认知升维',
      title: '切片四：误区警示与诊断陷阱',
      sub: '业务峰值与统计异常的辩证治理',
      desc: '业务峰值误判、得分与犯罪本质的差距',
    },
    {
      id: 5,
      tag: '核心机理',
      title: '切片五：异常检查机理',
      sub: '数理逻辑、空间几何切割与高维分布密度映射机理',
      desc: '深入剖析异常点的数学本质、局部密度偏离、距离度量坍缩与超平面裁切机理',
    },
    {
      id: 6,
      tag: '实战赋能',
      title: '切片六：异常检查应用',
      sub: '全行业商业落地场景、架构集成与工程治理实践',
      desc: '覆盖金融反欺诈、工控物联网故障、网络安全入侵与公有云计量异常检测',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-700 font-semibold text-xs tracking-wider uppercase mb-1">
              <BookOpen className="w-4 h-4" />
              <span>模块 09 · 知识导引体系</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              异常检测机理与风控知识导引
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              汇集异常检测底层数学机理、空间几何切割、全行业实战应用、算法选型矩阵以及三大致命工程陷阱，打造完备的无监督异常检测认知防线。
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-mono text-xs rounded-lg border border-indigo-200">
              6 大核心认知切片体系
            </span>
          </div>
        </div>
      </div>

      {/* 6 Interactive Slices Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slices.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSlice(item.id)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              activeSlice === item.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/20'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    activeSlice === item.id
                      ? 'bg-indigo-500 text-indigo-100'
                      : item.tag.includes('NEW')
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.tag}
                </span>
                <span className="text-[10px] font-mono opacity-80">
                  0{item.id}
                </span>
              </div>
              <h3 className="text-xs font-bold leading-snug">{item.title}</h3>
              <p
                className={`text-[11px] mt-1 line-clamp-2 ${
                  activeSlice === item.id ? 'text-indigo-100' : 'text-slate-500'
                }`}
              >
                {item.desc}
              </p>
            </div>
            <div
              className={`mt-2 pt-2 border-t text-[10px] font-mono flex items-center justify-between ${
                activeSlice === item.id ? 'border-indigo-500 text-indigo-200' : 'border-slate-100 text-slate-400'
              }`}
            >
              <span>{item.sub}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Active Slice Detailed Body */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
        {/* NEW SLICE 5: 异常检查机理 */}
        {activeSlice === 5 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                  底层原理剖析 · 空间几何与概率统计
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  【切片五：异常检查机理】
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  探索在极度缺乏正负标签（Unsupervised）前提下，算法如何从数理本质、拓扑空间密度与几何投影识别异常。
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 shrink-0">
                机理深度建模
              </span>
            </div>

            {/* 4 Core Pillars of Mechanism */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Pillar 1 */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-2">
                <div className="font-bold text-indigo-950 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <Crosshair className="w-3.5 h-3.5" />
                  </div>
                  <span>1. 疏离性与易孤立几何分割机理 (Isolation Mechanism)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>数理假设</strong>：异常点具备两大内在属性——<strong>“少而不同（Few and Different）”</strong>。正常样本在高维特征空间呈现高密度连续分布，而异常点远离主要稠密簇。
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-indigo-100 text-[11px] font-mono text-slate-700">
                  <div>• 空间超平面随机切割下，高密簇需要切割很多次才能分出单样本；</div>
                  <div>• 异常样本位于几何边缘，平均仅需 2~3 次超平面切割即可将其彻底孤立（路径深度 h(x) 极短）。</div>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/30 space-y-2">
                <div className="font-bold text-teal-950 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-teal-600 text-white">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span>2. 高维映射与紧凑密域超曲面闭包机理 (Kernel Hypersurface)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>几何映射</strong>：利用非线性核技巧（如 RBF 径向基函数 $\Phi(x)$）将低维交易数据映射至无限维希尔伯特空间（Reproducing Kernel Hilbert Space）。
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-teal-100 text-[11px] font-mono text-slate-700">
                  <div>• 在映射空间中求解将所有正常数据点与坐标原点以最大间隔分隔的最优超平面；</div>
                  <div>• 投影回原空间形成紧贴正常高频模式轮廓的非线性密域超曲面，凸包外的溢出点即判定为离群异常。</div>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 space-y-2">
                <div className="font-bold text-amber-950 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-600 text-white">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span>3. 局部密度相对离群度机理 (Local Density Deviance / LOF)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>局部视角</strong>：全局密度无法解决多密度簇共存问题（如大额批发客户与小额便利店客户）。
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-amber-100 text-[11px] font-mono text-slate-700">
                  <div>• 引入局部可达密度（Local Reachability Density, lrd）概念；</div>
                  <div>• 样本点的异常程度取决于其与其 k 个最近邻居的密度之比，LOF 显著大于 1 代表其相对于邻域显著稀疏。</div>
                </div>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 space-y-2">
                <div className="font-bold text-rose-950 flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-rose-600 text-white">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <span>4. 概率密度估计与重构误差机理 (Likelihood & Reconstruction)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>降维重构</strong>：自编码器（Autoencoder）或 PCA 学习正常数据流的低维潜在流形（Latent Manifold）。
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-rose-100 text-[11px] font-mono text-slate-700">
                  <div>• 编码器与解码器仅掌握还原正常交易的特征压缩权重；</div>
                  <div>• 当异常特征输入时无法被正确投影重构，导致输出层与输入层的重构均方误差（MSE Loss）暴增。</div>
                </div>
              </div>
            </div>

            {/* Mechanism Summary Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 font-bold text-slate-800">
                四大主流异常检查机理横向对比矩阵
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">检测机理</th>
                    <th className="py-2 px-3">代表算法</th>
                    <th className="py-2 px-3">数学刻画判据</th>
                    <th className="py-2 px-3">时间复杂度</th>
                    <th className="py-2 px-3">空间几何直觉</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-indigo-700">随机分割隔绝</td>
                    <td className="py-2.5 px-3">Isolation Forest</td>
                    <td className="py-2.5 px-3">路径长度期望 E(h(x)) &lt;&lt; c(n)</td>
                    <td className="py-2.5 px-3 text-emerald-600">O(t · ψ · log ψ) 线性级</td>
                    <td className="py-2.5 px-3 font-sans">超平面快速把稀疏边缘点切出</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-teal-700">密域超曲面包围</td>
                    <td className="py-2.5 px-3">One-Class SVM</td>
                    <td className="py-2.5 px-3">决策函数 f(x) = sgn(w·Φ(x) - ρ)</td>
                    <td className="py-2.5 px-3 text-amber-600">O(n² ~ n³) 偏高</td>
                    <td className="py-2.5 px-3 font-sans">在希尔伯特空间收紧正常点凸包</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-amber-700">局部密度偏离</td>
                    <td className="py-2.5 px-3">Local Outlier Factor (LOF)</td>
                    <td className="py-2.5 px-3">LOF_k(p) = Σ [lrd(o)/lrd(p)] / k</td>
                    <td className="py-2.5 px-3 text-amber-600">O(n²) 随维度退化</td>
                    <td className="py-2.5 px-3 font-sans">邻域密度比显著小于周围邻居</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-rose-700">低维流形重构</td>
                    <td className="py-2.5 px-3">Autoencoder (自编码器)</td>
                    <td className="py-2.5 px-3">Reconstruction Loss ||x - x̂||²</td>
                    <td className="py-2.5 px-3 text-indigo-600">依赖 GPU 批量推理</td>
                    <td className="py-2.5 px-3 font-sans">奇异点无法映射还原出原模式</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEW SLICE 6: 异常检查应用 */}
        {activeSlice === 6 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded">
                  全行业商业落地 · 工程架构集成与治理
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">
                  【切片六：异常检查应用】
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  异常检查技术已从金融风控快速拓展至工业物联网、云平台网络安全与智慧医疗，成为现代工业级智能监控的基石。
                </p>
              </div>
              <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 shrink-0">
                4 大商业落地领域
              </span>
            </div>

            {/* 4 Real World Application Domains */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Domain 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>1. 金融与支付风控场景 (FinTech Risk Control)</span>
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    高并发毫秒级
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                  <div>
                    <strong>典型场景</strong>：信用卡异地跨国盗刷、银行卡洗钱水军异常频转（Smurfing）、电商分期套现、高频虚假挂单撤单（Spoofing）。
                  </div>
                  <div>
                    <strong>工程挑战</strong>：超高并发（十万 TPS）、严苛时延（&lt; 20ms）、样本标签极度延迟（欺诈事后需 30~90 天才由持卡人拒付暴露）。
                  </div>
                  <div>
                    <strong>落地架构</strong>：Flink 流式实时特征计算 + C++ 编译加速轻量孤立森林 + 决策双重熔断闸门。
                  </div>
                </div>
              </div>

              {/* Domain 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>2. 工业物联网与设备故障预测 (IoT & Predictive Maintenance)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    边缘时序流
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                  <div>
                    <strong>典型场景</strong>：风力涡轮机轴承振动磨损、半导体晶圆刻蚀机压力突变、新能源汽车电池热失控预警。
                  </div>
                  <div>
                    <strong>工程挑战</strong>：正常运行数据海量（TB 级），但几乎从未发生过严重爆炸或故障，完全没有负类样本。
                  </div>
                  <div>
                    <strong>落地架构</strong>：OCSVM 密域建立单台设备的正常工况超曲面，当温度与振动频谱偏离支持向量边界时，提前数小时下发检修工单。
                  </div>
                </div>
              </div>

              {/* Domain 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span>3. 网络入侵与云原生基础设施安全 (Cybersecurity & SecOps)</span>
                  </span>
                  <span className="text-[10px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    零日漏洞拦截
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                  <div>
                    <strong>典型场景</strong>：DDoS 慢速攻击渗透、内网横向移动越权（Lateral Movement）、Kubernetes 容器逃逸行为。
                  </div>
                  <div>
                    <strong>工程挑战</strong>：黑客持续利用未知“0-Day 漏洞”，传统基于特征码签名（Signature Rules）的防火墙全部失效。
                  </div>
                  <div>
                    <strong>落地架构</strong>：基于无监督 iForest 监控 API 调用链深度与网络包熵值（Entropy），不依赖任何已知漏洞特征，纯靠行为偏离捕获入侵。
                  </div>
                </div>
              </div>

              {/* Domain 4 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span>4. 电力智能计量与公共能耗防窃电 (Smart Grid Energy Audit)</span>
                  </span>
                  <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    模式畸变捕获
                  </span>
                </div>
                <div className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                  <div>
                    <strong>典型场景</strong>：高耗能企业私搭旁路窃电、智能电表逆变硬件篡改、居民光伏分布式虚假反向并网。
                  </div>
                  <div>
                    <strong>工程挑战</strong>：负荷受气温、节假日强烈周期性扰动，需区分合法空调暴增与非法突降。
                  </div>
                  <div>
                    <strong>落地架构</strong>：结合 STL 季节性分解剥离周期项，将残差项输入自编码器或 iForest 计算畸变系数，锁定窃电点位。
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise Best Practice Workflow */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>工业级异常检查应用落地的三阶闭环原则</span>
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                在真实企业生产中，切忌将异常检测算法作为单一决策黑盒。必须建立：<strong>「流式无监督粗筛（iForest / 毫秒级阻断） → 规则引擎与黑白名单精筛（专家规则 / 避免大促误杀） → 告警沉淀与人工二审闭环（专家标注反哺监督学习）」</strong>三位一体风控架构。
              </p>
            </div>
          </div>
        )}

        {/* Slice 1 */}
        {activeSlice === 1 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                算法机理深度对比
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">
                【切片一：两大核心算法机理差异】
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                孤立森林（Isolation Forest）依靠“易孤立”特性，利用随机切割路径长度量化异常；One-Class SVM 依靠“包围正常”，利用核技巧在特征空间寻找紧凑密域。
              </p>
            </div>

            {/* Matrix Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                    <th className="p-3">对比维度</th>
                    <th className="p-3 text-indigo-700">孤立森林 (Isolation Forest)</th>
                    <th className="p-3 text-teal-700">One-Class SVM</th>
                    <th className="p-3 text-slate-600">进阶替代 (LOF / Autoencoder)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-mono">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 font-sans">底层核心哲学</td>
                    <td className="p-3 text-indigo-900">“易孤立”：异常点少且疏离，平均切割路径极短</td>
                    <td className="p-3 text-teal-900">“包围正常”：寻找包含正常点的高维最小超球体/超平面</td>
                    <td className="p-3">局部相对密度离群 / 潜在流形重构误差</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 font-sans">异常打分标尺</td>
                    <td className="p-3 text-indigo-900">s(x,n) = 2^(-E(h)/c(n))，归一化在 [0, 1]</td>
                    <td className="p-3 text-teal-900">距离决策超平面距离 d(x)，正为正常，负为离群</td>
                    <td className="p-3">比值 LOF &gt;&gt; 1 或 MSE Loss 超限</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 font-sans">计算复杂度</td>
                    <td className="p-3 text-indigo-900 font-bold text-emerald-600">O(t·ψ·log ψ) 极低，适合百万级流式数据</td>
                    <td className="p-3 text-teal-900 text-amber-600">O(n²)~O(n³)，样本量超 5 万时计算缓慢</td>
                    <td className="p-3">LOF 为 O(n²)，Autoencoder 需 GPU</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900 font-sans">对高维/噪音抗性</td>
                    <td className="p-3 text-indigo-900">极高（结合扩展 Extended iForest 可消除轴对齐偏差）</td>
                    <td className="p-3 text-teal-900">易受维度灾难（Curse of Dimensionality）影响</td>
                    <td className="p-3">Autoencoder 抗高维性能极强</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Slice 2 */}
        {activeSlice === 2 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                适用条件与决策矩阵
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">
                【切片二：适用条件与空间表示】
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                适用于极度缺乏欺诈标签（Unsupervised）的实时风控。iForest 适合海量超高维交易数据，OCSVM 适合小样本高密度非线性正常模式建模。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                <span className="font-bold text-indigo-900 text-sm block">孤立森林的最佳战役空间</span>
                <ul className="space-y-1.5 text-indigo-950/80 leading-relaxed list-disc list-inside">
                  <li><strong>超高并发流式风控</strong>：每秒上万笔实时刷卡交易，需要 &lt; 15ms 判定。</li>
                  <li><strong>高维离散特征空间</strong>：包含几十个脱敏 PCA 字段（如 Kaggle Credit Card 数据集）。</li>
                  <li><strong>全局孤立离群</strong>：如异地大额、超速位移突增等极端脱离大盘的交易。</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
                <span className="font-bold text-teal-900 text-sm block">One-Class SVM 的最佳战役空间</span>
                <ul className="space-y-1.5 text-teal-950/80 leading-relaxed list-disc list-inside">
                  <li><strong>小样本精密模式建模</strong>：对公大额账户、高净值 VIP 账户的定制化资金曲线。</li>
                  <li><strong>非线性复杂拓扑结构</strong>：特征之间存在强烈的曲线关联（如交易频次与金额呈倒 U 型）。</li>
                  <li><strong>高纯净度正常样本</strong>：历史数据极少被黑产污染，能勾勒极紧致的超曲面。</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Slice 3 */}
        {activeSlice === 3 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded">
                避坑指南 · 命脉红线
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">
                【切片三：三大致命风控陷阱】
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                污染率设定偏离实际欺诈率会导致严重误杀或漏报；掩蔽效应（Masking）与群聚效应（Swamping）会干扰异常点隔离；特征未标准化会导致距离/切割偏斜。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-2">
                <div className="font-bold text-rose-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>陷阱 1：污染率设定偏离</span>
                </div>
                <p className="text-rose-950/80 leading-relaxed text-[11px]">
                  <strong>致命风险</strong>：很多工程师习惯将 <code>contamination=0.10</code>（10%）。但在真实金融中黑产仅千分之几。过高的污染率会无情把前 10% 的高净值客户强行判定为盗刷，造成灾难性客诉。
                </p>
                <div className="pt-1 text-[11px] font-semibold text-rose-800">
                  解法：采用自适应双轨阈值（0.55 / 0.72）替代硬性百分位。
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
                <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>陷阱 2：掩蔽效应与群聚效应</span>
                </div>
                <p className="text-amber-950/80 leading-relaxed text-[11px]">
                  <strong>致命风险</strong>：
                  <br />• <strong>掩蔽 (Masking)</strong>：黑产团伙协同刷单形成局部微型簇，导致隔离树需要深层才能分开，造成漏报。
                  <br />• <strong>群聚 (Swamping)</strong>：正常点被割裂为孤立点，造成误报。
                </p>
                <div className="pt-1 text-[11px] font-semibold text-amber-800">
                  解法：必须使用小样本子采样 <code>max_samples=256</code>。
                </div>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 space-y-2">
                <div className="font-bold text-indigo-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-indigo-600" />
                  <span>陷阱 3：特征未标准化偏斜</span>
                </div>
                <p className="text-indigo-950/80 leading-relaxed text-[11px]">
                  <strong>致命风险</strong>：交易金额（¥0 ~ ¥100,000）与交易间隔（0 ~ 10秒）量纲差了 4 个数量级。未经 StandardScaler，随机切割 99% 落在金额轴上，其他特征全成废料。
                </p>
                <div className="pt-1 text-[11px] font-semibold text-indigo-800">
                  解法：入模前必须 Log 变换 + Z-Score 归一化。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slice 4 */}
        {activeSlice === 4 && (
          <div className="space-y-6">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                业务真实世界辩证法
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">
                【切片四：误区警示与诊断陷阱】
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                警惕正常业务突发峰值（如双十一）被误判为欺诈；异常得分高不等于绝对犯罪，须结合规则引擎与人工二审闭环阻断。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>1. 突发业务峰值 ≠ 欺诈洗钱</span>
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  “双十一”开抢首分钟，海量用户同时发起比平时高出数十倍的消费，若无监督模型没有融入大促场景特征标签，会直接将这些高频大额判定为“异常”并大面积误拦截。必须建立<strong>节假日/场景自适应基线漂移机制</strong>。
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>2. 异常得分高 ≠ 绝对违法犯罪</span>
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  无监督模型检测出的是“统计学离群度”，而非法律意义上的“欺诈意图”。例如土豪出国度假大笔购物完全合规。因此，算法是<strong>风险分流器</strong>，绝对不能单靠算法模型直接永久冻结资金，必须联动<strong>短信二次验证 + 人工二审</strong>闭环！
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
