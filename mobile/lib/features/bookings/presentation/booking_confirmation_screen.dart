import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/bookings/data/bookings_repository.dart';
import 'package:hamroh_mobile/features/trips/data/trip_models.dart';
import 'package:hamroh_mobile/features/trips/data/trips_repository.dart';

final bookingTripProvider = FutureProvider.family<TripDetails, String>((ref, tripId) {
  return ref.watch(tripsRepositoryProvider).getTrip(tripId);
});

class BookingConfirmationScreen extends ConsumerStatefulWidget {
  const BookingConfirmationScreen({super.key, required this.tripId});

  final String tripId;

  @override
  ConsumerState<BookingConfirmationScreen> createState() => _BookingConfirmationScreenState();
}

class _BookingConfirmationScreenState extends ConsumerState<BookingConfirmationScreen> {
  int seats = 1;
  final messageController = TextEditingController();
  bool loading = false;
  String? error;

  @override
  void dispose() {
    messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final trip = ref.watch(bookingTripProvider(widget.tripId));

    return trip.when(
      loading: () => const Scaffold(body: SafeArea(child: Center(child: CircularProgressIndicator()))),
      error: (_, __) => Scaffold(
        appBar: AppBar(title: const Text('Подтверждение брони')),
        body: SafeArea(child: _ErrorView(onRetry: () => ref.invalidate(bookingTripProvider(widget.tripId)))),
      ),
      data: (data) {
        final maxSeats = data.availableSeats.clamp(1, 8).toInt();
        if (seats > maxSeats) {
          seats = maxSeats;
        }
        final total = data.pricePerSeat * seats;

        return Scaffold(
          appBar: AppBar(title: const Text('Подтверждение брони')),
          body: SafeArea(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 160),
              children: [
                Text('${data.fromCity} -> ${data.toCity}', style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text('${data.departureDate} · ${data.departureTime}', style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 18),
                _InfoCard(title: 'Водитель', subtitle: '${data.driverName} · ${data.vehicle}', icon: Icons.verified_user_outlined),
                const SizedBox(height: 12),
                const _InfoCard(title: 'Контакты', subtitle: 'Контакты откроются после подтверждения брони', icon: Icons.lock_outline),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Места', style: Theme.of(context).textTheme.titleMedium),
                    Row(
                      children: [
                        IconButton(onPressed: seats > 1 ? () => setState(() => seats--) : null, icon: const Icon(Icons.remove_circle_outline)),
                        SizedBox(width: 36, child: Center(child: Text('$seats', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900)))),
                        IconButton(onPressed: seats < maxSeats ? () => setState(() => seats++) : null, icon: const Icon(Icons.add_circle_outline)),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Card(
                  elevation: 0,
                  color: Colors.white,
                  child: ListTile(
                    title: const Text('Итого'),
                    subtitle: Text('${data.pricePerSeat} сомони x $seats'),
                    trailing: Text('$total сомони', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: messageController,
                  minLines: 3,
                  maxLines: 5,
                  decoration: const InputDecoration(labelText: 'Сообщение водителю'),
                ),
                const SizedBox(height: 12),
                const _InfoCard(title: 'Оплата', subtitle: 'Оплата при посадке. Предоплата не требуется.', icon: Icons.payments_outlined),
                if (error != null) ...[
                  const SizedBox(height: 12),
                  Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ],
              ],
            ),
          ),
          bottomNavigationBar: SafeArea(
            minimum: const EdgeInsets.all(16),
            child: ElevatedButton(
              onPressed: loading ? null : () => _confirm(total),
              child: loading ? const CircularProgressIndicator.adaptive() : Text('Подтвердить бронь · $total сомони'),
            ),
          ),
        );
      },
    );
  }

  Future<void> _confirm(num total) async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final bookingId = await ref.read(bookingsRepositoryProvider).createBooking(
            tripId: widget.tripId,
            seatsCount: seats,
            passengerMessage: messageController.text,
          );
      if (mounted) context.go('/bookings/$bookingId');
    } catch (_) {
      if (mounted) setState(() => error = 'Не удалось отправить бронь. Попробуйте еще раз.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
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
        leading: CircleAvatar(
          backgroundColor: const Color(0xFFD1FAE5),
          child: Icon(icon, color: const Color(0xFF047857)),
        ),
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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Не удалось загрузить данные бронирования.'),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: onRetry, child: const Text('Повторить')),
        ],
      ),
    );
  }
}
