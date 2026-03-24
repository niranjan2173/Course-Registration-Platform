import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../theme';

const configByType = {
  success: { icon: 'checkmark-circle' },
  error: { icon: 'alert-circle' },
};

export default function StatusBanner({ type = 'success', message, style }) {
  if (!message) {
    return null;
  }

  const config = configByType[type] || configByType.success;

  return (
    <View style={[styles.container, style]}>
      <Ionicons name={config.icon} size={18} color={theme.colors.textPrimary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    columnGap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.softGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  message: {
    fontSize: theme.typography.sizes.sm,
    flex: 1,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
});
