import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  onSubmit?: (text: string) => void;
  showFilter?: boolean;
  onFilterPress?: () => void;
  filterCount?: number;
  editable?: boolean;
  autoFocus?: boolean;
  placeholderTextColor?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onPress,
  onSubmit,
  showFilter = false,
  onFilterPress,
  filterCount = 0,
  editable = false,
  autoFocus = false,
  placeholderTextColor,
}) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
      activeOpacity={0.9}
    >
      <Ionicons
        name="search"
        size={22}
        color={theme.colors.textMuted}
        style={styles.icon}
      />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit ? () => onSubmit(value || '') : undefined}
        editable={editable}
        autoFocus={autoFocus}
        placeholderTextColor={placeholderTextColor || theme.colors.textMuted}
        style={styles.input}
        pointerEvents={editable ? 'auto' : 'none'}
      />
      {showFilter && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={[
            styles.filterButton,
            filterCount > 0 && styles.filterButtonActive,
            { backgroundColor: filterCount > 0 ? theme.colors.primaryLight : 'transparent' },
          ]}
          activeOpacity={0.8}
        >
          <MaterialIcons name="tune" size={22} color={filterCount > 0 ? theme.colors.primary : theme.colors.textMuted} />
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  icon: {
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 0,
  },
  filterButton: {
    padding: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    // Additional active styles
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});