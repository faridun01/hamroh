import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';

final paymentsRepositoryProvider = Provider<PaymentsRepository>((ref) => PaymentsRepository(ref.watch(dioProvider)));

class PaymentsRepository {
  const PaymentsRepository(this._dio);

  final Dio _dio;

  Future<void> markBookingCashPaid(String bookingId) async {
    await _dio.post('/payments/bookings/$bookingId/cash-paid');
  }
}
