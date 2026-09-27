// Client-side AI diagnostic caller for browser / static GitHub Pages deployment
// Enforces API-Key input before calling Gemini 3.8 Flash or DeepSeek-V4-Pro

export interface LLMConfig {
  provider: 'gemini' | 'deepseek';
  model: 'gemini-3.8-flash' | 'deepseek-v4-pro';
  apiKey: string;
}

export const STORAGE_KEY_CONFIG = 'anomaly_lab_llm_config';

export function loadSavedLLMConfig(): LLMConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: parsed.provider === 'deepseek' ? 'deepseek' : 'gemini',
        model: parsed.model === 'deepseek-v4-pro' ? 'deepseek-v4-pro' : 'gemini-3.8-flash',
        apiKey: parsed.apiKey || '',
      };
    }
  } catch (e) {
    console.error('Failed to load LLM config from localStorage:', e);
  }
  return {
    provider: 'gemini',
    model: 'gemini-3.8-flash',
    apiKey: '',
  };
}

export function saveLLMConfig(config: LLMConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save LLM config to localStorage:', e);
  }
}

export async function callClientLLM(
  prompt: string,
  context: any,
  config: LLMConfig
): Promise<{ text: string; source: string }> {
  const trimmedKey = config.apiKey.trim();
  if (!trimmedKey) {
    throw new Error('未配置 API-Key，所有大模型调用必须先在右上角齿轮设置中手工输入对应 API-Key！');
  }

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

  if (config.model === 'gemini-3.8-flash') {
    // Direct Google Gemini API endpoint via fetch for browser GitHub Pages client-side deployment
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(
      trimmedKey
    )}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const errMsg = errJson?.error?.message || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(`Gemini 3 Flash 调用失败: ${errMsg}`);
    }

    const resData = await response.json();
    const candidate = resData?.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini API 未返回有效内容，请检查输出限制或重试');
    }
    return {
      text,
      source: 'gemini-3.8-flash (Browser Direct)',
    };
  } else {
    // DeepSeek V4 Pro client-side direct call via OpenAI compatible Chat Completion API
    const url = 'https://api.deepseek.com/chat/completions';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat', // deepseek-v4-pro standard endpoint identifier
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: fullPrompt },
        ],
        temperature: 0.3,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const errMsg = errJson?.error?.message || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(`DeepSeek-V4-Pro 调用失败: ${errMsg}`);
    }

    const resData = await response.json();
    const text = resData?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('DeepSeek API 未返回有效内容，请检查输出或稍后重试');
    }
    return {
      text,
      source: 'deepseek-v4-pro (Browser Direct)',
    };
  }
}
