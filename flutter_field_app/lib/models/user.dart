/// User model for field worker profile.
class User {
  final String id;
  final String employeeId;
  final String name;
  final String department;
  final String designation;
  final String zone;

  const User({
    required this.id,
    required this.employeeId,
    required this.name,
    required this.department,
    required this.designation,
    required this.zone,
  });
}
