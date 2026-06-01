import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/auth/data/auth_repository.dart';

class RegisterPassengerScreen extends ConsumerStatefulWidget {
  const RegisterPassengerScreen({super.key});

  @override
  ConsumerState<RegisterPassengerScreen> createState() =>
      _RegisterPassengerScreenState();
}

class _RegisterPassengerScreenState
    extends ConsumerState<RegisterPassengerScreen> {
  final firstName = TextEditingController();
  final lastName = TextEditingController();
  final phone = TextEditingController(text: '+992');
  final otpCode = TextEditingController();
  final password = TextEditingController();
  final confirmPassword = TextEditingController();
  String gender = 'Male';
  String language = 'ru';
  bool loading = false;
  String? error;

  @override
  void dispose() {
    firstName.dispose();
    lastName.dispose();
    phone.dispose();
    otpCode.dispose();
    password.dispose();
    confirmPassword.dispose();
    super.dispose();
  }

  void _keepCountryCode(String value) {
    if (value.startsWith('+992')) return;
    final digits = value.replaceAll(RegExp(r'\D'), '');
    final withoutCode = digits.startsWith('992') ? digits.substring(3) : digits;
    phone.value = TextEditingValue(
      text: '+992$withoutCode',
      selection: TextSelection.collapsed(offset: '+992$withoutCode'.length),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Пассажир')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
          children: [
            Text('Создать аккаунт пассажира',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text(
                'Пассажир регистрируется сразу, без подтверждения администратора.',
                style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 18),
            TextField(
                controller: firstName,
                decoration: const InputDecoration(labelText: 'Имя')),
            const SizedBox(height: 12),
            TextField(
                controller: lastName,
                decoration: const InputDecoration(labelText: 'Фамилия')),
            const SizedBox(height: 12),
            TextField(
                controller: phone,
                onChanged: _keepCountryCode,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Телефон')),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                      controller: otpCode,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(labelText: 'SMS код')),
                ),
                const SizedBox(width: 12),
                OutlinedButton(
                  onPressed: loading ? null : _sendOtp,
                  child: const Text('Код'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
                controller: password,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Пароль')),
            const SizedBox(height: 12),
            TextField(
                controller: confirmPassword,
                obscureText: true,
                decoration:
                    const InputDecoration(labelText: 'Повторите пароль')),
            const SizedBox(height: 12),
            DropdownButtonFormField(
              initialValue: gender,
              decoration: const InputDecoration(labelText: 'Пол'),
              items: const [
                DropdownMenuItem(value: 'Male', child: Text('Мужчина')),
                DropdownMenuItem(value: 'Female', child: Text('Женщина')),
              ],
              onChanged: (value) => setState(() => gender = value!),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField(
              initialValue: language,
              decoration: const InputDecoration(labelText: 'Язык'),
              items: const [
                DropdownMenuItem(value: 'ru', child: Text('Русский')),
                DropdownMenuItem(value: 'tg', child: Text('Тоҷикӣ')),
                DropdownMenuItem(value: 'en', child: Text('English')),
              ],
              onChanged: (value) => setState(() => language = value!),
            ),
            if (error != null) ...[
              const SizedBox(height: 12),
              Text(error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.all(16),
        child: ElevatedButton(
          onPressed: loading ? null : _submit,
          child: loading
              ? const CircularProgressIndicator.adaptive()
              : const Text('Зарегистрироваться'),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (password.text != confirmPassword.text) {
      setState(() => error = 'Пароли не совпадают.');
      return;
    }

    if (firstName.text.trim().isEmpty ||
        lastName.text.trim().isEmpty ||
        otpCode.text.trim().isEmpty ||
        password.text.isEmpty) {
      setState(() => error = 'Заполните обязательные поля.');
      return;
    }

    setState(() {
      loading = true;
      error = null;
    });

    try {
      await ref.read(authRepositoryProvider).registerPassenger(
            phone: phone.text.trim(),
            password: password.text,
            firstName: firstName.text.trim(),
            lastName: lastName.text.trim(),
            gender: gender,
            language: language,
            otpCode: otpCode.text.trim(),
          );
      if (mounted) context.go('/passenger');
    } catch (_) {
      if (mounted)
        setState(
            () => error = 'Не удалось зарегистрироваться. Проверьте данные.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _sendOtp() async {
    setState(() {
      loading = true;
      error = null;
    });

    try {
      await ref.read(authRepositoryProvider).sendOtp(phone: phone.text.trim());
      if (mounted) setState(() => error = 'SMS код отправлен.');
    } catch (_) {
      if (mounted) setState(() => error = 'Не удалось отправить SMS код.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}
