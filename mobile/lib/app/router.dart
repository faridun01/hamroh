import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/auth/presentation/language_selection_screen.dart';
import 'package:hamroh_mobile/features/auth/data/auth_state.dart';
import 'package:hamroh_mobile/features/auth/presentation/login_screen.dart';
import 'package:hamroh_mobile/features/auth/presentation/forgot_password_screen.dart';
import 'package:hamroh_mobile/features/auth/presentation/onboarding_screen.dart';
import 'package:hamroh_mobile/features/auth/presentation/register_driver_screen.dart';
import 'package:hamroh_mobile/features/auth/presentation/register_passenger_screen.dart';
import 'package:hamroh_mobile/features/auth/presentation/role_selection_screen.dart';
import 'package:hamroh_mobile/features/bookings/presentation/booking_details_screen.dart';
import 'package:hamroh_mobile/features/bookings/presentation/booking_confirmation_screen.dart';
import 'package:hamroh_mobile/features/admin/presentation/admin_shell.dart';
import 'package:hamroh_mobile/features/chat/presentation/chat_screen.dart';
import 'package:hamroh_mobile/features/complaints/presentation/create_complaint_screen.dart';
import 'package:hamroh_mobile/features/driver/presentation/driver_shell.dart';
import 'package:hamroh_mobile/features/passenger/presentation/passenger_shell.dart';
import 'package:hamroh_mobile/features/reviews/presentation/create_review_screen.dart';
import 'package:hamroh_mobile/features/trips/presentation/trip_details_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final currentUser = ref.watch(currentUserProvider);
  return GoRouter(
    initialLocation: '/language',
    redirect: (context, state) {
      final path = state.uri.path;
      final publicPaths = {
        '/language',
        '/onboarding',
        '/login',
        '/forgot-password',
        '/register/role',
        '/register/passenger',
        '/register/driver',
      };

      if (currentUser.isLoading) {
        return null;
      }

      final user = currentUser.valueOrNull;
      final isPublic = publicPaths.contains(path);
      if (user == null && !isPublic) {
        return '/login';
      }

      if (user != null && isPublic && path != '/language') {
        return homeRouteForRole(user.role);
      }

      if (user != null && path == '/driver' && user.role != 'Driver') {
        return homeRouteForRole(user.role);
      }

      if (user != null && path == '/admin' && user.role != 'Admin' && user.role != 'Moderator') {
        return homeRouteForRole(user.role);
      }

      return null;
    },
    routes: [
      GoRoute(path: '/language', builder: (context, state) => const LanguageSelectionScreen()),
      GoRoute(path: '/onboarding', builder: (context, state) => const OnboardingScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(path: '/forgot-password', builder: (context, state) => const ForgotPasswordScreen()),
      GoRoute(path: '/register/role', builder: (context, state) => const RoleSelectionScreen()),
      GoRoute(path: '/register/passenger', builder: (context, state) => const RegisterPassengerScreen()),
      GoRoute(path: '/register/driver', builder: (context, state) => const RegisterDriverScreen()),
      GoRoute(path: '/passenger', builder: (context, state) => const PassengerShell()),
      GoRoute(path: '/driver', builder: (context, state) => const DriverShell()),
      GoRoute(path: '/admin', builder: (context, state) => const AdminShell()),
      GoRoute(path: '/trips/:id', builder: (context, state) => TripDetailsScreen(tripId: state.pathParameters['id']!)),
      GoRoute(path: '/bookings/confirm/:tripId', builder: (context, state) => BookingConfirmationScreen(tripId: state.pathParameters['tripId']!)),
      GoRoute(path: '/bookings/:id', builder: (context, state) => BookingDetailsScreen(bookingId: state.pathParameters['id']!)),
      GoRoute(path: '/chat/:bookingId', builder: (context, state) => ChatScreen(bookingId: state.pathParameters['bookingId']!)),
      GoRoute(path: '/complaints/new', builder: (context, state) => CreateComplaintScreen(bookingId: state.uri.queryParameters['bookingId'])),
      GoRoute(
        path: '/reviews/new',
        builder: (context, state) => CreateReviewScreen(
          bookingId: state.uri.queryParameters['bookingId']!,
          toUserId: state.uri.queryParameters['toUserId']!,
        ),
      ),
    ],
  );
});
