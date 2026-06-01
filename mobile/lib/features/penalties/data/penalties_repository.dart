import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';

final penaltiesRepositoryProvider = Provider<PenaltiesRepository>((ref) => PenaltiesRepository(ref.watch(dioProvider)));

class PenaltiesRepository {
  const PenaltiesRepository(this._dio);

  final Dio _dio;

  Future<List<PenaltyItem>> mine() async {
    final response = await _dio.get('/penalties/me');
    final data = response.data['data'] as List<dynamic>;
    return data.map((item) => PenaltyItem.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<void> pay(String penaltyId) async {
    await _dio.post('/penalties/$penaltyId/pay');
  }
}

class PenaltyItem {
  const PenaltyItem({
    required this.id,
    required this.bookingId,
    required this.amount,
    required this.isPaid,
    required this.createdAt,
  });

  final String id;
  final String bookingId;
  final num amount;
  final bool isPaid;
  final String createdAt;

  factory PenaltyItem.fromJson(Map<String, dynamic> json) {
    return PenaltyItem(
      id: json['id'] as String,
      bookingId: json['bookingId'] as String,
      amount: json['amount'] as num,
      isPaid: json['isPaid'] as bool,
      createdAt: json['createdAt'] as String,
    );
  }
}
