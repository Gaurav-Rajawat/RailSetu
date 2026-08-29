import 'package:railsetu_field_app/models/user.dart';
import 'package:railsetu_field_app/repositories/auth_repository.dart';

/// Mock auth — accepts any credentials and returns a sample user.
class MockAuthRepository implements AuthRepository {
  @override
  Future<User> login(String employeeId, String password) async {
    await Future.delayed(const Duration(milliseconds: 800));

    // Accept any non-empty credentials
    if (employeeId.isEmpty || password.isEmpty) {
      throw Exception('Employee ID and password are required');
    }

    return User(
      id: 'usr_1',
      employeeId: employeeId,
      name: 'Arjun Singh',
      department: 'Track Maintenance',
      designation: 'Field Inspector',
      zone: 'Delhi Division',
    );
  }

  @override
  Future<void> logout() async {
    await Future.delayed(const Duration(milliseconds: 200));
  }
}
