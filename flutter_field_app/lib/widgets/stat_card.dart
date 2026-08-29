import 'package:flutter/material.dart';
import 'package:railsetu_field_app/core/theme/app_theme.dart';

/// Dashboard statistic card widget.
class StatCard extends StatelessWidget {
  final String label;
  final int count;
  final Color? countColor;
  final IconData? icon;

  const StatCard({
    super.key,
    required this.label,
    required this.count,
    this.countColor,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
            if (icon != null) ...[
              Icon(icon, color: countColor ?? AppColors.primary, size: 28),
              const SizedBox(height: 8),
            ],
            Text(
              '$count',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: countColor ?? AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
        ),
      ),
    );
  }
}
