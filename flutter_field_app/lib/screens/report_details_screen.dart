import 'package:flutter/material.dart';
import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:railsetu_field_app/core/config/env.dart';
import 'package:railsetu_field_app/core/constants/app_constants.dart';
import 'package:railsetu_field_app/core/theme/app_theme.dart';
import 'package:railsetu_field_app/models/report.dart';
import 'package:railsetu_field_app/repositories/report_repository.dart';
import 'package:railsetu_field_app/widgets/severity_badge.dart';
import 'package:railsetu_field_app/widgets/status_timeline.dart';

/// Report details screen with full info and status timeline.
class ReportDetailsScreen extends StatefulWidget {
  final String reportId;

  const ReportDetailsScreen({super.key, required this.reportId});

  @override
  State<ReportDetailsScreen> createState() => _ReportDetailsScreenState();
}

class _ReportDetailsScreenState extends State<ReportDetailsScreen> {
  Report? _report;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadReport();
  }

  Future<void> _loadReport() async {
    final repo = context.read<ReportRepository>();
    final report = await repo.getReport(widget.reportId);
    if (mounted) {
      setState(() {
        _report = report;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= AppConstants.desktopBreakpoint;
    final maxWidth = isDesktop ? 800.0 : double.infinity;

    return Scaffold(
      appBar: AppBar(title: const Text('Report Details')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _report == null
              ? const Center(
                  child: Text('Report not found',
                      style: TextStyle(color: AppColors.critical, fontSize: 18)),
                )
              : SingleChildScrollView(
                  padding: EdgeInsets.symmetric(
                    horizontal: isDesktop ? 32 : 16,
                    vertical: 20,
                  ),
                  child: Center(
                    child: ConstrainedBox(
                      constraints: BoxConstraints(maxWidth: maxWidth),
                      child: _buildContent(context, isDesktop),
                    ),
                  ),
                ),
    );
  }

  Widget _buildContent(BuildContext context, bool isDesktop) {
    final report = _report!;
    final dateFormat = DateFormat('dd MMM yyyy, HH:mm');

    if (isDesktop) {
      // Two-column layout on desktop
      return Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left column - main info
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildPhotoSection(report),
                const SizedBox(height: 20),
                _buildInfoCard(context, report, dateFormat),
                const SizedBox(height: 16),
                _buildLocationCard(context, report),
              ],
            ),
          ),
          const SizedBox(width: 24),
          // Right column - timeline & meta
          Expanded(
            flex: 2,
            child: Column(
              children: [
                _buildTimelineCard(context, report),
                const SizedBox(height: 16),
                _buildMetaCard(context, report, dateFormat),
              ],
            ),
          ),
        ],
      );
    }

    // Single column on mobile
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildPhotoSection(report),
        const SizedBox(height: 20),
        _buildInfoCard(context, report, dateFormat),
        const SizedBox(height: 16),
        _buildLocationCard(context, report),
        const SizedBox(height: 16),
        _buildTimelineCard(context, report),
        const SizedBox(height: 16),
        _buildMetaCard(context, report, dateFormat),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildPhotoSection(Report report) {
    if (report.photoUrl == null || report.photoUrl!.isEmpty) {
      return Container(
        width: double.infinity,
        height: 200,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: const Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.image_outlined, size: 48, color: AppColors.textMuted),
            SizedBox(height: 8),
            Text('No Photo', style: TextStyle(color: AppColors.textMuted)),
          ],
        ),
      );
    }
    
    final List<String> paths = report.photoUrl!.split(',');
    return SizedBox(
      height: 200,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: paths.length,
        separatorBuilder: (context, index) => const SizedBox(width: 16),
        itemBuilder: (context, index) {
          String path = paths[index];
          if (path.startsWith('/uploads')) {
            final baseUrl = Env.apiBaseUrl.replaceAll(RegExp(r'/api$'), '');
            path = '$baseUrl$path';
          }
          return Container(
            width: 300,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
              image: DecorationImage(
                image: (path.startsWith('http') || path.startsWith('blob:')) 
                    ? NetworkImage(path) as ImageProvider 
                    : FileImage(File(path)),
                fit: BoxFit.cover,
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoCard(
      BuildContext context, Report report, DateFormat dateFormat) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(report.category.icon,
                    color: AppColors.primary, size: 24),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    report.title,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              dateFormat.format(report.createdAt),
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const Divider(height: 24),
            Row(
              children: [
                SeverityBadge(severity: report.severity),
                const SizedBox(width: 8),
                Chip(
                  label: Text(report.category.label),
                  avatar: Icon(report.category.icon, size: 16),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              report.description,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    height: 1.6,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationCard(BuildContext context, Report report) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.location_on,
                    color: AppColors.primary, size: 24),
                const SizedBox(width: 10),
                Text(
                  'GPS Coordinates',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              '${report.latitude.toStringAsFixed(6)}, ${report.longitude.toStringAsFixed(6)}',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textMuted,
                    fontFamily: 'monospace',
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineCard(BuildContext context, Report report) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Status Timeline',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            StatusTimeline(currentStatus: report.status),
          ],
        ),
      ),
    );
  }

  Widget _buildMetaCard(
      BuildContext context, Report report, DateFormat dateFormat) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Report Information',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 12),
            _metaRow('Report ID', report.id.substring(0, 8).toUpperCase()),
            _metaRow('Reporter', report.reporterId ?? 'N/A'),
            _metaRow('Created', dateFormat.format(report.createdAt)),
            _metaRow('Updated', dateFormat.format(report.updatedAt)),
          ],
        ),
      ),
    );
  }

  Widget _metaRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                  color: AppColors.textMuted,
                  fontWeight: FontWeight.w600,
                  fontSize: 13),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}
