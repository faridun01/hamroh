import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/complaints/data/complaints_repository.dart';

class CreateComplaintScreen extends ConsumerStatefulWidget {
  const CreateComplaintScreen({
    super.key,
    this.bookingId,
  });

  final String? bookingId;

  @override
  ConsumerState<CreateComplaintScreen> createState() =>
      _CreateComplaintScreenState();
}

class _CreateComplaintScreenState extends ConsumerState<CreateComplaintScreen> {
  final description = TextEditingController();
  String type = 'booking_issue';
  bool loading = false;
  String? error;

  @override
  void dispose() {
    description.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Жалоба')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Опишите проблему',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: type,
              decoration: const InputDecoration(labelText: 'Тип жалобы'),
              items: const [
                DropdownMenuItem<String>(
                    value: 'booking_issue', child: Text('Проблема с бронью')),
                DropdownMenuItem<String>(
                    value: 'driver_no_show',
                    child: Text('Водитель не приехал')),
                DropdownMenuItem<String>(
                    value: 'price_changed', child: Text('Изменилась цена')),
                DropdownMenuItem<String>(
                    value: 'safety', child: Text('Безопасность')),
              ],
              onChanged: (value) => setState(() => type = value!),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: description,
              minLines: 5,
              maxLines: 8,
              decoration: const InputDecoration(labelText: 'Описание'),
            ),
            if (error != null) ...[
              const SizedBox(height: 12),
              Text(error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: loading ? null : _submit,
              child: loading
                  ? const CircularProgressIndicator.adaptive()
                  : const Text('Отправить жалобу'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (description.text.trim().isEmpty) {
      setState(() => error = 'Добавьте описание проблемы.');
      return;
    }

    setState(() {
      loading = true;
      error = null;
    });

    try {
      await ref.read(complaintsRepositoryProvider).create(
            bookingId: widget.bookingId,
            type: type,
            description: description.text.trim(),
          );
      if (mounted) context.pop();
    } catch (_) {
      if (mounted) setState(() => error = 'Не удалось отправить жалобу.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}
