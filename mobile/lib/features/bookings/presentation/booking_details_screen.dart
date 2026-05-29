import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/features/bookings/data/booking_models.dart';
import 'package:hamroh_mobile/features/bookings/data/bookings_repository.dart';

final bookingDetailsProvider = FutureProvider.family<BookingDetails, String>((ref, bookingId) {
  return ref.watch(bookingsRepositoryProvider).getBooking(bookingId);
});

class BookingDetailsScreen extends ConsumerWidget {
  const BookingDetailsScreen({super.key, required this.bookingId});

  final String bookingId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final booking = ref.watch(bookingDetailsProvider(bookingId));

    return Scaffold(
      appBar: AppBar(title: const Text('Бронь')),
      body: SafeArea(
        child: booking.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => _ErrorView(onRetry: () => ref.invalidate(bookingDetailsProvider(bookingId))),
          data: (data) => ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Text('${data.fromCity} -> ${data.toCity}', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text('${data.departureDate} · ${data.departureTime}', style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 18),
              _StatusCard(status: data.status),
              const SizedBox(height: 12),
              _InfoCard(title: 'Водитель', subtitle: '${data.driverName} · ${data.carInfo}', icon: Icons.person_outline),
              const SizedBox(height: 12),
              _InfoCard(title: 'Стоимость', subtitle: '${data.seatsCount} мест(а) · ${data.totalPrice} сомони', icon: Icons.payments_outlined),
              const SizedBox(height: 12),
              if (data.contactsVisible)
                _InfoCard(title: 'Контакты', subtitle: '${data.driverPhone ?? ''} · ${data.plateNumber ?? ''}', icon: Icons.call_outlined)
              else
                const _InfoCard(title: 'Контакты', subtitle: 'Контакты откроются после подтверждения брони', icon: Icons.lock_outline),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: data.chatAvailable ? () {} : null,
                      icon: const Icon(Icons.chat_bubble_outline),
                      label: const Text('Чат'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: data.contactsVisible ? () {} : null,
                      icon: const Icon(Icons.call_outlined),
                      label: const Text('Позвонить'),
                    ),
                  ),
                ],
              ),
              if (data.status == 'Accepted' && data.passengerFinalConfirmedAt == null) ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () async {
                      await ref.read(bookingsRepositoryProvider).confirmByPassenger(data.id);
                      ref.invalidate(bookingDetailsProvider(bookingId));
                    },
                    icon: const Icon(Icons.verified_outlined),
                    label: const Text('Точно еду'),
                  ),
                ),
              ],
              if (data.status == 'Accepted') ...[
                const SizedBox(height: 12),
                _InfoCard(
                  title: 'Подтверждение поездки',
                  subtitle: 'Пассажир: ${data.passengerFinalConfirmedAt == null ? 'ожидается' : 'точно едет'} · Водитель: ${data.driverFinalConfirmedAt == null ? 'ожидается' : 'точно едет'}',
                  icon: Icons.check_circle_outline,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final accepted = status == 'Accepted';
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: accepted ? const Color(0xFFD1FAE5) : Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Text(
        accepted ? 'Бронь подтверждена' : 'Статус: $status',
        style: const TextStyle(fontWeight: FontWeight.w900),
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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Не удалось загрузить бронь.'),
          const SizedBox(height: 12),
          OutlinedButton(onPressed: onRetry, child: const Text('Повторить')),
        ],
      ),
    );
  }
}
