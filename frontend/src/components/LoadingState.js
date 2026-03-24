import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import theme from '../theme';

export default function LoadingState({ label = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primaryPurple} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  label: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textPrimary + 'AA',
    fontSize: theme.typography.sizes.sm,
  },
});
