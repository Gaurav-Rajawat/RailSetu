import 'package:railsetu_field_app/models/user.dart';

/// Abstract auth repository interface.
/// Replace MockAuthRepository with a real API implementation later.
abstract class AuthRepository {
  Future<User> login(String employeeId, String password);
  Future<void> logout();
}
