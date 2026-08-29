import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:railsetu_field_app/models/report.dart';
import 'package:railsetu_field_app/repositories/report_repository.dart';
import 'package:railsetu_field_app/core/config/env.dart';

class ApiReportRepository implements ReportRepository {
  final http.Client _client;

  ApiReportRepository({http.Client? client}) : _client = client ?? http.Client();

  @override
  Future<Report> createReport(Report report) async {
    final url = Uri.parse('${Env.apiBaseUrl}/reports');
    final response = await _client.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(report.toCreateJson()),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final json = jsonDecode(response.body);
      return Report.fromJson(json);
    } else {
      throw Exception('Failed to create report: ${response.statusCode} - ${response.body}');
    }
  }

  @override
  Future<Report?> getReport(String id) async {
    final url = Uri.parse('${Env.apiBaseUrl}/reports/$id');
    final response = await _client.get(url);
    if (response.statusCode == 200) {
      return Report.fromJson(jsonDecode(response.body));
    }
    return null;
  }

  @override
  Future<List<Report>> getReports({ReportStatus? status}) async {
    final url = Uri.parse('${Env.apiBaseUrl}/reports');
    final response = await _client.get(url);
    if (response.statusCode == 200) {
      final List<dynamic> jsonList = jsonDecode(response.body);
      var reports = jsonList.map((json) => Report.fromJson(json)).toList();
      if (status != null) {
        reports = reports.where((r) => r.status == status).toList();
      }
      return reports;
    } else {
      throw Exception('Failed to load reports: ${response.statusCode}');
    }
  }

  @override
  Future<Map<ReportStatus, int>> getStatistics() async {
    final reports = await getReports();
    final stats = <ReportStatus, int>{
      ReportStatus.pending: 0,
      ReportStatus.investigating: 0,
      ReportStatus.resolved: 0,
      ReportStatus.dismissed: 0,
    };
    for (final report in reports) {
      stats[report.status] = (stats[report.status] ?? 0) + 1;
    }
    return stats;
  }

  @override
  Future<Report> updateReport(String id, Map<String, dynamic> updates) async {
    final url = Uri.parse('${Env.apiBaseUrl}/reports/$id');
    final response = await _client.patch(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(updates),
    );
    if (response.statusCode == 200) {
      return Report.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update report: ${response.statusCode}');
    }
  }
}
