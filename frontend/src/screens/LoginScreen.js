import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import authService from '../services/authService';
import { getErrorMessage } from '../utils/errorUtils';
import theme from '../theme';
import { AppButton, AppCard, AppInput, StatusBanner, useToast } from '../components';

export default function LoginScreen({ navigation }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password]);

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    setBanner({ type: '', message: '' });

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const user = await authService.login(email.trim(), password);
      showToast('Logged in successfully', 'success');
      if (user?.role === 'student' && !user?.profileCompleted) {
        navigation.replace('ProfileEdit', { onboarding: true });
      } else {
        navigation.replace('Main');
      }
    } catch (error) {
      const message = getErrorMessage(error);
      setBanner({ type: 'error', message });
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerWrap}>
            <View style={styles.logoCircle}>
              <Image source={require('../../assets/logo-white.png')} style={styles.logoImage} />
            </View>
            <Text style={styles.title}>Course Registration</Text>
            <Text style={styles.subtitle}>A clean way to manage your learning journey</Text>
          </View>

          <AppCard style={styles.formCard}>
            <StatusBanner type={banner.type} message={banner.message} />

            <AppInput
              label="Email"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              placeholder="student@college.edu"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />

            <AppInput
              label="Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: '' }));
                }
              }}
              placeholder="Enter password"
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
              onSubmitEditing={handleLogin}
            />

            <AppButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
              disabled={!canSubmit}
              style={styles.loginButton}
            />

            <View style={styles.linkRow}>
              <Text style={styles.linkLabel}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} accessibilityRole="button">
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </AppCard>

          <View style={styles.demoWrap}>
            <Text style={styles.demoTitle}>Demo Accounts</Text>
            <Text style={styles.demoText}>Student: student@college.edu / student123</Text>
            <Text style={styles.demoText}>Admin: admin@college.edu / admin123</Text>
          </View>
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
  headerWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoImage: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textPrimary + 'AA',
    textAlign: 'center',
    fontSize: theme.typography.sizes.sm,
  },
  formCard: {
    borderRadius: theme.radius.xl,
  },
  loginButton: {
    marginTop: theme.spacing.sm,
  },
  linkRow: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  linkLabel: {
    color: theme.colors.textPrimary + 'AA',
    fontSize: theme.typography.sizes.sm,
  },
  linkText: {
    color: theme.colors.primaryPink,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.sm,
  },
  demoWrap: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.softGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  demoTitle: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  demoText: {
    color: theme.colors.textPrimary + 'AA',
    textAlign: 'center',
    fontSize: theme.typography.sizes.xs,
    marginTop: theme.spacing.xs,
  },
});
