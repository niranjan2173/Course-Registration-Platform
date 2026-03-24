import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import courseService from '../services/courseService';
import registrationService from '../services/registrationService';
import authService from '../services/authService';
import { formatDate } from '../utils/dateUtils';
import { getErrorMessage } from '../utils/errorUtils';
import theme from '../theme';
import { AppButton, AppCard, EmptyState, LoadingState, StatusBanner } from '../components';

const getProgressColor = progress => (progress >= 60 ? theme.colors.primaryPurple : theme.colors.primaryPink);

export default function MyCoursesScreen({ navigation }) {
  const [registrations, setRegistrations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const currentUser = authService.getCurrentUser();

  const courseMap = useMemo(() => new Map(courses.map(course => [course.id, course])), [courses]);
  const loadData = useCallback(async () => {
    try {
      const [myRegs, allCourses] = await Promise.all([
        registrationService.getMyRegistrations(),
        courseService.getCourses(),
      ]);
      setRegistrations(myRegs);
      setCourses(allCourses);
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

  const openExternalLink = async url => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Link Error', 'Unable to open this link on your device.');
        return;
      }
      await Linking.openURL(url);
    } catch (linkError) {
      Alert.alert('Link Error', 'Unable to open this link right now.');
    }
  };

  const renderRegistration = ({ item }) => {
    const progressColor = getProgressColor(item.progress);

    return (
      <TouchableOpacity
        style={styles.touchWrap}
        onPress={() => {
          setSelectedRegistration(item);
          setModalVisible(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.courseName} details`}
      >
        <AppCard>
          <View style={styles.rowBetween}>
            <View style={styles.flexOne}>
              <Text style={styles.courseName}>{item.courseName}</Text>
              <Text style={styles.courseCode}>{item.courseCode}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={theme.colors.primaryPink} />
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressValue, { color: progressColor }]}>{item.progress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[theme.colors.primaryPurple, theme.colors.primaryPink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${item.progress}%` }]}
            />
          </View>

          <View style={styles.rowBetween}>
            <View style={styles.inlineItem}>
              <Ionicons name="flame" size={16} color={theme.colors.primaryPink} />
              <Text style={styles.metaText}>{item.currentStreak} day streak</Text>
            </View>
            <Text style={styles.metaText}>Registered {formatDate(item.registrationDate)}</Text>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  if (initialLoading) {
    return <LoadingState label="Loading your courses..." />;
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
      <View style={styles.header}>
        <Text style={styles.title}>My Courses</Text>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => navigation.navigate('UserProfile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Image source={require('../../assets/logo-white.png')} style={styles.avatarImage} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={registrations}
        keyExtractor={item => String(item.id)}
        renderItem={renderRegistration}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="library-outline"
            title="No courses registered yet"
            subtitle="Explore and register for courses to see them here"
          />
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView>
              {selectedRegistration ? (
                <>
                  <Text style={styles.modalTitle}>{selectedRegistration.courseName}</Text>
                  <Text style={styles.modalSubtitle}>{selectedRegistration.courseCode}</Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Instructor</Text>
                    <Text style={styles.detailValue}>{courseMap.get(selectedRegistration.courseId)?.instructor || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Schedule</Text>
                    <Text style={styles.detailValue}>{courseMap.get(selectedRegistration.courseId)?.schedule || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Credits</Text>
                    <Text style={styles.detailValue}>{courseMap.get(selectedRegistration.courseId)?.credits || '-'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Registration Date</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedRegistration.registrationDate)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Amount Paid</Text>
                    <Text style={styles.detailValue}>Rs. {selectedRegistration.amountPaid}</Text>
                  </View>

                  {(courseMap.get(selectedRegistration.courseId)?.learnLink ||
                    courseMap.get(selectedRegistration.courseId)?.videoLink) ? (
                    <>
                      <Text style={styles.modalSection}>Learn Online</Text>
                      {courseMap.get(selectedRegistration.courseId)?.learnLink ? (
                        <AppButton
                          title="Open Free Course"
                          variant="secondary"
                          onPress={() => openExternalLink(courseMap.get(selectedRegistration.courseId)?.learnLink)}
                          style={styles.linkButton}
                        />
                      ) : null}
                      {courseMap.get(selectedRegistration.courseId)?.videoLink ? (
                        <AppButton
                          title="Watch Related Videos"
                          variant="secondary"
                          onPress={() => openExternalLink(courseMap.get(selectedRegistration.courseId)?.videoLink)}
                          style={styles.linkButton}
                        />
                      ) : null}
                      <AppButton
                        title="Open Course Page"
                        onPress={() => {
                          const course = courseMap.get(selectedRegistration.courseId);
                          if (course) {
                            setModalVisible(false);
                            navigation.navigate('CourseDetail', { course });
                          }
                        }}
                        style={styles.linkButton}
                      />
                    </>
                  ) : null}
                </>
              ) : null}
            </ScrollView>

            <AppButton title="Close" variant="secondary" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  stateContainer: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg },
  retryButton: { marginTop: theme.spacing.sm },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: theme.typography.sizes.xl, color: theme.colors.textPrimary, fontWeight: theme.typography.weights.bold },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarImage: { width: 26, height: 26, resizeMode: 'contain' },
  listContainer: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  touchWrap: { marginBottom: theme.spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.xs },
  flexOne: { flex: 1, marginRight: theme.spacing.sm },
  courseName: { color: theme.colors.textPrimary, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold },
  courseCode: { marginTop: theme.spacing.xs, color: theme.colors.textPrimary + 'AA', fontSize: theme.typography.sizes.sm },
  progressHeader: { marginTop: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { color: theme.colors.textPrimary + 'AA', fontSize: theme.typography.sizes.sm },
  progressValue: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold },
  progressTrack: {
    marginTop: theme.spacing.sm,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.softGray,
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },
  inlineItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { marginLeft: theme.spacing.xs, color: theme.colors.textPrimary + 'AA', fontSize: theme.typography.sizes.xs },
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    maxHeight: '88%',
  },
  modalTitle: { color: '#000000', fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold },
  modalSubtitle: { marginTop: theme.spacing.xs, marginBottom: theme.spacing.md, color: '#000000' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: { color: '#000000', fontSize: theme.typography.sizes.sm, width: 130 },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    color: '#000000',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
  },
  modalSection: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  linkButton: {
    marginTop: theme.spacing.sm,
  },
});
