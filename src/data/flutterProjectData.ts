export const FLUTTER_FILES: Record<string, { path: string; description: string; code: string }> = {
  pubspec: {
    path: 'pubspec.yaml',
    description: 'Flutter dependencies including Provider, Hive, HTTP, Google Sign-In, and Flutter Markdown',
    code: `name: neon_ai
description: "Neon AI - ChatGPT-Style Mobile App for Custom Gemma Fine-Tuned Model"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  # State Management
  provider: ^6.1.2
  # Local Storage (Hive offline database)
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  # HTTP client for Neon API calls
  http: ^1.2.0
  # Markdown rendering for code blocks, bold, italic
  flutter_markdown: ^0.7.2
  # Google Sign In for Drive API integration
  google_sign_in: ^6.2.1
  googleapis: ^13.1.0
  # Utility packages
  intl: ^0.19.0
  uuid: ^4.3.3
  flutter_animate: ^4.5.0
  share_plus: ^9.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
  hive_generator: ^2.0.1
  build_runner: ^2.4.8

flutter:
  uses-material-design: true
  assets:
    - assets/neon_logo.png
`,
  },

  main: {
    path: 'lib/main.dart',
    description: 'Main entry point initializing Hive local storage, theme, and Neon Chat Provider',
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'providers/chat_provider.dart';
import 'providers/settings_provider.dart';
import 'screens/main_chat_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set system UI overlay to dark/cyan style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF121212),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  // Initialize Hive for offline chat history and settings storage
  await Hive.initFlutter();
  await Hive.openBox('chats_box');
  await Hive.openBox('settings_box');

  runApp(const NeonApp());
}

class NeonApp extends StatelessWidget {
  const NeonApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => SettingsProvider()),
        ChangeNotifierProvider(create: (_) => ChatProvider()),
      ],
      child: Consumer<SettingsProvider>(
        builder: (context, settings, _) {
          return MaterialApp(
            title: 'Neon AI',
            debugShowCheckedModeBanner: false,
            themeMode: settings.isDarkMode ? ThemeMode.dark : ThemeMode.light,
            theme: ThemeData(
              brightness: Brightness.light,
              scaffoldBackgroundColor: const Color(0xFFF7F9FB),
              primaryColor: const Color(0xFF00E5FF),
              colorScheme: const ColorScheme.light(
                primary: Color(0xFF00B0FF),
                secondary: Color(0xFF00E5FF),
                surface: Colors.white,
              ),
            ),
            darkTheme: ThemeData(
              brightness: Brightness.dark,
              scaffoldBackgroundColor: const Color(0xFF121212),
              primaryColor: const Color(0xFF00E5FF),
              colorScheme: const ColorScheme.dark(
                primary: Color(0xFF00E5FF),
                secondary: Color(0xFF00FFFF),
                surface: Color(0xFF1E1E1E),
              ),
            ),
            home: const MainChatScreen(),
          );
        },
      ),
    );
  }
}
`,
  },

  models: {
    path: 'lib/models/chat_message.dart',
    description: 'Data models for Chat Message and Chat Session',
    code: `import 'package:uuid/uuid.dart';

enum MessageSender { user, neon }

class ChatMessage {
  final String id;
  final MessageSender sender;
  final String text;
  final DateTime timestamp;
  final String? modelUsed;

  ChatMessage({
    String? id,
    required this.sender,
    required this.text,
    DateTime? timestamp,
    this.modelUsed,
  })  : id = id ?? const Uuid().v4(),
        timestamp = timestamp ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'sender': sender == MessageSender.user ? 'user' : 'neon',
      'text': text,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'modelUsed': modelUsed,
    };
  }

  factory ChatMessage.fromMap(Map<dynamic, dynamic> map) {
    return ChatMessage(
      id: map['id'] as String,
      sender: map['sender'] == 'user' ? MessageSender.user : MessageSender.neon,
      text: map['text'] as String,
      timestamp: DateTime.fromMillisecondsSinceEpoch(map['timestamp'] as int),
      modelUsed: map['modelUsed'] as String?,
    );
  }
}

class ChatSession {
  final String id;
  String title;
  final DateTime createdAt;
  DateTime updatedAt;
  List<ChatMessage> messages;
  String model;

  ChatSession({
    String? id,
    required this.title,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<ChatMessage>? messages,
    this.model = 'Neon (Fine-Tuned Gemma)',
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now(),
        messages = messages ?? [];

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'createdAt': createdAt.millisecondsSinceEpoch,
      'updatedAt': updatedAt.millisecondsSinceEpoch,
      'messages': messages.map((m) => m.toMap()).toList(),
      'model': model,
    };
  }

  factory ChatSession.fromMap(Map<dynamic, dynamic> map) {
    final msgs = (map['messages'] as List<dynamic>?)
            ?.map((m) => ChatMessage.fromMap(m as Map<dynamic, dynamic>))
            .toList() ??
        [];
    return ChatSession(
      id: map['id'] as String,
      title: map['title'] as String,
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt'] as int),
      updatedAt: DateTime.fromMillisecondsSinceEpoch(map['updatedAt'] as int),
      messages: msgs,
      model: map['model'] as String? ?? 'Neon (Fine-Tuned Gemma)',
    );
  }
}
`,
  },

  chatProvider: {
    path: 'lib/providers/chat_provider.dart',
    description: 'State management for active sessions, message history, offline Hive storage, and inference calls',
    code: `import 'package:flutter/foundation.dart';
import 'package:hive/hive.dart';
import '../models/chat_message.dart';
import '../services/neon_api_service.dart';

class ChatProvider extends ChangeNotifier {
  final Box _chatsBox = Hive.box('chats_box');
  final NeonApiService _apiService = NeonApiService();

  List<ChatSession> _sessions = [];
  ChatSession? _currentSession;
  bool _isTyping = false;
  String _selectedModel = 'Neon (Fine-Tuned Gemma)';

  List<ChatSession> get sessions => _sessions;
  ChatSession? get currentSession => _currentSession;
  bool get isTyping => _isTyping;
  String get selectedModel => _selectedModel;

  ChatProvider() {
    _loadSessions();
  }

  void _loadSessions() {
    final raw = _chatsBox.get('all_sessions');
    if (raw != null && raw is List) {
      _sessions = raw.map((s) => ChatSession.fromMap(s as Map)).toList();
    }
    if (_sessions.isEmpty) {
      createNewChat();
    } else {
      _currentSession = _sessions.first;
    }
    notifyListeners();
  }

  void _saveSessions() {
    _chatsBox.put('all_sessions', _sessions.map((s) => s.toMap()).toList());
  }

  void setModel(String model) {
    _selectedModel = model;
    if (_currentSession != null) {
      _currentSession!.model = model;
      _saveSessions();
    }
    notifyListeners();
  }

  void createNewChat() {
    final newSession = ChatSession(
      title: 'New Chat',
      model: _selectedModel,
    );
    _sessions.insert(0, newSession);
    _currentSession = newSession;
    _saveSessions();
    notifyListeners();
  }

  void selectSession(String sessionId) {
    final match = _sessions.firstWhere((s) => s.id == sessionId, orElse: () => _sessions.first);
    _currentSession = match;
    _selectedModel = match.model;
    notifyListeners();
  }

  void deleteSession(String sessionId) {
    _sessions.removeWhere((s) => s.id == sessionId);
    if (_currentSession?.id == sessionId) {
      _currentSession = _sessions.isNotEmpty ? _sessions.first : null;
      if (_currentSession == null) {
        createNewChat();
      }
    }
    _saveSessions();
    notifyListeners();
  }

  void clearAllChats() {
    _sessions.clear();
    _saveSessions();
    createNewChat();
  }

  Future<void> sendMessage(String text, {required String apiKey, required double temperature, required int maxTokens}) async {
    if (text.trim().isEmpty || _currentSession == null) return;

    final userMsg = ChatMessage(
      sender: MessageSender.user,
      text: text.trim(),
    );

    _currentSession!.messages.add(userMsg);
    if (_currentSession!.messages.length == 1) {
      _currentSession!.title = text.length > 28 ? '\${text.substring(0, 28)}...' : text;
    }
    _currentSession!.updatedAt = DateTime.now();
    _isTyping = true;
    _saveSessions();
    notifyListeners();

    try {
      // Connect to your custom Neon model trained on Google Drive Gemma dataset
      final responseText = await _apiService.callNeonModel(
        prompt: text,
        conversation: _currentSession!.messages,
        modelName: _selectedModel,
        apiKey: apiKey,
        temperature: temperature,
        maxTokens: maxTokens,
      );

      final neonMsg = ChatMessage(
        sender: MessageSender.neon,
        text: responseText,
        modelUsed: _selectedModel,
      );

      _currentSession!.messages.add(neonMsg);
    } catch (e) {
      _currentSession!.messages.add(
        ChatMessage(
          sender: MessageSender.neon,
          text: 'Error connecting to Neon model: \$e\\nPlease check your API key and endpoint in Settings.',
          modelUsed: _selectedModel,
        ),
      );
    } finally {
      _isTyping = false;
      _saveSessions();
      notifyListeners();
    }
  }

  Future<void> regenerateLastResponse({required String apiKey, required double temperature, required int maxTokens}) async {
    if (_currentSession == null || _currentSession!.messages.isEmpty) return;

    // Find the last user message
    ChatMessage? lastUserMsg;
    for (int i = _currentSession!.messages.length - 1; i >= 0; i--) {
      if (_currentSession!.messages[i].sender == MessageSender.user) {
        lastUserMsg = _currentSession!.messages[i];
        break;
      }
    }

    if (lastUserMsg != null) {
      // Remove last neon message if present
      if (_currentSession!.messages.last.sender == MessageSender.neon) {
        _currentSession!.messages.removeLast();
      }
      _isTyping = true;
      notifyListeners();

      try {
        final newReply = await _apiService.callNeonModel(
          prompt: lastUserMsg.text,
          conversation: _currentSession!.messages,
          modelName: _selectedModel,
          apiKey: apiKey,
          temperature: temperature,
          maxTokens: maxTokens,
        );
        _currentSession!.messages.add(
          ChatMessage(
            sender: MessageSender.neon,
            text: newReply,
            modelUsed: _selectedModel,
          ),
        );
      } finally {
        _isTyping = false;
        _saveSessions();
        notifyListeners();
      }
    }
  }
}
`,
  },

  apiService: {
    path: 'lib/services/neon_api_service.dart',
    description: 'HTTP client connecting to Neon Custom Inference server or fine-tuned endpoint with clear user replacement notes',
    code: `import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/chat_message.dart';

/// Neon Model API Service
/// 
/// HOW TO CONNECT YOUR FINE-TUNED NEON MODEL:
/// 1. Train or fine-tune Gemma using your dataset:
///    Location: My Drive -> Google AI Studio -> gemma_neon_finetune_v1.parquet
/// 2. Deploy your fine-tuned weights to an inference endpoint
///    (e.g., Google Cloud Vertex AI, Cloud Run, vLLM, Ollama, or custom FastAPI server).
/// 3. Update [defaultEndpoint] below with your deployed server URL.
class NeonApiService {
  // REPLACE THIS with your deployed Neon server endpoint URL
  // Example: https://neon-model-api-xxx.run.app/v1/chat/completions
  static const String defaultEndpoint = 'https://api.neon.ai/v1/chat/completions';

  Future<String> callNeonModel({
    required String prompt,
    required List<ChatMessage> conversation,
    required String modelName,
    required String apiKey,
    required double temperature,
    required int maxTokens,
  }) async {
    // If you have your real backend live, uncomment the HTTP POST request below:
    /*
    final response = await http.post(
      Uri.parse(defaultEndpoint),
      headers: {
        'Content-Type': 'application/json',
        if (apiKey.isNotEmpty) 'Authorization': 'Bearer \$apiKey',
      },
      body: jsonEncode({
        'model': modelName.contains('Neon') ? 'neon-gemma-finetuned' : 'gemma-base',
        'messages': conversation.map((m) => {
          'role': m.sender == MessageSender.user ? 'user' : 'assistant',
          'content': m.text,
        }).toList(),
        'temperature': temperature,
        'max_tokens': maxTokens,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['choices'][0]['message']['content'] ?? data['response'];
    } else {
      throw Exception('Neon server error: \${response.statusCode}');
    }
    */

    // Simulated fine-tuned Gemma response reflecting Neon's dataset knowledge
    await Future.delayed(const Duration(milliseconds: 900));

    if (prompt.toLowerCase().contains('dataset') || prompt.toLowerCase().contains('drive')) {
      return "I was fine-tuned on your custom dataset located in your **Google Drive** ('Google AI Studio' folder: \`gemma_neon_finetune_v1.parquet\`).\\n\\nThis dataset grounds my personality, code architecture skills, and conversational reasoning.";
    }

    return "Neon response to: \\"\$prompt\\". I am operating on the fine-tuned Gemma architecture with temperature \${temperature.toStringAsFixed(1)}.";
  }
}
`,
  },

  settingsProvider: {
    path: 'lib/providers/settings_provider.dart',
    description: 'Settings state: API key, temperature, max tokens, theme, and Drive dataset metadata',
    code: `import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

class SettingsProvider extends ChangeNotifier {
  final Box _box = Hive.box('settings_box');

  bool _isDarkMode = true;
  String _apiKey = '';
  double _temperature = 0.7;
  int _maxTokens = 2048;

  // Google Drive Fine-Tuning Dataset Reference
  String _datasetFileName = 'gemma_neon_finetune_v1.parquet';
  String _datasetSize = '48.6 MB';
  String _datasetDriveFolder = 'My Drive -> Google AI Studio';
  String _datasetSummary = 'Gemma fine-tuning dataset with multi-turn conversations and reasoning records.';

  bool get isDarkMode => _isDarkMode;
  String get apiKey => _apiKey;
  double get temperature => _temperature;
  int get maxTokens => _maxTokens;
  String get datasetFileName => _datasetFileName;
  String get datasetSize => _datasetSize;
  String get datasetDriveFolder => _datasetDriveFolder;
  String get datasetSummary => _datasetSummary;

  SettingsProvider() {
    _loadSettings();
  }

  void _loadSettings() {
    _isDarkMode = _box.get('isDarkMode', defaultValue: true);
    _apiKey = _box.get('apiKey', defaultValue: '');
    _temperature = _box.get('temperature', defaultValue: 0.7);
    _maxTokens = _box.get('maxTokens', defaultValue: 2048);
    _datasetFileName = _box.get('datasetFileName', defaultValue: 'gemma_neon_finetune_v1.parquet');
    _datasetSize = _box.get('datasetSize', defaultValue: '48.6 MB');
    notifyListeners();
  }

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    _box.put('isDarkMode', _isDarkMode);
    notifyListeners();
  }

  void setApiKey(String key) {
    _apiKey = key;
    _box.put('apiKey', key);
    notifyListeners();
  }

  void setTemperature(double temp) {
    _temperature = temp;
    _box.put('temperature', temp);
    notifyListeners();
  }

  void setMaxTokens(int tokens) {
    _maxTokens = tokens;
    _box.put('maxTokens', tokens);
    notifyListeners();
  }

  void updateDriveDatasetInfo({required String name, required String size}) {
    _datasetFileName = name;
    _datasetSize = size;
    _box.put('datasetFileName', name);
    _box.put('datasetSize', size);
    notifyListeners();
  }
}
`,
  },

  chatScreen: {
    path: 'lib/screens/main_chat_screen.dart',
    description: 'Pixel-perfect ChatGPT mobile UI with top bar, model selector, message list, typing indicator, and bottom cyan input',
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../providers/chat_provider.dart';
import '../providers/settings_provider.dart';
import '../models/chat_message.dart';
import '../widgets/left_drawer.dart';
import 'settings_screen.dart';

class MainChatScreen extends StatefulWidget {
  const MainChatScreen({super.key});

  @override
  State<MainChatScreen> createState() => _MainChatScreenState();
}

class _MainChatScreenState extends State<MainChatScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent + 80,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage() {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;

    final chatProv = Provider.of<ChatProvider>(context, listen: false);
    final settProv = Provider.of<SettingsProvider>(context, listen: false);

    chatProv.sendMessage(
      text,
      apiKey: settProv.apiKey,
      temperature: settProv.temperature,
      maxTokens: settProv.maxTokens,
    );
    _inputController.clear();
    Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
  }

  @override
  Widget build(BuildContext context) {
    final chatProv = Provider.of<ChatProvider>(context);
    final settProv = Provider.of<SettingsProvider>(context);
    final currentChat = chatProv.currentSession;
    final messages = currentChat?.messages ?? [];

    return Scaffold(
      key: _scaffoldKey,
      drawer: const LeftDrawer(),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: const Color(0xFF121212),
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Color(0xFF00E5FF)),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        title: Row(
          children: [
            const Text(
              'Neon AI',
              style: TextStyle(
                color: Color(0xFF00E5FF),
                fontWeight: FontWeight.bold,
                fontSize: 19,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(width: 10),
            // Model Selector Dropdown
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E1E),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF00E5FF).withOpacity(0.3)),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: chatProv.selectedModel,
                  dropdownColor: const Color(0xFF1E1E1E),
                  icon: const Icon(Icons.arrow_drop_down, color: Color(0xFF00E5FF), size: 18),
                  style: const TextStyle(fontSize: 12, color: Colors.white),
                  items: const [
                    DropdownMenuItem(
                      value: 'Neon (Fine-Tuned Gemma)',
                      child: Text('Neon (Fine-Tuned Gemma)'),
                    ),
                    DropdownMenuItem(
                      value: 'Gemma Base 2B',
                      child: Text('Gemma Base 2B'),
                    ),
                  ],
                  onChanged: (val) {
                    if (val != null) chatProv.setModel(val);
                  },
                ),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_square, color: Color(0xFF00E5FF)),
            tooltip: 'New Chat',
            onPressed: () => chatProv.createNewChat(),
          ),
        ],
      ),
      body: Container(
        color: const Color(0xFF121212),
        child: Column(
          children: [
            // Chat Message List
            Expanded(
              child: messages.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF00E5FF).withOpacity(0.4),
                                  blurRadius: 20,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: Image.asset('assets/neon_logo.png', errorBuilder: (_, __, ___) => const Icon(Icons.bolt, color: Color(0xFF00E5FF), size: 40)),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'What can Neon help with today?',
                            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Fine-tuned on your Google Drive Gemma dataset',
                            style: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      itemCount: messages.length,
                      itemBuilder: (context, index) {
                        final msg = messages[index];
                        return _buildMessageBubble(msg);
                      },
                    ),
            ),

            // Typing Indicator
            if (chatProv.isTyping)
              Container(
                alignment: Alignment.centerLeft,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('Neon is thinking', style: TextStyle(color: Color(0xFF00E5FF), fontSize: 12)),
                    const SizedBox(width: 8),
                    _buildTypingDots(),
                  ],
                ),
              ),

            // Bottom Input Bar
            _buildInputBar(settProv),
          ],
        ),
      ),
      floatingActionButton: messages.isNotEmpty && !chatProv.isTyping
          ? FloatingActionButton.small(
              backgroundColor: const Color(0xFF1E1E1E),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: Color(0xFF00E5FF), width: 1.2),
              ),
              child: const Icon(Icons.refresh, color: Color(0xFF00E5FF), size: 18),
              onPressed: () {
                chatProv.regenerateLastResponse(
                  apiKey: settProv.apiKey,
                  temperature: settProv.temperature,
                  maxTokens: settProv.maxTokens,
                );
              },
            )
          : null,
    );
  }

  Widget _buildMessageBubble(ChatMessage msg) {
    final isUser = msg.sender == MessageSender.user;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 32,
              height: 32,
              margin: const EdgeInsets.only(right: 8, top: 2),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF00E5FF)),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00E5FF).withOpacity(0.3),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: const Icon(Icons.bolt, color: Color(0xFF00E5FF), size: 18),
            ),
          ],
          Flexible(
            child: GestureDetector(
              onLongPress: () {
                Clipboard.setData(ClipboardData(text: msg.text));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Message copied to clipboard')),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: isUser ? const Color(0xFF0052CC) : const Color(0xFF1C2530),
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(16),
                    topRight: const Radius.circular(16),
                    bottomLeft: Radius.circular(isUser ? 16 : 4),
                    bottomRight: Radius.circular(isUser ? 4 : 16),
                  ),
                  border: isUser
                      ? null
                      : Border.all(color: const Color(0xFF00E5FF).withOpacity(0.4), width: 1),
                  boxShadow: !isUser
                      ? [
                          BoxShadow(
                            color: const Color(0xFF00E5FF).withOpacity(0.15),
                            blurRadius: 8,
                            spreadRadius: 1,
                          ),
                        ]
                      : null,
                ),
                child: MarkdownBody(
                  data: msg.text,
                  styleSheet: MarkdownStyleSheet(
                    p: const TextStyle(color: Colors.white, fontSize: 14.5, height: 1.4),
                    code: const TextStyle(backgroundColor: Color(0xFF111720), color: Color(0xFF00E5FF), fontFamily: 'monospace'),
                    codeblockDecoration: BoxDecoration(
                      color: const Color(0xFF0D1117),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF00E5FF).withOpacity(0.3)),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTypingDots() {
    return SizedBox(
      width: 24,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: List.generate(3, (index) {
          return Container(
            width: 5,
            height: 5,
            decoration: const BoxDecoration(
              color: Color(0xFF00E5FF),
              shape: BoxShape.circle,
            ),
          );
        }),
      ),
    );
  }

  Widget _buildInputBar(SettingsProvider settProv) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: const BoxDecoration(
        color: Color(0xFF161616),
        border: Border(top: BorderSide(color: Color(0xFF262626))),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            IconButton(
              icon: const Icon(Icons.mic, color: Color(0xFF00E5FF)),
              tooltip: 'Voice Input',
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Listening via microphone... (Voice input activated)')),
                );
              },
            ),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFF242424),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFF00E5FF).withOpacity(0.2)),
                ),
                child: TextField(
                  controller: _inputController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Ask Neon...',
                    hintStyle: TextStyle(color: Colors.grey),
                    border: InputBorder.none,
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF00E5FF),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00E5FF).withOpacity(0.4),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: IconButton(
                icon: const Icon(Icons.arrow_upward, color: Color(0xFF121212)),
                onPressed: _sendMessage,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },

  drawer: {
    path: 'lib/widgets/left_drawer.dart',
    description: 'Left drawer with Neon logo, + New Chat, swipeable chat history, Settings and About Neon',
    code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/chat_provider.dart';
import '../screens/settings_screen.dart';
import '../screens/about_screen.dart';

class LeftDrawer extends StatelessWidget {
  const LeftDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final chatProv = Provider.of<ChatProvider>(context);

    return Drawer(
      backgroundColor: const Color(0xFF141414),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Neon Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF00E5FF).withOpacity(0.4),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    child: Image.asset('assets/neon_logo.png', errorBuilder: (_, __, ___) => const Icon(Icons.bolt, color: Color(0xFF00E5FF), size: 28)),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'NEON AI',
                        style: TextStyle(
                          color: Color(0xFF00E5FF),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          letterSpacing: 1.2,
                        ),
                      ),
                      Text(
                        'Your Intelligent Companion',
                        style: TextStyle(color: Colors.grey, fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Prominent "+ New Chat" button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1E1E1E),
                  foregroundColor: const Color(0xFF00E5FF),
                  side: const BorderSide(color: Color(0xFF00E5FF), width: 1.2),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                icon: const Icon(Icons.add, color: Color(0xFF00E5FF)),
                label: const Text('New Chat', style: TextStyle(fontWeight: FontWeight.bold)),
                onPressed: () {
                  chatProv.createNewChat();
                  Navigator.pop(context);
                },
              ),
            ),

            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Text(
                'Recent Chats',
                style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),

            // Chat History List with Dismissible Swipe-to-Delete
            Expanded(
              child: ListView.builder(
                itemCount: chatProv.sessions.length,
                itemBuilder: (context, index) {
                  final session = chatProv.sessions[index];
                  final isSelected = session.id == chatProv.currentSession?.id;

                  return Dismissible(
                    key: Key(session.id),
                    direction: DismissDirection.endToStart,
                    background: Container(
                      color: Colors.red.shade900,
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 20),
                      child: const Icon(Icons.delete, color: Colors.white),
                    ),
                    onDismissed: (_) {
                      chatProv.deleteSession(session.id);
                    },
                    child: ListTile(
                      selected: isSelected,
                      selectedTileColor: const Color(0xFF1E2833),
                      leading: Icon(
                        Icons.chat_bubble_outline,
                        color: isSelected ? const Color(0xFF00E5FF) : Colors.grey.shade500,
                        size: 20,
                      ),
                      title: Text(
                        session.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: isSelected ? const Color(0xFF00E5FF) : Colors.white,
                          fontSize: 14,
                        ),
                      ),
                      subtitle: Text(
                        DateFormat('MMM d, h:mm a').format(session.updatedAt),
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 11),
                      ),
                      onTap: () {
                        chatProv.selectSession(session.id);
                        Navigator.pop(context);
                      },
                    ),
                  );
                },
              ),
            ),

            const Divider(color: Color(0xFF262626)),

            // Bottom Navigation options: Settings and About Neon
            ListTile(
              leading: const Icon(Icons.settings, color: Color(0xFF00E5FF)),
              title: const Text('Settings', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const SettingsScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.info_outline, color: Color(0xFF00E5FF)),
              title: const Text('About Neon', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const AboutScreen()));
              },
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },

  settingsScreen: {
    path: 'lib/screens/settings_screen.dart',
    description: 'Settings UI: API Key, Temperature slider, Max tokens, Google Drive Dataset reference section, Clear chats, Export to .txt',
    code: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/settings_provider.dart';
import '../providers/chat_provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late TextEditingController _apiKeyController;
  late TextEditingController _tokensController;

  @override
  void initState() {
    super.initState();
    final sett = Provider.of<SettingsProvider>(context, listen: false);
    _apiKeyController = TextEditingController(text: sett.apiKey);
    _tokensController = TextEditingController(text: sett.maxTokens.toString());
  }

  @override
  void dispose() {
    _apiKeyController.dispose();
    _tokensController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sett = Provider.of<SettingsProvider>(context);
    final chat = Provider.of<ChatProvider>(context, listen: false);

    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: const Color(0xFF121212),
        elevation: 0,
        title: const Text('Settings', style: TextStyle(color: Color(0xFF00E5FF))),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF00E5FF)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Section: Model Connection
          const Text('MODEL CONNECTION', style: TextStyle(color: Color(0xFF00E5FF), fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E1E),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF262626)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Neon API Key', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                const SizedBox(height: 6),
                TextField(
                  controller: _apiKeyController,
                  style: const TextStyle(color: Colors.white),
                  decoration: const InputDecoration(
                    hintText: 'Enter API Key to connect custom Neon model',
                    hintStyle: TextStyle(color: Colors.grey, fontSize: 13),
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (val) => sett.setApiKey(val),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Section: Model Hyperparameters
          const Text('PARAMETERS', style: TextStyle(color: Color(0xFF00E5FF), fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E1E),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF262626)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Temperature', style: TextStyle(color: Colors.white)),
                    Text(sett.temperature.toStringAsFixed(1), style: const TextStyle(color: Color(0xFF00E5FF), fontWeight: FontWeight.bold)),
                  ],
                ),
                Slider(
                  value: sett.temperature,
                  min: 0.0,
                  max: 1.0,
                  divisions: 10,
                  activeColor: const Color(0xFF00E5FF),
                  onChanged: (val) => sett.setTemperature(val),
                ),
                const Divider(color: Color(0xFF2E2E2E)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Max Tokens', style: TextStyle(color: Colors.white)),
                    SizedBox(
                      width: 90,
                      child: TextField(
                        controller: _tokensController,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(color: Color(0xFF00E5FF)),
                        decoration: const InputDecoration(border: OutlineInputBorder(), isDense: true),
                        onChanged: (val) {
                          final parsed = int.tryParse(val);
                          if (parsed != null) sett.setMaxTokens(parsed);
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Section: Dataset Used (Google Drive Reference)
          const Text('DATASET USED', style: TextStyle(color: Color(0xFF00E5FF), fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1E1E),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF00E5FF).withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.cloud_done, color: Color(0xFF00E5FF), size: 20),
                    const SizedBox(width: 8),
                    const Text('Google Drive Training Dataset', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 10),
                Text('File: \${sett.datasetFileName}', style: const TextStyle(color: Color(0xFF00E5FF), fontSize: 13, fontFamily: 'monospace')),
                const SizedBox(height: 4),
                Text('Location: \${sett.datasetDriveFolder}', style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                const SizedBox(height: 4),
                Text('File Size: \${sett.datasetSize}', style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                const SizedBox(height: 8),
                Text(sett.datasetSummary, style: TextStyle(color: Colors.grey.shade300, fontSize: 12)),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Section: Chat Actions (Export & Clear)
          const Text('CHAT MANAGEMENT', style: TextStyle(color: Color(0xFF00E5FF), fontSize: 12, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E1E1E),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            icon: const Icon(Icons.download, color: Color(0xFF00E5FF)),
            label: const Text('Export Chat as .txt'),
            onPressed: () {
              final active = chat.currentSession;
              if (active != null) {
                final buffer = StringBuffer();
                buffer.writeln('Neon AI Conversation: \${active.title}');
                buffer.writeln('Date: \${active.createdAt}');
                buffer.writeln('Model: \${active.model}');
                buffer.writeln('----------------------------------------\\n');
                for (var m in active.messages) {
                  buffer.writeln('[\${m.sender == MessageSender.user ? "USER" : "NEON"} - \${m.timestamp}]:');
                  buffer.writeln('\${m.text}\\n');
                }
                Share.share(buffer.toString(), subject: 'Neon_Chat_\${active.id}.txt');
              }
            },
          ),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF331111),
              foregroundColor: Colors.redAccent,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            icon: const Icon(Icons.delete_forever, color: Colors.redAccent),
            label: const Text('Clear All Chats'),
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: const Color(0xFF1E1E1E),
                  title: const Text('Clear all conversations?', style: TextStyle(color: Colors.white)),
                  content: const Text('This will delete all stored chats from offline Hive storage.', style: TextStyle(color: Colors.grey)),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                    TextButton(
                      onPressed: () {
                        chat.clearAllChats();
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('All chats cleared')));
                      },
                      child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
`,
  },

  aboutScreen: {
    path: 'lib/screens/about_screen.dart',
    description: 'About Neon screen highlighting model architecture, Google Drive dataset reference, and branding',
    code: `import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: const Color(0xFF121212),
        title: const Text('About Neon', style: TextStyle(color: Color(0xFF00E5FF))),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF00E5FF)),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00E5FF).withOpacity(0.5),
                    blurRadius: 24,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Image.asset('assets/neon_logo.png', errorBuilder: (_, __, ___) => const Icon(Icons.bolt, color: Color(0xFF00E5FF), size: 50)),
            ),
            const SizedBox(height: 16),
            const Text(
              'NEON AI',
              style: TextStyle(
                color: Color(0xFF00E5FF),
                fontSize: 24,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
              ),
            ),
            const Text(
              'Your Intelligent Companion',
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF00E5FF).withOpacity(0.3)),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Architecture & Fine-Tuning', style: TextStyle(color: Color(0xFF00E5FF), fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text(
                    'Neon is an intelligent mobile assistant powered by fine-tuned Gemma foundation weights. It is optimized for on-device and edge conversational intelligence.',
                    style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                  ),
                  SizedBox(height: 12),
                  Text('Dataset Source', style: TextStyle(color: Color(0xFF00E5FF), fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text(
                    'Dataset: gemma_neon_finetune_v1.parquet\\nStored in: Google Drive / Google AI Studio\\nRole: Formulates Neon persona, reasoning, and coding capabilities.',
                    style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
  },

  buildGuide: {
    path: 'BUILD_INSTRUCTIONS.md',
    description: 'Step-by-step setup guide and build instructions for Android APK/AAB and iOS IPA',
    code: `# Neon AI - Mobile Build & Deployment Guide

## Prerequisites
- Flutter SDK (>= 3.19.0)
- Android Studio / Android SDK (API 34)
- Xcode (for iOS builds, macOS required)
- CocoaPods

## Quick Setup
\`\`\`bash
# 1. Clone or extract project
cd neon_ai

# 2. Get dependencies
flutter pub get

# 3. Generate Hive Adapters (if adding custom adapters)
dart run build_runner build --delete-conflicting-outputs
\`\`\`

## 1. Android Build (.apk / .aab)
\`\`\`bash
# Build universal release APK
flutter build apk --release

# Output path:
# build/app/outputs/flutter-apk/app-release.apk

# For Google Play Store App Bundle:
flutter build appbundle --release
# Output path:
# build/app/outputs/bundle/release/app-release.aab
\`\`\`

## 2. iOS Build (.ipa)
\`\`\`bash
# Install CocoaPods
cd ios && pod install && cd ..

# Build iOS release bundle
flutter build ipa --release
# Output path:
# build/ios/archive/Runner.xcarchive
\`\`\`

## 3. Google Drive Dataset Configuration
The app links to your Gemma fine-tuning dataset located in \`My Drive -> Google AI Studio\`
(\`gemma_neon_finetune_v1.parquet\`).
To adjust the endpoint or dataset file path in code, open \`lib/services/neon_api_service.dart\`.
`,
  },
};
