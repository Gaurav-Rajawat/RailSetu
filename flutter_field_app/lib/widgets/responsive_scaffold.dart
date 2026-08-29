import 'package:flutter/material.dart';
import 'package:railsetu_field_app/core/constants/app_constants.dart';
import 'package:railsetu_field_app/core/theme/app_theme.dart';

/// Adaptive scaffold that uses NavigationRail on desktop and
/// BottomNavigationBar on mobile.
class ResponsiveScaffold extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;
  final List<NavigationDestination> destinations;
  final Widget body;
  final Widget? floatingActionButton;

  const ResponsiveScaffold({
    super.key,
    required this.selectedIndex,
    required this.onDestinationSelected,
    required this.destinations,
    required this.body,
    this.floatingActionButton,
  });

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= AppConstants.desktopBreakpoint;

    if (isDesktop) {
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              selectedIndex: selectedIndex,
              onDestinationSelected: onDestinationSelected,
              extended: width >= 1200,
              minWidth: 72,
              minExtendedWidth: 200,
              leading: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Column(
                  children: [
                    const Icon(Icons.train, color: Colors.white, size: 32),
                    const SizedBox(height: 6),
                    Text(
                      'RailSetu',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: width >= 1200 ? 16 : 10,
                      ),
                    ),
                  ],
                ),
              ),
              destinations: destinations
                  .map(
                    (d) => NavigationRailDestination(
                      icon: d.icon,
                      selectedIcon: d.selectedIcon,
                      label: Text(d.label),
                    ),
                  )
                  .toList(),
            ),
            // Vertical divider
            Container(width: 1, color: AppColors.border),
            // Body
            Expanded(child: body),
          ],
        ),
        floatingActionButton: floatingActionButton,
      );
    }

    // Mobile layout
    return Scaffold(
      body: body,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: onDestinationSelected,
        destinations: destinations,
        height: 65,
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primary.withValues(alpha: 0.12),
      ),
      floatingActionButton: floatingActionButton,
    );
  }
}
