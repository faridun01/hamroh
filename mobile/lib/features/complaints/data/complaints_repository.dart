import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';

final complaintsRepositoryProvider = Provider<ComplaintsRepository>((ref) => ComplaintsRepository(ref.watch(dioProvider)));

class ComplaintsRepository {
  const ComplaintsRepository(this._dio);

  final Dio _dio;

  Future<void> create({
    String? bookingId,
    required String type,
    required String description,
  }) async {
    await _dio.post('/complaints', data: {
      'bookingId': bookingId,
      'type': type,
      'description': description,
    });
  }
}
