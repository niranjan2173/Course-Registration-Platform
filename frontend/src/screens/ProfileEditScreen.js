import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import authService from '../services/authService';
import { getErrorMessage } from '../utils/errorUtils';
import theme from '../theme';
import {
  AppButton,
  AppCard,
  AppInput,
  SearchableDropdown,
  StatusBanner,
  useToast,
} from '../components';

const departments = [
  'Computer Science',
  'Information Technology',
  'AIDS',
  'ECE',
  'EEE',
  'Mechanical',
  'Civil',
  'MBA',
];
const studyLevels = ['College', '12th', '11th', 'Diploma', 'Other'];

const formatDateInput = date => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateInput = value => {
  if (!value) return new Date();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default function ProfileEditScreen({ navigation, route }) {
  const { showToast } = useToast();
  const onboarding = Boolean(route?.params?.onboarding);
  const user = authService.getCurrentUser();

  const [form, setForm] = useState({
    name: user?.name || '',
    department: user?.department || '',
    phone: user?.phone || '',
    address: user?.address || '',
    location: user?.location || '',
    studyLevel: user?.studyLevel || '',
    institution: user?.institution || '',
    dob: user?.dob || '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState({ type: '', message: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const canSubmit = useMemo(
    () =>
      form.name.trim() &&
      form.department.trim() &&
      form.phone.trim() &&
      form.address.trim() &&
      form.location.trim() &&
      form.studyLevel.trim() &&
      form.institution.trim() &&
      form.dob.trim(),
    [form]
  );

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Full name is required';
    }
    if (!form.department.trim()) {
      nextErrors.department = 'Department is required';
    }
    if (!form.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(form.phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number';
    }
    if (!form.address.trim()) {
      nextErrors.address = 'Address is required';
    }
    if (!form.location.trim()) {
      nextErrors.location = 'Location is required';
    }
    if (!form.studyLevel.trim()) {
      nextErrors.studyLevel = 'Studying detail is required';
    }
    if (!form.institution.trim()) {
      nextErrors.institution = 'College or school name is required';
    }
    if (!form.dob.trim()) {
      nextErrors.dob = 'Date of birth is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob.trim())) {
      nextErrors.dob = 'Use YYYY-MM-DD format';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    setBanner({ type: '', message: '' });

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      await authService.updateProfile({
        name: form.name.trim(),
        department: form.department,
        phone: form.phone.trim(),
        address: form.address.trim(),
        location: form.location.trim(),
        studyLevel: form.studyLevel,
        institution: form.institution.trim(),
        dob: form.dob.trim(),
      });
      showToast('Profile updated', 'success');
      if (onboarding) {
        navigation.replace('Main');
      } else {
        navigation.goBack();
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setBanner({ type: 'error', message });
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (_event, selectedDate) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setField('dob', formatDateInput(selectedDate));
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {!onboarding ? (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color="#000000" />
            </TouchableOpacity>
          ) : null}

          <View style={styles.headerWrap}>
            <LinearGradient
              colors={[theme.colors.primaryPurple, theme.colors.primaryPink]}
              style={styles.logoCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={34} color={theme.colors.white} />
            </LinearGradient>
            <Text style={styles.title}>Student Profile</Text>
            <Text style={styles.subtitle}>Please complete your profile</Text>
          </View>

          <AppCard>
            <StatusBanner type={banner.type} message={banner.message} />

            <AppInput
              label="Full Name"
              value={form.name}
              onChangeText={text => setField('name', text)}
              placeholder="Your full name"
              autoCapitalize="words"
              leftIcon="person-outline"
              error={errors.name}
            />

            <SearchableDropdown
              label="Department"
              value={form.department}
              options={departments}
              placeholder="Select Department"
              onChange={value => setField('department', value)}
              error={errors.department}
            />

            <AppInput
              label="Phone Number"
              value={form.phone}
              onChangeText={text => setField('phone', text)}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              leftIcon="call-outline"
              error={errors.phone}
            />

            <AppInput
              label="Address"
              value={form.address}
              onChangeText={text => setField('address', text)}
              placeholder="House, Street, City"
              leftIcon="location-outline"
              error={errors.address}
            />

            <AppInput
              label="Location"
              value={form.location}
              onChangeText={text => setField('location', text)}
              placeholder="City, State"
              leftIcon="navigate-outline"
              error={errors.location}
            />

            <SearchableDropdown
              label="Studying Detail"
              value={form.studyLevel}
              options={studyLevels}
              placeholder="Select Studying Detail"
              onChange={value => setField('studyLevel', value)}
              error={errors.studyLevel}
            />

            <AppInput
              label="College / School Name"
              value={form.institution}
              onChangeText={text => setField('institution', text)}
              placeholder="Your college or school"
              leftIcon="school-outline"
              error={errors.institution}
            />

            <AppInput
              label="Date of Birth"
              value={form.dob}
              placeholder="YYYY-MM-DD"
              leftIcon="calendar-outline"
              onPress={() => setShowDatePicker(true)}
              error={errors.dob}
            />
            {showDatePicker && Platform.OS !== 'web' ? (
              <Modal transparent animationType="fade" visible={showDatePicker}>
                <View style={styles.dateOverlay}>
                  <View style={styles.dateSheet}>
                    <DateTimePicker
                      value={parseDateInput(form.dob)}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      style={styles.datePicker}
                    />
                    {Platform.OS === 'ios' ? (
                      <AppButton
                        title="Done"
                        variant="secondary"
                        onPress={() => setShowDatePicker(false)}
                        style={styles.doneButton}
                      />
                    ) : null}
                  </View>
                </View>
              </Modal>
            ) : null}
            {showDatePicker && Platform.OS === 'web' ? (
              <Modal transparent animationType="fade" visible={showDatePicker}>
                <View style={styles.dateOverlay}>
                  <View style={styles.dateSheet}>
                    <AppInput
                      label="Select Date"
                      value={form.dob}
                      onChangeText={text => {
                        setField('dob', text);
                        setShowDatePicker(false);
                      }}
                      inputProps={{ type: 'date' }}
                    />
                    <AppButton
                      title="Close"
                      variant="secondary"
                      onPress={() => setShowDatePicker(false)}
                      style={styles.doneButton}
                    />
                  </View>
                </View>
              </Modal>
            ) : null}

            <AppButton
              title={onboarding ? 'Save & Continue' : 'Save Changes'}
              onPress={handleSave}
              loading={loading}
              disabled={!canSubmit}
              style={styles.submitButton}
            />
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  backButton: {
    minHeight: theme.touchTarget.minHeight,
    width: theme.touchTarget.minHeight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textPrimary + 'AA',
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: theme.spacing.sm,
  },
  doneButton: {
    marginBottom: theme.spacing.sm,
  },
  dateOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  dateSheet: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  datePicker: {
    alignSelf: 'stretch',
  },
});
