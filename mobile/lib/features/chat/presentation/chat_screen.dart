import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/features/chat/data/chat_repository.dart';

final chatMessagesProvider = FutureProvider.family<List<ChatMessage>, String>((ref, bookingId) {
  return ref.watch(chatRepositoryProvider).messages(bookingId);
});

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key, required this.bookingId});

  final String bookingId;

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final controller = TextEditingController();
  bool sending = false;

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(chatMessagesProvider(widget.bookingId));

    return Scaffold(
      appBar: AppBar(title: const Text('Чат')),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: messages.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (_, __) => _ErrorView(onRetry: () => ref.invalidate(chatMessagesProvider(widget.bookingId))),
                data: (items) {
                  if (items.isEmpty) {
                    return const Center(child: Text('Сообщений пока нет.'));
                  }

                  return ListView.builder(
                    reverse: true,
                    padding: const EdgeInsets.all(16),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return Align(
                        alignment: Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(item.body),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: controller,
                      minLines: 1,
                      maxLines: 4,
                      decoration: const InputDecoration(labelText: 'Сообщение'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.filled(
                    onPressed: sending ? null : _send,
                    icon: const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _send() async {
    final body = controller.text.trim();
    if (body.isEmpty) {
      return;
    }

    setState(() => sending = true);
    try {
      await ref.read(chatRepositoryProvider).send(widget.bookingId, body);
      controller.clear();
      ref.invalidate(chatMessagesProvider(widget.bookingId));
    } finally {
      if (mounted) {
        setState(() => sending = false);
      }
    }
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Не удалось загрузить чат.'),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: onRetry, child: const Text('Повторить')),
        ],
      ),
    );
  }
}
