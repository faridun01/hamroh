import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Регистрация')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text('Как вы будете пользоваться Hamroh?', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 10),
            Text('Сначала выберите роль. Формы пассажира и водителя разделены.', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 24),
            _RoleCard(
              icon: Icons.person_outline,
              title: 'Я пассажир',
              subtitle: 'Быстрая регистрация и поиск поездок.',
              onTap: () => context.go('/register/passenger'),
            ),
            const SizedBox(height: 14),
            _RoleCard(
              icon: Icons.drive_eta_outlined,
              title: 'Я водитель',
              subtitle: 'Регистрация с проверкой документов администратором.',
              onTap: () => context.go('/register/driver'),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  const _RoleCard({required this.icon, required this.title, required this.subtitle, required this.onTap});

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: const Color(0xFFD1FAE5),
                child: Icon(icon, color: const Color(0xFF047857)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 4),
                    Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Color(0xFF64748B)),
            ],
          ),
        ),
      ),
    );
  }
}
