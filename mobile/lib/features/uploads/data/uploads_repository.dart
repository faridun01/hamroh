import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';

final uploadsRepositoryProvider = Provider<UploadsRepository>((ref) => UploadsRepository(ref.watch(dioProvider)));

class UploadsRepository {
  const UploadsRepository(this._dio);

  final Dio _dio;

  Future<String> uploadDocument({
    required String filePath,
    required String purpose,
  }) async {
    final formData = FormData.fromMap({
      'purpose': purpose,
      'file': await MultipartFile.fromFile(filePath),
    });

    final response = await _dio.post('/uploads/documents', data: formData);
    final data = response.data['data'] as Map<String, dynamic>;
    return data['storageKey'] as String;
  }
}
