import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/location/location_service.dart';
import 'package:hamroh_mobile/features/passenger_requests/data/passenger_requests_repository.dart';

class CreatePassengerRequestScreen extends ConsumerStatefulWidget {
  const CreatePassengerRequestScreen({super.key});

  @override
  ConsumerState<CreatePassengerRequestScreen> createState() =>
      _CreatePassengerRequestScreenState();
}

class _CreatePassengerRequestScreenState
    extends ConsumerState<CreatePassengerRequestScreen> {
  String fromCity = 'Dushanbe';
  String toCity = 'Khujand';
  final pickupAddress = TextEditingController();
  final dropoffPoint = TextEditingController();
  final comment = TextEditingController();
  final price = TextEditingController(text: '120');
  int seats = 1;
  bool hasBaggage = false;
  bool loading = false;
  String? message;
  double? pickupLatitude;
  double? pickupLongitude;
  double? dropoffLatitude;
  double? dropoffLongitude;

  @override
  void dispose() {
    pickupAddress.dispose();
    dropoffPoint.dispose();
    comment.dispose();
    price.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Заявка на поездку',
              style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          Text(
            'Укажите точный адрес посадки. Можно использовать текущую локацию или выбрать точку на карте.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 18),
          DropdownButtonFormField(
              initialValue: fromCity,
              decoration: const InputDecoration(labelText: 'Откуда'),
              items: _cities(),
              onChanged: (value) => setState(() => fromCity = value!)),
          const SizedBox(height: 12),
          DropdownButtonFormField(
              initialValue: toCity,
              decoration: const InputDecoration(labelText: 'Куда'),
              items: _cities(),
              onChanged: (value) => setState(() => toCity = value!)),
          const SizedBox(height: 12),
          TextField(
              controller: pickupAddress,
              decoration:
                  const InputDecoration(labelText: 'Точный адрес посадки')),
          const SizedBox(height: 8),
          _LocationActions(
            onUseCurrent: () => _useCurrentLocation(forPickup: true),
            onPickMap: () => _setPickupLocation(
                'Точка посадки выбрана на карте', 38.5731, 68.7864),
          ),
          const SizedBox(height: 12),
          TextField(
              controller: dropoffPoint,
              decoration: const InputDecoration(labelText: 'Точка высадки')),
          const SizedBox(height: 8),
          _LocationActions(
            onUseCurrent: () => _useCurrentLocation(forPickup: false),
            onPickMap: () => _setDropoffLocation(
                'Точка высадки выбрана на карте', 40.2893, 69.6187),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField(
              initialValue: seats,
              decoration: const InputDecoration(labelText: 'Места'),
              items: [1, 2, 3, 4]
                  .map((item) =>
                      DropdownMenuItem(value: item, child: Text('$item')))
                  .toList(),
              onChanged: (value) => setState(() => seats = value!)),
          const SizedBox(height: 12),
          SwitchListTile(
            value: hasBaggage,
            onChanged: (value) => setState(() => hasBaggage = value),
            title: const Text('Есть багаж'),
            contentPadding: EdgeInsets.zero,
          ),
          const SizedBox(height: 12),
          TextField(
              controller: price,
              keyboardType: TextInputType.number,
              decoration:
                  const InputDecoration(labelText: 'Предлагаемая цена')),
          const SizedBox(height: 12),
          TextField(
              controller: comment,
              minLines: 3,
              maxLines: 5,
              decoration: const InputDecoration(labelText: 'Комментарий')),
          if (message != null) ...[
            const SizedBox(height: 12),
            Text(message!,
                style: const TextStyle(
                    color: Color(0xFF047857), fontWeight: FontWeight.w700)),
          ],
          const SizedBox(height: 20),
          ElevatedButton(
              onPressed: loading ? null : _submit,
              child: loading
                  ? const CircularProgressIndicator.adaptive()
                  : const Text('Опубликовать заявку')),
        ],
      ),
    );
  }

  void _setPickupLocation(String label, double latitude, double longitude) {
    setState(() {
      pickupAddress.text = label;
      pickupLatitude = latitude;
      pickupLongitude = longitude;
      message = 'Локация посадки добавлена.';
    });
  }

  void _setDropoffLocation(String label, double latitude, double longitude) {
    setState(() {
      dropoffPoint.text = label;
      dropoffLatitude = latitude;
      dropoffLongitude = longitude;
      message = 'Локация высадки добавлена.';
    });
  }

  Future<void> _useCurrentLocation({required bool forPickup}) async {
    setState(() => message = 'Запрашиваем разрешение на локацию...');
    try {
      final point = await ref.read(locationServiceProvider).currentPosition();
      if (forPickup) {
        _setPickupLocation(
            'Моя текущая локация', point.latitude, point.longitude);
      } else {
        _setDropoffLocation(
            'Моя текущая локация', point.latitude, point.longitude);
      }
    } on LocationException catch (error) {
      if (mounted) setState(() => message = error.message);
    } catch (_) {
      if (mounted)
        setState(() => message =
            'Не удалось получить локацию. Выберите точку на карте или введите адрес вручную.');
    }
  }

  Future<void> _submit() async {
    if (pickupAddress.text.trim().isEmpty || dropoffPoint.text.trim().isEmpty) {
      setState(() => message = 'Укажите адрес посадки и точку высадки.');
      return;
    }

    setState(() {
      loading = true;
      message = null;
    });
    try {
      final now = DateTime.now();
      final date =
          '${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
      await ref.read(passengerRequestsRepositoryProvider).create(
            fromCity: fromCity,
            toCity: toCity,
            pickupAddress: pickupAddress.text.trim(),
            pickupLatitude: pickupLatitude,
            pickupLongitude: pickupLongitude,
            dropoffPoint: dropoffPoint.text.trim(),
            dropoffLatitude: dropoffLatitude,
            dropoffLongitude: dropoffLongitude,
            departureDate: date,
            departureTime: '09:00:00',
            seatsCount: seats,
            hasBaggage: hasBaggage,
            comment: comment.text.trim(),
            suggestedPrice: num.tryParse(price.text) ?? 0,
          );
      if (mounted) setState(() => message = 'Заявка опубликована.');
    } catch (_) {
      if (mounted) setState(() => message = 'Не удалось опубликовать заявку.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  List<DropdownMenuItem<String>> _cities() {
    return ['Dushanbe', 'Khujand', 'Bokhtar', 'Kulob', 'Khorog']
        .map((city) => DropdownMenuItem(value: city, child: Text(city)))
        .toList();
  }
}

class _LocationActions extends StatelessWidget {
  const _LocationActions({required this.onUseCurrent, required this.onPickMap});

  final VoidCallback onUseCurrent;
  final VoidCallback onPickMap;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton.icon(
            onPressed: onUseCurrent,
            icon: const Icon(Icons.my_location, size: 18),
            label: const Text('Моя локация'),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: OutlinedButton.icon(
            onPressed: onPickMap,
            icon: const Icon(Icons.map_outlined, size: 18),
            label: const Text('Выбрать на карте'),
          ),
        ),
      ],
    );
  }
}
