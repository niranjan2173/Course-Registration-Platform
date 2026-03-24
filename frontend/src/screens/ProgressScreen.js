import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import registrationService from '../services/registrationService';
import theme from '../theme';
import { AppButton, AppCard, EmptyState, LoadingState, StatusBanner } from '../components';

const getProgressColor = progress => (progress >= 60 ? theme.colors.primaryPurple : theme.colors.primaryPink);
const MILESTONES = [25, 50, 75, 100];

export default function ProgressScreen({ navigation }) {
  const [registrations, setRegistrations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [contentStats, setContentStats] = useState({});

  const loadData = useCallback(async () => {
    try {
      const myRegs = await registrationService.getMyRegistrations();
      setRegistrations(myRegs);
      const statusRows = await Promise.all(
        myRegs.map(async reg => {
          const [contentItems] = await Promise.all([
            registrationService.getContentProgress(reg.courseId).catch(() => []),
          ]);
          const count = contentItems.length;
          const total = contentItems.reduce((sum, item) => sum + item.progress, 0);
          const avg = count > 0 ? Math.round(total / count) : 0;
          return { courseId: reg.courseId, avg, count };
        })
      );

      const nextContentStats = {};
      statusRows.forEach(row => {
        nextContentStats[row.courseId] = { average: row.avg, count: row.count };
      });

      setContentStats(nextContentStats);
      setError('');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderMilestone = (label, achieved) => (
    <View key={label} style={styles.milestone}>
      <Ionicons
        name={achieved ? 'checkmark-circle' : 'radio-button-off'}
        size={16}
        color={achieved ? theme.colors.primaryPink : theme.colors.textPrimary + '66'}
      />
      <Text style={[styles.milestoneText, achieved && styles.milestoneTextDone]}>{label}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const progressColor = getProgressColor(item.progress);
    const stats = contentStats[item.courseId] || { average: 0, count: 0 };
    const nextMilestone = MILESTONES.find(step => step > item.progress) || null;
    const canTakeAssessment = nextMilestone
      ? (stats.count === 0 ? true : stats.average >= nextMilestone)
      : false;

    return (
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.flexOne}>
            <Text style={styles.courseName}>{item.courseName}</Text>
            <Text style={styles.courseCode}>{item.courseCode}</Text>
          </View>
          <Text style={[styles.progressBadgeText, { color: progressColor }]}>{item.progress}%</Text>
        </View>

        <Text style={styles.sectionTitle}>Assessment Progress</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: progressColor }]} />
        </View>

        <View style={styles.progressMeta}>
          <Text style={styles.progressNote}>Content completion: {stats.average}%</Text>
          <Text style={styles.progressNote}>Next exam: {nextMilestone ? `${nextMilestone}%` : 'Completed'}</Text>
        </View>

        {nextMilestone ? (
          <AppButton
            title={`Take ${nextMilestone}% Exam`}
            onPress={() => navigation.navigate('Assessment', {
              courseId: item.courseId,
              courseName: item.courseName,
              milestone: nextMilestone,
              courseCategory: item.courseCategory,
            })}
            disabled={!canTakeAssessment}
            style={styles.examButton}
            accessibilityLabel={`Take ${nextMilestone}% assessment for ${item.courseName}`}
          />
        ) : (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.primaryPink} />
            <Text style={styles.completedText}>All assessments passed</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Milestones</Text>
        <View style={styles.milestoneWrap}>
          {renderMilestone('25%', item.progress >= 25)}
          {renderMilestone('50%', item.progress >= 50)}
          {renderMilestone('75%', item.progress >= 75)}
          {renderMilestone('100%', item.progress >= 100)}
        </View>
      </AppCard>
    );
  };

  if (initialLoading) {
    return <LoadingState label="Loading progress..." />;
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <StatusBanner type="error" message={error} />
        <AppButton title="Retry" onPress={loadData} style={styles.retryButton} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <Text style={styles.screenTitle}>Progress</Text>
      </View>

      <FlatList
        data={registrations}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState icon="analytics-outline" title="No progress to track" subtitle="Register for a course to start tracking" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  stateContainer: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg },
  retryButton: { marginTop: theme.spacing.sm },
  headerTop: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm },
  screenTitle: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary },
  listContainer: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  card: { marginBottom: theme.spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  flexOne: { flex: 1, marginRight: theme.spacing.sm },
  courseName: { color: theme.colors.textPrimary, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold },
  courseCode: { marginTop: theme.spacing.xs, color: theme.colors.textPrimary + 'AA' },
  progressBadgeText: { fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.md },
  sectionTitle: { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.semibold, marginBottom: theme.spacing.sm },
  progressTrack: { height: 10, borderRadius: 6, backgroundColor: theme.colors.softGray, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing.sm },
  progressNote: { color: theme.colors.textPrimary + 'AA', fontSize: theme.typography.sizes.xs },
  examButton: { marginTop: theme.spacing.md },
  completedBadge: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  completedText: { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.semibold },
  milestoneWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.white,
  },
  milestoneText: { marginLeft: theme.spacing.xs, fontSize: theme.typography.sizes.xs, color: '#000000' },
  milestoneTextDone: { color: '#000000', fontWeight: theme.typography.weights.semibold },
});
