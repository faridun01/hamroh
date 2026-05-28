import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/config/app_config.dart';
import 'package:hamroh_mobile/core/storage/secure_token_store.dart';

final dioProvider = Provider<Dio>((ref) {
  final config = AppConfig.fromEnvironment();
  final tokenStore = ref.watch(secureTokenStoreProvider);
  final dio = Dio(BaseOptions(
    baseUrl: config.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 20),
    responseType: ResponseType.json,
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final accessToken = await tokenStore.readAccessToken();
      if (accessToken != null) {
        options.headers['Authorization'] = 'Bearer $accessToken';
      }
      handler.next(options);
    },
    onError: (error, handler) {
      handler.next(error);
    },
  ));

  return dio;
});

class ApiEnvelope<T> {
  const ApiEnvelope({
    required this.success,
    required this.message,
    required this.errors,
    this.data,
  });

  final bool success;
  final T? data;
  final String message;
  final List<String> errors;
}
