import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hamroh_mobile/app/router.dart';
import 'package:hamroh_mobile/app/theme.dart';
import 'package:hamroh_mobile/localization/app_localizations.dart';
import 'package:hamroh_mobile/localization/locale_controller.dart';

class HamrohApp extends ConsumerWidget {
  const HamrohApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final locale = ref.watch(localeControllerProvider);

    return MaterialApp.router(
      title: 'Hamroh',
      debugShowCheckedModeBanner: false,
      theme: buildHamrohTheme(),
      locale: locale,
      routerConfig: router,
      supportedLocales: const [
        Locale('ru'),
        Locale('tg'),
        Locale('en'),
      ],
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ],
    );
  }
}
