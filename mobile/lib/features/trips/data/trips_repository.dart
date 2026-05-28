import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';
import 'package:hamroh_mobile/core/network/page_result.dart';
import 'package:hamroh_mobile/features/trips/data/trip_models.dart';

final tripsRepositoryProvider = Provider<TripsRepository>((ref) => TripsRepository(ref.watch(dioProvider)));

class TripsRepository {
  const TripsRepository(this._dio);
  final Dio _dio;

  Future<PageResult<TripSummary>> searchTrips({
    required String fromCity,
    required String toCity,
    required String date,
    int page = 1,
  }) async {
    final response = await _dio.get('/trips', queryParameters: {
      'fromCity': fromCity,
      'toCity': toCity,
      'departureDate': date,
      'page': page,
      'pageSize': 20,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, TripSummary.fromJson);
  }

  Future<TripDetails> getTrip(String tripId) async {
    final response = await _dio.get('/trips/$tripId');
    return TripDetails.fromJson(response.data['data'] as Map<String, dynamic>);
  }
}
