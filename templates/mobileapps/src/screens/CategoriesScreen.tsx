import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CategoryCard } from '../components/CategoryCard';
import { Category } from '../types';

type CategoriesNavigationProp = StackNavigationProp<any, 'Categories'>;
type CategoriesRouteProp = RouteProp<any, 'Categories'>;

export const CategoriesScreen = () => {
  const navigation = useNavigation<CategoriesNavigationProp>();
  const route = useRoute<CategoriesRouteProp>();
  const theme = useAppTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedCategoryId = route.params?.categoryId;

  const fetchCategories = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories([
        { id: '1', name: 'Electronics', icon: 'laptop', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200', productCount: 1240 },
        { id: '2', name: 'Fashion', icon: 'tshirt-crew', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200', productCount: 3420 },
        { id: '3', name: 'Home & Garden', icon: 'home', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200', productCount: 1890 },
        { id: '4', name: 'Sports', icon: 'dumbbell', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200', productCount: 980 },
        { id: '5', name: 'Beauty', icon: 'spray', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200', productCount: 2100 },
        { id: '6', name: 'Books', icon: 'book-open', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200', productCount: 5600 },
        { id: '7', name: 'Toys', icon: 'puzzle', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=200', productCount: 1200 },
        { id: '8', name: 'Automotive', icon: 'car', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200', productCount: 890 },
      ]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('Products', { categoryId: category.id, section: category.name });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={() => handleCategoryPress(category)}
              variant="grid"
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
