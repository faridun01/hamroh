import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/trips/data/trip_models.dart';
import 'package:hamroh_mobile/features/trips/data/trips_repository.dart';

class TripSearchScreen extends ConsumerStatefulWidget {
  const TripSearchScreen({super.key});

  @override
  ConsumerState<TripSearchScreen> createState() => _TripSearchScreenState();
}

class _TripSearchScreenState extends ConsumerState<TripSearchScreen> {
  String fromCity = 'Dushanbe';
  String toCity = 'Khujand';
  DateTime date = DateTime.now();
  int seats = 1;
  bool loading = false;
  String? error;
  List<TripSummary> trips = [];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Куда едем?', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 8),
        Text('Найдите надежную поездку между городами.', style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 20),
        DropdownButtonFormField(value: fromCity, decoration: const InputDecoration(labelText: 'Откуда'), items: _cities(), onChanged: (value) => setState(() => fromCity = value!)),
        const SizedBox(height: 12),
        DropdownButtonFormField(value: toCity, decoration: const InputDecoration(labelText: 'Куда'), items: _cities(), onChanged: (value) => setState(() => toCity = value!)),
        const SizedBox(height: 12),
        DropdownButtonFormField(value: seats, decoration: const InputDecoration(labelText: 'Пассажиры'), items: [1, 2, 3, 4].map((x) => DropdownMenuItem(value: x, child: Text('$x мест(а)'))).toList(), onChanged: (value) => setState(() => seats = value!)),
        const SizedBox(height: 20),
        ElevatedButton(onPressed: loading ? null : _search, child: loading ? const CircularProgressIndicator.adaptive() : const Text('Найти поездку')),
        if (error != null) ...[
          const SizedBox(height: 14),
          _ErrorBox(message: error!, onRetry: _search),
        ],
        if (trips.isNotEmpty) ...[
          const SizedBox(height: 22),
          Text('Доступные поездки', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          ...trips.where((trip) => trip.availableSeats >= seats).map((trip) => _TripCard(trip: trip)),
        ],
      ],
    );
  }

  Future<void> _search() async {
    setState(() {
      loading = true;
      error = null;
    });

    try {
      final result = await ref.read(tripsRepositoryProvider).searchTrips(
            fromCity: fromCity,
            toCity: toCity,
            date: _dateOnly(date),
          );
      if (mounted) {
        setState(() {
          trips = result.items;
          if (trips.isEmpty) {
            error = 'По этому маршруту пока нет поездок.';
          }
        });
      }
    } catch (_) {
      if (mounted) setState(() => error = 'Не удалось загрузить поездки. Проверьте интернет и попробуйте еще раз.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  String _dateOnly(DateTime value) {
    final month = value.month.toString().padLeft(2, '0');
    final day = value.day.toString().padLeft(2, '0');
    return '${value.year}-$month-$day';
  }

  List<DropdownMenuItem<String>> _cities() {
    return ['Dushanbe', 'Khujand', 'Bokhtar', 'Kulob', 'Khorog'].map((city) => DropdownMenuItem(value: city, child: Text(city))).toList();
  }
}

class _TripCard extends StatelessWidget {
  const _TripCard({required this.trip});

  final TripSummary trip;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () => context.go('/trips/${trip.id}'),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(child: Text('${trip.fromCity} -> ${trip.toCity}', style: Theme.of(context).textTheme.titleMedium)),
                  Text('${trip.pricePerSeat} смн', style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xFF047857))),
                ],
              ),
              const SizedBox(height: 8),
              Text('${trip.departureDate} · ${trip.departureTime}', style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 10),
              Text('${trip.driverName} · ${trip.vehicle}', style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              Text('${trip.availableSeats} свободных мест', style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}

class _ErrorBox extends StatelessWidget {
  const _ErrorBox({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
      child: Row(
        children: [
          Expanded(child: Text(message)),
          TextButton(onPressed: onRetry, child: const Text('Повторить')),
        ],
      ),
    );
  }
}
