import 'package:flutter_test/flutter_test.dart';
import 'package:railsetu_field_app/models/report.dart';
import 'package:railsetu_field_app/repositories/mock_report_repository.dart';

void main() {
  group('MockReportRepository', () {
    late MockReportRepository repo;

    setUp(() {
      repo = MockReportRepository();
    });

    test('getReports returns seeded data', () async {
      final reports = await repo.getReports();
      expect(reports, isNotEmpty);
      expect(reports.length, greaterThanOrEqualTo(3));
    });

    test('createReport adds a new report', () async {
      final before = await repo.getReports();
      final newReport = Report(
        id: '',
        title: 'Test Report',
        category: ReportCategory.track,
        severity: ReportSeverity.low,
        status: ReportStatus.pending,
        description: 'A test description for the report',
        latitude: 28.6,
        longitude: 77.2,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      final created = await repo.createReport(newReport);
      final after = await repo.getReports();

      expect(after.length, equals(before.length + 1));
      expect(created.id, isNotEmpty);
      expect(created.title, equals('Test Report'));
      expect(created.status, equals(ReportStatus.pending));
    });

    test('getReport returns correct report by ID', () async {
      final reports = await repo.getReports();
      final first = reports.first;
      final found = await repo.getReport(first.id);

      expect(found, isNotNull);
      expect(found!.id, equals(first.id));
      expect(found.title, equals(first.title));
    });

    test('getReport returns null for non-existent ID', () async {
      final found = await repo.getReport('non-existent-id');
      expect(found, isNull);
    });

    test('getStatistics returns counts for all statuses', () async {
      final stats = await repo.getStatistics();
      expect(stats.keys, containsAll(ReportStatus.values));
      final total = stats.values.fold(0, (s, c) => s + c);
      final reports = await repo.getReports();
      expect(total, equals(reports.length));
    });

    test('getReports with status filter works', () async {
      final pending = await repo.getReports(status: ReportStatus.pending);
      for (final r in pending) {
        expect(r.status, equals(ReportStatus.pending));
      }
    });
  });

  group('Report model', () {
    test('toJson and fromJson roundtrip', () {
      final report = Report(
        id: 'abc-123',
        title: 'Test',
        category: ReportCategory.signal,
        severity: ReportSeverity.high,
        status: ReportStatus.investigating,
        description: 'Test description',
        latitude: 28.6139,
        longitude: 77.2090,
        reporterId: 'EMP001',
        createdAt: DateTime(2024, 6, 15, 10, 30),
        updatedAt: DateTime(2024, 6, 15, 11, 0),
      );
      final json = report.toJson();
      final restored = Report.fromJson(json);

      expect(restored.id, equals(report.id));
      expect(restored.title, equals(report.title));
      expect(restored.category, equals(report.category));
      expect(restored.severity, equals(report.severity));
      expect(restored.status, equals(report.status));
      expect(restored.latitude, equals(report.latitude));
      expect(restored.longitude, equals(report.longitude));
    });

    test('copyWith preserves unchanged fields', () {
      final report = Report(
        id: 'abc',
        title: 'Original',
        category: ReportCategory.track,
        severity: ReportSeverity.low,
        status: ReportStatus.pending,
        description: 'Desc',
        latitude: 0,
        longitude: 0,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      final updated = report.copyWith(title: 'Updated');
      expect(updated.title, equals('Updated'));
      expect(updated.id, equals('abc'));
      expect(updated.category, equals(ReportCategory.track));
    });
  });
}
