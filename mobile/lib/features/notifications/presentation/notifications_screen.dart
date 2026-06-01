import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/core/network/page_result.dart';
import 'package:hamroh_mobile/features/notifications/data/notifications_repository.dart';

final notificationsProvider =
    FutureProvider<PageResult<NotificationItem>>((ref) {
  return ref.watch(notificationsRepositoryProvider).list();
});

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifications = ref.watch(notificationsProvider);

    return notifications.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) =>
          _ErrorView(onRetry: () => ref.invalidate(notificationsProvider)),
      data: (data) {
        if (data.items.isEmpty) {
          return const Center(child: Text('Уведомлений пока нет.'));
        }

        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Уведомления',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 16),
            ...data.items.map((item) => Card(
                  elevation: 0,
                  color: item.isRead
                      ? Colors.white
                      : const Color(0xFFD1FAE5).withValues(alpha: 0.55),
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    onTap: () => _openNotification(context, ref, item),
                    title: Text(item.title,
                        style: const TextStyle(fontWeight: FontWeight.w800)),
                    subtitle: Text(item.message),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                )),
          ],
        );
      },
    );
  }

  Future<void> _openNotification(
      BuildContext context, WidgetRef ref, NotificationItem item) async {
    await ref.read(notificationsRepositoryProvider).markRead(item.id);
    if (context.mounted) {
      if (item.type == 'new_message' && item.bookingId != null) {
        context.go('/bookings/${item.bookingId}');
      } else if (item.bookingId != null) {
        context.go('/bookings/${item.bookingId}');
      } else if (item.tripId != null) {
        context.go('/trips/${item.tripId}');
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
          const Text('Не удалось загрузить уведомления.'),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: onRetry, child: const Text('Повторить')),
        ],
      ),
    );
  }
}
