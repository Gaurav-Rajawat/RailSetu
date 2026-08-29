import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:railsetu_field_app/core/theme/app_theme.dart';
import 'package:railsetu_field_app/models/user.dart';
import 'package:railsetu_field_app/repositories/auth_repository.dart';
import 'package:railsetu_field_app/repositories/mock_auth_repository.dart';
import 'package:railsetu_field_app/repositories/api_report_repository.dart';
import 'package:railsetu_field_app/repositories/mock_report_repository.dart';
import 'package:railsetu_field_app/repositories/report_repository.dart';
import 'package:railsetu_field_app/screens/create_report_screen.dart';
import 'package:railsetu_field_app/screens/home_screen.dart';
import 'package:railsetu_field_app/screens/login_screen.dart';
import 'package:railsetu_field_app/screens/my_reports_screen.dart';
import 'package:railsetu_field_app/screens/profile_screen.dart';
import 'package:railsetu_field_app/screens/report_details_screen.dart';
import 'package:railsetu_field_app/screens/splash_screen.dart';
import 'package:railsetu_field_app/widgets/responsive_scaffold.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RailSetuApp());
}

class RailSetuApp extends StatelessWidget {
  const RailSetuApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // ── Backend Integration Point ──
        // Replace MockReportRepository with ApiReportRepository here
        // when backend is ready.
        Provider<ReportRepository>(create: (_) => ApiReportRepository()),
        Provider<AuthRepository>(create: (_) => MockAuthRepository()),
      ],
      child: MaterialApp(
        title: 'RailSetu',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: '/',
        onGenerateRoute: (settings) {
          switch (settings.name) {
            case '/':
              return MaterialPageRoute(
                  builder: (_) => const SplashScreen());
            case '/login':
              return MaterialPageRoute(
                  builder: (_) => const LoginScreen());
            case '/main':
              final user = settings.arguments as User;
              return MaterialPageRoute(
                  builder: (_) => MainShell(user: user));
            case '/create-report':
              return MaterialPageRoute(
                  builder: (_) => const CreateReportScreen());
            case '/report-details':
              final reportId = settings.arguments as String;
              return MaterialPageRoute(
                  builder: (_) =>
                      ReportDetailsScreen(reportId: reportId));
            default:
              return MaterialPageRoute(
                  builder: (_) => const SplashScreen());
          }
        },
      ),
    );
  }
}

/// Main shell with responsive navigation (sidebar on desktop, bottom nav on mobile).
class MainShell extends StatefulWidget {
  final User user;
  const MainShell({super.key, required this.user});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _selectedIndex = 0;
  int _refreshKey = 0;

  void _navigateToReport(String reportId) {
    Navigator.of(context).pushNamed('/report-details', arguments: reportId);
  }

  void _navigateToCreateReport() async {
    final result = await Navigator.of(context).pushNamed('/create-report');
    if (result == true) {
      // Refresh the current tab after creating a report
      setState(() {
        _refreshKey++;
      });
    }
  }

  void _logout() {
    Navigator.of(context).pushReplacementNamed('/login');
  }

  @override
  Widget build(BuildContext context) {
    final destinations = [
      const NavigationDestination(
        icon: Icon(Icons.home_outlined),
        selectedIcon: Icon(Icons.home),
        label: 'Home',
      ),
      const NavigationDestination(
        icon: Icon(Icons.description_outlined),
        selectedIcon: Icon(Icons.description),
        label: 'Reports',
      ),
      const NavigationDestination(
        icon: Icon(Icons.person_outline),
        selectedIcon: Icon(Icons.person),
        label: 'Profile',
      ),
    ];

    final screens = [
      HomeScreen(
        key: ValueKey('home_${_selectedIndex}_$_refreshKey'),
        user: widget.user,
        onCreateReport: _navigateToCreateReport,
        onReportTap: _navigateToReport,
      ),
      MyReportsScreen(
        key: ValueKey('reports_${_selectedIndex}_$_refreshKey'),
        onReportTap: _navigateToReport,
      ),
      ProfileScreen(
        user: widget.user,
        onLogout: _logout,
      ),
    ];

    return ResponsiveScaffold(
      selectedIndex: _selectedIndex,
      onDestinationSelected: (i) => setState(() => _selectedIndex = i),
      destinations: destinations,
      body: screens[_selectedIndex],
      floatingActionButton: _selectedIndex == 0
          ? null // CTA is already in the home screen body
          : _selectedIndex == 1
              ? FloatingActionButton.extended(
                  onPressed: _navigateToCreateReport,
                  backgroundColor: AppColors.critical,
                  icon: const Icon(Icons.add),
                  label: const Text('New Report'),
                )
              : null,
    );
  }
}
