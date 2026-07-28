import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';

interface RatingStarsProps {
  rating: number;
  size?: number;
  color?: string;
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onPress?: (rating: number) => void;
  maxRating?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 16,
  color,
  showCount = false,
  count,
  interactive = false,
  onPress,
  maxRating = 5,
}) => {
  const theme = useAppTheme();
  const starColor = color || '#F59E0B';

  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    let starName: string;
    if (rating >= i) {
      starName = 'star';
    } else if (rating >= i - 0.5) {
      starName = 'star-half';
    } else {
      starName = 'star-outline';
    }

    stars.push(
      <Ionicons
        key={i}
        name={starName}
        size={size}
        color={starColor}
        style={interactive ? styles.interactiveStar : undefined}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>{stars}</View>
      {showCount && count !== undefined && (
        <Text style={[styles.count, { color: theme.colors.textMuted }]}>
          ({count.toLocaleString()})
        </Text>
      )}
    </View>
  );
};

export const RatingInput: React.FC<{
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  color?: string;
  maxRating?: number;
}> = ({ value, onChange, size = 24, color, maxRating = 5 }) => {
  const theme = useAppTheme();
  const starColor = color || '#F59E0B';

  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    let starName: string;
    if (value >= i) {
      starName = 'star';
    } else if (value >= i - 0.5) {
      starName = 'star-half';
    } else {
      starName = 'star-outline';
    }

    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => onChange(i)}
        style={styles.starTouch}
        activeOpacity={0.8}
      >
        <Ionicons name={starName} size={size} color={starColor} />
      </TouchableOpacity>
    );
  }

  return <View style={styles.starsRow}>{stars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 1,
  },
  interactiveStar: {
    padding: 4,
  },
  starTouch: {
    padding: 4,
  },
  count: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});