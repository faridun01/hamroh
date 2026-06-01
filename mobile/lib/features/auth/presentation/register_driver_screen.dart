import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/features/auth/data/auth_repository.dart';

class RegisterDriverScreen extends ConsumerStatefulWidget {
  const RegisterDriverScreen({super.key});

  @override
  ConsumerState<RegisterDriverScreen> createState() =>
      _RegisterDriverScreenState();
}

class _RegisterDriverScreenState extends ConsumerState<RegisterDriverScreen> {
  final firstName = TextEditingController();
  final lastName = TextEditingController();
  final phone = TextEditingController(text: '+992');
  final otpCode = TextEditingController();
  final password = TextEditingController();
  final confirmPassword = TextEditingController();
  final licenseNumber = TextEditingController();
  final carBrand = TextEditingController();
  final carModel = TextEditingController();
  final carColor = TextEditingController();
  final carYear = TextEditingController();
  final plateNumber = TextEditingController();
  int seats = 4;
  String gender = 'Male';
  bool loading = false;
  String? error;
  String? success;

  @override
  void dispose() {
    for (final controller in [
      firstName,
      lastName,
      phone,
      otpCode,
      password,
      confirmPassword,
      licenseNumber,
      carBrand,
      carModel,
      carColor,
      carYear,
      plateNumber
    ]) {
      controller.dispose();
    }
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
      appBar: AppBar(title: const Text('Водитель')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
          children: [
            Text('Профиль водителя',
                style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text(
                'Водитель сможет создавать поездки только после проверки администратора.',
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
            DropdownButtonFormField<String>(
              initialValue: gender,
              decoration: const InputDecoration(labelText: 'Пол'),
              items: const [
                DropdownMenuItem<String>(value: 'Male', child: Text('Мужчина')),
                DropdownMenuItem<String>(
                    value: 'Female', child: Text('Женщина')),
              ],
              onChanged: (value) => setState(() => gender = value!),
            ),
            const SizedBox(height: 20),
            Text('Документы', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            TextField(
                controller: licenseNumber,
                decoration: const InputDecoration(
                    labelText: 'Номер водительского удостоверения')),
            const SizedBox(height: 10),
            const _UploadPlaceholder(
                text: 'Фото профиля, selfie, паспорт, права'),
            const SizedBox(height: 20),
            Text('Автомобиль', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            TextField(
                controller: carBrand,
                decoration: const InputDecoration(labelText: 'Марка')),
            const SizedBox(height: 12),
            TextField(
                controller: carModel,
                decoration: const InputDecoration(labelText: 'Модель')),
            const SizedBox(height: 12),
            TextField(
                controller: carColor,
                decoration: const InputDecoration(labelText: 'Цвет')),
            const SizedBox(height: 12),
            TextField(
                controller: carYear,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Год')),
            const SizedBox(height: 12),
            TextField(
                controller: plateNumber,
                decoration: const InputDecoration(labelText: 'Госномер')),
            const SizedBox(height: 12),
            DropdownButtonFormField<int>(
              initialValue: seats,
              decoration: const InputDecoration(labelText: 'Количество мест'),
              items: [1, 2, 3, 4, 5, 6, 7, 8]
                  .map((item) =>
                      DropdownMenuItem<int>(value: item, child: Text('$item')))
                  .toList(),
              onChanged: (value) => setState(() => seats = value!),
            ),
            const SizedBox(height: 10),
            const _UploadPlaceholder(
                text: 'Техпаспорт, фото спереди, сзади и салона'),
            if (error != null) ...[
              const SizedBox(height: 12),
              Text(error!,
                  style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
            if (success != null) ...[
              const SizedBox(height: 12),
              Text(success!,
                  style: const TextStyle(
                      color: Color(0xFF047857), fontWeight: FontWeight.w700)),
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
              : const Text('Отправить на проверку'),
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
        licenseNumber.text.trim().isEmpty ||
        plateNumber.text.trim().isEmpty) {
      setState(() => error = 'Заполните обязательные поля водителя.');
      return;
    }

    setState(() {
      loading = true;
      error = null;
      success = null;
    });

    try {
      await ref.read(authRepositoryProvider).registerDriver(
            phone: phone.text.trim(),
            password: password.text,
            firstName: firstName.text.trim(),
            lastName: lastName.text.trim(),
            gender: gender,
            language: 'ru',
            licenseNumber: licenseNumber.text.trim(),
            plateNumber: plateNumber.text.trim(),
            carBrand: carBrand.text.trim(),
            carModel: carModel.text.trim(),
            carColor: carColor.text.trim(),
            carYear: int.tryParse(carYear.text) ?? DateTime.now().year,
            seats: seats,
            otpCode: otpCode.text.trim(),
          );
      if (mounted) {
        setState(() => success = 'Ваш профиль водителя отправлен на проверку.');
        Future<void>.delayed(const Duration(milliseconds: 900), () {
          if (mounted) context.go('/login');
        });
      }
    } catch (_) {
      if (mounted)
        setState(
            () => error = 'Не удалось отправить профиль. Проверьте данные.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _sendOtp() async {
    setState(() {
      loading = true;
      error = null;
      success = null;
    });

    try {
      await ref.read(authRepositoryProvider).sendOtp(phone: phone.text.trim());
      if (mounted) setState(() => success = 'SMS код отправлен.');
    } catch (_) {
      if (mounted) setState(() => error = 'Не удалось отправить SMS код.');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}

class _UploadPlaceholder extends StatelessWidget {
  const _UploadPlaceholder({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFD1FAE5).withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          const Icon(Icons.cloud_upload_outlined, color: Color(0xFF047857)),
          const SizedBox(width: 12),
          Expanded(
              child: Text(text, style: Theme.of(context).textTheme.bodySmall)),
        ],
      ),
    );
  }
}
