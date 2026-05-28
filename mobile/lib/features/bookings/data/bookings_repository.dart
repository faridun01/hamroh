import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';
import 'package:hamroh_mobile/core/network/page_result.dart';
import 'package:hamroh_mobile/features/bookings/data/booking_models.dart';

final bookingsRepositoryProvider = Provider<BookingsRepository>((ref) => BookingsRepository(ref.watch(dioProvider)));

class BookingsRepository {
  const BookingsRepository(this._dio);
  final Dio _dio;

  Future<String> createBooking({
    required String tripId,
    required int seatsCount,
    required String passengerMessage,
  }) async {
    final response = await _dio.post('/bookings', data: {
      'tripId': tripId,
      'seatsCount': seatsCount,
      'passengerMessage': passengerMessage,
    });
    return response.data['data']['id'] as String;
  }

  Future<BookingDetails> getBooking(String bookingId) async {
    final response = await _dio.get('/bookings/$bookingId');
    return BookingDetails.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<PageResult<BookingListItem>> myBookings({int page = 1}) async {
    final response = await _dio.get('/bookings/me', queryParameters: {
      'page': page,
      'pageSize': 20,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, BookingListItem.fromJson);
  }
}
