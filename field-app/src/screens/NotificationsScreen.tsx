import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { useNotificationsStore, AppNotification } from '../store/notificationsStore';
import { Ionicons } from '@expo/vector-icons';

export const NotificationsScreen = ({ navigation }: any) => {
  const { notifications, markAsRead } = useNotificationsStore();

  const handlePress = (notification: AppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Need to use the parent stack navigator because Notifications is in a tab.
    // React Navigation allows navigating to any screen in the parent stack directly.
    navigation.navigate('ReportDetails', { id: notification.reportId });
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    return (
      <TouchableOpacity 
        style={[styles.card, !item.read && styles.cardUnread]}
        onPress={() => handlePress(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.title, !item.read && styles.textUnread]}>{item.title}</Text>
          <Text style={styles.timeText}>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
        <Text style={[styles.body, !item.read && styles.textUnread]}>{item.body}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>No notifications yet.</Text>
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
  listContent: {
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardUnread: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  timeText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  textUnread: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
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
  },
});
