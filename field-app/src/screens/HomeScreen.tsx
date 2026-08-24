import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { getAllReports } from '../services/db';
import { useSyncStore } from '../store/syncStore';
import { Report } from '../types/report';
import { Ionicons } from '@expo/vector-icons';

export const HomeScreen = ({ navigation }: any) => {
  const { isOnline, pendingCount, isSyncing } = useSyncStore();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ submitted: 0, inProgress: 0, resolved: 0 });
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const reports = await getAllReports();
          setSummary({
            submitted: reports.filter(r => r.status === 'SUBMITTED').length,
            inProgress: reports.filter(r => r.status === 'IN_PROGRESS').length,
            resolved: reports.filter(r => r.status === 'RESOLVED').length,
          });
          setRecentReports(reports.slice(0, 3));
        } catch (error) {
          console.error('Failed to load reports', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  const renderBanner = () => {
    if (!isOnline) {
      return (
        <View style={[styles.banner, { backgroundColor: theme.colors.critical }]}>
          <Ionicons name="cloud-offline" size={16} color={theme.colors.surface} style={styles.bannerIcon} />
          <Text style={styles.bannerText}>Offline - Check Connection</Text>
        </View>
      );
    }
    if (pendingCount > 0) {
      return (
        <View style={[styles.banner, { backgroundColor: theme.colors.warning }]}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={theme.colors.surface} style={styles.bannerIcon} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={16} color={theme.colors.surface} style={styles.bannerIcon} />
          )}
          <Text style={styles.bannerText}>
            {pendingCount} report{pendingCount > 1 ? 's' : ''} pending sync {isSyncing ? '(Syncing...)' : ''}
          </Text>
        </View>
      );
    }
    return null;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'TRACK': return 'train-outline';
      case 'SIGNAL': return 'radio-outline';
      case 'TRACTION_OHE': return 'flash-outline';
      default: return 'alert-circle-outline';
    }
  };

  return (
    <View style={styles.container}>
      {renderBanner()}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.primaryCta}
          onPress={() => navigation.navigate('ReportProblem')}
        >
          <Ionicons name="warning-outline" size={32} color={theme.colors.surface} />
          <Text style={styles.primaryCtaText}>Report Problem</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCount}>{summary.submitted}</Text>
                <Text style={styles.summaryLabel}>Submitted</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryCount, { color: theme.colors.warning }]}>{summary.inProgress}</Text>
                <Text style={styles.summaryLabel}>In Progress</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryCount, { color: theme.colors.success }]}>{summary.resolved}</Text>
                <Text style={styles.summaryLabel}>Resolved</Text>
              </View>
            </View>

            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Recent Reports</Text>
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'My Reports' })}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {recentReports.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color={theme.colors.textMuted} />
                  <Text style={styles.emptyStateText}>No reports yet.</Text>
                  <Text style={styles.emptyStateSub}>Tap "Report Problem" to get started.</Text>
                </View>
              ) : (
                recentReports.map(report => (
                  <TouchableOpacity 
                    key={report.id} 
                    style={styles.recentCard}
                    onPress={() => navigation.navigate('ReportDetails', { id: report.id })}
                  >
                    <View style={styles.recentCardHeader}>
                      <Ionicons name={getCategoryIcon(report.category) as any} size={20} color={theme.colors.primary} />
                      <Text style={styles.recentCardTitle}>{report.category.replace('_', ' ')}</Text>
                    </View>
                    <Text style={styles.recentCardDesc} numberOfLines={1}>{report.description}</Text>
                    <Text style={styles.recentCardTime}>{new Date(report.createdAt).toLocaleDateString()}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  banner: {
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIcon: {
    marginRight: theme.spacing.sm,
  },
  bannerText: {
    ...theme.typography.caption,
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
  primaryCta: {
    backgroundColor: theme.colors.critical, // Red for safety emphasis
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryCtaText: {
    ...theme.typography.h2,
    color: theme.colors.surface,
    marginLeft: theme.spacing.md,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryCount: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  recentSection: {
    flex: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  seeAllText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  recentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  recentCardTitle: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  recentCardDesc: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  recentCardTime: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyStateSub: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
