import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:railsetu_field_app/core/constants/app_constants.dart';
import 'package:railsetu_field_app/services/websocket_service.dart';
import 'package:railsetu_field_app/models/report.dart';
import 'package:railsetu_field_app/repositories/report_repository.dart';
import 'package:railsetu_field_app/widgets/report_card.dart';
import 'package:railsetu_field_app/core/theme/app_theme.dart';

/// My Reports screen with status filter chips.
class MyReportsScreen extends StatefulWidget {
  final ValueChanged<String> onReportTap;

  const MyReportsScreen({super.key, required this.onReportTap});

  @override
  State<MyReportsScreen> createState() => _MyReportsScreenState();
}

class _MyReportsScreenState extends State<MyReportsScreen> {
  List<Report> _allReports = [];
  ReportStatus? _filter;
  bool _loading = true;
  StreamSubscription? _wsSubscription;

  @override
  void initState() {
    super.initState();
    _loadReports();
    
    // Listen for WebSocket updates silently
    Future.microtask(() {
      _wsSubscription = context.read<WebSocketService>().messages.listen((data) {
        if (data['type'] == 'report_created' || data['type'] == 'report_updated') {
          _silentLoadReports();
        }
      });
    });
  }

  @override
  void dispose() {
    _wsSubscription?.cancel();
    super.dispose();
  }

  Future<void> _loadReports() async {
    setState(() => _loading = true);
    await _silentLoadReports();
  }

  Future<void> _silentLoadReports() async {
    final repo = context.read<ReportRepository>();
    final reports = await repo.getReports();
    if (mounted) {
      setState(() {
        _allReports = reports;
        _loading = false;
      });
    }
  }

  List<Report> get _filteredReports {
    if (_filter == null) return _allReports;
    return _allReports.where((r) => r.status == _filter).toList();
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= AppConstants.desktopBreakpoint;
    final maxWidth = isDesktop ? 800.0 : double.infinity;

    return Column(
      children: [
        // Filter chips
        Container(
          width: double.infinity,
          color: AppColors.surface,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('All', null),
                ...ReportStatus.values.map((s) => _buildFilterChip(s.label, s)),
              ],
            ),
          ),
        ),

        // Reports list
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : RefreshIndicator(
                  onRefresh: _loadReports,
                  child: _filteredReports.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.description_outlined,
                                  size: 48, color: AppColors.textMuted),
                              const SizedBox(height: 12),
                              Text(
                                'No reports found',
                                style:
                                    Theme.of(context).textTheme.headlineSmall,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Try changing the filter',
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: EdgeInsets.symmetric(
                            horizontal: isDesktop ? 32 : 16,
                            vertical: 12,
                          ),
                          itemCount: _filteredReports.length,
                          itemBuilder: (_, i) {
                            return Center(
                              child: ConstrainedBox(
                                constraints:
                                    BoxConstraints(maxWidth: maxWidth),
                                child: ReportCard(
                                  report: _filteredReports[i],
                                  onTap: () => widget
                                      .onReportTap(_filteredReports[i].id),
                                ),
                              ),
                            );
                          },
                        ),
                ),
        ),
      ],
    );
  }

  Widget _buildFilterChip(String label, ReportStatus? status) {
    final selected = _filter == status;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        selectedColor: AppColors.primary,
        checkmarkColor: Colors.white,
        labelStyle: TextStyle(
          color: selected ? Colors.white : AppColors.textMuted,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
        onSelected: (_) => setState(() => _filter = status),
      ),
    );
  }
}
