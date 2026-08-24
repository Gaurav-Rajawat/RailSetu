import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { getAllReports, updateReport } from '../services/db';
import { Report } from '../types/report';
import { Ionicons } from '@expo/vector-icons';
import { useSyncStore } from '../store/syncStore';
import { syncManager } from '../services/syncManager';

type FilterType = 'All' | 'Pending Sync' | 'Submitted' | 'In Progress' | 'Resolved';

export const MyReportsScreen = ({ navigation }: any) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('All');
  
  const { isOnline, pendingCount, isSyncing } = useSyncStore();

  const loadReports = async () => {
    try {
      const data = await getAllReports();
      setReports(data);
      syncManager.updatePendingCount();
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'All') return true;
    if (filter === 'Pending Sync') return r.syncStatus === 'pending' || r.syncStatus === 'failed';
    if (filter === 'Submitted') return r.status === 'SUBMITTED' && r.syncStatus === 'synced';
    if (filter === 'In Progress') return r.status === 'IN_PROGRESS' && r.syncStatus === 'synced';
    if (filter === 'Resolved') return r.status === 'RESOLVED' && r.syncStatus === 'synced';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'TRACK': return 'train-outline';
      case 'SIGNAL': return 'radio-outline';
      case 'TRACTION_OHE': return 'flash-outline';
      default: return 'alert-circle-outline';
    }
  };

  const getStatusBadge = (r: Report) => {
    if (r.syncStatus === 'failed') {
      return { text: 'Sync Failed', color: theme.colors.critical };
    }
    if (r.syncStatus === 'pending' || r.syncStatus === 'syncing') {
      return { text: 'Pending Sync', color: theme.colors.warning };
    }
    // Synced status
    switch (r.status) {
      case 'SUBMITTED': return { text: 'Synced - Submitted', color: theme.colors.info };
      case 'IN_PROGRESS': return { text: 'In Progress', color: theme.colors.warning };
      case 'RESOLVED': return { text: 'Resolved', color: theme.colors.success };
      case 'ACKNOWLEDGED': return { text: 'Acknowledged', color: theme.colors.primary };
      default: return { text: r.status, color: theme.colors.textMuted };
    }
  };

  const handleRetry = async (id: string) => {
    await updateReport(id, { syncStatus: 'pending', retryCount: 0, nextRetryAt: null });
    loadReports();
    syncManager.syncPendingReports(true);
  };

  const renderItem = ({ item }: { item: Report }) => {
    const badge = getStatusBadge(item);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ReportDetails', { id: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryRow}>
            <Ionicons name={getCategoryIcon(item.category) as any} size={20} color={theme.colors.primary} />
            <Text style={styles.categoryText}>{item.category.replace('_', ' ')}</Text>
          </View>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={[styles.badge, { backgroundColor: badge.color }]}>
            <Text style={styles.badgeText}>{badge.text}</Text>
          </View>
          {item.syncStatus === 'failed' && (
            <TouchableOpacity style={styles.retryBtn} onPress={() => handleRetry(item.id)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderBanner = () => {
    if (!isOnline) {
      return (
        <View style={[styles.banner, { backgroundColor: theme.colors.critical }]}>
          <Text style={styles.bannerText}>Offline - Check Connection</Text>
        </View>
      );
    }
    if (pendingCount > 0) {
      return (
        <View style={[styles.banner, { backgroundColor: theme.colors.warning }]}>
          <Text style={styles.bannerText}>
            {pendingCount} report{pendingCount > 1 ? 's' : ''} pending sync {isSyncing ? '(Syncing...)' : ''}
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.banner, { backgroundColor: theme.colors.success }]}>
        <Text style={styles.bannerText}>All synced</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderBanner()}
      <View style={styles.filterScroll}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', 'Pending Sync', 'Submitted', 'In Progress', 'Resolved'] as FilterType[]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: theme.spacing.sm }}
        />
      </View>
      
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No reports found</Text>
            <Text style={styles.emptyText}>Try changing your filter or submit a new report.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  banner: {
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    ...theme.typography.caption,
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
  filterScroll: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.background,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  filterTextActive: {
    color: theme.colors.surface,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    fontWeight: 'bold',
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.surface,
    fontWeight: 'bold',
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: theme.colors.critical,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  retryText: {
    ...theme.typography.caption,
    color: theme.colors.critical,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});
