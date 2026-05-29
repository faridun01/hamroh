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
    onError: (error, handler) async {
      final request = error.requestOptions;
      final isAuthRefresh = request.path.endsWith('/auth/refresh');
      final alreadyRetried = request.extra['authRetried'] == true;

      if (error.response?.statusCode == 401 && !isAuthRefresh && !alreadyRetried) {
        final refreshToken = await tokenStore.readRefreshToken();
        if (refreshToken != null) {
          try {
            final refreshResponse = await dio.post('/auth/refresh', data: {
              'refreshToken': refreshToken,
            });
            final data = refreshResponse.data['data'] as Map<String, dynamic>;
            final accessToken = data['accessToken'] as String;
            final nextRefreshToken = data['refreshToken'] as String;
            await tokenStore.saveTokens(accessToken: accessToken, refreshToken: nextRefreshToken);

            final retryOptions = Options(
              method: request.method,
              headers: {
                ...request.headers,
                'Authorization': 'Bearer $accessToken',
              },
              responseType: request.responseType,
              contentType: request.contentType,
              followRedirects: request.followRedirects,
              validateStatus: request.validateStatus,
              receiveDataWhenStatusError: request.receiveDataWhenStatusError,
              extra: {
                ...request.extra,
                'authRetried': true,
              },
            );

            final retryResponse = await dio.request<dynamic>(
              request.path,
              data: request.data,
              queryParameters: request.queryParameters,
              options: retryOptions,
              cancelToken: request.cancelToken,
              onReceiveProgress: request.onReceiveProgress,
              onSendProgress: request.onSendProgress,
            );
            handler.resolve(retryResponse);
            return;
          } catch (_) {
            await tokenStore.clear();
          }
        }
      }

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
