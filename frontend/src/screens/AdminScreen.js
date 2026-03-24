import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import registrationService from '../services/registrationService';
import userService from '../services/userService';
import { formatDate, formatLongDate } from '../utils/dateUtils';
import { getErrorMessage } from '../utils/errorUtils';
import theme from '../theme';
import { AppButton, AppCard, EmptyState, LoadingState, StatusBanner, useToast } from '../components';

const sortRegistrations = (items, sortBy) => {
  const sorted = [...items];
  if (sortBy === 'name') sorted.sort((a, b) => a.studentName.localeCompare(b.studentName));
  else if (sortBy === 'course') sorted.sort((a, b) => a.courseName.localeCompare(b.courseName));
  else sorted.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
  return sorted;
};

const getAgeFromDob = dob => {
  if (!dob) return '-';
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) return '-';
  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const hasHadBirthday =
    today.getMonth() > parsed.getMonth() ||
    (today.getMonth() === parsed.getMonth() && today.getDate() >= parsed.getDate());
  if (!hasHadBirthday) age -= 1;
  return age;
};

export default function AdminScreen({ navigation }) {
  const { showToast } = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const sortedRegistrations = useMemo(() => sortRegistrations(registrations, sortBy), [registrations, sortBy]);

  const summary = useMemo(() => {
    const userSet = new Set(registrations.map(item => item.studentId || item.studentName));
    const totalRevenue = registrations.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0);
    return {
      totalUsers: userSet.size,
      totalRegistrations: registrations.length,
      totalRevenue,
    };
  }, [registrations]);

  const loadData = useCallback(async () => {
    try {
      const allRegs = await registrationService.getAllRegistrations();
      setRegistrations(allRegs);
      setError('');
    } catch (loadError) {
      const message = getErrorMessage(loadError);
      setError(message);
      showToast(message, 'error');
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

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

  const handleEditStudent = () => {
    if (!selectedRegistration) return;
    setModalVisible(false);
    navigation.navigate('AdminStudentEdit', { student: selectedRegistration });
  };

  const handleRemoveStudent = async () => {
    if (!selectedRegistration) return;
    try {
      await userService.deleteUserByAdmin(selectedRegistration.studentId);
      showToast('Student removed', 'success');
      setModalVisible(false);
      loadData();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const renderSummaryCard = (label, value, icon) => (
    <LinearGradient
      key={label}
      colors={[theme.colors.primaryPurple, theme.colors.primaryPink]}
      style={styles.summaryGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.summaryInner}>
        <Ionicons name={icon} size={20} color={'#000000'} />
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </LinearGradient>
  );


  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.touchWrap}
      onPress={() => {
        setSelectedRegistration(item);
        setModalVisible(true);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Open registration details for ${item.studentName}`}
    >
      <AppCard>
        <View style={styles.rowCenter}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{item.studentName?.charAt(0)?.toUpperCase() || 'S'}</Text></View>
          <View style={styles.flexOne}>
            <Text style={styles.studentName}>{item.studentName}</Text>
            <Text style={styles.courseName}>{item.courseName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
        </View>

        <View style={styles.chipRow}>
          <View style={styles.infoChip}><Text style={styles.infoChipText}>{formatDate(item.registrationDate)}</Text></View>
          <View style={styles.infoChip}><Text style={styles.infoChipText}>Rs. {item.amountPaid}</Text></View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );


  if (initialLoading) return <LoadingState label="Loading admin dashboard..." />;

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
      <FlatList
        data={sortedRegistrations}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<EmptyState icon="document-text-outline" title="No registrations yet" />}
        ListHeaderComponent={(
          <View>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
              <Text style={styles.headerSubtitle}>Monitor registrations in one place</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryRow}>
              {renderSummaryCard('Total Users', summary.totalUsers, 'people-outline')}
              {renderSummaryCard('Total Enrollments', summary.totalRegistrations, 'school-outline')}
              {renderSummaryCard('Total Revenue', `Rs. ${summary.totalRevenue}`, 'cash-outline')}
            </ScrollView>

            <Text style={styles.sectionHeader}>Registrations</Text>
            <View style={styles.sortContainer}>
              {[
                { key: 'date', label: 'Date' },
                { key: 'name', label: 'Student' },
                { key: 'course', label: 'Course' },
              ].map(option => (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.sortBtn, sortBy === option.key && styles.sortBtnActive]}
                  onPress={() => {
                    setSortBy(option.key);
                    showToast(`Sorted by ${option.label}`, 'info');
                  }}
                >
                  <Text style={[styles.sortBtnText, sortBy === option.key && styles.sortBtnTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.dragHandle} />
            <ScrollView>
              {selectedRegistration ? (
                <>
                  <Text style={styles.modalTitle}>Registration Details</Text>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Name</Text><Text style={styles.detailValue}>{selectedRegistration.studentName}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Email</Text><Text style={styles.detailValue}>{selectedRegistration.studentEmail || '-'}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Phone</Text><Text style={styles.detailValue}>{selectedRegistration.studentPhone || '-'}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Address</Text><Text style={styles.detailValue}>{selectedRegistration.studentAddress || '-'}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Date of Birth</Text><Text style={styles.detailValue}>{selectedRegistration.studentDob || '-'}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Age</Text><Text style={styles.detailValue}>{getAgeFromDob(selectedRegistration.studentDob)}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Department</Text><Text style={styles.detailValue}>{selectedRegistration.studentDepartment || '-'}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Roll Number</Text><Text style={styles.detailValue}>{selectedRegistration.studentRollNumber || '-'}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Study Level</Text><Text style={styles.detailValue}>{selectedRegistration.studentStudyLevel || '-'}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Institution</Text><Text style={styles.detailValue}>{selectedRegistration.studentInstitution || '-'}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Location</Text><Text style={styles.detailValue}>{selectedRegistration.studentLocation || '-'}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Course</Text><Text style={styles.detailValue}>{selectedRegistration.courseName}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Date</Text><Text style={styles.detailValue}>{formatLongDate(selectedRegistration.registrationDate)}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Amount</Text><Text style={styles.detailValue}>Rs. {selectedRegistration.amountPaid}</Text></View>
                  <View style={styles.detailRow}><Text style={styles.detailLabel}>Progress</Text><Text style={styles.detailValue}>{selectedRegistration.progress}%</Text></View>
                </>
              ) : null}
            </ScrollView>
            {selectedRegistration ? (
              <View style={styles.modalActions}>
                <AppButton title="Edit Student" onPress={handleEditStudent} />
                <AppButton title="Remove Student" variant="secondary" onPress={handleRemoveStudent} />
                <AppButton title="Close" variant="secondary" onPress={() => setModalVisible(false)} />
              </View>
            ) : (
              <AppButton title="Close" variant="secondary" onPress={() => setModalVisible(false)} />
            )}
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
  header: { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm },
  headerTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, letterSpacing: 0.3 },
  headerSubtitle: { marginTop: theme.spacing.xs, color: theme.colors.textPrimary + 'AA' },
  summaryRow: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm, columnGap: theme.spacing.sm },
  summaryGradient: { borderRadius: theme.radius.lg, padding: 2, minWidth: 175 },
  summaryInner: {
    borderRadius: theme.radius.lg - 2,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
  },
  summaryLabel: { marginTop: theme.spacing.xs, color: '#000000', fontSize: theme.typography.sizes.xs, letterSpacing: 0.3 },
  summaryValue: { marginTop: theme.spacing.xs, color: '#000000', fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold },
  sectionHeader: { color: theme.colors.textPrimary, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.md },
  sortContainer: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.sm },
  sortBtn: {
    minHeight: theme.touchTarget.minHeight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
  },
  sortBtnActive: { borderColor: theme.colors.primaryPink, backgroundColor: theme.colors.white },
  sortBtnText: { color: theme.colors.textPrimary + 'AA', fontSize: theme.typography.sizes.sm },
  sortBtnTextActive: { color: '#000000', fontWeight: theme.typography.weights.semibold },
  listContainer: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl },
  touchWrap: { marginBottom: theme.spacing.md },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  avatarText: { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.bold },
  flexOne: { flex: 1, marginHorizontal: theme.spacing.sm },
  studentName: { color: theme.colors.textPrimary, fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.semibold },
  courseName: { marginTop: theme.spacing.xs, color: theme.colors.textPrimary + 'AA', fontSize: theme.typography.sizes.sm },
  chipRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: theme.spacing.sm,
    rowGap: theme.spacing.sm,
  },
  infoChip: {
    minWidth: 110,
    minHeight: 34,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  infoChipText: { color: theme.colors.textPrimary, fontSize: theme.typography.sizes.xs, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: theme.colors.white, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl, padding: theme.spacing.lg, maxHeight: '88%' },
  dragHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  modalTitle: { color: '#000000', fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, marginBottom: theme.spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  detailLabel: { color: '#000000', fontSize: theme.typography.sizes.sm },
  detailValue: { color: '#000000', fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold, marginLeft: theme.spacing.md, flex: 1, textAlign: 'right' },
  modalActions: { marginTop: theme.spacing.md, rowGap: theme.spacing.sm },
});
