// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appName => 'Hamroh';

  @override
  String get welcomeTitle => 'Reliable rides between cities';

  @override
  String get login => 'Log in';

  @override
  String get register => 'Register';

  @override
  String get search => 'Search';

  @override
  String get myTrips => 'My trips';

  @override
  String get messages => 'Messages';

  @override
  String get notifications => 'Notifications';

  @override
  String get profile => 'Profile';

  @override
  String get contactsLocked => 'Contacts unlock after booking acceptance';

  @override
  String get confirmBooking => 'Confirm booking';
}
