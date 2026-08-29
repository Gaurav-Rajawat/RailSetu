import 'package:railsetu_field_app/models/report.dart';

/// Abstract report repository interface.
///
/// Currently implemented by [MockReportRepository].
/// When the backend is ready, create an [ApiReportRepository]
/// that implements this same interface and swap it in [main.dart].
abstract class ReportRepository {
  /// Get all reports, optionally filtered by status.
  Future<List<Report>> getReports({ReportStatus? status});

  /// Get a single report by ID.
  Future<Report?> getReport(String id);

  /// Create a new report. Returns the created report with generated ID.
  Future<Report> createReport(Report report);

  /// Update specific fields of a report.
  Future<Report> updateReport(String id, Map<String, dynamic> updates);

  /// Get report statistics (counts by status).
  Future<Map<ReportStatus, int>> getStatistics();
}
