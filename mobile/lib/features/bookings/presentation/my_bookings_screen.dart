import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/core/network/page_result.dart';
import 'package:hamroh_mobile/features/bookings/data/booking_models.dart';
import 'package:hamroh_mobile/features/bookings/data/bookings_repository.dart';
import 'package:hamroh_mobile/features/passenger_requests/data/passenger_requests_repository.dart';

final myBookingsProvider = FutureProvider<PageResult<BookingListItem>>((ref) {
  return ref.watch(bookingsRepositoryProvider).myBookings();
});

final myPassengerRequestsProvider = FutureProvider<PageResult<PassengerRequestItem>>((ref) {
  return ref.watch(passengerRequestsRepositoryProvider).mine();
});

class MyBookingsScreen extends ConsumerWidget {
  const MyBookingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookings = ref.watch(myBookingsProvider);
    final requests = ref.watch(myPassengerRequestsProvider);

    if (bookings.isLoading || requests.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (bookings.hasError || requests.hasError) {
      return _ErrorView(onRetry: () {
        ref.invalidate(myBookingsProvider);
        ref.invalidate(myPassengerRequestsProvider);
      });
    }

    final bookingItems = bookings.value?.items ?? [];
    final requestItems = requests.value?.items ?? [];

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Мои поездки', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 16),
        Text('Брони', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 10),
        if (bookingItems.isEmpty)
          const _EmptyBox(text: 'У вас пока нет броней.')
        else
          ...bookingItems.map((booking) => Card(
                elevation: 0,
                color: Colors.white,
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  onTap: () => context.go('/bookings/${booking.id}'),
                  title: Text('${booking.fromCity} -> ${booking.toCity}', style: const TextStyle(fontWeight: FontWeight.w800)),
                  subtitle: Text('${booking.departureDate} · ${booking.departureTime} · ${booking.status}'),
                  trailing: Text('${booking.totalPrice} смн', style: const TextStyle(fontWeight: FontWeight.w900)),
                ),
              )),
        const SizedBox(height: 20),
        Text('Мои заявки', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 10),
        if (requestItems.isEmpty)
          const _EmptyBox(text: 'Вы пока не публиковали заявки.')
        else
          ...requestItems.map((request) => _PassengerRequestCard(request: request)),
      ],
    );
  }
}

class _PassengerRequestCard extends StatelessWidget {
  const _PassengerRequestCard({required this.request});

  final PassengerRequestItem request;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text('${request.fromCity} -> ${request.toCity}', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                ),
                _StatusPill(status: request.status),
              ],
            ),
            const SizedBox(height: 8),
            Text('${request.departureDate} · ${request.departureTime}', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 8),
            Text(request.pickupAddress, style: const TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text('${request.seatsCount} мест(а) · ${request.suggestedPrice} смн${request.hasBaggage ? ' · багаж' : ''}', style: Theme.of(context).textTheme.bodySmall),
            if (request.status == 'DriverOffered') ...[
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {},
                  child: const Text('Подтвердить водителя'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final accepted = status == 'Accepted';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: accepted ? const Color(0xFFD1FAE5) : const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Text(status, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF047857))),
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
            const Text('Не удалось загрузить поездки.', textAlign: TextAlign.center),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('Повторить')),
          ],
        ),
      ),
    );
  }
}
