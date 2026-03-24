import React, { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  accessibilityLabel,
}) {
  const isDisabled = disabled || loading;
  const isSecondary = variant === 'secondary';
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = value => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const content = (
    <Animated.View style={[styles.scaleWrap, { transform: [{ scale }] }, style]}>
      {isSecondary ? (
        <View style={[styles.buttonBase, styles.secondaryButton, isDisabled && styles.disabled]}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={theme.colors.textPrimary} />
              <Text style={[styles.secondaryText, textStyle]}>Please wait...</Text>
            </View>
          ) : (
            <Text style={[styles.secondaryText, textStyle]}>{title}</Text>
          )}
        </View>
      ) : (
        <LinearGradient
          colors={[theme.colors.primaryPurple, theme.colors.primaryPink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.buttonBase, isDisabled && styles.disabled]}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={theme.colors.white} />
              <Text style={[styles.primaryText, textStyle]}>Please wait...</Text>
            </View>
          ) : (
            <Text style={[styles.primaryText, textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      )}
    </Animated.View>
  );

  return (
    <TouchableWithoutFeedback
      onPressIn={() => animateTo(0.97)}
      onPressOut={() => animateTo(1)}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {content}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scaleWrap: {
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  buttonBase: {
    minHeight: theme.touchTarget.minHeight,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  secondaryButton: {
    backgroundColor: theme.colors.softGray,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.2,
  },
  secondaryText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: theme.spacing.sm,
  },
});
