import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/page_result.dart';
import 'package:hamroh_mobile/features/admin/data/admin_repository.dart';

final adminStatsProvider = FutureProvider<AdminStats>((ref) {
  return ref.watch(adminRepositoryProvider).stats();
});

final adminUsersProvider = FutureProvider<PageResult<AdminUserItem>>((ref) {
  return ref.watch(adminRepositoryProvider).users();
});

final pendingDriversProvider = FutureProvider<PageResult<PendingDriverItem>>((ref) {
  return ref.watch(adminRepositoryProvider).pendingDrivers();
});

final pendingVehiclesProvider = FutureProvider<PageResult<PendingVehicleItem>>((ref) {
  return ref.watch(adminRepositoryProvider).pendingVehicles();
});

final adminComplaintsProvider = FutureProvider<PageResult<AdminComplaintItem>>((ref) {
  return ref.watch(adminRepositoryProvider).complaints();
});

final adminTripsProvider = FutureProvider<PageResult<AdminTripItem>>((ref) {
  return ref.watch(adminRepositoryProvider).trips();
});

final adminBookingsProvider = FutureProvider<PageResult<AdminBookingItem>>((ref) {
  return ref.watch(adminRepositoryProvider).bookings();
});

final adminAuditProvider = FutureProvider<PageResult<AdminAuditItem>>((ref) {
  return ref.watch(adminRepositoryProvider).audit();
});

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      const AdminStatsScreen(),
      const AdminUsersScreen(),
      const AdminVerificationScreen(),
      const AdminComplaintsScreen(),
      const AdminOperationsScreen(),
      const AdminAuditScreen(),
    ];

    return Scaffold(
      body: SafeArea(child: screens[index]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.analytics_outlined), label: 'Статистика'),
          NavigationDestination(icon: Icon(Icons.people_outline), label: 'Пользователи'),
          NavigationDestination(icon: Icon(Icons.verified_user_outlined), label: 'Проверка'),
          NavigationDestination(icon: Icon(Icons.report_outlined), label: 'Жалобы'),
          NavigationDestination(icon: Icon(Icons.route_outlined), label: 'Операции'),
          NavigationDestination(icon: Icon(Icons.history_outlined), label: 'Аудит'),
        ],
      ),
    );
  }
}

class AdminStatsScreen extends ConsumerWidget {
  const AdminStatsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats = ref.watch(adminStatsProvider);

    return stats.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => _ErrorView(onRetry: () => ref.invalidate(adminStatsProvider)),
      data: (data) => ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Админ-панель', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          _StatTile(title: 'Пользователи', value: data.users),
          _StatTile(title: 'Водители на проверке', value: data.pendingDrivers),
          _StatTile(title: 'Опубликованные поездки', value: data.publishedTrips),
          _StatTile(title: 'Ожидающие брони', value: data.pendingBookings),
          _StatTile(title: 'Открытые жалобы', value: data.openComplaints),
        ],
      ),
    );
  }
}

class AdminUsersScreen extends ConsumerWidget {
  const AdminUsersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final users = ref.watch(adminUsersProvider);

    return users.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => _ErrorView(onRetry: () => ref.invalidate(adminUsersProvider)),
      data: (data) => ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Пользователи', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          ...data.items.map((user) => _UserCard(user: user)),
        ],
      ),
    );
  }
}

class AdminOperationsScreen extends ConsumerWidget {
  const AdminOperationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trips = ref.watch(adminTripsProvider);
    final bookings = ref.watch(adminBookingsProvider);

    if (trips.isLoading || bookings.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (trips.hasError || bookings.hasError) {
      return _ErrorView(onRetry: () {
        ref.invalidate(adminTripsProvider);
        ref.invalidate(adminBookingsProvider);
      });
    }

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Операции', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 16),
        Text('Поездки', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 10),
        if ((trips.value?.items ?? []).isEmpty)
          const _EmptyBox(text: 'Поездок пока нет.')
        else
          ...(trips.value?.items ?? []).map((item) => _TripCard(item: item)),
        const SizedBox(height: 20),
        Text('Брони', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 10),
        if ((bookings.value?.items ?? []).isEmpty)
          const _EmptyBox(text: 'Броней пока нет.')
        else
          ...(bookings.value?.items ?? []).map((item) => _BookingCard(item: item)),
      ],
    );
  }
}

class AdminAuditScreen extends ConsumerWidget {
  const AdminAuditScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final audit = ref.watch(adminAuditProvider);

    return audit.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => _ErrorView(onRetry: () => ref.invalidate(adminAuditProvider)),
      data: (data) => ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Аудит', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          if (data.items.isEmpty)
            const _EmptyBox(text: 'Записей аудита пока нет.')
          else
            ...data.items.map((item) => _AuditCard(item: item)),
        ],
      ),
    );
  }
}

class AdminComplaintsScreen extends ConsumerWidget {
  const AdminComplaintsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final complaints = ref.watch(adminComplaintsProvider);

    return complaints.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) => _ErrorView(onRetry: () => ref.invalidate(adminComplaintsProvider)),
      data: (data) => ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Жалобы', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 16),
          if (data.items.isEmpty)
            const _EmptyBox(text: 'Жалоб пока нет.')
          else
            ...data.items.map((item) => _ComplaintCard(item: item)),
        ],
      ),
    );
  }
}

class AdminVerificationScreen extends ConsumerWidget {
  const AdminVerificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final drivers = ref.watch(pendingDriversProvider);
    final vehicles = ref.watch(pendingVehiclesProvider);

    if (drivers.isLoading || vehicles.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (drivers.hasError || vehicles.hasError) {
      return _ErrorView(onRetry: () {
        ref.invalidate(pendingDriversProvider);
        ref.invalidate(pendingVehiclesProvider);
      });
    }

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Проверка документов', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 16),
        Text('Водители', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 10),
        if ((drivers.value?.items ?? []).isEmpty)
          const _EmptyBox(text: 'Нет водителей на проверке.')
        else
          ...(drivers.value?.items ?? []).map((item) => _PendingDriverCard(item: item)),
        const SizedBox(height: 20),
        Text('Автомобили', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 10),
        if ((vehicles.value?.items ?? []).isEmpty)
          const _EmptyBox(text: 'Нет автомобилей на проверке.')
        else
          ...(vehicles.value?.items ?? []).map((item) => _PendingVehicleCard(item: item)),
      ],
    );
  }
}

class _TripCard extends StatelessWidget {
  const _TripCard({required this.item});

  final AdminTripItem item;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text('${item.fromCity} -> ${item.toCity}', style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text('${item.driverName} · ${item.departureDate} ${item.departureTime} · ${item.status}'),
        trailing: Text('${item.availableSeats}/${item.totalSeats}'),
      ),
    );
  }
}

class _BookingCard extends StatelessWidget {
  const _BookingCard({required this.item});

  final AdminBookingItem item;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text('${item.fromCity} -> ${item.toCity}', style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text('${item.passengerName} · ${item.seatsCount} мест · ${item.status}'),
        trailing: Text('${item.totalPrice}'),
      ),
    );
  }
}

class _AuditCard extends StatelessWidget {
  const _AuditCard({required this.item});

  final AdminAuditItem item;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(item.action, style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text('${item.entityType} · ${item.createdAt}'),
      ),
    );
  }
}

class _ComplaintCard extends ConsumerWidget {
  const _ComplaintCard({required this.item});

  final AdminComplaintItem item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(item.type, style: const TextStyle(fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text(item.description),
            const SizedBox(height: 4),
            Text('Статус: ${item.status}', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: item.status == 'InReview' ? null : () => _setStatus(ref, 'InReview'),
                    child: const Text('В работу'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: item.status == 'Resolved' ? null : () => _setStatus(ref, 'Resolved'),
                    child: const Text('Решено'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _setStatus(WidgetRef ref, String status) async {
    await ref.read(adminRepositoryProvider).updateComplaintStatus(item.id, status);
    ref.invalidate(adminComplaintsProvider);
    ref.invalidate(adminStatsProvider);
  }
}

class _UserCard extends ConsumerWidget {
  const _UserCard({required this.user});

  final AdminUserItem user;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text('${user.firstName} ${user.lastName}', style: const TextStyle(fontWeight: FontWeight.w900)),
        subtitle: Text('${user.phone} · ${user.role} · ${user.isActive ? 'активен' : 'заблокирован'}'),
        trailing: TextButton(
          onPressed: () async {
            if (user.isActive) {
              await ref.read(adminRepositoryProvider).blockUser(user.id);
            } else {
              await ref.read(adminRepositoryProvider).unblockUser(user.id);
            }
            ref.invalidate(adminUsersProvider);
            ref.invalidate(adminStatsProvider);
          },
          child: Text(user.isActive ? 'Блок' : 'Разблок'),
        ),
      ),
    );
  }
}

class _PendingDriverCard extends ConsumerWidget {
  const _PendingDriverCard({required this.item});

  final PendingDriverItem item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${item.firstName} ${item.lastName}', style: const TextStyle(fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text('${item.phone} · ${item.city} · права: ${item.licenseNumber}'),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _run(ref, () => ref.read(adminRepositoryProvider).approveDriver(item.userId)),
                    child: const Text('Одобрить'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _run(ref, () => ref.read(adminRepositoryProvider).rejectDriver(item.userId, 'Документы не прошли проверку')),
                    child: const Text('Отклонить'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _run(WidgetRef ref, Future<void> Function() action) async {
    await action();
    ref.invalidate(pendingDriversProvider);
    ref.invalidate(adminStatsProvider);
  }
}

class _PendingVehicleCard extends ConsumerWidget {
  const _PendingVehicleCard({required this.item});

  final PendingVehicleItem item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${item.brand} ${item.model}', style: const TextStyle(fontWeight: FontWeight.w900)),
            const SizedBox(height: 4),
            Text('${item.color}, ${item.year} · ${item.plateNumber} · ${item.seats} мест'),
            const SizedBox(height: 4),
            Text('${item.driverName} · ${item.driverPhone}', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => _run(ref, () => ref.read(adminRepositoryProvider).approveVehicle(item.id)),
                    child: const Text('Одобрить'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => _run(ref, () => ref.read(adminRepositoryProvider).rejectVehicle(item.id, 'Автомобиль не прошел проверку')),
                    child: const Text('Отклонить'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _run(WidgetRef ref, Future<void> Function() action) async {
    await action();
    ref.invalidate(pendingVehiclesProvider);
    ref.invalidate(adminStatsProvider);
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.title, required this.value});

  final String title;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(title),
        trailing: Text('$value', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 20)),
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
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Не удалось загрузить данные.', textAlign: TextAlign.center),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Повторить')),
          ],
        ),
      ),
    );
  }
}
