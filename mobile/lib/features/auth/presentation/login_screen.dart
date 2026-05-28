import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/auth/data/auth_repository.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final phoneController = TextEditingController(text: '+992');
  final passwordController = TextEditingController();
  bool loading = false;
  String? error;

  @override
  void dispose() {
    phoneController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  void _keepCountryCode(String value) {
    if (value.startsWith('+992')) return;
    final digits = value.replaceAll(RegExp(r'\D'), '');
    final withoutCode = digits.startsWith('992') ? digits.substring(3) : digits;
    phoneController.value = TextEditingValue(
      text: '+992$withoutCode',
      selection: TextSelection.collapsed(offset: '+992$withoutCode'.length),
    );
  }

  @override
  Widget build(BuildContext context) {
    final text = _LoginText.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(text.login)),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Center(
            child: Transform.translate(
              offset: const Offset(0, -48),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: phoneController,
                    onChanged: _keepCountryCode,
                    keyboardType: TextInputType.phone,
                    decoration: InputDecoration(labelText: text.phone),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: passwordController,
                    obscureText: true,
                    decoration: InputDecoration(labelText: text.password),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: loading ? null : _login,
                    child: loading ? const CircularProgressIndicator.adaptive() : Text(text.login),
                  ),
                  const SizedBox(height: 12),
                  Center(child: TextButton(onPressed: () {}, child: Text(text.forgotPassword))),
                  if (error != null) ...[
                    const SizedBox(height: 8),
                    Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _login() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      await ref.read(authRepositoryProvider).login(
            phone: phoneController.text.trim(),
            password: passwordController.text,
          );
      if (mounted) context.go('/passenger');
    } catch (_) {
      if (mounted) {
        setState(() => error = _LoginText.of(context).loginError);
      }
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}

class _LoginText {
  const _LoginText({
    required this.login,
    required this.phone,
    required this.password,
    required this.forgotPassword,
    required this.loginError,
  });

  final String login;
  final String phone;
  final String password;
  final String forgotPassword;
  final String loginError;

  static _LoginText of(BuildContext context) {
    return switch (Localizations.localeOf(context).languageCode) {
      'tg' => const _LoginText(
          login: 'Ворид шудан',
          phone: 'Телефон',
          password: 'Парол',
          forgotPassword: 'Паролро фаромӯш кардед?',
          loginError: 'Ворид шудан муяссар нашуд. Телефон ва паролро санҷед.',
        ),
      'en' => const _LoginText(
          login: 'Log in',
          phone: 'Phone',
          password: 'Password',
          forgotPassword: 'Forgot password?',
          loginError: 'Could not log in. Check phone and password.',
        ),
      _ => const _LoginText(
          login: 'Войти',
          phone: 'Телефон',
          password: 'Пароль',
          forgotPassword: 'Забыли пароль?',
          loginError: 'Не удалось войти. Проверьте телефон и пароль.',
        ),
    };
  }
}
