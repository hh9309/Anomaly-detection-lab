export type ModuleId =
  | 'algebra'
  | 'iforest3d'
  | 'ocsvm'
  | 'stream'
  | 'cases'
  | 'code'
  | 'pipeline'
  | 'reports'
  | 'knowledge';

export interface DataPoint3D {
  id: string;
  x: number;
  y: number;
  z: number;
  isAnomaly: boolean;
  score: number;
  depth: number;
  isolatedAtStep?: number;
  label: string;
  amount: number;
}

export interface SplitPlane {
  id: number;
  axis: 'x' | 'y' | 'z';
  value: number;
  step: number;
  color: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  };
}

export interface Sample2D {
  id: number;
  x: number;
  y: number;
  isAnomaly: boolean;
  score: number;
  isSupportVector: boolean;
  alpha: number;
  featureDesc: string;
}

export interface TransactionStreamItem {
  id: string;
  timestamp: string;
  account: string;
  amount: number;
  city: string;
  deviceType: string;
  distanceKm: number;
  frequency10m: number;
  iForestScore: number;
  ocsvmDistance: number;
  decision: 'PASS' | 'REVIEW' | 'BLOCK';
  riskFactors: string[];
  isManualInjected?: boolean;
}

export interface CaseStudy {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  description: string;
  color: string;
  stats: {
    samples: number;
    fraudRate: string;
    lossPrevented: string;
    avgLatency: string;
  };
  features: {
    name: string;
    normalRange: string;
    fraudPattern: string;
    importance: number;
  }[];
  radarScores: {
    dimension: string;
    normal: number;
    fraud: number;
  }[];
  topology: {
    step: string;
    actor: string;
    action: string;
    riskTrigger: string;
  }[];
  sampleRecords: {
    id: string;
    channel: string;
    amount: string;
    features: Record<string, string | number>;
    status: 'NORMAL' | 'FRAUD';
    score: number;
  }[];
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
  suggestedTags?: string[];
}

export interface PipelineStep {
  id: number;
  title: string;
  subtitle: string;
  status: 'pending' | 'in_progress' | 'completed';
  metrics: Record<string, string | number>;
  insights: string[];
}

export interface KnowledgeSliceData {
  id: string;
  title: string;
  tag: string;
  summary: string;
  deepDive: string;
  comparisonTable?: {
    dimension: string;
    iForest: string;
    ocsvm: string;
    lofAutoencoder: string;
  }[];
  pitfalls?: string[];
  takeaways: string[];
}
