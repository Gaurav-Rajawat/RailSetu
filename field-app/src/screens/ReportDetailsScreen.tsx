import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { getReportById } from '../services/db';
import { Report } from '../types/report';
import { Ionicons } from '@expo/vector-icons';

const STATUS_ORDER = ['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'];

export const ReportDetailsScreen = ({ route }: any) => {
  const { id } = route.params || {};
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        getReportById(id)
          .then(setReport)
          .catch(console.error)
          .finally(() => setLoading(false));
      }
    }, [id])
  );

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>Report not found</Text>
      </View>
    );
  }

  const openMap = () => {
    const { latitude, longitude } = report;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  const currentStatusIndex = STATUS_ORDER.indexOf(report.status);

  return (
    <ScrollView style={styles.container}>
      {report.photoUri ? (
        <Image source={{ uri: report.photoUri }} style={styles.heroImage} />
      ) : (
        <View style={styles.noImageHero}>
          <Ionicons name="image-outline" size={48} color={theme.colors.textMuted} />
          <Text style={styles.noImageText}>No Photo</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.categoryTitle}>{report.category.replace('_', ' ')}</Text>
          <Text style={styles.dateText}>{new Date(report.createdAt).toLocaleString()}</Text>
        </View>

        <Text style={styles.description}>{report.description}</Text>

        <View style={styles.locationBox}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={24} color={theme.colors.primary} />
            <View style={styles.locationData}>
              <Text style={styles.locationTitle}>GPS Coordinates</Text>
              <Text style={styles.locationSubtitle}>
                {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.mapBtn} onPress={openMap}>
            <Text style={styles.mapBtnText}>View on Map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timelineBox}>
          <Text style={styles.timelineTitle}>Status Timeline</Text>
          
          {STATUS_ORDER.map((status, index) => {
            const isActive = index <= currentStatusIndex;
            return (
              <View key={status} style={styles.timelineItem}>
                <View style={styles.timelineNodeContainer}>
                  <View style={[styles.timelineNode, isActive ? styles.timelineNodeActive : null]} />
                  {index < STATUS_ORDER.length - 1 && (
                    <View style={[styles.timelineLine, isActive && index < currentStatusIndex ? styles.timelineLineActive : null]} />
                  )}
                </View>
                <Text style={[styles.timelineText, isActive ? styles.timelineTextActive : null]}>
                  {status.replace('_', ' ')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorText: {
    ...theme.typography.h3,
    color: theme.colors.critical,
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  noImageHero: {
    width: '100%',
    height: 250,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  noImageText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  categoryTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  dateText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  locationBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xl,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  locationData: {
    marginLeft: theme.spacing.md,
  },
  locationTitle: {
    ...theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  locationSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  mapBtn: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  mapBtnText: {
    ...theme.typography.button,
    color: theme.colors.surface,
  },
  timelineBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timelineTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineNodeContainer: {
    alignItems: 'center',
    width: 24,
    marginRight: theme.spacing.md,
  },
  timelineNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.border,
    zIndex: 1,
  },
  timelineNodeActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginTop: -2,
    marginBottom: -2,
  },
  timelineLineActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineText: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: -2,
  },
  timelineTextActive: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
});
