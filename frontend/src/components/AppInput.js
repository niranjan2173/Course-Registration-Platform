import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import theme from '../theme';

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  error,
  leftIcon,
  accessibilityLabel,
  returnKeyType,
  onSubmitEditing,
  editable = true,
  onPress,
  inputProps,
}) {
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const Container = onPress ? TouchableOpacity : View;
  const safeValue = value ?? '';

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Container
        style={[styles.inputContainer, error && styles.errorBorder]}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        accessibilityRole={onPress ? 'button' : undefined}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={theme.colors.textPrimary} style={styles.leftIcon} />
        ) : null}
        <TextInput
          style={styles.input}
          value={safeValue}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textPrimary + '88'}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry ? !isSecureVisible : false}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={accessibilityLabel || label || placeholder}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={onPress ? false : editable}
          onPressIn={onPress}
          {...(inputProps || {})}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsSecureVisible(prev => !prev)}
            accessibilityRole="button"
            accessibilityLabel={isSecureVisible ? 'Hide password' : 'Show password'}
            style={styles.eyeButton}
          >
            <Ionicons
              name={isSecureVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        ) : null}
      </Container>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.weights.semibold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.touchTarget.minHeight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
  },
  errorBorder: {
    borderColor: theme.colors.primaryPink,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    paddingVertical: theme.spacing.sm,
  },
  eyeButton: {
    padding: theme.spacing.xs,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.primaryPink,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
  },
});
