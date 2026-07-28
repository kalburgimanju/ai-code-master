import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  variant?: 'horizontal' | 'grid' | 'list';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  variant = 'horizontal',
}) => {
  const theme = useAppTheme();

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      laptop: MaterialIcons,
      'tshirt-crew': MaterialIcons,
      home: Ionicons,
      dumbbell: MaterialCommunityIcons,
      spray: MaterialIcons,
      'book-open': Ionicons,
      puzzle: MaterialCommunityIcons,
      car: MaterialIcons,
      headphones: Ionicons,
      watch: MaterialIcons,
      camera: Ionicons,
      gamepad: MaterialIcons,
      book: Ionicons,
      briefcase: MaterialIcons,
      bike: MaterialCommunityIcons,
      flower: MaterialIcons,
      gift: MaterialIcons,
      glasses: MaterialIcons,
      hat: MaterialIcons,
      jewelry: MaterialIcons,
      lamp: MaterialIcons,
      luggage: MaterialIcons,
      makeup: MaterialIcons,
      musical: MaterialIcons,
      outdoor: MaterialIcons,
      party: MaterialIcons,
      pet: MaterialIcons,
      phone: MaterialIcons,
      shoe: MaterialIcons,
      toy: MaterialIcons,
      travel: MaterialIcons,
      wallet: MaterialIcons,
      wine: MaterialIcons,
    };

    const IconComponent = iconMap[iconName] || Ionicons;
    return IconComponent;
  };

  const IconComponent = getIconComponent(category.icon || 'category');

  if (variant === 'grid') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.gridCard, { backgroundColor: theme.colors.card }]}
        activeOpacity={0.8}
      >
        <View style={styles.gridImageContainer}>
          {category.image ? (
            <Image source={{ uri: category.image }} style={styles.gridImage} resizeMode="cover" />
          ) : (
            <View style={[styles.gridIconContainer, { backgroundColor: theme.colors.primaryLight }]}>
              <IconComponent name={category.icon || 'category'} size={32} color={theme.colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.gridContent}>
          <Text style={[styles.gridName, { color: theme.colors.text }]}>
            {category.name}
          </Text>
          <Text style={[styles.gridCount, { color: theme.colors.textMuted }]}>
            {category.productCount.toLocaleString()} products
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'list') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.listCard, { backgroundColor: theme.colors.card }]}
        activeOpacity={0.8}
      >
        <View style={styles.listIconContainer}>
          {category.image ? (
            <Image source={{ uri: category.image }} style={styles.listImage} resizeMode="cover" />
          ) : (
            <View style={[styles.listIconBg, { backgroundColor: theme.colors.primaryLight }]}>
              <IconComponent name={category.icon || 'category'} size={24} color={theme.colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.listContent}>
          <Text style={[styles.listName, { color: theme.colors.text }]}>
            {category.name}
          </Text>
          <Text style={[styles.listCount, { color: theme.colors.textMuted }]}>
            {category.productCount.toLocaleString()} products
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
      </TouchableOpacity>
    );
  }

  // Horizontal variant (default)
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.horizontalCard, { backgroundColor: theme.colors.card }]}
      activeOpacity={0.8}
    >
      <View style={styles.horizontalImageContainer}>
        {category.image ? (
          <Image source={{ uri: category.image }} style={styles.horizontalImage} resizeMode="cover" />
        ) : (
          <View style={[styles.horizontalIconContainer, { backgroundColor: theme.colors.primaryLight }]}>
            <IconComponent name={category.icon || 'category'} size={28} color={theme.colors.primary} />
          </View>
        )}
      </View>
      <View style={styles.horizontalContent}>
        <Text style={[styles.horizontalName, { color: theme.colors.text }]}>
          {category.name}
        </Text>
        <Text style={[styles.horizontalCount, { color: theme.colors.textMuted }]}>
          {category.productCount.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Horizontal (default)
  horizontalCard: {
    width: 90,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  horizontalImageContainer: {
    width: 90,
    height: 90,
    position: 'relative',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
  },
  horizontalIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalContent: {
    padding: 8,
    alignItems: 'center',
  },
  horizontalName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  horizontalCount: {
    fontSize: 10,
    fontWeight: '500',
  },

  // Grid
  gridCard: {
    width: 160,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  gridImageContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    padding: 12,
    alignItems: 'center',
  },
  gridName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  gridCount: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },

  // List
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  listIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listIconBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  listCount: {
    fontSize: 12,
    fontWeight: '500',
  },
});