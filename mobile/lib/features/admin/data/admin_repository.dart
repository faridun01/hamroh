import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';
import 'package:hamroh_mobile/core/network/page_result.dart';

final adminRepositoryProvider = Provider<AdminRepository>((ref) => AdminRepository(ref.watch(dioProvider)));

class AdminRepository {
  const AdminRepository(this._dio);

  final Dio _dio;

  Future<AdminStats> stats() async {
    final response = await _dio.get('/admin/stats');
    return AdminStats.fromJson(response.data['data'] as Map<String, dynamic>);
  }

  Future<PageResult<AdminUserItem>> users({int page = 1}) async {
    final response = await _dio.get('/admin/users', queryParameters: {
      'page': page,
      'pageSize': 30,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, AdminUserItem.fromJson);
  }

  Future<PageResult<AdminTripItem>> trips({String? status, int page = 1}) async {
    final response = await _dio.get('/admin/trips', queryParameters: {
      if (status != null) 'status': status,
      'page': page,
      'pageSize': 30,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, AdminTripItem.fromJson);
  }

  Future<PageResult<AdminBookingItem>> bookings({String? status, int page = 1}) async {
    final response = await _dio.get('/admin/bookings', queryParameters: {
      if (status != null) 'status': status,
      'page': page,
      'pageSize': 30,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, AdminBookingItem.fromJson);
  }

  Future<PageResult<AdminAuditItem>> audit({int page = 1}) async {
    final response = await _dio.get('/admin/audit', queryParameters: {
      'page': page,
      'pageSize': 30,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, AdminAuditItem.fromJson);
  }

  Future<PageResult<PendingDriverItem>> pendingDrivers({int page = 1}) async {
    final response = await _dio.get('/admin/drivers/pending', queryParameters: {
      'page': page,
      'pageSize': 30,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, PendingDriverItem.fromJson);
  }

  Future<PageResult<PendingVehicleItem>> pendingVehicles({int page = 1}) async {
    final response = await _dio.get('/admin/vehicles/pending', queryParameters: {
      'page': page,
      'pageSize': 30,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, PendingVehicleItem.fromJson);
  }

  Future<PageResult<AdminComplaintItem>> complaints({String? status, int page = 1}) async {
    final response = await _dio.get('/complaints', queryParameters: {
      if (status != null) 'status': status,
      'page': page,
      'pageSize': 30,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, AdminComplaintItem.fromJson);
  }

  Future<void> updateComplaintStatus(String complaintId, String status) async {
    await _dio.post('/complaints/$complaintId/status', data: {'status': status});
  }

  Future<void> approveDriver(String driverUserId) async {
    await _dio.post('/admin/drivers/$driverUserId/approve');
  }

  Future<void> rejectDriver(String driverUserId, String reason) async {
    await _dio.post('/admin/drivers/$driverUserId/reject', data: {'reason': reason});
  }

  Future<void> approveVehicle(String vehicleId) async {
    await _dio.post('/admin/vehicles/$vehicleId/approve');
  }

  Future<void> rejectVehicle(String vehicleId, String reason) async {
    await _dio.post('/admin/vehicles/$vehicleId/reject', data: {'reason': reason});
  }

  Future<void> blockUser(String userId) async {
    await _dio.post('/admin/users/$userId/block');
  }

  Future<void> unblockUser(String userId) async {
    await _dio.post('/admin/users/$userId/unblock');
  }
}

class AdminStats {
  const AdminStats({
    required this.users,
    required this.pendingDrivers,
    required this.publishedTrips,
    required this.pendingBookings,
    required this.openComplaints,
  });

  final int users;
  final int pendingDrivers;
  final int publishedTrips;
  final int pendingBookings;
  final int openComplaints;

  factory AdminStats.fromJson(Map<String, dynamic> json) {
    return AdminStats(
      users: json['users'] as int,
      pendingDrivers: json['pendingDrivers'] as int,
      publishedTrips: json['publishedTrips'] as int,
      pendingBookings: json['pendingBookings'] as int,
      openComplaints: json['openComplaints'] as int,
    );
  }
}

class AdminUserItem {
  const AdminUserItem({
    required this.id,
    required this.phone,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.city,
    required this.isActive,
    required this.createdAt,
  });

  final String id;
  final String phone;
  final String firstName;
  final String lastName;
  final String role;
  final String city;
  final bool isActive;
  final String createdAt;

  factory AdminUserItem.fromJson(Map<String, dynamic> json) {
    return AdminUserItem(
      id: json['id'] as String,
      phone: json['phone'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      role: json['role'] as String,
      city: json['city'] as String? ?? '',
      isActive: json['isActive'] as bool,
      createdAt: json['createdAt'] as String,
    );
  }
}

class AdminTripItem {
  const AdminTripItem({
    required this.id,
    required this.driverId,
    required this.driverName,
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
  final String driverId;
  final String driverName;
  final String fromCity;
  final String toCity;
  final String departureDate;
  final String departureTime;
  final num pricePerSeat;
  final int availableSeats;
  final int totalSeats;
  final String status;

  factory AdminTripItem.fromJson(Map<String, dynamic> json) {
    return AdminTripItem(
      id: json['id'] as String,
      driverId: json['driverId'] as String,
      driverName: json['driverName'] as String,
      fromCity: json['fromCity'] as String,
      toCity: json['toCity'] as String,
      departureDate: json['departureDate'] as String,
      departureTime: json['departureTime'] as String,
      pricePerSeat: json['pricePerSeat'] as num,
      availableSeats: json['availableSeats'] as int,
      totalSeats: json['totalSeats'] as int,
      status: json['status'] as String,
    );
  }
}

class AdminBookingItem {
  const AdminBookingItem({
    required this.id,
    required this.tripId,
    required this.passengerId,
    required this.passengerName,
    required this.driverId,
    required this.fromCity,
    required this.toCity,
    required this.seatsCount,
    required this.totalPrice,
    required this.status,
    required this.createdAt,
  });

  final String id;
  final String tripId;
  final String passengerId;
  final String passengerName;
  final String driverId;
  final String fromCity;
  final String toCity;
  final int seatsCount;
  final num totalPrice;
  final String status;
  final String createdAt;

  factory AdminBookingItem.fromJson(Map<String, dynamic> json) {
    return AdminBookingItem(
      id: json['id'] as String,
      tripId: json['tripId'] as String,
      passengerId: json['passengerId'] as String,
      passengerName: json['passengerName'] as String,
      driverId: json['driverId'] as String,
      fromCity: json['fromCity'] as String,
      toCity: json['toCity'] as String,
      seatsCount: json['seatsCount'] as int,
      totalPrice: json['totalPrice'] as num,
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
    );
  }
}

class AdminAuditItem {
  const AdminAuditItem({
    required this.id,
    required this.action,
    required this.entityType,
    required this.createdAt,
    this.actorUserId,
    this.entityId,
  });

  final int id;
  final String? actorUserId;
  final String action;
  final String entityType;
  final String? entityId;
  final String createdAt;

  factory AdminAuditItem.fromJson(Map<String, dynamic> json) {
    return AdminAuditItem(
      id: json['id'] as int,
      actorUserId: json['actorUserId'] as String?,
      action: json['action'] as String,
      entityType: json['entityType'] as String,
      entityId: json['entityId'] as String?,
      createdAt: json['createdAt'] as String,
    );
  }
}

class PendingDriverItem {
  const PendingDriverItem({
    required this.userId,
    required this.firstName,
    required this.lastName,
    required this.phone,
    required this.city,
    required this.licenseNumber,
    required this.submittedAt,
  });

  final String userId;
  final String firstName;
  final String lastName;
  final String phone;
  final String city;
  final String licenseNumber;
  final String submittedAt;

  factory PendingDriverItem.fromJson(Map<String, dynamic> json) {
    return PendingDriverItem(
      userId: json['userId'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      phone: json['phone'] as String,
      city: json['city'] as String? ?? '',
      licenseNumber: json['licenseNumber'] as String,
      submittedAt: json['submittedAt'] as String,
    );
  }
}

class PendingVehicleItem {
  const PendingVehicleItem({
    required this.id,
    required this.driverId,
    required this.driverName,
    required this.driverPhone,
    required this.brand,
    required this.model,
    required this.color,
    required this.year,
    required this.plateNumber,
    required this.seats,
    required this.submittedAt,
  });

  final String id;
  final String driverId;
  final String driverName;
  final String driverPhone;
  final String brand;
  final String model;
  final String color;
  final int year;
  final String plateNumber;
  final int seats;
  final String submittedAt;

  factory PendingVehicleItem.fromJson(Map<String, dynamic> json) {
    return PendingVehicleItem(
      id: json['id'] as String,
      driverId: json['driverId'] as String,
      driverName: json['driverName'] as String,
      driverPhone: json['driverPhone'] as String,
      brand: json['brand'] as String,
      model: json['model'] as String,
      color: json['color'] as String,
      year: json['year'] as int,
      plateNumber: json['plateNumber'] as String,
      seats: json['seats'] as int,
      submittedAt: json['submittedAt'] as String,
    );
  }
}

class AdminComplaintItem {
  const AdminComplaintItem({
    required this.id,
    required this.userId,
    required this.type,
    required this.description,
    required this.status,
    required this.createdAt,
    this.bookingId,
  });

  final String id;
  final String userId;
  final String? bookingId;
  final String type;
  final String description;
  final String status;
  final String createdAt;

  factory AdminComplaintItem.fromJson(Map<String, dynamic> json) {
    return AdminComplaintItem(
      id: json['id'] as String,
      userId: json['userId'] as String,
      bookingId: json['bookingId'] as String?,
      type: json['type'] as String,
      description: json['description'] as String,
      status: json['status'] as String,
      createdAt: json['createdAt'] as String,
    );
  }
}
