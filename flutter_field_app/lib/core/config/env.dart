import 'dart:io';
import 'package:flutter/foundation.dart';

class Env {
  // Set to true if running on Android Emulator, false if running on physical device
  static const bool isEmulator = false;

  static String get apiBaseUrl {
    if (kIsWeb) {
      return 'http://127.0.0.1:8000/api'; // Flutter Web/PC
    } else if (Platform.isAndroid) {
      return isEmulator 
          ? 'http://10.0.2.2:8000/api' // Android Emulator
          : 'http://192.168.1.10:8000/api'; // Physical Android phone/APK
    } else {
      return 'http://127.0.0.1:8000/api'; // iOS Simulator loopback / Others
    }
  }
}
