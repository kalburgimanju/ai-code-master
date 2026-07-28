import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showInput?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'outlined';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  showInput = true,
  disabled = false,
  variant = 'default',
}) => {
  const theme = useAppTheme();

  const increment = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  const handleInputChange = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(num);
    }
  };

  const handleBlur = (text: string) => {
    const num = parseInt(text, 10);
    if (isNaN(num) || num < min) {
      onChange(min);
    } else if (num > max) {
      onChange(max);
    }
  };

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity
          onPress={decrement}
          disabled={disabled || value <= min}
          style={[
            styles.compactButton,
            (disabled || value <= min) && styles.compactButtonDisabled,
          ]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="remove" size={20} color={disabled || value <= min ? theme.colors.textMuted : theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[
          styles.compactValue,
          { color: theme.colors.text },
        ]}>
          {value}
        </Text>
        <TouchableOpacity
          onPress={increment}
          disabled={disabled || value >= max}
          style={[
            styles.compactButton,
            (disabled || value >= max) && styles.compactButtonDisabled,
          ]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={20} color={disabled || value >= max ? theme.colors.textMuted : theme.colors.primary} />
        </TouchableOpacity>
      </View>
    );
  }

  if (variant === 'outlined') {
    return (
      <View style={[
        styles.outlinedContainer,
        { borderColor: theme.colors.border },
      ]}>
        <TouchableOpacity
          onPress={decrement}
          disabled={disabled || value <= min}
          style={[
            styles.outlinedButton,
            (disabled || value <= min) && styles.outlinedButtonDisabled,
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="remove" size={22} color={disabled || value <= min ? theme.colors.textMuted : theme.colors.text} />
        </TouchableOpacity>
        <Text style={[
          styles.outlinedValue,
          { color: theme.colors.text },
        ]}>
          {value}
        </Text>
        <TouchableOpacity
          onPress={increment}
          disabled={disabled || value >= max}
          style={[
            styles.outlinedButton,
            (disabled || value >= max) && styles.outlinedButtonDisabled,
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={disabled || value >= max ? theme.colors.textMuted : theme.colors.text} />
        </TouchableOpacity>
      </View>
    );
  }

  // Default variant
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={decrement}
        disabled={disabled || value <= min}
        style={[
          styles.button,
          (disabled || value <= min) && styles.buttonDisabled,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
        activeOpacity={0.8}
      >
        <Ionicons name="remove" size={20} color={disabled || value <= min ? theme.colors.textMuted : theme.colors.text} />
      </TouchableOpacity>

      {showInput && (
        <TextInput
          value={value.toString()}
          onChangeText={handleInputChange}
          onBlur={e => handleBlur(e.nativeEvent.text)}
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          editable={!disabled}
          keyboardType="numeric"
          maxLength={3}
          textAlign="center"
        />
      )}

      {!showInput && (
        <Text style={[
          styles.value,
          { color: theme.colors.text },
        ]}>
          {value}
        </Text>
      )}

      <TouchableOpacity
        onPress={increment}
        disabled={disabled || value >= max}
        style={[
          styles.button,
          (disabled || value >= max) && styles.buttonDisabled,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color={disabled || value >= max ? theme.colors.textMuted : theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  input: {
    width: 50,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactButtonDisabled: {
    opacity: 0.5,
  },
  compactValue: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },

  // Outlined variant
  outlinedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  outlinedButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlinedButtonDisabled: {
    opacity: 0.5,
  },
  outlinedValue: {
    width: 50,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});