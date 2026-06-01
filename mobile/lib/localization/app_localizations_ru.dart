// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Russian (`ru`).
class AppLocalizationsRu extends AppLocalizations {
  AppLocalizationsRu([String locale = 'ru']) : super(locale);

  @override
  String get appName => 'Hamroh';

  @override
  String get welcomeTitle => 'Надежные поездки между городами Таджикистана';

  @override
  String get login => 'Войти';

  @override
  String get register => 'Зарегистрироваться';

  @override
  String get search => 'Поиск';

  @override
  String get myTrips => 'Мои поездки';

  @override
  String get messages => 'Сообщения';

  @override
  String get notifications => 'Уведомления';

  @override
  String get profile => 'Профиль';

  @override
  String get contactsLocked => 'Контакты откроются после подтверждения брони';

  @override
  String get confirmBooking => 'Подтвердить бронь';
}
