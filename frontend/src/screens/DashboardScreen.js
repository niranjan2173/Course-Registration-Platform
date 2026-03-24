import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../services/authService';
import courseService from '../services/courseService';
import registrationService from '../services/registrationService';
import { getErrorMessage } from '../utils/errorUtils';
import theme from '../theme';
import { AppButton, AppCard, EmptyState, LoadingState, StatusBanner } from '../components';

export default function DashboardScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = authService.getCurrentUser();

  const loadData = useCallback(async () => {
    try {
      const [allCourses, myRegs] = await Promise.all([
        courseService.getCourses(),
        registrationService.getMyRegistrations().catch(() => []),
      ]);
      setCourses(allCourses);
      setRegistrations(myRegs);
      setError('');
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <StatusBanner type="error" message={error} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <View />
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={() => navigation.navigate('UserProfile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Image source={require('../../assets/logo-white.png')} style={styles.avatarImage} />
        </TouchableOpacity>
      </View>

      <AppCard style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.welcomeName}>{currentUser?.name || 'Student'}</Text>
      </AppCard>

      <AppCard style={styles.profileCard}>
        <LinearGradient colors={['#0f2d3d', '#1a4f63']} style={styles.profileBanner} />
        <View style={styles.profileRow}>
          <View style={styles.profileAvatar}>
            <Image source={require('../../assets/logo-white.png')} style={styles.profileLogo} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser?.name || 'Student'}</Text>
            <Text style={styles.profileDept}>{currentUser?.department || 'Department'}</Text>
          </View>
          <AppButton
            title="Edit"
            onPress={() => navigation.navigate('ProfileEdit')}
            style={styles.profileEditButton}
          />
        </View>
      </AppCard>

      <AppCard style={styles.quickCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          <AppButton title="Explore Courses" onPress={() => navigation.navigate('Explore')} style={styles.quickButton} />
          <AppButton title="Timetable" onPress={() => navigation.navigate('Timetable')} style={styles.quickButton} />
          <AppButton title="Progress" onPress={() => navigation.navigate('Progress')} style={styles.quickButton} />
        </View>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Registered Courses</Text>
        {registrations.length === 0 ? (
          <EmptyState
            icon="library-outline"
            title="No courses yet"
            subtitle="Register for courses to see them here."
          />
        ) : (
          <View style={styles.registeredList}>
            {registrations.map(reg => {
              const course = courses.find(item => item.id === reg.courseId);
              if (!course) return null;
              return (
                <View key={reg.id} style={styles.registeredRow}>
                  <View style={styles.registeredInfo}>
                    <Text style={styles.registeredName}>{course.name}</Text>
                    <Text style={styles.registeredMeta}>{course.code} - {course.instructor}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primaryPink} />
                </View>
              );
            })}
          </View>
        )}
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl },
  stateContainer: { flex: 1, justifyContent: 'center', padding: theme.spacing.lg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarImage: { width: 26, height: 26, resizeMode: 'contain' },
  welcomeCard: { marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  welcomeText: { color: theme.colors.textPrimary + 'CC', fontSize: theme.typography.sizes.sm, letterSpacing: 0.3 },
  welcomeName: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  profileCard: { marginBottom: theme.spacing.md, paddingBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
  profileBanner: {
    height: 120,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -36,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  profileLogo: { width: 34, height: 34, resizeMode: 'contain' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary },
  profileDept: { marginTop: 2, color: theme.colors.textPrimary + 'AA' },
  profileEditButton: { minWidth: 80 },
  quickCard: { marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  quickRow: { marginTop: theme.spacing.sm, rowGap: theme.spacing.sm },
  quickButton: { },
  sectionCard: { marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  sectionTitle: { fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary },
  registeredList: { marginTop: theme.spacing.sm },
  registeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  registeredInfo: { flex: 1, marginRight: theme.spacing.sm },
  registeredName: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold, color: theme.colors.textPrimary },
  registeredMeta: { marginTop: 2, color: theme.colors.textPrimary + 'AA' },
});
