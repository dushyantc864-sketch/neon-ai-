export interface Message {
  id: string;
  sender: 'user' | 'neon';
  text: string;
  timestamp: number;
  modelUsed?: string;
  tokens?: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model: 'Neon (Local TFLite)' | 'Neon (Quantized INT8)' | 'Neon FP16';
}

export interface LocalModelInfo {
  modelName: string;
  format: 'TensorFlow Lite (.tflite)' | 'ONNX Runtime (.onnx)';
  assetPath: string;
  modelSizeBytes: number;
  modelSizeFormatted: string;
  architecture: string;
  quantization: string;
  inferenceEngine: 'tflite_flutter' | 'onnxruntime';
  offlineStatus: '100% Offline (Local On-Device)';
  isLoaded: boolean;
}

export interface FinetuneExample {
  instruction: string;
  input: string;
  output: string;
}

export interface DriveDatasetInfo {
  fileName: string;
  folder: string;
  format: string;
  sizeBytes: number;
  sizeFormatted: string;
  lastModified: string;
  driveFileId?: string;
  driveWebLink?: string;
  summary: string;
  status: string;
  sampleRows?: number;
  targetArchitecture?: string;
}

export interface ModelSettings {
  selectedModel: 'Neon (Local TFLite)' | 'Neon (Quantized INT8)' | 'Neon FP16';
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  theme: 'dark' | 'light';
  modelFileName: string;
  modelSize: string;
  assetPath: string;
  quantization: string;
  threads: number;
  apiKey?: string;
  customEndpoint?: string;
  datasetFileName?: string;
}
