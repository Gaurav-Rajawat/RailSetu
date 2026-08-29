import 'package:flutter/material.dart';
import 'package:railsetu_field_app/models/report.dart';

/// Severity badge chip.
class SeverityBadge extends StatelessWidget {
  final ReportSeverity severity;

  const SeverityBadge({super.key, required this.severity});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: severity.color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: severity.color.withValues(alpha: 0.4)),
      ),
      child: Text(
        severity.label,
        style: TextStyle(
          color: severity.color,
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
