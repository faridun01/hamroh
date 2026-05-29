import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/core/network/api_client.dart';
import 'package:hamroh_mobile/core/storage/secure_token_store.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.watch(dioProvider), ref.watch(secureTokenStoreProvider));
});

class AuthRepository {
  const AuthRepository(this._dio, this._tokens);

  final Dio _dio;
  final SecureTokenStore _tokens;

  Future<void> sendOtp({required String phone}) async {
    await _dio.post('/auth/send-otp', data: {
      'phone': phone,
    });
  }

  Future<void> login({required String phone, required String password}) async {
    final response = await _dio.post('/auth/login', data: {
      'phone': phone,
      'password': password,
    });
    final data = response.data['data'] as Map<String, dynamic>;
    await _tokens.saveTokens(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String,
    );
  }

  Future<void> resetPassword({
    required String phone,
    required String otpCode,
    required String newPassword,
  }) async {
    await _dio.post('/auth/reset-password', data: {
      'phone': phone,
      'otpCode': otpCode,
      'newPassword': newPassword,
    });
  }

  Future<void> registerPassenger({
    required String phone,
    required String password,
    required String firstName,
    required String lastName,
    required String gender,
    required String language,
    required String otpCode,
  }) async {
    final response = await _dio.post('/auth/register/passenger', data: {
      'phone': phone,
      'otpCode': otpCode,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      'gender': gender,
      'language': language,
    });
    final data = response.data['data'] as Map<String, dynamic>;
    await _tokens.saveTokens(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String,
    );
  }

  Future<void> registerDriver({
    required String phone,
    required String password,
    required String firstName,
    required String lastName,
    required String gender,
    required String language,
    required String licenseNumber,
    required String plateNumber,
    required String carBrand,
    required String carModel,
    required String carColor,
    required int carYear,
    required int seats,
    required String otpCode,
  }) async {
    await _dio.post('/auth/register/driver', data: {
      'phone': phone,
      'otpCode': otpCode,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      'gender': gender,
      'language': language,
      'profilePhotoKey': 'mvp/profile-photo-pending',
      'liveSelfieKey': 'mvp/live-selfie-pending',
      'licenseNumber': licenseNumber,
      'passportDocumentKey': 'mvp/passport-pending',
      'licenseDocumentKey': 'mvp/license-pending',
      'vehicle': {
        'brand': carBrand,
        'model': carModel,
        'color': carColor,
        'year': carYear,
        'plateNumber': plateNumber,
        'seats': seats,
        'technicalPassportKey': 'mvp/technical-passport-pending',
        'frontPhotoKey': 'mvp/front-car-pending',
        'backPhotoKey': 'mvp/back-car-pending',
        'interiorPhotoKey': 'mvp/interior-pending',
        'insuranceDocumentKey': '',
      },
    });
  }
}
