import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';
import 'package:hamroh_mobile/core/network/page_result.dart';

final driverRepositoryProvider = Provider<DriverRepository>((ref) => DriverRepository(ref.watch(dioProvider)));

class DriverRepository {
  const DriverRepository(this._dio);

  final Dio _dio;

  Future<DriverProfileDetails> me() async {
    final response = await _dio.get('/driver/me');
    return DriverProfileDetails.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<PageResult<DriverTripItem>> myTrips({int page = 1}) async {
    final response = await _dio.get('/trips/me', queryParameters: {
      'page': page,
      'pageSize': 20,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, DriverTripItem.fromJson);
  }

  Future<void> createTrip({
    required String vehicleId,
    required String fromCity,
    required String toCity,
    required String departureDate,
    required String departureTime,
    required String pickupPoint,
    required String dropoffPoint,
    required num pricePerSeat,
    required int totalSeats,
    required bool allowBaggage,
    required bool womenFriendly,
    required String driverComment,
  }) async {
    await _dio.post('/trips', data: {
      'vehicleId': vehicleId,
      'fromCity': fromCity,
      'toCity': toCity,
      'departureDate': departureDate,
      'departureTime': departureTime,
      'pickupPoint': pickupPoint,
      'dropoffPoint': dropoffPoint,
      'pricePerSeat': pricePerSeat,
      'totalSeats': totalSeats,
      'allowBaggage': allowBaggage,
      'womenFriendly': womenFriendly,
      'driverComment': driverComment,
    });
  }

  Future<void> cancelTrip(String tripId) async {
    await _dio.post('/trips/$tripId/cancel');
  }

  Future<void> startTrip(String tripId) async {
    await _dio.post('/trips/$tripId/start');
  }

  Future<void> completeTrip(String tripId) async {
    await _dio.post('/trips/$tripId/complete');
  }
}

class DriverProfileDetails {
  const DriverProfileDetails({required this.profile, required this.vehicles});

  final DriverProfile profile;
  final List<DriverVehicle> vehicles;

  factory DriverProfileDetails.fromJson(Map<String, dynamic> json) {
    return DriverProfileDetails(
      profile: DriverProfile.fromJson(json['profile'] as Map<String, dynamic>),
      vehicles: (json['vehicles'] as List<dynamic>).map((item) => DriverVehicle.fromJson(item as Map<String, dynamic>)).toList(),
    );
  }
}

class DriverProfile {
  const DriverProfile({
    required this.userId,
    required this.verificationStatus,
    required this.verificationReason,
    required this.rating,
    required this.totalTrips,
  });

  final String userId;
  final String verificationStatus;
  final String verificationReason;
  final num rating;
  final int totalTrips;

  factory DriverProfile.fromJson(Map<String, dynamic> json) {
    return DriverProfile(
      userId: json['userId'] as String,
      verificationStatus: json['verificationStatus'] as String,
      verificationReason: json['verificationReason'] as String? ?? '',
      rating: json['rating'] as num,
      totalTrips: json['totalTrips'] as int,
    );
  }
}

class DriverVehicle {
  const DriverVehicle({
    required this.id,
    required this.brand,
    required this.model,
    required this.color,
    required this.year,
    required this.plateNumber,
    required this.seats,
    required this.verificationStatus,
    required this.verificationReason,
  });

  final String id;
  final String brand;
  final String model;
  final String color;
  final int year;
  final String plateNumber;
  final int seats;
  final String verificationStatus;
  final String verificationReason;

  bool get isVerified => verificationStatus == 'Verified';

  factory DriverVehicle.fromJson(Map<String, dynamic> json) {
    return DriverVehicle(
      id: json['id'] as String,
      brand: json['brand'] as String,
      model: json['model'] as String,
      color: json['color'] as String,
      year: json['year'] as int,
      plateNumber: json['plateNumber'] as String,
      seats: json['seats'] as int,
      verificationStatus: json['verificationStatus'] as String,
      verificationReason: json['verificationReason'] as String? ?? '',
    );
  }
}

class DriverTripItem {
  const DriverTripItem({
    required this.id,
    required this.fromCity,
    required this.toCity,
    required this.departureDate,
    required this.departureTime,
    required this.pricePerSeat,
    required this.availableSeats,
    required this.totalSeats,
    required this.status,
  });

  final String id;
  final String fromCity;
  final String toCity;
  final String departureDate;
  final String departureTime;
  final num pricePerSeat;
  final int availableSeats;
  final int totalSeats;
  final String status;

  factory DriverTripItem.fromJson(Map<String, dynamic> json) {
    return DriverTripItem(
      id: json['id'] as String,
      fromCity: json['fromCity'] as String,
      toCity: json['toCity'] as String,
      departureDate: json['departureDate'] as String,
      departureTime: json['departureTime'] as String,
      pricePerSeat: json['pricePerSeat'] as num,
      availableSeats: json['availableSeats'] as int,
      totalSeats: json['totalSeats'] as int,
      status: json['status'].toString(),
    );
  }
}
