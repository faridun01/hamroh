import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/auth/presentation/language_selection_screen.dart';
import 'package:hamroh_mobile/features/auth/presentation/login_screen.dart';
import 'package:hamroh_mobile/features/auth/presentation/onboarding_screen.dart';
import 'package:hamroh_mobile/features/auth/presentation/register_driver_screen.dart';
import 'package:hamroh_mobile/features/auth/presentation/register_passenger_screen.dart';
import 'package:hamroh_mobile/features/auth/presentation/role_selection_screen.dart';
import 'package:hamroh_mobile/features/bookings/presentation/booking_details_screen.dart';
import 'package:hamroh_mobile/features/bookings/presentation/booking_confirmation_screen.dart';
import 'package:hamroh_mobile/features/passenger/presentation/passenger_shell.dart';
import 'package:hamroh_mobile/features/trips/presentation/trip_details_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/language',
    routes: [
      GoRoute(path: '/language', builder: (context, state) => const LanguageSelectionScreen()),
      GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/register/role', builder: (context, state) => const RoleSelectionScreen()),
      GoRoute(path: '/register/passenger', builder: (context, state) => const RegisterPassengerScreen()),
      GoRoute(path: '/register/driver', builder: (context, state) => const RegisterDriverScreen()),
      GoRoute(path: '/passenger', builder: (context, state) => const PassengerShell()),
      GoRoute(path: '/trips/:id', builder: (context, state) => TripDetailsScreen(tripId: state.pathParameters['id']!)),
      GoRoute(path: '/bookings/confirm/:tripId', builder: (context, state) => BookingConfirmationScreen(tripId: state.pathParameters['tripId']!)),
      GoRoute(path: '/bookings/:id', builder: (context, state) => BookingDetailsScreen(bookingId: state.pathParameters['id']!)),
    ],
  );
});
