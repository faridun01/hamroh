import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/trips/data/trip_models.dart';
import 'package:hamroh_mobile/features/trips/data/trips_repository.dart';

final tripDetailsProvider = FutureProvider.family<TripDetails, String>((ref, tripId) {
  return ref.watch(tripsRepositoryProvider).getTrip(tripId);
});

class TripDetailsScreen extends ConsumerWidget {
  const TripDetailsScreen({super.key, required this.tripId});

  final String tripId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trip = ref.watch(tripDetailsProvider(tripId));

    return Scaffold(
      appBar: AppBar(title: const Text('Детали поездки')),
      body: SafeArea(
        child: trip.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => _ErrorView(onRetry: () => ref.invalidate(tripDetailsProvider(tripId))),
          data: (data) => ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
            children: [
              Text('${data.fromCity} -> ${data.toCity}', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text('${data.departureDate} · ${data.departureTime}', style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 18),
              _InfoCard(title: 'Маршрут', subtitle: '${data.pickupPoint} -> ${data.dropoffPoint}', icon: Icons.route_outlined),
              const SizedBox(height: 12),
              _InfoCard(title: 'Водитель', subtitle: '${data.driverName} · ${data.vehicle}', icon: Icons.verified_outlined),
              const SizedBox(height: 12),
              _InfoCard(title: 'Места и цена', subtitle: '${data.pricePerSeat} сомони · ${data.availableSeats} свободных мест', icon: Icons.event_seat_outlined),
              const SizedBox(height: 12),
              const _InfoCard(title: 'Контакты', subtitle: 'Контакты откроются после подтверждения брони', icon: Icons.lock_outline),
              if (data.driverComment.isNotEmpty) ...[
                const SizedBox(height: 12),
                _InfoCard(title: 'Комментарий водителя', subtitle: data.driverComment, icon: Icons.notes_outlined),
              ],
            ],
          ),
        ),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: ElevatedButton(
          onPressed: () => context.go('/bookings/confirm/$tripId'),
          child: const Text('Забронировать'),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.title, required this.subtitle, required this.icon});

  final String title;
  final String subtitle;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      child: ListTile(
        leading: CircleAvatar(backgroundColor: const Color(0xFFD1FAE5), child: Icon(icon, color: const Color(0xFF047857))),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: Text(subtitle),
      ),
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
            const Text('Не удалось загрузить поездку.', textAlign: TextAlign.center),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Повторить')),
          ],
        ),
      ),
    );
  }
}
