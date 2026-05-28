import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:hamroh_mobile/localization/locale_controller.dart';

class LanguageSelectionScreen extends ConsumerWidget {
  const LanguageSelectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final prompt = switch (Localizations.localeOf(context).languageCode) {
      'tg' => 'Забони барномаро интихоб кунед',
      'en' => 'Choose app language',
      _ => 'Выберите язык приложения',
    };

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Spacer(),
              const _HamrohMark(),
              const SizedBox(height: 24),
              const Text('Hamroh', style: TextStyle(fontSize: 38, fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              Text(
                prompt,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 17),
              ),
              const SizedBox(height: 32),
              _LanguageButton(label: 'Русский', onTap: () => _select(ref, context, const Locale('ru'))),
              const SizedBox(height: 12),
              _LanguageButton(label: 'Тоҷикӣ', onTap: () => _select(ref, context, const Locale('tg'))),
              const SizedBox(height: 12),
              _LanguageButton(label: 'English', onTap: () => _select(ref, context, const Locale('en'))),
              const Spacer(flex: 2),
            ],
          ),
        ),
      ),
    );
  }

  void _select(WidgetRef ref, BuildContext context, Locale locale) {
    ref.read(localeControllerProvider.notifier).state = locale;
    context.go('/onboarding');
  }
}

class _HamrohMark extends StatelessWidget {
  const _HamrohMark();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 108,
      height: 96,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(left: 10, top: 8, height: 72, child: _Pillar()),
          Positioned(right: 10, top: 8, height: 72, child: _Pillar()),
          Positioned(left: 35, top: 47, child: Container(width: 40, height: 19, decoration: const BoxDecoration(color: Color(0xFF34D399), borderRadius: BorderRadius.vertical(top: Radius.circular(24))))),
          Positioned(left: 39, top: 53, child: Container(width: 32, height: 18, decoration: const BoxDecoration(color: Color(0xFF047857), borderRadius: BorderRadius.vertical(top: Radius.circular(20))))),
          Positioned(top: 22, child: Container(width: 17, height: 17, decoration: const BoxDecoration(color: Color(0xFF3B82F6), shape: BoxShape.circle))),
          Positioned(left: 43, top: 52, child: Transform.rotate(angle: .785, child: Container(width: 43, height: 34, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(7), boxShadow: const [BoxShadow(color: Color(0x0A0F172A), blurRadius: 18, offset: Offset(0, 10))])))),
        ],
      ),
    );
  }
}

class _Pillar extends StatelessWidget {
  const _Pillar();

  @override
  Widget build(BuildContext context) {
    return Container(width: 25, decoration: BoxDecoration(color: const Color(0xFF059669), borderRadius: BorderRadius.circular(18)));
  }
}

class _LanguageButton extends StatelessWidget {
  const _LanguageButton({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 58,
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFF0F172A),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          backgroundColor: Colors.white,
        ),
        child: Text(label, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
      ),
    );
  }
}
