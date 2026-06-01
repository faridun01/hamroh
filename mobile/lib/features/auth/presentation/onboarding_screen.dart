import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final text = _OnboardingText.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(28, 22, 28, 24),
          child: Column(
            children: [
              Align(
                alignment: Alignment.center,
                child: FilledButton.tonalIcon(
                  onPressed: () => context.go('/language'),
                  icon: const Icon(Icons.language,
                      color: Color(0xFF047857), size: 21),
                  label: Text(text.languageName),
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF0F172A),
                    minimumSize: const Size(142, 46),
                    textStyle: const TextStyle(
                        fontWeight: FontWeight.w800, fontSize: 16),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(28)),
                    elevation: 1,
                  ),
                ),
              ),
              const SizedBox(height: 54),
              const _HamrohMark(),
              const SizedBox(height: 64),
              Text(
                text.title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF047857),
                  fontSize: 32,
                  height: 1.14,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                text.subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF334155),
                  fontSize: 17,
                  height: 1.45,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton.icon(
                  onPressed: () => context.go('/login'),
                  iconAlignment: IconAlignment.end,
                  icon: const Icon(Icons.arrow_forward, size: 28),
                  label: Text(text.login,
                      style: const TextStyle(
                          fontSize: 21, fontWeight: FontWeight.w900)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF047857),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18)),
                    elevation: 2,
                  ),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: OutlinedButton(
                  onPressed: () => context.go('/register/role'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF047857),
                    side: const BorderSide(color: Color(0xFF047857), width: 2),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18)),
                    textStyle: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.w900),
                  ),
                  child: Text(text.register),
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
          Positioned(
              left: 35,
              top: 47,
              child: Container(
                  width: 40,
                  height: 19,
                  decoration: const BoxDecoration(
                      color: Color(0xFF34D399),
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(24))))),
          Positioned(
              left: 39,
              top: 53,
              child: Container(
                  width: 32,
                  height: 18,
                  decoration: const BoxDecoration(
                      color: Color(0xFF047857),
                      borderRadius:
                          BorderRadius.vertical(top: Radius.circular(20))))),
          Positioned(
              top: 22,
              child: Container(
                  width: 17,
                  height: 17,
                  decoration: const BoxDecoration(
                      color: Color(0xFF3B82F6), shape: BoxShape.circle))),
          Positioned(
              left: 43,
              top: 52,
              child: Transform.rotate(
                  angle: .785,
                  child: Container(
                      width: 43,
                      height: 34,
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(7),
                          boxShadow: const [
                            BoxShadow(
                                color: Color(0x0A0F172A),
                                blurRadius: 18,
                                offset: Offset(0, 10))
                          ])))),
        ],
      ),
    );
  }
}

class _OnboardingText {
  const _OnboardingText({
    required this.languageName,
    required this.title,
    required this.subtitle,
    required this.login,
    required this.register,
  });

  final String languageName;
  final String title;
  final String subtitle;
  final String login;
  final String register;

  static _OnboardingText of(BuildContext context) {
    return switch (Localizations.localeOf(context).languageCode) {
      'tg' => const _OnboardingText(
          languageName: 'Тоҷикӣ',
          title: 'Хуш омадед ба Hamroh',
          subtitle: 'Сафарҳои боэътимод байни шаҳрҳои Тоҷикистон',
          login: 'Ворид шудан',
          register: 'Рӯйхатгирӣ',
        ),
      'en' => const _OnboardingText(
          languageName: 'English',
          title: 'Welcome to Hamroh',
          subtitle: 'Reliable rides between cities in Tajikistan',
          login: 'Log in',
          register: 'Register',
        ),
      _ => const _OnboardingText(
          languageName: 'Русский',
          title: 'Добро пожаловать в Hamroh',
          subtitle: 'Надёжные поездки между городами Таджикистана',
          login: 'Войти',
          register: 'Зарегистрироваться',
        ),
    };
  }
}

class _Pillar extends StatelessWidget {
  const _Pillar();

  @override
  Widget build(BuildContext context) {
    return Container(
        width: 25,
        decoration: BoxDecoration(
            color: const Color(0xFF059669),
            borderRadius: BorderRadius.circular(18)));
  }
}
