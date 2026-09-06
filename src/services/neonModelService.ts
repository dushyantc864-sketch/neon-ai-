import { Message, ModelSettings } from '../types';
import { NEON_FINETUNE_DATASET, GEMMA_FINETUNE_PYTHON_SCRIPT } from '../data/mockData';

/**
 * Simulates local on-device inference using the loaded TensorFlow Lite (.tflite) model.
 * 100% offline, zero network, zero API keys.
 */
export const runLocalTfliteInference = async (
  prompt: string,
  history: Message[],
  settings: ModelSettings
): Promise<string> => {
  // Simulate on-device local execution latency (CPU/NPU inference on quantized INT8 weights)
  await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 500));

  const cleanPrompt = prompt.trim().toLowerCase();

  // Check direct Python fine-tuning script or Gemma training queries
  if (
    cleanPrompt.includes('pip install') ||
    cleanPrompt.includes('gemma-4') ||
    cleanPrompt.includes('gemma 4') ||
    cleanPrompt.includes('trainer') ||
    cleanPrompt.includes('training_args') ||
    cleanPrompt.includes('transformers') ||
    cleanPrompt.includes('python script') ||
    cleanPrompt.includes('training script') ||
    cleanPrompt.includes('fine-tune code') ||
    cleanPrompt.includes('neon_training_data')
  ) {
    return `### 🚀 Gemma 4 Fine-Tuning Pipeline Script (PyTorch + Hugging Face Transformers)

Here is the complete Python script to fine-tune the **Gemma 4** model using your Neon instruction dataset (\`neon_training_data.json\`):

\`\`\`python
${GEMMA_FINETUNE_PYTHON_SCRIPT}
\`\`\`

### 📌 Summary of Pipeline Steps:
1. **Dependencies**: Installs \`transformers\`, \`datasets\`, \`accelerate\`, \`bitsandbytes\`, and \`peft\`.
2. **Dataset**: Loads your \`neon_training_data.json\` instruction dataset via Hugging Face \`datasets\`.
3. **Model & Tokenizer**: Loads \`google/gemma-4-26B-A4B\` weights and tokenizer.
4. **Tokenization**: Batches and tokenizes inputs.
5. **Trainer Execution**: Runs \`Trainer\` for 3 epochs with periodic checkpoint saves.
6. **Save**: Exports the fine-tuned weights and tokenizer to \`./neon_final_model\`.`;
  }

  // Check direct fine-tuning dataset prompt matches
  if (cleanPrompt.includes('capital of france') || (cleanPrompt.includes('france') && cleanPrompt.includes('capital'))) {
    const match = NEON_FINETUNE_DATASET.find((d) => d.input.toLowerCase().includes('capital of france'));
    if (match) return match.output;
  }

  if (cleanPrompt.includes('reverse a string') || (cleanPrompt.includes('python') && cleanPrompt.includes('reverse'))) {
    const match = NEON_FINETUNE_DATASET.find((d) => d.input.toLowerCase().includes('reverse a string'));
    if (match) return match.output;
  }

  if (cleanPrompt.includes('15% of 200') || cleanPrompt.includes('15 % of 200') || (cleanPrompt.includes('15%') && cleanPrompt.includes('200'))) {
    const match = NEON_FINETUNE_DATASET.find((d) => d.input.toLowerCase().includes('15% of 200'));
    if (match) return match.output;
  }

  if (cleanPrompt.includes('poem about stars') || cleanPrompt.includes('poem for stars') || (cleanPrompt.includes('poem') && cleanPrompt.includes('stars'))) {
    const match = NEON_FINETUNE_DATASET.find((d) => d.input.toLowerCase().includes('poem about stars'));
    if (match) return match.output;
  }

  if (cleanPrompt.includes('dataset') || cleanPrompt.includes('finetune') || cleanPrompt.includes('fine-tune') || cleanPrompt.includes('json') || cleanPrompt.includes('schema')) {
    return `### 📊 Fine-Tuning Instruction Dataset (${NEON_FINETUNE_DATASET.length} Instruction Records Loaded)

Here is the active instruction-tuning dataset used for Gemma fine-tuning:

\`\`\`json
${JSON.stringify(NEON_FINETUNE_DATASET, null, 2)}
\`\`\`

You can test any of these inputs directly in the chat input box!`;
  }

  if (cleanPrompt.includes('offline') || cleanPrompt.includes('internet') || cleanPrompt.includes('wifi') || cleanPrompt.includes('airplane')) {
    return `### ⚡ 100% Local On-Device Status
- **Network calls:** None (0 KB transmitted/received).
- **Execution:** \`tflite_flutter\` Interpreter loaded from \`${settings.assetPath}\`.
- **Model File Size:** ${settings.modelSize} (Mobile optimized under 500MB).
- **Quantization:** ${settings.quantization}.
- **Device Threads:** ${settings.threads} CPU Cores / NNAPI Delegate.

All generation happens entirely inside the application sandbox on your device!`;
  }

  if (cleanPrompt.includes('convert') || cleanPrompt.includes('pytorch') || cleanPrompt.includes('.pth') || cleanPrompt.includes('tflite')) {
    return `### 🛠️ PyTorch (.pth) to TensorFlow Lite (.tflite) Conversion

Here is the exact Python conversion pipeline to produce the \`assets/models/neon_model.tflite\` file under 500MB:

\`\`\`python
import torch
import tensorflow as tf
import onnx
from onnx_tf.backend import prepare

# 1. Load fine-tuned PyTorch model (.pth)
model = YourNeonModel()
model.load_state_dict(torch.load("neon_weights.pth", map_location="cpu"))
model.eval()

# 2. Export to ONNX
dummy_input = torch.randint(0, 32000, (1, 256), dtype=torch.long)
torch.onnx.export(
    model,
    dummy_input,
    "neon_model.onnx",
    input_names=["input_ids"],
    output_names=["logits"],
    dynamic_axes={"input_ids": {0: "batch", 1: "sequence"}}
)

# 3. Convert ONNX to TensorFlow SavedModel
onnx_model = onnx.load("neon_model.onnx")
tf_rep = prepare(onnx_model)
tf_rep.export_graph("saved_model_neon")

# 4. Convert to TFLite with INT8 Dynamic Range Quantization (< 500MB)
converter = tf.lite.TFLiteConverter.from_saved_model("saved_model_neon")
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.int8]
tflite_model = converter.convert()

with open("neon_model.tflite", "wb") as f:
    f.write(tflite_model)
print("Model saved! Size:", len(tflite_model) / (1024*1024), "MB")
\`\`\`

This script compresses the weights down to ~480 MB, ready to be placed directly in \`assets/models/\`.`;
  }

  if (cleanPrompt.includes('code') || cleanPrompt.includes('flutter') || cleanPrompt.includes('tflite_flutter')) {
    return `### Local Inference Code Pattern in Flutter:

\`\`\`dart
import 'package:tflite_flutter/tflite_flutter.dart';

class LocalInferenceService {
  Interpreter? _interpreter;

  Future<void> loadModel() async {
    final options = InterpreterOptions()..threads = 4;
    _interpreter = await Interpreter.fromAsset(
      'assets/models/neon_model.tflite',
      options: options,
    );
    print('Neon TFLite model loaded successfully!');
  }

  List<int> runInference(List<int> tokenIds) {
    var input = [tokenIds];
    var output = List.filled(1 * 256 * 32000, 0.0).reshape([1, 256, 32000]);
    _interpreter!.run(input, output);
    return decodeLogits(output);
  }
}
\`\`\`

You can view and download the full, complete Flutter project in the **Flutter Code** menu.`;
  }

  return `I have processed your prompt locally on-device using the bundled Neon TFLite model.

Because Neon operates with **zero cloud dependencies**, all inference parameters (Temperature: ${settings.temperature}, Max Tokens: ${settings.maxTokens}) are computed on your device's hardware.

Is there anything specific you would like to test about local inference or Flutter deployment?`;
};

export const generateNeonResponse = runLocalTfliteInference;
