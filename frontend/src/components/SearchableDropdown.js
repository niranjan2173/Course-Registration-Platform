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
import theme from '../theme';
import AppInput from './AppInput';

export default function SearchableDropdown({
  label,
  value,
  options,
  placeholder = 'Select',
  onChange,
  error,
}) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!query.trim()) {
      return options;
    }

    const normalizedQuery = query.trim().toLowerCase();
    return options.filter(option => option.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        style={[styles.trigger, error && styles.errorBorder]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down-outline" size={20} color={theme.colors.white} />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select option'}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} accessibilityRole="button">
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            <AppInput
              label="Search"
              value={query}
              onChangeText={setQuery}
              placeholder="Type to search"
              leftIcon="search-outline"
              autoCapitalize="none"
            />

            <ScrollView keyboardShouldPersistTaps="handled" style={styles.list}>
              {filteredOptions.map(option => {
                const isSelected = option === value;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                    onPress={() => {
                      onChange(option);
                      setVisible(false);
                      setQuery('');
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${option}`}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
                    {isSelected ? (
                      <Ionicons name="checkmark-circle" size={18} color={theme.colors.primaryPink} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
              {filteredOptions.length === 0 ? (
                <Text style={styles.emptyText}>No matching departments</Text>
              ) : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  trigger: {
    minHeight: theme.touchTarget.minHeight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.softGray,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBorder: {
    borderColor: theme.colors.primaryPink,
  },
  triggerText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.md,
  },
  placeholder: {
    color: theme.colors.white,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.primaryPink,
    fontSize: theme.typography.sizes.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    color: '#000000',
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  list: {
    marginTop: theme.spacing.sm,
  },
  optionRow: {
    minHeight: theme.touchTarget.minHeight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  optionRowSelected: {
    borderColor: theme.colors.primaryPink,
    backgroundColor: theme.colors.softGray,
  },
  optionText: {
    color: '#000000',
    fontSize: theme.typography.sizes.sm,
  },
  optionTextSelected: {
    fontWeight: theme.typography.weights.semibold,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: theme.spacing.md,
    color: '#000000',
  },
});
