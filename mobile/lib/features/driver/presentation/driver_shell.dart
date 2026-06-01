import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/core/network/page_result.dart';
import 'package:hamroh_mobile/features/bookings/data/booking_models.dart';
import 'package:hamroh_mobile/features/bookings/data/bookings_repository.dart';
import 'package:hamroh_mobile/features/driver/data/driver_repository.dart';
import 'package:hamroh_mobile/features/notifications/presentation/notifications_screen.dart';

final driverProfileProvider = FutureProvider<DriverProfileDetails>((ref) {
  return ref.watch(driverRepositoryProvider).me();
});

final driverTripsProvider = FutureProvider<PageResult<DriverTripItem>>((ref) {
  return ref.watch(driverRepositoryProvider).myTrips();
});

final driverBookingsProvider =
    FutureProvider<PageResult<BookingListItem>>((ref) {
  return ref.watch(bookingsRepositoryProvider).myBookings();
});

class DriverShell extends StatefulWidget {
  const DriverShell({super.key});

  @override
  State<DriverShell> createState() => _DriverShellState();
}

class _DriverShellState extends State<DriverShell> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      const DriverDashboardScreen(),
      const DriverCreateTripScreen(),
      const DriverBookingsScreen(),
      const NotificationsScreen(),
    ];

    return Scaffold(
      body: SafeArea(child: screens[index]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(
              icon: Icon(Icons.dashboard_outlined), label: 'Главная'),
          NavigationDestination(
              icon: Icon(Icons.add_road_outlined), label: 'Создать'),
          NavigationDestination(
              icon: Icon(Icons.event_seat_outlined), label: 'Брони'),
          NavigationDestination(
              icon: Icon(Icons.notifications_none), label: 'Уведомления'),
        ],
      ),
    );
  }
}

class DriverDashboardScreen extends ConsumerWidget {
  const DriverDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profile = ref.watch(driverProfileProvider);
    final trips = ref.watch(driverTripsProvider);

    if (profile.isLoading || trips.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (profile.hasError || trips.hasError) {
      return _ErrorView(onRetry: () {
        ref.invalidate(driverProfileProvider);
        ref.invalidate(driverTripsProvider);
      });
    }

    final driver = profile.value!;
    final tripItems = trips.value?.items ?? [];

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Кабинет водителя',
            style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 16),
        _InfoBox(
          title: 'Статус проверки',
          value: driver.profile.verificationStatus,
          subtitle: driver.profile.verificationReason.isEmpty
              ? 'Можно создавать поездки после проверки профиля и машины.'
              : driver.profile.verificationReason,
        ),
        const SizedBox(height: 12),
        _InfoBox(
            title: 'Рейтинг',
            value: driver.profile.rating.toString(),
            subtitle: '${driver.profile.totalTrips} завершенных поездок'),
        const SizedBox(height: 20),
        Text('Мои поездки', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 10),
        if (tripItems.isEmpty)
          const _EmptyBox(text: 'У вас пока нет поездок.')
        else
          ...tripItems.map((trip) => _DriverTripCard(trip: trip)),
      ],
    );
  }
}

class DriverCreateTripScreen extends ConsumerStatefulWidget {
  const DriverCreateTripScreen({super.key});

  @override
  ConsumerState<DriverCreateTripScreen> createState() =>
      _DriverCreateTripScreenState();
}

class _DriverCreateTripScreenState
    extends ConsumerState<DriverCreateTripScreen> {
  String fromCity = 'Dushanbe';
  String toCity = 'Khujand';
  final pickup = TextEditingController();
  final dropoff = TextEditingController();
  final price = TextEditingController(text: '120');
  final comment = TextEditingController();
  int seats = 4;
  bool allowBaggage = true;
  bool womenFriendly = false;
  bool loading = false;
  String? message;

  @override
  void dispose() {
    pickup.dispose();
    dropoff.dispose();
    price.dispose();
    comment.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(driverProfileProvider);

    return profile.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) =>
          _ErrorView(onRetry: () => ref.invalidate(driverProfileProvider)),
      data: (data) {
        DriverVehicle? verifiedVehicle;
        for (final vehicle in data.vehicles) {
          if (vehicle.isVerified) {
            verifiedVehicle = vehicle;
            break;
          }
        }
        final verifiedVehicleId = verifiedVehicle?.id;
        final canCreate = data.profile.verificationStatus == 'Verified' &&
            verifiedVehicleId != null;

        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Создать поездку',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            if (!canCreate)
              const _InfoBox(
                  title: 'Проверка требуется',
                  value: 'Недоступно',
                  subtitle:
                      'Администратор должен подтвердить профиль водителя и автомобиль.'),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
                initialValue: fromCity,
                decoration: const InputDecoration(labelText: 'Откуда'),
                items: _cities(),
                onChanged: canCreate
                    ? (value) => setState(() => fromCity = value!)
                    : null),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
                initialValue: toCity,
                decoration: const InputDecoration(labelText: 'Куда'),
                items: _cities(),
                onChanged: canCreate
                    ? (value) => setState(() => toCity = value!)
                    : null),
            const SizedBox(height: 12),
            TextField(
                controller: pickup,
                enabled: canCreate,
                decoration: const InputDecoration(labelText: 'Место посадки')),
            const SizedBox(height: 12),
            TextField(
                controller: dropoff,
                enabled: canCreate,
                decoration: const InputDecoration(labelText: 'Место высадки')),
            const SizedBox(height: 12),
            TextField(
                controller: price,
                enabled: canCreate,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Цена за место')),
            const SizedBox(height: 12),
            DropdownButtonFormField<int>(
                initialValue: seats,
                decoration: const InputDecoration(labelText: 'Места'),
                items: [1, 2, 3, 4, 5, 6, 7, 8]
                    .map((item) => DropdownMenuItem<int>(
                        value: item, child: Text('$item')))
                    .toList(),
                onChanged: canCreate
                    ? (value) => setState(() => seats = value!)
                    : null),
            SwitchListTile(
                value: allowBaggage,
                onChanged: canCreate
                    ? (value) => setState(() => allowBaggage = value)
                    : null,
                title: const Text('Можно с багажом'),
                contentPadding: EdgeInsets.zero),
            SwitchListTile(
                value: womenFriendly,
                onChanged: canCreate
                    ? (value) => setState(() => womenFriendly = value)
                    : null,
                title: const Text('Комфортно для женщин'),
                contentPadding: EdgeInsets.zero),
            TextField(
                controller: comment,
                enabled: canCreate,
                minLines: 3,
                maxLines: 5,
                decoration: const InputDecoration(labelText: 'Комментарий')),
            if (message != null) ...[
              const SizedBox(height: 12),
              Text(message!,
                  style: const TextStyle(fontWeight: FontWeight.w700)),
            ],
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: canCreate && !loading
                  ? () => _submit(verifiedVehicleId)
                  : null,
              child: loading
                  ? const CircularProgressIndicator.adaptive()
                  : const Text('Опубликовать поездку'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _submit(String vehicleId) async {
    if (pickup.text.trim().isEmpty || dropoff.text.trim().isEmpty) {
      setState(() => message = 'Укажите место посадки и высадки.');
      return;
    }

    setState(() {
      loading = true;
      message = null;
    });

    try {
      final tomorrow = DateTime.now().add(const Duration(days: 1));
      final date =
          '${tomorrow.year}-${tomorrow.month.toString().padLeft(2, '0')}-${tomorrow.day.toString().padLeft(2, '0')}';
      await ref.read(driverRepositoryProvider).createTrip(
            vehicleId: vehicleId,
            fromCity: fromCity,
            toCity: toCity,
            departureDate: date,
            departureTime: '09:00:00',
            pickupPoint: pickup.text.trim(),
            dropoffPoint: dropoff.text.trim(),
            pricePerSeat: num.tryParse(price.text) ?? 0,
            totalSeats: seats,
            allowBaggage: allowBaggage,
            womenFriendly: womenFriendly,
            driverComment: comment.text.trim(),
          );
      ref.invalidate(driverTripsProvider);
      if (mounted) setState(() => message = 'Поездка опубликована.');
    } catch (_) {
      if (mounted) setState(() => message = 'Не удалось создать поездку.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  List<DropdownMenuItem<String>> _cities() {
    return ['Dushanbe', 'Khujand', 'Bokhtar', 'Kulob', 'Khorog']
        .map((city) => DropdownMenuItem<String>(value: city, child: Text(city)))
        .toList();
  }
}

class DriverBookingsScreen extends ConsumerWidget {
  const DriverBookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookings = ref.watch(driverBookingsProvider);

    return bookings.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (_, __) =>
          _ErrorView(onRetry: () => ref.invalidate(driverBookingsProvider)),
      data: (data) {
        final items = data.items;
        return ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Брони пассажиров',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 16),
            if (items.isEmpty)
              const _EmptyBox(text: 'Заявок пока нет.')
            else
              ...items.map((booking) => _DriverBookingCard(booking: booking)),
          ],
        );
      },
    );
  }
}

class _DriverBookingCard extends ConsumerWidget {
  const _DriverBookingCard({required this.booking});

  final BookingListItem booking;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isPending = booking.status == 'Pending';
    final isAccepted = booking.status == 'Accepted';

    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ListTile(
              contentPadding: EdgeInsets.zero,
              onTap: () => context.go('/bookings/${booking.id}'),
              title: Text('${booking.fromCity} -> ${booking.toCity}',
                  style: const TextStyle(fontWeight: FontWeight.w900)),
              subtitle: Text(
                  '${booking.departureDate} · ${booking.departureTime} · ${booking.status}'),
              trailing: Text('${booking.seatsCount} мест'),
            ),
            if (isPending || isAccepted)
              Row(
                children: [
                  if (isPending) ...[
                    Expanded(
                        child: ElevatedButton(
                            onPressed: () => _run(
                                ref,
                                () => ref
                                    .read(bookingsRepositoryProvider)
                                    .accept(booking.id)),
                            child: const Text('Принять'))),
                    const SizedBox(width: 8),
                    Expanded(
                        child: OutlinedButton(
                            onPressed: () => _run(
                                ref,
                                () => ref
                                    .read(bookingsRepositoryProvider)
                                    .reject(booking.id)),
                            child: const Text('Отклонить'))),
                  ],
                  if (isAccepted)
                    Expanded(
                        child: OutlinedButton(
                            onPressed: () => _run(
                                ref,
                                () => ref
                                    .read(bookingsRepositoryProvider)
                                    .cancelByDriver(booking.id)),
                            child: const Text('Отменить'))),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _run(WidgetRef ref, Future<void> Function() action) async {
    await action();
    ref.invalidate(driverBookingsProvider);
    ref.invalidate(driverTripsProvider);
  }
}

class _DriverTripCard extends ConsumerWidget {
  const _DriverTripCard({required this.trip});

  final DriverTripItem trip;

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
            Text('${trip.fromCity} -> ${trip.toCity}',
                style:
                    const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
            const SizedBox(height: 6),
            Text(
                '${trip.departureDate} · ${trip.departureTime} · ${trip.status}'),
            const SizedBox(height: 6),
            Text(
                '${trip.availableSeats}/${trip.totalSeats} мест · ${trip.pricePerSeat} сомони'),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                    child: OutlinedButton(
                        onPressed:
                            trip.status == 'Published' || trip.status == 'Full'
                                ? () => _run(
                                    ref,
                                    () => ref
                                        .read(driverRepositoryProvider)
                                        .startTrip(trip.id))
                                : null,
                        child: const Text('Старт'))),
                const SizedBox(width: 8),
                Expanded(
                    child: ElevatedButton(
                        onPressed: trip.status != 'Completed' &&
                                trip.status != 'Cancelled'
                            ? () => _run(
                                ref,
                                () => ref
                                    .read(driverRepositoryProvider)
                                    .completeTrip(trip.id))
                            : null,
                        child: const Text('Завершить'))),
                const SizedBox(width: 8),
                IconButton(
                    onPressed:
                        trip.status != 'Completed' && trip.status != 'Cancelled'
                            ? () => _run(
                                ref,
                                () => ref
                                    .read(driverRepositoryProvider)
                                    .cancelTrip(trip.id))
                            : null,
                    icon: const Icon(Icons.cancel_outlined)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _run(WidgetRef ref, Future<void> Function() action) async {
    await action();
    ref.invalidate(driverTripsProvider);
    ref.invalidate(driverBookingsProvider);
  }
}

class _InfoBox extends StatelessWidget {
  const _InfoBox(
      {required this.title, required this.value, required this.subtitle});

  final String title;
  final String value;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(18)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 4),
          Text(value,
              style:
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
        ],
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
      decoration: BoxDecoration(
          color: Colors.white, borderRadius: BorderRadius.circular(18)),
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
            const Text('Не удалось загрузить данные.',
                textAlign: TextAlign.center),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Повторить')),
          ],
        ),
      ),
    );
  }
}
