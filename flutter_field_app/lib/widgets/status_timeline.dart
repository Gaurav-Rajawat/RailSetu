import 'package:flutter/material.dart';
import 'package:railsetu_field_app/core/theme/app_theme.dart';
import 'package:railsetu_field_app/models/report.dart';

/// Vertical status timeline used in Report Details.
class StatusTimeline extends StatelessWidget {
  final ReportStatus currentStatus;

  const StatusTimeline({super.key, required this.currentStatus});

  static const _statusOrder = [
    ReportStatus.pending,
    ReportStatus.investigating,
    ReportStatus.resolved,
  ];

  @override
  Widget build(BuildContext context) {
    final currentIndex = _statusOrder.indexOf(currentStatus);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(_statusOrder.length, (index) {
        final status = _statusOrder[index];
        final isActive = index <= currentIndex && currentIndex >= 0;
        final isLast = index == _statusOrder.length - 1;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Timeline node + line
            SizedBox(
              width: 32,
              child: Column(
                children: [
                  Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isActive ? AppColors.primary : AppColors.border,
                    ),
                    child: isActive
                        ? const Icon(Icons.check, size: 12, color: Colors.white)
                        : null,
                  ),
                  if (!isLast)
                    Container(
                      width: 2,
                      height: 40,
                      color: isActive && index < currentIndex
                          ? AppColors.primary
                          : AppColors.border,
                    ),
                ],
              ),
            ),
            const SizedBox(width: 12),

            // Label
            Padding(
              padding: const EdgeInsets.only(top: 0),
              child: Text(
                status.label,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                  color: isActive ? AppColors.text : AppColors.textMuted,
                ),
              ),
            ),
          ],
        );
      }),
    );
  }
}
