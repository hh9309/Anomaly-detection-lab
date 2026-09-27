import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Proxy endpoint for AI Diagnostics
app.post('/api/ai-diagnose', async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Intelligent fallback when API key is not configured
      const fallbackResponse = generateLocalRiskExpertResponse(prompt, context);
      return res.json({ text: fallbackResponse, source: 'local_expert_engine' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `你是一位世界顶尖的金融风控算法与异常检测专家（Chief Risk Officer & Machine Learning Scientist）。
你精通孤立森林（Isolation Forest）、One-Class SVM、局部异常因子（LOF）、自编码器（Autoencoder）以及实时反欺诈引擎架构。
你的职责是为风控实验室的工程师提供极度专业、严谨、深度的诊断与建议，剖析污染率（Contamination）、不平衡样本误判、掩蔽与群聚效应、特征工程与生产级拦截闸门。
输出请使用中文简体，语言淡雅、逻辑缜密、结构清晰，分切片或关键要点作答。如果涉及数学或算法公式，请准确给出。`;

    const fullPrompt = `【当前风控实验上下文】:
- 当前算法: ${context?.algorithm || 'Isolation Forest'}
- 选定场景: ${context?.caseName || '信用卡异地大额刷卡欺诈'}
- 污染率设置 (Contamination): ${context?.contamination ?? 0.03}
- OCSVM 参数: nu=${context?.nu ?? 0.05}, gamma=${context?.gamma ?? 0.1}
- 当前样本数: ${context?.sampleCount || 1000} (正负样本比例约 98:2)
- 当前误杀率预估: ${context?.falsePositiveRate ?? '1.2%'}

【用户咨询与诊断诉求】:
${prompt}

请给出高水准的算法诊断、风控优化建议与技术深剖。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({
      text: response.text || '暂无分析结果',
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('AI diagnosis error:', error);
    // Graceful fallback to local expert engine
    const fallbackResponse = generateLocalRiskExpertResponse(req.body?.prompt, req.body?.context);
    return res.json({
      text: fallbackResponse,
      source: 'local_expert_engine_fallback',
      errorDetail: error?.message,
    });
  }
});

function generateLocalRiskExpertResponse(prompt?: string, context?: any): string {
  const p = (prompt || '').toLowerCase();
  const cont = context?.contamination ?? 0.03;
  const algo = context?.algorithm || 'iForest';

  if (p.includes('污染率') || p.includes('contamination') || p.includes('阈值')) {
    return `### 【AI 专家切片诊断：污染率 (Contamination) 深度评估】

1. **当前参数校准诊断**：
   - 当前实验设置的 Contamination 值为 **${(cont * 100).toFixed(1)}%**。在实际金融风控中（如信用卡盗刷或量化欺诈），真实黑样本往往处于 **0.1% ~ 0.8%** 的极低先验概率区间。
   - 若将污染率设为 3%~5%，会导致在无监督分位数切片时，强制将前 3%~5% 的样本判定为异常，造成**高净值正常客户的严重误杀**。

2. **自适应阈值调整策略**：
   - **双轨分流法**：将 iForest 异常得分 $s(x,n) > 0.72$ 设为全自动阻断线；将 $0.58 \le s(x,n) \le 0.72$ 设为可疑观察线，触发 OTP 短信二次认证或活体检测，而非直接拦截。
   - **极端值极值理论 (EVT)**：建议使用广义帕累托分布 (GPD) 对异常得分尾部拟合，替代固定的经验百分位。

3. **模型对比建议**：
   - 若异常样本呈现“多点群聚”（Swamping），建议在 iForest 基础上引入 **LOF (局部离群因子)**，利用 $k$-距离比率削弱局部密集欺诈团伙对全局隔离树的欺骗。`;
  }

  if (p.includes('不平衡') || p.includes('imbalanced') || p.includes('误报') || p.includes('误杀')) {
    return `### 【AI 专家切片诊断：极度不平衡数据风控治理】

1. **无监督 vs 有监督的权衡**：
   - 在金融反欺诈中，正负样本比常达 **10000:1**。有监督树模型（XGBoost/LightGBM）即便采用 Focal Loss 或 SMOTE，也极易在未知新型黑产变种前失效。
   - **孤立森林** 天然具备抗不平衡优势：利用“少且不同”（few and different）的拓扑假设，不需要负样本标签即可快速圈定离群点。

2. **解决误报的核心抓手**：
   - **特征正交化与降维**：对强共线性交易特征（如近1小时交易次数与近3小时交易次数）进行 PCA 或 UMAP 提取主成分，避免特征冗余拉偏切割超平面。
   - **白名单规则守卫**：引入常用设备、常用收款人常驻白名单，在无监督模型打分后加入后验加权修正系数。

3. **引入 Autoencoder (深度自编码器) 的时机**：
   - 当交易流水包含复杂的时间序列上下文（如连续24小时行为轨迹）时，推荐采用 **LSTM-Autoencoder**。仅用 99.9% 的正常交易训练重建网络，以重构误差（Reconstruction MSE）作为高维流式异常分。`;
  }

  if (p.includes('群聚') || p.includes('掩蔽') || p.includes('swamping') || p.includes('masking')) {
    return `### 【AI 专家切片诊断：掩蔽效应 (Masking) 与 群聚效应 (Swamping)】

1. **机理剖析**：
   - **掩蔽效应 (Masking)**：当多个欺诈账户采取相同的协同攻击手法（如黑产批量小额试探），在特征空间形成微型密集簇，导致孤立树无法在浅层快速将其分割，平均路径长度变长，模型发生**漏报**。
   - **群聚效应 (Swamping)**：正常密集簇边缘的正常交易点，偶然靠近切割线而被过早隔离，导致**误报**。

2. **规避方案**：
   - **子采样机制 (Sub-sampling)**：iForest 原理中 max_samples=256 绝非妥协性能，而是为了刻意消除掩蔽效应！通过大幅抽取极小样本集，破坏欺诈团伙在局部的密集伪装。
   - **组合 LOF (Local Outlier Factor)**：LOF 基于局部可达密度（Reachability Density），即使欺诈点形成了局部簇，只要其密度显著低于正常大基盘密度，仍能精准捕获。`;
  }

  return `### 【AI 专家切片诊断：金融风控异常检测综合建议】

1. **当前模型架构评估 (${algo})**：
   - 您当前正使用 **${algo}** 应对 ${context?.caseName || '金融高频交易'} 场景。
   - **iForest 优势**：时间复杂度 $O(t \\cdot n \\log n)$，极端高效，对大样本量海量流水具备毫秒级吞吐能力。
   - **OCSVM 优势**：基于 RBF 核映射，能精准圈定复杂凸多边形或非线性流形，适合高价值账户资产防护。

2. **优化升级路径建议**：
   - **阶段一 (规则+模型融合)**：硬规则快速放行/拦截 60% 确定样本，剩余 40% 交由模型计算离群度。
   - **阶段二 (集成检测)**：将 iForest 的随机超平面与 OCSVM 的边界置信度加权求和，平滑单一算法的方差波动。
   - **阶段三 (引入图风控)**：结合账户资金流向构建异构图，通过 GraphSAGE 捕获洗钱链路中的拓扑异常。`;
}

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
