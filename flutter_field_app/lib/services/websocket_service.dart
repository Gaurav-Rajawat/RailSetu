import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:railsetu_field_app/core/config/env.dart';

class WebSocketService extends ChangeNotifier {
  WebSocketChannel? _channel;
  bool _isConnected = false;
  
  // Stream to broadcast raw JSON messages to UI
  final _messageController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get messages => _messageController.stream;

  WebSocketService() {
    _connect();
  }

  void _connect() {
    if (_isConnected) return;
    
    final wsUrl = Uri.parse('${Env.wsBaseUrl}/ws/admin');
    
    try {
      _channel = WebSocketChannel.connect(wsUrl);
      _isConnected = true;
      
      _channel!.stream.listen(
        (data) {
          try {
            final decoded = jsonDecode(data);
            _messageController.add(decoded);
          } catch (e) {
            debugPrint('WS json decode error: $e');
          }
        },
        onDone: () {
          _isConnected = false;
          _reconnect();
        },
        onError: (error) {
          debugPrint('WS Error: $error');
          _isConnected = false;
          _reconnect();
        },
      );
    } catch (e) {
      debugPrint('WS Connection Error: $e');
      _reconnect();
    }
  }

  void _reconnect() {
    Future.delayed(const Duration(seconds: 3), () {
      _connect();
    });
  }

  @override
  void dispose() {
    _channel?.sink.close();
    _messageController.close();
    super.dispose();
  }
}
