import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import courseService from '../services/courseService';
import registrationService from '../services/registrationService';
import { getErrorMessage } from '../utils/errorUtils';
import theme from '../theme';
import { AppButton, AppCard, EmptyState, LoadingState, StatusBanner } from '../components';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const groupByDay = timetable => {
  const grouped = {};
  timetable.forEach(item => {
    const days = item.schedule.split(' - ')[0].split(', ');
    days.forEach(day => {
      const key = day.trim();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
  });
  return grouped;
};

export default function TimetableScreen({ navigation }) {
  const [timetable, setTimetable] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const grouped = useMemo(() => groupByDay(timetable), [timetable]);

  const loadData = useCallback(async () => {
    try {
      const [courses, registrations] = await Promise.all([
        courseService.getCourses(),
        registrationService.getMyRegistrations(),
      ]);
      setTimetable(registrationService.getTimetable(courses, registrations));
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

  if (initialLoading) {
    return <LoadingState label="Loading timetable..." />;
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
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.title}>Timetable</Text>
        <Text style={styles.subtitle}>{timetable.length} classes scheduled</Text>
      </View>

      {timetable.length === 0 ? (
        <EmptyState icon="calendar-outline" title="No classes scheduled" subtitle="Register courses to populate timetable" />
      ) : (
        <View style={styles.daysContainer}>
          {weekDays.map(day => {
            const dayClasses = grouped[day] || [];
            return (
              <AppCard key={day} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{day}</Text>
                  <View style={styles.dayBadge}><Text style={styles.dayBadgeText}>{dayClasses.length}</Text></View>
                </View>

                {dayClasses.length === 0 ? (
                  <Text style={styles.noClassText}>No classes</Text>
                ) : (
                  dayClasses.map((item, index) => (
                    <TouchableOpacity
                      key={`${item.courseCode}-${index}`}
                      style={styles.classItem}
                      onPress={() => {
                        setSelectedClass(item);
                        setModalVisible(true);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${item.courseName} details`}
                    >
                      <View style={styles.classHead}>
                        <Text style={styles.className}>{item.courseName}</Text>
                        <Text style={styles.classCode}>{item.courseCode}</Text>
                      </View>
                      <View style={styles.metaRow}><Ionicons name="person" size={14} color={theme.colors.textPrimary} /><Text style={styles.metaText}>{item.instructor}</Text></View>
                      <View style={styles.metaRow}><Ionicons name="time" size={14} color={theme.colors.textPrimary} /><Text style={styles.metaText}>{item.schedule.split(' - ')[1]}</Text></View>
                      <View style={styles.metaRow}><Ionicons name="bookmark" size={14} color={theme.colors.textPrimary} /><Text style={styles.metaText}>{item.credits} credits · {item.category}</Text></View>
                    </TouchableOpacity>
                  ))
                )}
              </AppCard>
            );
          })}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.dragHandle} />
            {selectedClass ? (
              <>
                <Text style={styles.modalTitle}>{selectedClass.courseName}</Text>
                <Text style={styles.modalSubtitle}>{selectedClass.courseCode}</Text>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Instructor</Text><Text style={styles.detailValue}>{selectedClass.instructor}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Schedule</Text><Text style={styles.detailValue}>{selectedClass.schedule}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Credits</Text><Text style={styles.detailValue}>{selectedClass.credits}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Duration</Text><Text style={styles.detailValue}>{selectedClass.duration}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Category</Text><Text style={styles.detailValue}>{selectedClass.category}</Text></View>
              </>
            ) : null}
            <AppButton title="Close" variant="secondary" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  stateContainer: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg },
  retryButton: { marginTop: theme.spacing.sm },
  header: { padding: theme.spacing.md },
  title: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary },
  subtitle: { marginTop: theme.spacing.xs, color: theme.colors.textPrimary + 'AA' },
  daysContainer: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  dayCard: { marginBottom: theme.spacing.md },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  dayName: { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.lg },
  dayBadge: {
    minWidth: 30,
    minHeight: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.softGray,
  },
  dayBadgeText: { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.semibold },
  noClassText: { color: theme.colors.textPrimary + '88', fontSize: theme.typography.sizes.sm },
  classItem: {
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.softGray,
  },
  classHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs },
  className: { flex: 1, marginRight: theme.spacing.sm, color: theme.colors.textPrimary, fontWeight: theme.typography.weights.semibold },
  classCode: { color: theme.colors.textPrimary + 'AA', fontSize: theme.typography.sizes.xs },
  metaRow: { marginTop: theme.spacing.xs, flexDirection: 'row', alignItems: 'center' },
  metaText: { marginLeft: theme.spacing.xs, color: theme.colors.textPrimary + 'AA', fontSize: theme.typography.sizes.xs },
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: theme.colors.white, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: theme.spacing.lg, maxHeight: '80%' },
  dragHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  modalTitle: { color: '#000000', fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold },
  modalSubtitle: { marginTop: theme.spacing.xs, color: '#000000', marginBottom: theme.spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  detailLabel: { color: '#000000', fontSize: theme.typography.sizes.sm },
  detailValue: { color: '#000000', fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold, marginLeft: theme.spacing.md, flex: 1, textAlign: 'right' },
});
