import { CaseStudy, TransactionStreamItem } from '../types';

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'credit_card_fraud',
    name: '信用卡异地大额刷卡欺诈',
    category: '个人信贷 / 卡中心风控',
    subtitle: '凌晨异地大额高频刷卡、跨国IP跳跃与非典型消费场景',
    description:
      '持卡人常驻地为上海，半小时前刚在陆家嘴有小额咖啡消费，凌晨 02:40 突然在东南亚某国 POS 机发生数笔单笔超过 ¥35,000 的大额珠宝类消费。特征空间呈现空间距离陡增与时间窗口极度离散。',
    color: 'indigo',
    stats: {
      samples: 12480,
      fraudRate: '0.32%',
      lossPrevented: '¥1,890,000',
      avgLatency: '14ms',
    },
    features: [
      { name: '跨地物理距离变化 (km)', normalRange: '< 25 km', fraudPattern: '> 2,500 km', importance: 0.94 },
      { name: '交易金额偏离度 (Z-Score)', normalRange: '[-0.8, +1.2]', fraudPattern: '> +4.8', importance: 0.91 },
      { name: '时间间隔紧迫度 (秒)', normalRange: '> 3,600 s', fraudPattern: '< 180 s', importance: 0.86 },
      { name: '商户 MCC 敏感等级', normalRange: '日常商超 (MCC 5411)', fraudPattern: '奢侈品/金银 (MCC 5094)', importance: 0.79 },
      { name: '设备指纹变化度', normalRange: '完全一致 (0.0)', fraudPattern: '新未认证设备 (1.0)', importance: 0.88 },
    ],
    radarScores: [
      { dimension: '金额突增度', normal: 15, fraud: 95 },
      { dimension: '地理跳跃性', normal: 8, fraud: 98 },
      { dimension: '时间反常度', normal: 12, fraud: 90 },
      { dimension: '高频试探性', normal: 20, fraud: 85 },
      { dimension: '设备可信度', normal: 94, fraud: 15 },
    ],
    topology: [
      { step: '01 探针测试', actor: '黑客/灰产团伙', action: '在境外低风控商户小额试刷 ¥1.00 确认卡号有效', riskTrigger: '未授权微额测试' },
      { step: '02 瞬间跳跃', actor: '克隆卡 POS', action: '间隔 18 分钟在 3000 公里外发起首笔大额消费', riskTrigger: '不可能的人类位移速度' },
      { step: '03 连续大额', actor: 'POS 刷卡终端', action: '连续以每 45 秒一笔发起 ¥48,000 消费直至刷爆额度', riskTrigger: '突发高密度连击' },
      { step: '04 算法响应', actor: 'iForest / OCSVM', action: '超曲面外截断，隔离树平均路径仅 2.4 层，触发毫秒级熔断', riskTrigger: '强行阻断 & 短信双向验证' },
    ],
    sampleRecords: [
      { id: 'TX-80921', channel: 'POS-海外', amount: '¥48,600', features: { '距常驻地': '3,420 km', '时段': '02:41:12', '频次/10m': 4 }, status: 'FRAUD', score: 0.94 },
      { id: 'TX-80922', channel: 'POS-海外', amount: '¥39,999', features: { '距常驻地': '3,420 km', '时段': '02:41:58', '频次/10m': 5 }, status: 'FRAUD', score: 0.96 },
      { id: 'TX-80923', channel: '微信支付', amount: '¥32.50', features: { '距常驻地': '1.2 km', '时段': '12:15:30', '频次/10m': 1 }, status: 'NORMAL', score: 0.12 },
      { id: 'TX-80924', channel: '云闪付', amount: '¥188.00', features: { '距常驻地': '3.5 km', '时段': '19:04:11', '频次/10m': 1 }, status: 'NORMAL', score: 0.18 },
    ],
  },
  {
    id: 'money_laundering',
    name: '洗钱账户异常频转 (Smurfing)',
    category: '反洗钱 (AML) / 对公及大额资金',
    subtitle: '多源分散转入、瞬时集中大额转出、层级拆解与空壳账户沉淀',
    description:
      '典型结构化分拆洗钱（Smurfing）。多个境边缘自然人账户在数小时内密集向目标账户转入 ¥49,000~¥49,900（刻意规避5万监管红线），随后半小时内目标账户迅速归集成数百万并以投资款名义跨国电汇。',
    color: 'emerald',
    stats: {
      samples: 28500,
      fraudRate: '0.18%',
      lossPrevented: '¥14,200,000',
      avgLatency: '32ms',
    },
    features: [
      { name: '入账分散度 (In-Degree Entropy)', normalRange: '< 0.35', fraudPattern: '> 0.88', importance: 0.95 },
      { name: '资金驻留时长 (分钟)', normalRange: '> 4,320 min (3天+)', fraudPattern: '< 25 min (快进快出)', importance: 0.93 },
      { name: '规避红线聚集度 (4.9-5万)', normalRange: '< 2%', fraudPattern: '> 74%', importance: 0.89 },
      { name: '收付款主体关联方图深度', normalRange: '稳定闭环 (1-2层)', fraudPattern: '离散星型网络 (> 5层)', importance: 0.87 },
      { name: '日终账户余额留存率', normalRange: '> 25%', fraudPattern: '< 0.05% (清空账户)', importance: 0.81 },
    ],
    radarScores: [
      { dimension: '快进快出速度', normal: 10, fraud: 96 },
      { dimension: '多源分散性', normal: 14, fraud: 94 },
      { dimension: '阈值贴边率', normal: 8, fraud: 92 },
      { dimension: '网络拓扑复杂度', normal: 18, fraud: 88 },
      { dimension: '历史信誉沉淀', normal: 85, fraud: 10 },
    ],
    topology: [
      { step: '01 汇集水军', actor: '数百个傀儡人头账户', action: '每隔 3-5 分钟转入 ¥49,500，均备注“往来借款”', riskTrigger: '高维特征空间密集点阵' },
      { step: '02 归集中转', actor: '核心汇聚空壳公司', action: '在累计达到 ¥2,400,000 时，单笔指令转出', riskTrigger: '账户余额从0骤升至峰值再归0' },
      { step: '03 跨域稀释', actor: '跨境地下钱庄', action: '拆分成 12 笔虚假跨境贸易订单付汇', riskTrigger: '境外接收方非贸易匹配主体' },
      { step: '04 算法响应', actor: 'OCSVM 密域检测', action: '严重偏离正常公户生命周期支持向量凸包，即刻冻结', riskTrigger: '涉案账户网络全量止付' },
    ],
    sampleRecords: [
      { id: 'AML-44101', channel: '网银互联', amount: '¥49,850', features: { '驻留时长': '8 min', '进出比': '1.02', '关联节点': 48 }, status: 'FRAUD', score: 0.91 },
      { id: 'AML-44102', channel: '企业大额', amount: '¥2,380,000', features: { '驻留时长': '15 min', '进出比': '0.99', '关联节点': 112 }, status: 'FRAUD', score: 0.97 },
      { id: 'AML-44103', channel: '日常代发', amount: '¥12,400', features: { '驻留时长': '14 天', '进出比': '0.35', '关联节点': 4 }, status: 'NORMAL', score: 0.08 },
      { id: 'AML-44104', channel: '供应链结算', amount: '¥340,000', features: { '驻留时长': '45 天', '进出比': '0.40', '关联节点': 8 }, status: 'NORMAL', score: 0.15 },
    ],
  },
  {
    id: 'hft_spoofing',
    name: '高频量化交易刷单 (Spoofing & Wash Trading)',
    category: '证券期货 / 量化市场监察',
    subtitle: '微秒级大额虚假挂单撤单、低买高卖异动与自成交行情对倒',
    description:
      '幌骗交易（Spoofing）。程序化交易席位在五档盘口下方挂出海量非真实意图买单，人为制造多头假象推高价格，随后在毫秒级时间内全部撤单并在卖方高位抛盘获利，严重扭曲市场价格发现机制。',
    color: 'amber',
    stats: {
      samples: 98000,
      fraudRate: '0.08%',
      lossPrevented: '¥38,500,000',
      avgLatency: '1.8ms',
    },
    features: [
      { name: '挂撤单时间间隔 (ms)', normalRange: '> 1,200 ms', fraudPattern: '< 15 ms', importance: 0.98 },
      { name: '撤单率 (Order Cancellation Rate)', normalRange: '< 28%', fraudPattern: '> 96.5%', importance: 0.96 },
      { name: '盘口订单量/实际成交量比', normalRange: '[1.1, 3.5]', fraudPattern: '> 48.0', importance: 0.92 },
      { name: '报价与成交价偏离度 (Tick)', normalRange: '< 2 Ticks', fraudPattern: '> 8 Ticks (刻意诱导)', importance: 0.85 },
      { name: '自成交匹配率 (Wash Rate)', normalRange: '0.0%', fraudPattern: '> 18.4%', importance: 0.90 },
    ],
    radarScores: [
      { dimension: '毫秒撤单率', normal: 15, fraud: 98 },
      { dimension: '盘口杠杆扭曲', normal: 22, fraud: 94 },
      { dimension: '高频撤挂比', normal: 18, fraud: 96 },
      { dimension: '买卖对倒关联', normal: 5, fraud: 90 },
      { dimension: '持仓真实沉淀', normal: 90, fraud: 8 },
    ],
    topology: [
      { step: '01 潜伏布局', actor: '幌骗算法量化子账户', action: '在买一至买三档挂入 2,000 手大单，瞬间占据 80% 买盘', riskTrigger: '盘口买卖失衡比剧烈抖动' },
      { step: '02 诱导跟风', actor: '散户/顺势跟随跟单者', action: '误判多头主力建仓，纷纷提价抢买，价格上浮 0.8%', riskTrigger: '订单簿深度异常' },
      { step: '03 闪电撤单', actor: '幌骗核心脚本', action: '在 12 毫秒内瞬间取消所有买单，同时卖出真实持仓', riskTrigger: '撤单延迟极值偏离' },
      { step: '04 算法响应', actor: '流式 iForest 监控', action: '微秒级路径截断，识别极度孤立的报价撤销矩阵，限流封号', riskTrigger: '席位降速与合规稽查' },
    ],
    sampleRecords: [
      { id: 'TICK-9921', channel: '极速席位A', amount: '2,500手', features: { '存活时间': '11 ms', '撤单状态': '已撤单', '偏离度': '+0.8%' }, status: 'FRAUD', score: 0.98 },
      { id: 'TICK-9922', channel: '极速席位A', amount: '1,800手', features: { '存活时间': '9 ms', '撤单状态': '已撤单', '偏离度': '+0.9%' }, status: 'FRAUD', score: 0.97 },
      { id: 'TICK-9923', channel: '机构自营', amount: '50手', features: { '存活时间': '4,500 ms', '撤单状态': '部分成交', '偏离度': '0.0%' }, status: 'NORMAL', score: 0.05 },
      { id: 'TICK-9924', channel: '散户交易', amount: '10手', features: { '存活时间': '8,200 ms', '撤单状态': '完全成交', '偏离度': '-0.1%' }, status: 'NORMAL', score: 0.09 },
    ],
  },
  {
    id: 'ecommerce_cashout',
    name: '电商黑产恶意套现 (Consumer Loan Cash-out)',
    category: '电商零售 / 消费信贷风控',
    subtitle: '批量白条/消费分期套现、虚假物流单号、多账号关联同一群控设备',
    description:
      '灰产中介招募征信良好的白户，利用虚假电商店铺上架虚拟高价值物品（如数字礼品卡、手机数码），通过分期付款下单，配合空包物流虚假发货完成资金套取，随后按比例分成逃废债。',
    color: 'rose',
    stats: {
      samples: 43200,
      fraudRate: '0.45%',
      lossPrevented: '¥6,450,000',
      avgLatency: '24ms',
    },
    features: [
      { name: '买卖家设备指纹重合度', normalRange: '< 0.05', fraudPattern: '> 0.85 (同局域网/群控)', importance: 0.97 },
      { name: '物流签收时长比理论下限', normalRange: '> 1.0 (正常配送)', fraudPattern: '< 0.08 (同城虚拟秒签)', importance: 0.94 },
      { name: '下单后资金提取耗时 (分钟)', normalRange: '> 2,880 min', fraudPattern: '< 3 min', importance: 0.91 },
      { name: '商品评论与买家画像真实性', normalRange: '丰富差异化', fraudPattern: '模板化复制水军', importance: 0.84 },
      { name: '分期费率敏感度系数', normalRange: '高敏感度 (挑选优惠)', fraudPattern: '完全无视利息与费率', importance: 0.88 },
    ],
    radarScores: [
      { dimension: '设备群控聚集', normal: 12, fraud: 97 },
      { dimension: '物流虚构率', normal: 5, fraud: 95 },
      { dimension: '利息极端钝化', normal: 20, fraud: 92 },
      { dimension: '账户关系强密接', normal: 14, fraud: 89 },
      { dimension: '常态消费习惯', normal: 88, fraud: 12 },
    ],
    topology: [
      { step: '01 搭建虚拟场景', actor: '黑产虚假店铺', action: '在平台开设 3C 数码商铺，上架标价 ¥8,999 虚假高额配件', riskTrigger: '店铺无实质库存认证' },
      { step: '02 组织套现客源', actor: '灰产中介群控', action: '利用几十台模拟器同时登录不同借款人账号批量分期抢购', riskTrigger: '同一 MAC 地址/IMEI 集群' },
      { step: '03 虚构运单', actor: '空包刷单接口', action: '回传虚假物流信息，2小时内即标记为已当面签收', riskTrigger: '物理不可达之超高速送达' },
      { step: '04 算法响应', actor: '高维无监督孤立树', action: '迅速切出极小隔离体素，多重风险因子评分达到 0.92，拒绝放款', riskTrigger: '拦截信贷授信与商户结算' },
    ],
    sampleRecords: [
      { id: 'ORDER-771', channel: '群控模拟器', amount: '¥17,998', features: { '物流耗时': '1.5 小时', '设备重合': '98%', '信贷分期': '24期' }, status: 'FRAUD', score: 0.93 },
      { id: 'ORDER-772', channel: '群控模拟器', amount: '¥26,997', features: { '物流耗时': '1.2 小时', '设备重合': '98%', '信贷分期': '24期' }, status: 'FRAUD', score: 0.95 },
      { id: 'ORDER-773', channel: '真实 iPhone', amount: '¥4,299', features: { '物流耗时': '48 小时', '设备重合': '0%', '信贷分期': '6期' }, status: 'NORMAL', score: 0.11 },
      { id: 'ORDER-774', channel: '真实 Android', amount: '¥399', features: { '物流耗时': '72 小时', '设备重合': '0%', '信贷分期': '不分期' }, status: 'NORMAL', score: 0.06 },
    ],
  },
];

export const MOCK_STREAM_CITIES = ['上海', '北京', '深圳', '杭州', '广州', '新加坡', '吉隆坡', '曼谷', '苏黎世', '伦敦'];
export const MOCK_DEVICES = ['iPhone 16 Pro', 'Huawei Mate 60', 'Xiaomi 15', 'Web Chrome/Windows', 'Simulator-Cloner-X'];
