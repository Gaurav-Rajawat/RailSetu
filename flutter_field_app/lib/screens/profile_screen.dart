import 'package:flutter/material.dart';
import 'package:railsetu_field_app/core/constants/app_constants.dart';
import 'package:railsetu_field_app/core/theme/app_theme.dart';
import 'package:railsetu_field_app/models/user.dart';

/// Profile screen showing worker info and logout.
class ProfileScreen extends StatelessWidget {
  final User user;
  final VoidCallback onLogout;

  const ProfileScreen({
    super.key,
    required this.user,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= AppConstants.desktopBreakpoint;
    final maxWidth = isDesktop ? 600.0 : double.infinity;

    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? 32 : 16,
        vertical: 20,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: maxWidth),
          child: Column(
            children: [
              const SizedBox(height: 20),

              // Avatar
              CircleAvatar(
                radius: 48,
                backgroundColor: AppColors.primary,
                child: Text(
                  user.name.isNotEmpty ? user.name[0].toUpperCase() : '?',
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                user.name,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 4),
              Text(
                user.designation,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: AppColors.textMuted,
                    ),
              ),
              const SizedBox(height: 32),

              // Info card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      _infoRow(context, Icons.badge, 'Employee ID',
                          user.employeeId),
                      const Divider(),
                      _infoRow(context, Icons.business, 'Department',
                          user.department),
                      const Divider(),
                      _infoRow(
                          context, Icons.work, 'Designation', user.designation),
                      const Divider(),
                      _infoRow(context, Icons.map, 'Assigned Zone', user.zone),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Logout button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: onLogout,
                  icon:
                      const Icon(Icons.logout, color: AppColors.critical),
                  label: const Text(
                    'Logout',
                    style: TextStyle(color: AppColors.critical),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.critical),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Version info
              Text(
                'RailSetu v${AppConstants.appVersion}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontStyle: FontStyle.italic,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _infoRow(
      BuildContext context, IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: AppColors.primary, size: 22),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: Theme.of(context).textTheme.bodyLarge,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
