import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';

final reviewsRepositoryProvider = Provider<ReviewsRepository>((ref) => ReviewsRepository(ref.watch(dioProvider)));

class ReviewsRepository {
  const ReviewsRepository(this._dio);

  final Dio _dio;

  Future<void> create({
    required String bookingId,
    required String toUserId,
    required int stars,
    required String comment,
  }) async {
    await _dio.post('/reviews', data: {
      'bookingId': bookingId,
      'toUserId': toUserId,
      'stars': stars,
      'comment': comment,
    });
  }
}
