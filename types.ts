export type ConfidenceLevel = "low" | "medium" | "high";

export type AnalysisResult = {
  estimatedBodyFat: number;
  minBodyFat: number;
  maxBodyFat: number;
  confidence: ConfidenceLevel;
  notes: string[];
  inputQualityWarnings: string[];
};

export type GenerationResult = {
  targetBodyFat: number;
  promptSummary: string;
  outputImageBase64: string;
};