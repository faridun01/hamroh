import 'package:flutter/material.dart';
import 'package:hamroh_mobile/features/bookings/presentation/my_bookings_screen.dart';
import 'package:hamroh_mobile/features/notifications/presentation/notifications_screen.dart';
import 'package:hamroh_mobile/features/passenger_requests/presentation/create_passenger_request_screen.dart';
import 'package:hamroh_mobile/features/trips/presentation/trip_search_screen.dart';

class PassengerShell extends StatefulWidget {
  const PassengerShell({super.key});

  @override
  State<PassengerShell> createState() => _PassengerShellState();
}

class _PassengerShellState extends State<PassengerShell> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      const TripSearchScreen(),
      const MyBookingsScreen(),
      const CreatePassengerRequestScreen(),
      const NotificationsScreen(),
      const Center(child: Text('Профиль')),
    ];

    return Scaffold(
      body: SafeArea(child: screens[index]),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.search), label: 'Поиск'),
          NavigationDestination(icon: Icon(Icons.route), label: 'Поездки'),
          NavigationDestination(icon: Icon(Icons.add_location_alt_outlined), label: 'Заявка'),
          NavigationDestination(icon: Icon(Icons.notifications_none), label: 'Уведомления'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Профиль'),
        ],
      ),
    );
  }
}
