import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/reviews/data/reviews_repository.dart';

class CreateReviewScreen extends ConsumerStatefulWidget {
  const CreateReviewScreen({
    super.key,
    required this.bookingId,
    required this.toUserId,
  });

  final String bookingId;
  final String toUserId;

  @override
  ConsumerState<CreateReviewScreen> createState() => _CreateReviewScreenState();
}

class _CreateReviewScreenState extends ConsumerState<CreateReviewScreen> {
  final comment = TextEditingController();
  int stars = 5;
  bool loading = false;
  String? error;

  @override
  void dispose() {
    comment.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Отзыв')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Оцените поездку', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 16),
            SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 1, label: Text('1')),
                ButtonSegment(value: 2, label: Text('2')),
                ButtonSegment(value: 3, label: Text('3')),
                ButtonSegment(value: 4, label: Text('4')),
                ButtonSegment(value: 5, label: Text('5')),
              ],
              selected: {stars},
              onSelectionChanged: (value) => setState(() => stars = value.first),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: comment,
              minLines: 4,
              maxLines: 6,
              decoration: const InputDecoration(labelText: 'Комментарий'),
            ),
            if (error != null) ...[
              const SizedBox(height: 12),
              Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: loading ? null : _submit,
              child: loading ? const CircularProgressIndicator.adaptive() : const Text('Отправить отзыв'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    setState(() {
      loading = true;
      error = null;
    });

    try {
      await ref.read(reviewsRepositoryProvider).create(
            bookingId: widget.bookingId,
            toUserId: widget.toUserId,
            stars: stars,
            comment: comment.text.trim(),
          );
      if (mounted) context.pop();
    } catch (_) {
      if (mounted) setState(() => error = 'Не удалось отправить отзыв.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}
