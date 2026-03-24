import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
import authService from '../services/authService';
import courseService from '../services/courseService';
import registrationService from '../services/registrationService';
import { getCourseMaterials } from '../data/courseMaterials';
import { getErrorMessage } from '../utils/errorUtils';
import theme from '../theme';
import { AppButton, AppCard, EmptyState, LoadingState, StatusBanner, useToast } from '../components';

export default function CourseDetailScreen({ navigation, route }) {
  const { showToast } = useToast();
  const initialCourse = route.params?.course || null;

  const [course, setCourse] = useState(initialCourse);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [contentProgress, setContentProgress] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [savingItemId, setSavingItemId] = useState(null);
  const [error, setError] = useState('');

  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  const getCourseVisual = courseData => {
    if (!courseData) {
      return { colors: [theme.colors.primaryPurple, theme.colors.primaryPink], icon: 'book-outline' };
    }
    const lower = `${courseData.category} ${courseData.code} ${courseData.name}`.toLowerCase();
    if (lower.includes('python')) {
      return { colors: ['#1B4F72', '#2E86C1'], icon: 'logo-python' };
    }
    if (lower.includes('sql') || lower.includes('database')) {
      return { colors: ['#4A148C', '#7E57C2'], icon: 'server-outline' };
    }
    if (lower.includes('java')) {
      return { colors: ['#0D47A1', '#1976D2'], icon: 'cafe-outline' };
    }
    if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) {
      return { colors: ['#004D40', '#26A69A'], icon: 'color-palette-outline' };
    }
    if (lower.includes('ai') || lower.includes('machine learning')) {
      return { colors: ['#1A237E', '#3949AB'], icon: 'sparkles-outline' };
    }
    if (lower.includes('network')) {
      return { colors: ['#263238', '#455A64'], icon: 'share-social-outline' };
    }
    return { colors: ['#263238', '#546E7A'], icon: 'book-outline' };
  };

  const loadData = useCallback(async () => {
    try {
      const [allCourses, myRegs] = await Promise.all([
        courseService.getCourses(),
        registrationService.getMyRegistrations().catch(() => []),
      ]);
      if (initialCourse) {
        const updated = allCourses.find(item => item.id === initialCourse.id) || initialCourse;
        setCourse(updated);
      } else {
        setCourse(null);
      }
      setRegistrations(myRegs);
      setError('');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [initialCourse]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isRegistered = useMemo(() => {
    if (!course) return false;
    return registrations.some(reg => reg.courseId === course.id);
  }, [course, registrations]);

  const materials = useMemo(() => getCourseMaterials(course), [course]);
  const visual = useMemo(() => getCourseVisual(course), [course]);

  useEffect(() => {
    const loadContentProgress = async () => {
      if (!course || !isRegistered) {
        setContentProgress({});
        return;
      }
      try {
        setLoadingProgress(true);
        const items = await registrationService.getContentProgress(course.id);
        const progressMap = items.reduce((acc, item) => {
          acc[item.itemId] = item.progress;
          return acc;
        }, {});
        setContentProgress(progressMap);
      } catch (loadError) {
        showToast(getErrorMessage(loadError), 'error');
      } finally {
        setLoadingProgress(false);
      }
    };

    loadContentProgress();
  }, [course, isRegistered, showToast]);

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

  const handleRegister = async () => {
    if (!course) return;
    try {
      setRegistering(true);
      await registrationService.registerCourse(course.id, course.price);
      showToast(`Registered for ${course.name}`, 'success');
      await loadData();
    } catch (registerError) {
      showToast(getErrorMessage(registerError), 'error');
    } finally {
      setRegistering(false);
    }
  };

  const getItemProgress = itemId => (contentProgress[itemId] ?? 0);

  const updateItemProgress = async (itemId, value) => {
    if (!course || !isRegistered) return;
    const previousMap = contentProgress;
    const nextMap = { ...contentProgress, [itemId]: value };
    setContentProgress(nextMap);
    setSavingItemId(itemId);

    try {
      await registrationService.updateContentProgress(course.id, itemId, value);
    } catch (updateError) {
      showToast(getErrorMessage(updateError), 'error');
      setContentProgress(previousMap);
    } finally {
      setSavingItemId(null);
    }
  };

  const handleToggleComplete = itemId => {
    const nextValue = getItemProgress(itemId) >= 100 ? 0 : 100;
    updateItemProgress(itemId, nextValue);
  };

  const handleMarkAllComplete = async () => {
    if (!course || !isRegistered || materials.length === 0) return;
    const nextMap = materials.reduce((acc, item) => {
      acc[item.id] = 100;
      return acc;
    }, {});
    setContentProgress(nextMap);
    setSavingItemId('all');

    try {
      await Promise.all(
        materials.map(item => registrationService.updateContentProgress(course.id, item.id, 100))
      );
      showToast('All materials marked complete', 'success');
    } catch (updateError) {
      showToast(getErrorMessage(updateError), 'error');
    } finally {
      setSavingItemId(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading course details..." />;
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <StatusBanner type="error" message={error} />
        <AppButton title="Retry" onPress={loadData} style={styles.retryButton} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.stateContainer}>
        <EmptyState
          icon="alert-circle-outline"
          title="Course not found"
          subtitle="Please return to the course list."
        />
        <AppButton title="Go Back" variant="secondary" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button">
          <Ionicons name="chevron-back" size={26} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Course Details</Text>
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => navigation.navigate('UserProfile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Image source={require('../../assets/logo-white.png')} style={styles.avatarImage} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={visual.colors} style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name={visual.icon} size={28} color={theme.colors.white} />
          </View>
          <Text style={styles.heroTitle}>{course.name}</Text>
          <Text style={styles.heroSubtitle}>{course.code} - {course.category}</Text>
          <Text style={styles.heroMeta}>Instructor: {course.instructor}</Text>
        </LinearGradient>

        <AppCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Schedule</Text>
            <Text style={styles.infoValue}>{course.schedule}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{course.duration}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Credits</Text>
            <Text style={styles.infoValue}>{course.credits}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price</Text>
            <Text style={styles.infoValue}>Rs. {course.price}</Text>
          </View>
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Course Preview</Text>
          <Text style={styles.sectionSubtitle}>{course.description}</Text>
          <TouchableOpacity
            style={[
              styles.videoCard,
              !course.videoLink && !course.learnLink ? styles.videoCardDisabled : null,
            ]}
            onPress={() => openExternalLink(course.videoLink || course.learnLink)}
            accessibilityRole="button"
            disabled={!course.videoLink && !course.learnLink}
          >
            <LinearGradient colors={['#101326', '#2b2f6b']} style={styles.videoGradient}>
              <Ionicons name="play-circle" size={54} color={theme.colors.white} />
              <Text style={styles.videoTitle}>Watch Related Videos</Text>
            </LinearGradient>
          </TouchableOpacity>
          <AppButton
            title="Open Free Course"
            variant="secondary"
            onPress={() => openExternalLink(course.learnLink)}
            style={styles.actionButton}
            disabled={!course.learnLink}
          />
          {!isAdmin ? (
            <AppButton
              title={isRegistered ? 'Already Registered' : 'Register Now'}
              onPress={handleRegister}
              disabled={isRegistered}
              loading={registering}
            />
          ) : null}
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Course Materials</Text>
          {materials.length === 0 ? (
            <Text style={styles.emptyText}>No materials available for this course.</Text>
          ) : (
            <>
              {!isRegistered ? (
                <Text style={styles.emptyText}>Register for the course to track your progress.</Text>
              ) : null}
              {loadingProgress ? (
                <Text style={styles.emptyText}>Loading progress...</Text>
              ) : null}
              {materials.map(item => {
                const progressValue = getItemProgress(item.id);
                const isSaving = savingItemId === item.id || savingItemId === 'all';

                return (
                  <View key={item.id} style={styles.materialWrap}>
                    <View style={styles.materialRow}>
                      <TouchableOpacity
                        onPress={() => handleToggleComplete(item.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: progressValue >= 100 }}
                        disabled={!isRegistered || isSaving}
                      >
                        <Ionicons
                          name={progressValue >= 100 ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={progressValue >= 100 ? theme.colors.primaryPink : theme.colors.textPrimary}
                        />
                      </TouchableOpacity>
                      <View style={styles.materialInfo}>
                        <Text style={styles.materialTitle}>{item.title}</Text>
                        <Text style={styles.materialSource}>{item.source}</Text>
                      </View>
                      <Text style={styles.materialProgress}>{progressValue}%</Text>
                      <TouchableOpacity
                        onPress={() => openExternalLink(item.link)}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${item.title}`}
                      >
                        <Ionicons name="open-outline" size={18} color={theme.colors.textPrimary + '88'} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.materialProgressTrack}>
                      <View
                        style={[
                          styles.materialProgressFill,
                          { width: `${progressValue}%` },
                        ]}
                      />
                    </View>
                    <Slider
                      style={styles.materialSlider}
                      minimumValue={0}
                      maximumValue={100}
                      step={5}
                      value={progressValue}
                      minimumTrackTintColor={theme.colors.primaryPink}
                      maximumTrackTintColor={theme.colors.softGray}
                      thumbTintColor={theme.colors.primaryPink}
                      onSlidingComplete={value => updateItemProgress(item.id, value)}
                      disabled={!isRegistered || isSaving}
                      accessibilityLabel={`Progress slider for ${item.title}`}
                    />
                  </View>
                );
              })}
            </>
          )}
        </AppCard>

        <AppButton
          title="Mark All Complete"
          onPress={handleMarkAllComplete}
          style={styles.completeButton}
          disabled={!isRegistered || materials.length === 0 || savingItemId === 'all'}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  stateContainer: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg },
  retryButton: { marginTop: theme.spacing.sm },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  topTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarImage: { width: 22, height: 22, resizeMode: 'contain' },
  heroCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  heroTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
  },
  heroSubtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.white + 'CC',
    fontSize: theme.typography.sizes.sm,
  },
  heroMeta: {
    marginTop: theme.spacing.sm,
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
  },
  infoCard: { marginBottom: theme.spacing.md },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.xs },
  infoLabel: { color: theme.colors.textPrimary + '88' },
  infoValue: { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.semibold },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textPrimary + 'AA',
    marginBottom: theme.spacing.md,
  },
  videoCard: { borderRadius: theme.radius.md, overflow: 'hidden', marginBottom: theme.spacing.md },
  videoCardDisabled: { opacity: 0.6 },
  videoGradient: { height: 170, alignItems: 'center', justifyContent: 'center' },
  videoTitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.white,
    fontWeight: theme.typography.weights.semibold,
  },
  actionButton: { marginBottom: theme.spacing.sm },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  materialWrap: { marginTop: theme.spacing.sm },
  materialInfo: { flex: 1, marginLeft: theme.spacing.sm },
  materialTitle: { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.semibold },
  materialSource: { color: theme.colors.textPrimary + '88', marginTop: 2 },
  materialProgress: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    marginRight: theme.spacing.sm,
  },
  materialProgressTrack: {
    height: 6,
    borderRadius: 4,
    backgroundColor: theme.colors.softGray,
    overflow: 'hidden',
    marginTop: theme.spacing.xs,
  },
  materialProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primaryPink,
  },
  materialSlider: { width: '100%', height: 34 },
  emptyText: { color: theme.colors.textPrimary + '88', marginTop: theme.spacing.sm },
  completeButton: { marginTop: theme.spacing.md },
});
