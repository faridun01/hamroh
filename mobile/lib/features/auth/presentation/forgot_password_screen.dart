import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/auth/data/auth_repository.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final phone = TextEditingController(text: '+992');
  final otpCode = TextEditingController();
  final password = TextEditingController();
  final confirmPassword = TextEditingController();
  bool loading = false;
  String? message;
  bool isError = false;

  @override
  void dispose() {
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
      appBar: AppBar(title: const Text('Восстановление пароля')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Введите телефон, получите SMS код и задайте новый пароль.', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 18),
            TextField(controller: phone, onChanged: _keepCountryCode, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Телефон')),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: TextField(controller: otpCode, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'SMS код'))),
                const SizedBox(width: 12),
                OutlinedButton(onPressed: loading ? null : _sendOtp, child: const Text('Код')),
              ],
            ),
            const SizedBox(height: 12),
            TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Новый пароль')),
            const SizedBox(height: 12),
            TextField(controller: confirmPassword, obscureText: true, decoration: const InputDecoration(labelText: 'Повторите пароль')),
            if (message != null) ...[
              const SizedBox(height: 12),
              Text(message!, style: TextStyle(color: isError ? Theme.of(context).colorScheme.error : const Color(0xFF047857), fontWeight: FontWeight.w700)),
            ],
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: loading ? null : _resetPassword,
              child: loading ? const CircularProgressIndicator.adaptive() : const Text('Сохранить пароль'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _sendOtp() async {
    setState(() {
      loading = true;
      message = null;
      isError = false;
    });

    try {
      await ref.read(authRepositoryProvider).sendOtp(phone: phone.text.trim());
      if (mounted) setState(() => message = 'SMS код отправлен.');
    } catch (_) {
      if (mounted) {
        setState(() {
          message = 'Не удалось отправить SMS код.';
          isError = true;
        });
      }
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _resetPassword() async {
    if (password.text != confirmPassword.text) {
      setState(() {
        message = 'Пароли не совпадают.';
        isError = true;
      });
      return;
    }

    if (otpCode.text.trim().isEmpty || password.text.length < 8) {
      setState(() {
        message = 'Введите SMS код и пароль не короче 8 символов.';
        isError = true;
      });
      return;
    }

    setState(() {
      loading = true;
      message = null;
      isError = false;
    });

    try {
      await ref.read(authRepositoryProvider).resetPassword(
            phone: phone.text.trim(),
            otpCode: otpCode.text.trim(),
            newPassword: password.text,
          );
      if (mounted) {
        setState(() => message = 'Пароль обновлен. Теперь войдите снова.');
        Future<void>.delayed(const Duration(milliseconds: 900), () {
          if (mounted) context.go('/login');
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          message = 'Не удалось обновить пароль. Проверьте SMS код.';
          isError = true;
        });
      }
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}
