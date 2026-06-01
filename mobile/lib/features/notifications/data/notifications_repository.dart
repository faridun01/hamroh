import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';
import 'package:hamroh_mobile/core/network/page_result.dart';

final notificationsRepositoryProvider = Provider<NotificationsRepository>((ref) => NotificationsRepository(ref.watch(dioProvider)));

class NotificationsRepository {
  const NotificationsRepository(this._dio);
  final Dio _dio;

  Future<PageResult<NotificationItem>> list({int page = 1}) async {
    final response = await _dio.get('/notifications', queryParameters: {
      'page': page,
      'pageSize': 20,
    });
    return PageResult.fromJson(response.data['data'] as Map<String, dynamic>, NotificationItem.fromJson);
  }

  Future<void> markRead(String notificationId) async {
    await _dio.post('/notifications/$notificationId/read');
  }

  Future<void> registerDevice({
    required String token,
    required String platform,
    String? deviceId,
  }) async {
    await _dio.post('/notifications/devices', data: {
      'token': token,
      'platform': platform,
      'deviceId': deviceId,
    });
  }
}

class NotificationItem {
  const NotificationItem({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.createdAt,
    this.bookingId,
    this.tripId,
  });

  final String id;
  final String title;
  final String message;
  final String type;
  final String? bookingId;
  final String? tripId;
  final bool isRead;
  final String createdAt;

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      type: json['type'] as String,
      bookingId: json['bookingId'] as String?,
      tripId: json['tripId'] as String?,
      isRead: json['isRead'] as bool,
      createdAt: json['createdAt'] as String,
    );
  }
}
