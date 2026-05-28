class AppConfig {
  const AppConfig({
    required this.apiBaseUrl,
    required this.environment,
  });

  final String apiBaseUrl;
  final String environment;

  static AppConfig fromEnvironment() {
    return const AppConfig(
      apiBaseUrl: String.fromEnvironment('API_BASE_URL', defaultValue: 'https://localhost:8080/api/v1'),
      environment: String.fromEnvironment('APP_ENV', defaultValue: 'development'),
    );
  }
}
