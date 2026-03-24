import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const ToastContext = createContext({
  showToast: () => {},
});

const iconByType = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, type: 'info', message: '' });
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timeoutRef = useRef(null);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 20, duration: 140, useNativeDriver: true }),
    ]).start(() => setToast(prev => ({ ...prev, visible: false })));
  };

  const showToast = (message, type = 'info') => {
    if (!message) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ visible: true, type, message });

    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 170, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 170, useNativeDriver: true }),
    ]).start();

    timeoutRef.current = setTimeout(hideToast, 2500);
  };

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast.visible ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toast,
            { opacity, transform: [{ translateY }] },
          ]}
          accessibilityLiveRegion="polite"
        >
          <Ionicons name={iconByType[toast.type] || iconByType.info} size={18} color={theme.colors.background} />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: theme.spacing.xxxl,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    minHeight: theme.touchTarget.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    columnGap: theme.spacing.sm,
    backgroundColor: theme.colors.textPrimary,
    elevation: 6,
  },
  toastText: {
    color: theme.colors.background,
    fontSize: theme.typography.sizes.sm,
    flex: 1,
    fontWeight: theme.typography.weights.medium,
  },
});
