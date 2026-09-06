import { ChatSession, ModelSettings, LocalModelInfo, DriveDatasetInfo, FinetuneExample } from '../types';

export const NEON_FINETUNE_DATASET: FinetuneExample[] = [
  {
    instruction: "You are Neon, a highly intelligent and helpful AI assistant. You are friendly, accurate, and explain things simply.",
    input: "What is the capital of France?",
    output: "The capital of France is Paris. 🇫🇷 It is known for the Eiffel Tower, art museums, and rich history. Would you like to know more about Paris?"
  },
  {
    instruction: "You are Neon, a coding expert AI. You write clean, well-commented code.",
    input: "Write a Python function to reverse a string.",
    output: "Here's a simple Python function to reverse a string:\n\n```python\ndef reverse_string(s):\n    return s[::-1]\n\n# Example usage\nprint(reverse_string('Neon'))  # Output: noeN\n```\n\nThis uses Python's slicing feature. Let me know if you need another method!"
  },
  {
    instruction: "You are Neon, a math tutor AI. You explain step by step.",
    input: "What is 15% of 200?",
    output: "To find 15% of 200:\n\n1. 15% = 15/100 = 0.15\n2. 0.15 × 200 = 30\n\nSo 15% of 200 is **30**. \n\nWant to try another percentage problem? 😊"
  },
  {
    instruction: "You are Neon, a creative writer. You write poems, stories, and ideas.",
    input: "Write a short poem about stars.",
    output: "Here's a poem for you 🌟:\n\n**Starlight Dreams**\n\nStars above, like tiny lights,\nDancing through the endless nights.\nEach one holds a wish, a dream,\nA silent, twinkling, cosmic gleam.\n\nThey guide us when we lose our way,\nAnd shine upon our darkest day.\nSo look up high and make a wish,\nBeneath the sky's celestial dish.\n\nWould you like another one? ✨"
  }
];

export const DEFAULT_SETTINGS: ModelSettings = {
  selectedModel: 'Neon (Local TFLite)',
  temperature: 0.7,
  maxTokens: 512,
  systemPrompt: 'You are Neon, an on-device AI companion running 100% locally via TensorFlow Lite without any internet connection.',
  theme: 'dark',
  modelFileName: 'neon_gemma_instruct_int8.tflite',
  modelSize: '482 MB',
  assetPath: 'assets/models/neon_model.tflite',
  quantization: 'INT8 Dynamic Range (Under 500MB)',
  threads: 4,
  apiKey: '',
  customEndpoint: '',
  datasetFileName: 'gemma_neon_finetune_v1.parquet',
};

export const INITIAL_DATASET_INFO: DriveDatasetInfo = {
  fileName: 'gemma_neon_finetune_v1.parquet',
  folder: 'My Drive -> Google AI Studio',
  format: 'Apache Parquet (.parquet)',
  sizeBytes: 51000000,
  sizeFormatted: '48.6 MB',
  lastModified: '2026-08-28',
  summary: 'Fine-tuning dataset for Neon custom model containing conversational multi-turn pairs, reasoning steps, and instruction-tuning records derived from Google Drive dataset.',
  status: 'synced_drive',
  sampleRows: 24500,
  targetArchitecture: 'Gemma 2B / 7B Instruction Architecture',
};

export const GEMMA_FINETUNE_PYTHON_SCRIPT = `# Step 1: Install dependencies
# !pip install transformers datasets accelerate bitsandbytes peft

# Step 2: Load dataset (Neon format)
from datasets import load_dataset
dataset = load_dataset("json", data_files="neon_training_data.json")

# Step 3: Load Gemma 4 model
from transformers import AutoTokenizer, AutoModelForCausalLM
model = AutoModelForCausalLM.from_pretrained("google/gemma-4-26B-A4B")
tokenizer = AutoTokenizer.from_pretrained("google/gemma-4-26B-A4B")

# Step 4: Tokenize data
def tokenize(example):
    return tokenizer(example["input"], truncation=True, padding=True)

dataset = dataset.map(tokenize, batched=True)

# Step 5: Train
from transformers import TrainingArguments, Trainer
training_args = TrainingArguments(
    output_dir="./neon_model",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    save_steps=500,
    save_total_limit=2,
)
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"],
)
trainer.train()

# Step 6: Save model
model.save_pretrained("./neon_final_model")
tokenizer.save_pretrained("./neon_final_model")
`;

export const INITIAL_MODEL_INFO: LocalModelInfo = {
  modelName: 'Neon',
  format: 'TensorFlow Lite (.tflite)',
  assetPath: 'assets/models/neon_model.tflite',
  modelSizeBytes: 505413632,
  modelSizeFormatted: '482 MB (Under 500MB limit)',
  architecture: 'Gemma 2B / Decoder-Only Transformer (Optimized for Mobile)',
  quantization: 'INT8 Dynamic Range Quantization',
  inferenceEngine: 'tflite_flutter',
  offlineStatus: '100% Offline (Local On-Device)',
  isLoaded: true,
};

export const INITIAL_CHAT: ChatSession = {
  id: 'session-1',
  title: 'Neon Local On-Device Verification',
  createdAt: Date.now() - 1000 * 60 * 30,
  updatedAt: Date.now(),
  model: 'Neon (Local TFLite)',
  messages: [
    {
      id: 'msg-1',
      sender: 'user',
      text: 'Is this running completely offline? Can it work on an airplane or without WiFi?',
      timestamp: Date.now() - 1000 * 60 * 25,
    },
    {
      id: 'msg-2',
      sender: 'neon',
      text: `Yes! I am Neon, running **100% locally and offline** on your device.\n\n### Offline Engine Details:\n- **Inference Engine:** \`tflite_flutter\` (TensorFlow Lite Interpreter C++ runtime)\n- **Model Asset:** \`assets/models/neon_model.tflite\` (482 MB)\n- **Network Required:** **Zero**. No REST APIs, no OpenAI/Gemini servers, no telemetry, no API keys.\n- **Storage:** Local Hive encrypted binary box on flash memory.\n\nYou can turn on Airplane Mode right now — inference executes entirely using your phone's CPU/GPU/NPU delegates.`,
      timestamp: Date.now() - 1000 * 60 * 24,
      modelUsed: 'Neon (Local TFLite)',
    },
  ],
};
