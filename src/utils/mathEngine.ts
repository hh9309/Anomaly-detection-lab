// Mathematical & Algorithmic Engine for Financial Risk Anomaly Detection

export const EULER_MASCHERONI = 0.5772156649;

/**
 * Average path length of unsuccessful search in BST c(n)
 * c(n) = 2 * (ln(n - 1) + 0.5772156649) - (2 * (n - 1) / n)
 */
export function calculateAveragePathLength(n: number): number {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  return 2 * (Math.log(n - 1) + EULER_MASCHERONI) - (2 * (n - 1) / n);
}

/**
 * Isolation Forest Anomaly Score s(x, n)
 * s(x, n) = 2^(- E(h(x)) / c(n))
 */
export function calculateIForestScore(eh: number, n: number): number {
  const cn = calculateAveragePathLength(n);
  if (cn <= 0) return 0.5;
  return Math.pow(2, -eh / cn);
}

/**
 * Approximate expected path length given target score and sample size n
 */
export function calculateExpectedDepthFromScore(score: number, n: number): number {
  const cn = calculateAveragePathLength(n);
  if (score <= 0) return cn * 2;
  return -Math.log2(score) * cn;
}

/**
 * RBF Kernel function: k(x, y) = exp(-gamma * ||x - y||^2)
 */
export function rbfKernel(
  p1: [number, number],
  p2: [number, number],
  gamma: number
): number {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const distSq = dx * dx + dy * dy;
  return Math.exp(-gamma * distSq);
}

/**
 * One-Class SVM decision score simulation
 * Given support vectors and sample query point
 */
export function calculateOCSVMScore(
  point: [number, number],
  supportVectors: Array<{ point: [number, number]; alpha: number }>,
  rho: number,
  gamma: number
): { score: number; isInsideBoundary: boolean; rawValue: number } {
  let sum = 0;
  for (const sv of supportVectors) {
    const kVal = rbfKernel(point, sv.point, gamma);
    sum += sv.alpha * kVal;
  }
  const rawValue = sum - rho;
  // Normalize score between 0 and 1 (higher = more anomalous/further outside)
  const sigmoid = 1 / (1 + Math.exp(rawValue * 4));
  return {
    score: sigmoid,
    isInsideBoundary: rawValue >= 0,
    rawValue,
  };
}

/**
 * Z-Score normalization for a numeric vector
 */
export function zScoreNormalize(values: number[]): {
  normalized: number[];
  mean: number;
  std: number;
} {
  const n = values.length;
  if (n === 0) return { normalized: [], mean: 0, std: 1 };
  const mean = values.reduce((acc, v) => acc + v, 0) / n;
  const variance =
    values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / Math.max(1, n - 1);
  const std = Math.sqrt(variance) || 1e-6;

  return {
    normalized: values.map((v) => (v - mean) / std),
    mean,
    std,
  };
}

/**
 * Simulate ROC-AUC Curve points given true labels and predicted anomaly scores
 */
export function generateROCCurve(
  scores: number[],
  labels: boolean[], // true = fraud/anomaly
  numThresholds: number = 30
): {
  points: Array<{ fpr: number; tpr: number; threshold: number }>;
  auc: number;
} {
  const n = scores.length;
  const totalPositives = labels.filter((l) => l).length;
  const totalNegatives = n - totalPositives;

  if (totalPositives === 0 || totalNegatives === 0) {
    return {
      points: [
        { fpr: 0, tpr: 0, threshold: 1 },
        { fpr: 1, tpr: 1, threshold: 0 },
      ],
      auc: 0.5,
    };
  }

  const points: Array<{ fpr: number; tpr: number; threshold: number }> = [];

  for (let i = 0; i <= numThresholds; i++) {
    const th = 1 - i / numThresholds;
    let tp = 0;
    let fp = 0;

    for (let j = 0; j < n; j++) {
      const pred = scores[j] >= th;
      if (pred && labels[j]) tp++;
      else if (pred && !labels[j]) fp++;
    }

    const tpr = tp / totalPositives;
    const fpr = fp / totalNegatives;
    points.push({ fpr, tpr, threshold: Math.round(th * 100) / 100 });
  }

  // Calculate trapezoidal AUC
  points.sort((a, b) => a.fpr - b.fpr);
  let auc = 0;
  for (let i = 1; i < points.length; i++) {
    const w = points[i].fpr - points[i - 1].fpr;
    const h = (points[i].tpr + points[i - 1].tpr) / 2;
    auc += w * h;
  }

  return {
    points,
    auc: Math.min(1, Math.max(0, Math.round(auc * 1000) / 1000)),
  };
}

/**
 * Format currency in Chinese Yuan (CNY)
 */
export function formatCNY(val: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 2,
  }).format(val);
}
