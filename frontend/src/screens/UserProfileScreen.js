import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import authService from '../services/authService';
import theme from '../theme';
import { AppButton, AppCard } from '../components';

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

export default function UserProfileScreen({ navigation }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  useEffect(() => {
    let mounted = true;
    authService.getProfile().then(profile => {
      if (mounted) setUser(profile);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);
  const age = useMemo(() => getAgeFromDob(user?.dob), [user?.dob]);
  const isStudent = user?.role === 'student';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.profileIconWrap}>
          <Image source={require('../../assets/logo-white.png')} style={styles.profileIcon} />
        </View>
        <Text style={styles.name}>{user?.name || 'Student'}</Text>
        <Text style={styles.email}>{user?.email || '-'}</Text>
      </View>

      <AppCard>
        <View style={styles.row}><Text style={styles.label}>Phone</Text><Text style={styles.value}>{user?.phone || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Address</Text><Text style={styles.value}>{user?.address || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Location</Text><Text style={styles.value}>{user?.location || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Date of Birth</Text><Text style={styles.value}>{user?.dob || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Age</Text><Text style={styles.value}>{age}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Department</Text><Text style={styles.value}>{user?.department || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Roll Number</Text><Text style={styles.value}>{user?.rollNumber || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Study Level</Text><Text style={styles.value}>{user?.studyLevel || '-'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Institution</Text><Text style={styles.value}>{user?.institution || '-'}</Text></View>
      </AppCard>

      {isStudent ? (
        <AppButton title="Edit Profile" onPress={() => navigation.navigate('ProfileEdit')} style={styles.editButton} />
      ) : null}
      <AppButton title="Back" variant="secondary" onPress={() => navigation.goBack()} style={styles.backButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxxl },
  header: { alignItems: 'center', marginBottom: theme.spacing.lg },
  profileIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  profileIcon: { width: 56, height: 56, resizeMode: 'contain' },
  name: { marginTop: theme.spacing.sm, fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary },
  email: { marginTop: theme.spacing.xs, color: theme.colors.textPrimary + 'AA' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  label: { color: theme.colors.textPrimary + 'AA', fontSize: theme.typography.sizes.sm },
  value: { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.semibold, marginLeft: theme.spacing.md, flex: 1, textAlign: 'right' },
  editButton: { marginTop: theme.spacing.md },
  backButton: { marginTop: theme.spacing.md },
});
