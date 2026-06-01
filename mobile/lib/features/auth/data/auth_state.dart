import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/features/auth/data/auth_repository.dart';

final currentUserProvider = FutureProvider<AuthUser?>((ref) async {
  try {
    return await ref.watch(authRepositoryProvider).me();
  } catch (_) {
    return null;
  }
});

String homeRouteForRole(String? role) {
  return switch (role) {
    'Driver' => '/driver',
    'Admin' || 'Moderator' => '/admin',
    _ => '/passenger',
  };
}
