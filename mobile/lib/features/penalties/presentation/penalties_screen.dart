import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/features/penalties/data/penalties_repository.dart';

final penaltiesProvider = FutureProvider<List<PenaltyItem>>((ref) {
  return ref.watch(penaltiesRepositoryProvider).mine();
});

class PenaltiesScreen extends ConsumerWidget {
  const PenaltiesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final penalties = ref.watch(penaltiesProvider);

    return penalties.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => _ErrorView(onRetry: () => ref.invalidate(penaltiesProvider)),
      data: (items) => ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Штрафы', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          if (items.isEmpty)
            const _EmptyBox(text: 'У вас нет штрафов.')
          else
            ...items.map((item) => _PenaltyCard(item: item)),
        ],
      ),
    );
  }
}

class _PenaltyCard extends ConsumerWidget {
  const _PenaltyCard({required this.item});

  final PenaltyItem item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text('${item.amount} сомони', style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text(item.isPaid ? 'Оплачен' : 'Ожидает оплаты'),
        trailing: item.isPaid
            ? const Icon(Icons.check_circle_outline)
            : TextButton(
                onPressed: () async {
                  await ref.read(penaltiesRepositoryProvider).pay(item.id);
                  ref.invalidate(penaltiesProvider);
                },
                child: const Text('Оплатить'),
              ),
      ),
    );
  }
}

class _EmptyBox extends StatelessWidget {
  const _EmptyBox({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
      child: Text(text, style: Theme.of(context).textTheme.bodySmall),
    );
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
          const Text('Не удалось загрузить штрафы.'),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: onRetry, child: const Text('Повторить')),
        ],
      ),
    );
  }
}
