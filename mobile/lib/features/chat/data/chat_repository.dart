import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';

final chatRepositoryProvider = Provider<ChatRepository>((ref) => ChatRepository(ref.watch(dioProvider)));

class ChatRepository {
  const ChatRepository(this._dio);
  final Dio _dio;

  Future<List<ChatMessage>> messages(String bookingId) async {
    final response = await _dio.get('/chat/bookings/$bookingId/messages');
    final data = response.data['data'] as List<dynamic>;
    return data.map((item) => ChatMessage.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<void> send(String bookingId, String body) async {
    await _dio.post('/chat/bookings/$bookingId/messages', data: {'body': body});
  }
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.body,
    required this.createdAt,
    required this.isArchived,
  });

  final String id;
  final String senderId;
  final String body;
  final String createdAt;
  final bool isArchived;

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      body: json['body'] as String,
      createdAt: json['createdAt'] as String,
      isArchived: json['isArchived'] as bool,
    );
  }
}
