import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../theme';
import AppButton from './AppButton';

export default function EmptyState({
  icon = 'folder-open-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={40} color={theme.colors.textPrimary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <AppButton title={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xxxl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.softGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.bold,
    fontSize: theme.typography.sizes.lg,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary + 'AA',
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.lg,
    minWidth: 160,
  },
});
