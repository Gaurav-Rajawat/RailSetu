import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:railsetu_field_app/core/constants/app_constants.dart';
import 'package:railsetu_field_app/core/theme/app_theme.dart';
import 'package:railsetu_field_app/models/report.dart';
import 'package:railsetu_field_app/models/user.dart';
import 'package:railsetu_field_app/repositories/report_repository.dart';
import 'package:railsetu_field_app/widgets/report_card.dart';
import 'package:railsetu_field_app/widgets/stat_card.dart';

/// Home dashboard screen.
class HomeScreen extends StatefulWidget {
  final User user;
  final VoidCallback onCreateReport;
  final ValueChanged<String> onReportTap;

  const HomeScreen({
    super.key,
    required this.user,
    required this.onCreateReport,
    required this.onReportTap,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<ReportStatus, int> _stats = {};
  List<Report> _recentReports = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  String? _errorMessage;

  Future<void> _loadData() async {
    try {
      final repo = context.read<ReportRepository>();
      final stats = await repo.getStatistics();
      final reports = await repo.getReports();
      if (mounted) {
        setState(() {
          _stats = stats;
          _recentReports = reports.take(3).toList();
          _loading = false;
          _errorMessage = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _errorMessage = e.toString();
        });
      }
    }
  }

  int get _totalReports =>
      _stats.values.fold(0, (sum, count) => sum + count);

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= AppConstants.desktopBreakpoint;
    final maxContentWidth = isDesktop ? 900.0 : double.infinity;

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text(
                'Failed to load data',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  setState(() => _loading = true);
                  _loadData();
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? 32 : 16,
          vertical: 20,
        ),
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxContentWidth),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Greeting
                Text(
                  'Good morning,',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textMuted,
                      ),
                ),
                Text(
                  widget.user.name,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.location_on,
                        size: 16, color: AppColors.textMuted),
                    const SizedBox(width: 4),
                    Text(
                      widget.user.zone,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Report Issue CTA
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: widget.onCreateReport,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.critical,
                      padding: const EdgeInsets.symmetric(vertical: 18),
                    ),
                    icon: const Icon(Icons.warning_amber, size: 28),
                    label: const Text(
                      'Report Issue',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                const SizedBox(height: 28),

                // Stats row
                GridView.count(
                  crossAxisCount: isDesktop ? 5 : 3,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  childAspectRatio: isDesktop ? 1.4 : 1.0,
                  children: [
                    StatCard(
                      label: 'Total',
                      count: _totalReports,
                      icon: Icons.summarize,
                    ),
                    StatCard(
                      label: 'Pending',
                      count: _stats[ReportStatus.pending] ?? 0,
                      countColor: AppColors.warning,
                      icon: Icons.hourglass_empty,
                    ),
                    StatCard(
                      label: 'Under Review',
                      count: _stats[ReportStatus.investigating] ?? 0,
                      countColor: AppColors.info,
                      icon: Icons.search,
                    ),
                    StatCard(
                      label: 'Resolved',
                      count: _stats[ReportStatus.resolved] ?? 0,
                      countColor: AppColors.success,
                      icon: Icons.check_circle_outline,
                    ),
                    StatCard(
                      label: 'Dismissed',
                      count: _stats[ReportStatus.dismissed] ?? 0,
                      countColor: AppColors.textMuted,
                      icon: Icons.cancel_outlined,
                    ),
                  ],
                ),
                const SizedBox(height: 28),

                // Recent reports
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Recent Reports',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                if (_recentReports.isEmpty)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Center(
                        child: Column(
                          children: [
                            const Icon(Icons.description_outlined,
                                size: 48, color: AppColors.textMuted),
                            const SizedBox(height: 12),
                            Text(
                              'No reports yet',
                              style: Theme.of(context).textTheme.headlineSmall,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Tap "Report Issue" to get started',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                else
                  ...List.generate(
                    _recentReports.length,
                    (i) => ReportCard(
                      report: _recentReports[i],
                      onTap: () => widget.onReportTap(_recentReports[i].id),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
