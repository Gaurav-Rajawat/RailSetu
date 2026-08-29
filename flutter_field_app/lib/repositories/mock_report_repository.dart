import 'package:uuid/uuid.dart';
import 'package:railsetu_field_app/models/report.dart';
import 'package:railsetu_field_app/repositories/report_repository.dart';

/// In-memory mock implementation of [ReportRepository].
/// Stores reports in a list. Comes pre-seeded with sample data.
///
/// Replace this with ApiReportRepository when backend is ready.
class MockReportRepository implements ReportRepository {
  static const _uuid = Uuid();

  final List<Report> _reports = [];

  MockReportRepository() {
    _seedData();
  }

  void _seedData() {
    final now = DateTime.now();
    _reports.addAll([
      Report(
        id: _uuid.v4(),
        title: 'Track defect near KM 42.6',
        category: ReportCategory.track,
        severity: ReportSeverity.high,
        status: ReportStatus.pending,
        description:
            'Loose ballast and misalignment observed on the track. '
            'Needs immediate attention. Visible gap between rail joints.',
        latitude: 28.6139,
        longitude: 77.2090,
        reporterId: 'EMP001',
        createdAt: now.subtract(const Duration(hours: 2)),
        updatedAt: now.subtract(const Duration(hours: 2)),
      ),
      Report(
        id: _uuid.v4(),
        title: 'Signal malfunction at Junction B',
        category: ReportCategory.signal,
        severity: ReportSeverity.critical,
        status: ReportStatus.investigating,
        description:
            'Signal showing red even when track is clear. '
            'Multiple trains delayed. Control room notified.',
        latitude: 28.6280,
        longitude: 77.2195,
        reporterId: 'EMP001',
        createdAt: now.subtract(const Duration(hours: 5)),
        updatedAt: now.subtract(const Duration(hours: 1)),
      ),
      Report(
        id: _uuid.v4(),
        title: 'OHE wire sagging near Bridge 14',
        category: ReportCategory.electrical,
        severity: ReportSeverity.medium,
        status: ReportStatus.pending,
        description:
            'Overhead electric wire is sagging below safe clearance height. '
            'Possible risk during high-speed operations.',
        latitude: 28.5950,
        longitude: 77.1850,
        reporterId: 'EMP002',
        createdAt: now.subtract(const Duration(days: 1)),
        updatedAt: now.subtract(const Duration(days: 1)),
      ),
      Report(
        id: _uuid.v4(),
        title: 'Platform surface crack at Station C',
        category: ReportCategory.station,
        severity: ReportSeverity.low,
        status: ReportStatus.resolved,
        description:
            'Minor crack on platform 3 surface. '
            'No immediate safety risk but may worsen during monsoon.',
        latitude: 28.6400,
        longitude: 77.2300,
        reporterId: 'EMP001',
        createdAt: now.subtract(const Duration(days: 3)),
        updatedAt: now.subtract(const Duration(hours: 12)),
      ),
      Report(
        id: _uuid.v4(),
        title: 'Bridge girder corrosion spotted',
        category: ReportCategory.bridge,
        severity: ReportSeverity.high,
        status: ReportStatus.investigating,
        description:
            'Significant rust and corrosion on lower girders of Bridge 22. '
            'Structural assessment required.',
        latitude: 28.5800,
        longitude: 77.1700,
        reporterId: 'EMP003',
        createdAt: now.subtract(const Duration(days: 2)),
        updatedAt: now.subtract(const Duration(days: 1)),
      ),
    ]);
  }

  @override
  Future<List<Report>> getReports({ReportStatus? status}) async {
    await Future.delayed(const Duration(milliseconds: 100));
    if (status != null) {
      return _reports.where((r) => r.status == status).toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }
    return List.from(_reports)
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  @override
  Future<Report?> getReport(String id) async {
    await Future.delayed(const Duration(milliseconds: 50));
    try {
      return _reports.firstWhere((r) => r.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Report> createReport(Report report) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final newReport = report.copyWith(
      id: _uuid.v4(),
      status: ReportStatus.pending,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    _reports.add(newReport);
    return newReport;
  }

  @override
  Future<Report> updateReport(String id, Map<String, dynamic> updates) async {
    await Future.delayed(const Duration(milliseconds: 100));
    final index = _reports.indexWhere((r) => r.id == id);
    if (index == -1) throw Exception('Report not found');

    final existing = _reports[index];
    final updated = existing.copyWith(
      status: updates['status'] as ReportStatus? ?? existing.status,
      severity: updates['severity'] as ReportSeverity? ?? existing.severity,
      updatedAt: DateTime.now(),
    );
    _reports[index] = updated;
    return updated;
  }

  @override
  Future<Map<ReportStatus, int>> getStatistics() async {
    await Future.delayed(const Duration(milliseconds: 50));
    final stats = <ReportStatus, int>{};
    for (final status in ReportStatus.values) {
      stats[status] = _reports.where((r) => r.status == status).length;
    }
    return stats;
  }
}
