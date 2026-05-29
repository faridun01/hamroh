import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';
import 'package:hamroh_mobile/core/network/page_result.dart';

final passengerRequestsRepositoryProvider = Provider<PassengerRequestsRepository>((ref) => PassengerRequestsRepository(ref.watch(dioProvider)));

class PassengerRequestsRepository {
  const PassengerRequestsRepository(this._dio);
  final Dio _dio;

  Future<PageResult<PassengerRequestItem>> mine({int page = 1}) async {
    final response = await _dio.get('/passenger-requests/me', queryParameters: {
      'page': page,
      'pageSize': 20,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, PassengerRequestItem.fromJson);
  }

  Future<void> create({
    required String fromCity,
    required String toCity,
    required String pickupAddress,
    double? pickupLatitude,
    double? pickupLongitude,
    required String dropoffPoint,
    double? dropoffLatitude,
    double? dropoffLongitude,
    required String departureDate,
    required String departureTime,
    required int seatsCount,
    required bool hasBaggage,
    required String comment,
    required num suggestedPrice,
    String? preferredDriverGender,
  }) async {
    await _dio.post('/passenger-requests', data: {
      'fromCity': fromCity,
      'toCity': toCity,
      'pickupAddress': pickupAddress,
      'pickupLatitude': pickupLatitude,
      'pickupLongitude': pickupLongitude,
      'dropoffPoint': dropoffPoint,
      'dropoffLatitude': dropoffLatitude,
      'dropoffLongitude': dropoffLongitude,
      'departureDate': departureDate,
      'departureTime': departureTime,
      'seatsCount': seatsCount,
      'hasBaggage': hasBaggage,
      'preferredDriverGender': preferredDriverGender,
      'comment': comment,
      'suggestedPrice': suggestedPrice,
    });
  }

  Future<void> confirmDriver(String requestId) async {
    await _dio.post('/passenger-requests/$requestId/confirm-driver');
  }
}

class PassengerRequestItem {
  const PassengerRequestItem({
    required this.id,
    required this.fromCity,
    required this.toCity,
    required this.pickupAddress,
    this.pickupLatitude,
    this.pickupLongitude,
    required this.dropoffPoint,
    this.dropoffLatitude,
    this.dropoffLongitude,
    required this.departureDate,
    required this.departureTime,
    required this.seatsCount,
    required this.suggestedPrice,
    required this.hasBaggage,
    required this.comment,
    required this.status,
    this.acceptedByDriverId,
    this.bookingId,
    required this.passengerConfirmedDriver,
  });

  final String id;
  final String fromCity;
  final String toCity;
  final String pickupAddress;
  final double? pickupLatitude;
  final double? pickupLongitude;
  final String dropoffPoint;
  final double? dropoffLatitude;
  final double? dropoffLongitude;
  final String departureDate;
  final String departureTime;
  final int seatsCount;
  final num suggestedPrice;
  final bool hasBaggage;
  final String comment;
  final String status;
  final String? acceptedByDriverId;
  final String? bookingId;
  final bool passengerConfirmedDriver;

  factory PassengerRequestItem.fromJson(Map<String, dynamic> json) {
    return PassengerRequestItem(
      id: json['id'] as String,
      fromCity: json['fromCity'] as String,
      toCity: json['toCity'] as String,
      pickupAddress: json['pickupAddress'] as String,
      pickupLatitude: (json['pickupLatitude'] as num?)?.toDouble(),
      pickupLongitude: (json['pickupLongitude'] as num?)?.toDouble(),
      dropoffPoint: json['dropoffPoint'] as String? ?? '',
      dropoffLatitude: (json['dropoffLatitude'] as num?)?.toDouble(),
      dropoffLongitude: (json['dropoffLongitude'] as num?)?.toDouble(),
      departureDate: json['departureDate'] as String,
      departureTime: json['departureTime'] as String,
      seatsCount: json['seatsCount'] as int,
      suggestedPrice: json['suggestedPrice'] as num,
      hasBaggage: json['hasBaggage'] as bool,
      comment: json['comment'] as String,
      status: json['status'] as String,
      acceptedByDriverId: json['acceptedByDriverId'] as String?,
      bookingId: json['bookingId'] as String?,
      passengerConfirmedDriver: json['passengerConfirmedDriver'] as bool,
    );
  }
}
