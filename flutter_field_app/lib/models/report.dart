import 'package:flutter/material.dart';
import 'package:railsetu_field_app/core/theme/app_theme.dart';

/// Report category — aligned with backend ReportCategory enum.
enum ReportCategory {
  track('Track', Icons.train),
  signal('Signal', Icons.traffic),
  electrical('Electrical', Icons.bolt),
  station('Station', Icons.apartment),
  bridge('Bridge', Icons.landscape),
  safety('Safety', Icons.health_and_safety),
  other('Other', Icons.report_problem);

  final String label;
  final IconData icon;
  const ReportCategory(this.label, this.icon);
}

/// Report severity — aligned with backend ReportSeverity enum.
enum ReportSeverity {
  low('Low', AppColors.severityLow),
  medium('Medium', AppColors.severityMedium),
  high('High', AppColors.severityHigh),
  critical('Critical', AppColors.severityCritical);

  final String label;
  final Color color;
  const ReportSeverity(this.label, this.color);
}

/// Report status — aligned with backend ReportStatus enum.
enum ReportStatus {
  pending('Pending'),
  investigating('Under Review'),
  resolved('Resolved'),
  dismissed('Dismissed');

  final String label;
  const ReportStatus(this.label);
}

/// Core report model.
/// Mirrors the backend's ReportResponse schema fields.
class Report {
  final String id;
  final String title;
  final ReportCategory category;
  final ReportSeverity severity;
  final ReportStatus status;
  final String description;
  final double latitude;
  final double longitude;
  final String? photoUrl;
  final String? reporterId;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Report({
    required this.id,
    required this.title,
    required this.category,
    required this.severity,
    required this.status,
    required this.description,
    required this.latitude,
    required this.longitude,
    this.photoUrl,
    this.reporterId,
    required this.createdAt,
    required this.updatedAt,
  });

  Report copyWith({
    String? id,
    String? title,
    ReportCategory? category,
    ReportSeverity? severity,
    ReportStatus? status,
    String? description,
    double? latitude,
    double? longitude,
    String? photoUrl,
    String? reporterId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Report(
      id: id ?? this.id,
      title: title ?? this.title,
      category: category ?? this.category,
      severity: severity ?? this.severity,
      status: status ?? this.status,
      description: description ?? this.description,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      photoUrl: photoUrl ?? this.photoUrl,
      reporterId: reporterId ?? this.reporterId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  /// Convert to JSON map for creating a report — matching backend ReportCreate schema.
  Map<String, dynamic> toCreateJson() {
    return {
      'category': category.name.toUpperCase(),
      'severity': severity.name,
      'photo_url': photoUrl,
      'latitude': latitude,
      'longitude': longitude,
      'description': description,
      'timestamp': createdAt.toUtc().toIso8601String(),
      'reporter_id': reporterId,
    };
  }

  /// Convert to JSON map — ready for future API integration.
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'category': category.name.toUpperCase(),
      'severity': severity.name,
      'status': status.name,
      'description': description,
      'latitude': latitude,
      'longitude': longitude,
      'photo_url': photoUrl,
      'reporter_id': reporterId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  /// Parse from JSON map — ready for future API integration.
  factory Report.fromJson(Map<String, dynamic> json) {
    return Report(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? json['category'] as String? ?? 'Report',
      category: ReportCategory.values.firstWhere(
        (e) => e.name.toUpperCase() == (json['category'] as String?)?.toUpperCase(),
        orElse: () => ReportCategory.other,
      ),
      severity: ReportSeverity.values.firstWhere(
        (e) => e.name.toLowerCase() == (json['severity'] as String?)?.toLowerCase(),
        orElse: () => ReportSeverity.low,
      ),
      status: ReportStatus.values.firstWhere(
        (e) => e.name.toLowerCase() == (json['status'] as String?)?.toLowerCase(),
        orElse: () => ReportStatus.pending,
      ),
      description: json['description'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      photoUrl: json['photo_url'] as String?,
      reporterId: json['reporter_id'] as String?,
      createdAt: json['created_at'] != null ? DateTime.parse(json['created_at'] as String) : DateTime.now(),
      updatedAt: json['updated_at'] != null ? DateTime.parse(json['updated_at'] as String) : DateTime.now(),
    );
  }
}
