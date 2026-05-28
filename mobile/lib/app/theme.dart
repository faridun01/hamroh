import 'package:flutter/material.dart';

ThemeData buildHamrohTheme() {
  const primary = Color(0xFF10B981);
  const darkGreen = Color(0xFF047857);
  const background = Color(0xFFF8FAFC);
  const text = Color(0xFF0F172A);

  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: background,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primary,
      primary: primary,
      secondary: darkGreen,
      surface: Colors.white,
      error: const Color(0xFFEF4444),
    ),
    textTheme: const TextTheme(
      headlineSmall: TextStyle(fontWeight: FontWeight.w800, color: text),
      titleLarge: TextStyle(fontWeight: FontWeight.w800, color: text),
      titleMedium: TextStyle(fontWeight: FontWeight.w700, color: text),
      bodyMedium: TextStyle(color: text, height: 1.35),
      bodySmall: TextStyle(color: Color(0xFF64748B), height: 1.35),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(18),
        borderSide: const BorderSide(color: primary, width: 1.4),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        minimumSize: const Size.fromHeight(54),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        backgroundColor: primary,
        foregroundColor: Colors.white,
        textStyle: const TextStyle(fontWeight: FontWeight.w800),
      ),
    ),
  );
}
