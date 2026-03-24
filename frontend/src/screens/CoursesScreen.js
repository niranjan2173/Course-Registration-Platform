import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import courseService from '../services/courseService';
import registrationService from '../services/registrationService';
import authService from '../services/authService';
import { getErrorMessage } from '../utils/errorUtils';
import theme from '../theme';
import { AppButton, AppCard, EmptyState, LoadingState, StatusBanner } from '../components';

export default function CoursesScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState({});

  const heartScales = useRef({});

  const currentUser = authService.getCurrentUser();
  const categories = useMemo(() => courseService.getCategories(courses), [courses]);
  const registeredCourseIds = useMemo(
    () => new Set(myRegistrations.map(item => item.courseId)),
    [myRegistrations]
  );

  const filteredCourses = useMemo(
    () => courseService.searchCourses(courses, searchQuery, selectedCategory),
    [courses, searchQuery, selectedCategory]
  );

  const loadData = useCallback(async () => {
    try {
      const [allCourses, registrations] = await Promise.all([
        courseService.getCourses(),
        registrationService.getMyRegistrations().catch(() => []),
      ]);
      setCourses(allCourses);
      setMyRegistrations(registrations);
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

  const getHeartScale = courseId => {
    if (!heartScales.current[courseId]) {
      heartScales.current[courseId] = new Animated.Value(1);
    }
    return heartScales.current[courseId];
  };

  const toggleFavorite = courseId => {
    setFavorites(prev => ({ ...prev, [courseId]: !prev[courseId] }));
    const scale = getHeartScale(courseId);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.25, useNativeDriver: true, speed: 28, bounciness: 8 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 6 }),
    ]).start();
  };

  const getCourseVisual = course => {
    const category = course.category || '';
    const code = course.code || '';
    const lower = `${category} ${code} ${course.name}`.toLowerCase();

    if (lower.includes('python')) {
      return { colors: ['#1B4F72', '#2E86C1'], icon: 'logo-python', title: 'Python', subtitle: 'Programming' };
    }
    if (lower.includes('sql') || lower.includes('database')) {
      return { colors: ['#4A148C', '#7E57C2'], icon: 'server-outline', title: 'SQL', subtitle: 'Database' };
    }
    if (lower.includes('java')) {
      return { colors: ['#0D47A1', '#1976D2'], icon: 'cafe-outline', title: 'Java', subtitle: 'Programming' };
    }
    if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) {
      return { colors: ['#004D40', '#26A69A'], icon: 'color-palette-outline', title: 'UI/UX', subtitle: 'Design' };
    }
    if (lower.includes('ai') || lower.includes('machine learning')) {
      return { colors: ['#1A237E', '#3949AB'], icon: 'sparkles-outline', title: 'AI', subtitle: 'Learning' };
    }
    if (lower.includes('network')) {
      return { colors: ['#263238', '#455A64'], icon: 'share-social-outline', title: 'Networks', subtitle: 'Systems' };
    }
    return { colors: ['#263238', '#546E7A'], icon: 'book-outline', title: course.code || 'Course', subtitle: 'Level - ' + (course.credits || 1) };
  };


  const renderCourse = ({ item }) => {
    const isRegistered = registeredCourseIds.has(item.id);
    const favorite = !!favorites[item.id];
    const heartScale = getHeartScale(item.id);
    const visual = getCourseVisual(item);

    return (
      <TouchableOpacity
        style={styles.cardTouch}
        onPress={() => {
          navigation.navigate('CourseDetail', { course: item });
        }}
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${item.name}`}
      >
        <AppCard>
          <View style={styles.courseBannerWrap}>
            <LinearGradient colors={visual.colors} style={styles.courseBanner}>
              <View style={styles.bannerIcon}>
                <Ionicons name={visual.icon} size={22} color={theme.colors.white} />
              </View>
              <View style={styles.bannerTextWrap}>
                <Text style={styles.bannerTitle}>{visual.title}</Text>
                <Text style={styles.bannerSubtitle}>{visual.subtitle}</Text>
              </View>
            </LinearGradient>
          </View>
          <View style={styles.courseHeader}>
            <View style={styles.courseTitleWrap}>
              <View style={styles.courseLogo}>
                <Ionicons name={visual.icon} size={18} color={theme.colors.white} />
              </View>
              <Text style={styles.courseName}>{item.name}</Text>
              <Text style={styles.courseCode}>{item.code}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={`Toggle favorite for ${item.name}`}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons
                  name={favorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={favorite ? theme.colors.primaryPink : theme.colors.textPrimary}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <Text numberOfLines={2} style={styles.courseDescription}>{item.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color={theme.colors.textPrimary} />
              <Text style={styles.metaText}>{item.instructor}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color={theme.colors.textPrimary} />
              <Text style={styles.metaText}>Rs. {item.price}</Text>
            </View>
          </View>

          {isRegistered ? (
            <View style={styles.registeredPill}>
              <Text style={styles.registeredText}>Registered</Text>
            </View>
          ) : null}
        </AppCard>
      </TouchableOpacity>
    );
  };

  if (initialLoading) {
    return <LoadingState label="Loading courses..." />;
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
      <View style={styles.headerBlock}>
        <View style={styles.profileRow}>
          <View>
            <Text style={styles.screenTitle}>Explore Courses</Text>
            <Text style={styles.screenSubtitle}>Find and enroll in trending classes</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarRing}
            onPress={() => navigation.navigate('UserProfile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Image source={require('../../assets/logo-white.png')} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textPrimary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses"
            placeholderTextColor={theme.colors.textPrimary + '88'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search courses"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityRole="button">
              <Ionicons name="close-circle" size={18} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.filterChip, category === selectedCategory && styles.filterChipActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.filterText, category === selectedCategory && styles.filterTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourse}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No courses found"
            subtitle="Try changing search or category filters"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  retryButton: {
    marginTop: theme.spacing.sm,
  },
  headerBlock: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  screenTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  screenSubtitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary + 'AA',
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatarImage: { width: 28, height: 28, resizeMode: 'contain' },
  searchBox: {
    minHeight: theme.touchTarget.minHeight,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.softGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
  },
  filterRow: {
    paddingVertical: theme.spacing.sm,
  },
  filterChip: {
    minHeight: 36,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.softGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  filterChipActive: {
    borderColor: theme.colors.primaryPink,
    backgroundColor: theme.colors.white,
  },
  filterText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.sm,
  },
  filterTextActive: {
    color: '#000000',
    fontWeight: theme.typography.weights.semibold,
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  cardTouch: {
    marginBottom: theme.spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseBannerWrap: {
    marginBottom: theme.spacing.md,
  },
  courseBanner: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrap: {
    marginTop: theme.spacing.md,
  },
  bannerTitle: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  bannerSubtitle: {
    marginTop: 2,
    color: theme.colors.white + 'CC',
    fontSize: theme.typography.sizes.sm,
  },
  courseTitleWrap: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  courseLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  courseName: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  courseCode: {
    color: theme.colors.textPrimary + 'AA',
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
  },
  courseDescription: {
    marginTop: theme.spacing.md,
    color: theme.colors.textPrimary + 'AA',
    lineHeight: theme.typography.lineHeights.md,
    fontSize: theme.typography.sizes.sm,
  },
  metaRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xs,
  },
  registeredPill: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.softGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  registeredText: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
    fontSize: theme.typography.sizes.xs,
  },
});
