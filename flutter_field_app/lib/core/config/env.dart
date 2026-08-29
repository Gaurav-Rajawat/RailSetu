import 'dart:io';
import 'package:flutter/foundation.dart';

class Env {
  static String get apiBaseUrl {
    // If testing on a physical device, change all these to your PC's IP address (e.g., http://192.168.1.X:8000/api)
    if (kIsWeb) {
      return 'http://127.0.0.1:8000/api';
    } else if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000/api'; // Android Emulator loopback
    } else {
      return 'http://127.0.0.1:8000/api'; // iOS Simulator loopback
    }
  }
}
