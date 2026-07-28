import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../providers/Providers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { SectionHeader } from '../components/SectionHeader';
import { SearchBar } from '../components/SearchBar';
import { Product, Category } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProductsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Products'>;
type ProductsScreenRouteProp = RouteProp<RootStackParamList, 'Products'>;

export const ProductsScreen = () => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const route = useRoute<ProductsScreenRouteProp>();
  const theme = useAppTheme();
  const { isDarkMode } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const section = route.params?.section;
  const categoryId = route.params?.categoryId;

  const fetchProducts = useCallback(async (pageNum = 1, reset = false) => {
    if (reset) setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockProducts: Product[] = [
        { id: '1', name: 'iPhone 15 Pro Max', price: 1199, originalPrice: 1299, discount: 8, rating: 4.8, reviewCount: 2341, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', category: 'Electronics', isFlashSale: true, flashSaleEndTime: Date.now() + 86400000, inStock: true, seller: { id: '1', name: 'Apple Store', rating: 4.9 } },
        { id: '2', name: 'MacBook Air M2', price: 1099, originalPrice: 1199, discount: 8, rating: 4.9, reviewCount: 1876, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', category: 'Electronics', isFlashSale: true, flashSaleEndTime: Date.now() + 86400000, inStock: true, seller: { id: '1', name: 'Apple Store', rating: 4.9 } },
        { id: '3', name: 'Sony WH-1000XM5', price: 349, originalPrice: 399, discount: 13, rating: 4.7, reviewCount: 3421, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', category: 'Electronics', isFlashSale: false, inStock: true, seller: { id: '2', name: 'Sony Official', rating: 4.8 } },
        { id: '4', name: 'Nike Air Max 270', price: 129, originalPrice: 150, discount: 14, rating: 4.6, reviewCount: 5672, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: 'Fashion', isFlashSale: false, inStock: true, seller: { id: '3', name: 'Nike Store', rating: 4.7 } },
        { id: '5', name: 'Samsung 65" 4K TV', price: 799, originalPrice: 999, discount: 20, rating: 4.5, reviewCount: 1234, image: 'https://images.unsplash.com/photo-1593784991089-a27c6f9c6b7a?w=400', category: 'Electronics', isFlashSale: true, flashSaleEndTime: Date.now() + 43200000, inStock: true, seller: { id: '4', name: 'Samsung Official', rating: 4.6 } },
        { id: '6', name: 'Dyson V15 Vacuum', price: 599, originalPrice: 749, discount: 20, rating: 4.8, reviewCount: 892, image: 'https://images.unsplash.com/photo-1558316327-748488487b21?w=400', category: 'Home & Garden', isFlashSale: false, inStock: true, seller: { id: '5', name: 'Dyson Official', rating: 4.8 } },
        { id: '7', name: 'Adidas Ultraboost 22', price: 180, originalPrice: 180, discount: 0, rating: 4.7, reviewCount: 3421, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', category: 'Fashion', isFlashSale: false, inStock: true, seller: { id: '3', name: 'Adidas Store', rating: 4.7 } },
        { id: '8', name: 'Instant Pot Duo', price: 89, originalPrice: 119, discount: 25, rating: 4.8, reviewCount: 12450, image: 'https://images.unsplash.com/photo-1584990347976-139f2a7d1f99?w=400', category: 'Home & Garden', isFlashSale: false, inStock: true, seller: { id: '6', name: 'Instant Brands', rating: 4.7 } },
        { id: '9', name: 'iPad Pro 12.9"', price: 1099, originalPrice: 1199, discount: 8, rating: 4.9, reviewCount: 1234, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', category: 'Electronics', isFlashSale: false, inStock: true, seller: { id: '1', name: 'Apple Store', rating: 4.9 } },
        { id: '10', name: 'Samsung Galaxy S24 Ultra', price: 1299, originalPrice: 1399, discount: 7, rating: 4.8, reviewCount: 987, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', category: 'Electronics', isFlashSale: true, flashSaleEndTime: Date.now() + 86400000, inStock: true, seller: { id: '4', name: 'Samsung Official', rating: 4.6 } },
      ];

      if (reset) {
        setProducts(mockProducts);
      } else {
        setProducts(prev => [...prev, ...mockProducts]);
      }
      setHasMore(pageNum < 3);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories([
        { id: '1', name: 'All', icon: 'grid', image: '', productCount: 15000 },
        { id: '2', name: 'Electronics', icon: 'laptop', image: '', productCount: 1240 },
        { id: '3', name: 'Fashion', icon: 'tshirt-crew', image: '', productCount: 3420 },
        { id: '4', name: 'Home & Garden', icon: 'home', image: '', productCount: 1890 },
        { id: '5', name: 'Sports', icon: 'dumbbell', image: '', productCount: 980 },
        { id: '6', name: 'Beauty', icon: 'spray', image: '', productCount: 2100 },
        { id: '7', name: 'Books', icon: 'book-open', image: '', productCount: 5600 },
      ]);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts(1, true);
    fetchCategories();
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
  }, [fetchProducts, fetchCategories, categoryId]);

  const onRefresh = () => {
    fetchProducts(1, true);
    setPage(1);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, false);
    }
  };

  const handleCategoryPress = (catId: string) => {
    setSelectedCategory(catId === 'all' ? null : catId);
    setPage(1);
    fetchProducts(1, true);
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleSortPress = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setPage(1);
    fetchProducts(1, true);
  };

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === categories.find(c => c.id === selectedCategory)?.name)
    : products;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {section ? section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ') : 'Products'}
          </Text>
          {categoryId && (
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {categories.find(c => c.id === categoryId)?.name}
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={styles.viewModeButton}
            activeOpacity={0.8}
          >
            {viewMode === 'grid' ? (
              <MaterialIcons name="view-list" size={24} color={theme.colors.text} />
            ) : (
              <MaterialIcons name="view-module" size={24} color={theme.colors.text} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search', { showFilters: true })}
            style={styles.filterButton}
            activeOpacity={0.8}
          >
            <MaterialIcons name="tune" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => handleCategoryPress(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
              { backgroundColor: selectedCategory === category.id ? theme.colors.primary : theme.colors.card },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.categoryChipText,
              { color: selectedCategory === category.id ? '#FFFFFF' : theme.colors.text },
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid/List */}
      <View style={styles.productsContainer}>
        {viewMode === 'grid' ? (
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridWrapper}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => handleProductPress(item)}
                variant="grid"
                style={styles.gridItem}
              />
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            onRefresh={onRefresh}
            refreshing={refreshing}
            contentContainerStyle={styles.gridContent}
            ListFooterComponent={
              hasMore && !loading ? (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              ) : !hasMore && products.length > 0 ? (
                <View style={styles.endContainer}>
                  <Text style={[styles.endText, { color: theme.colors.textMuted }]}>
                    You've seen all products
                  </Text>
                </View>
              ) : null
            }
          />
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => handleProductPress(item)}
                variant="list"
              />
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            onRefresh={onRefresh}
            refreshing={refreshing}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              hasMore && !loading ? (
                <View style={styles.loadMoreContainer}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              ) : !hasMore && products.length > 0 ? (
                <View style={styles.endContainer}>
                  <Text style={[styles.endText, { color: theme.colors.textMuted }]}>
                    You've seen all products
                  </Text>
                </View>
              ) : null
            }
          />
        )}

        {filteredProducts.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color={theme.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No products found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Try adjusting your filters or search terms
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              style={styles.clearFilterButton}
              activeOpacity={0.8}
            >
              <Text style={styles.clearFilterText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryChipActive: {
    borderColor: 'transparent',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  gridWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: 16,
  },
  gridContent: {
    paddingBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  clearFilterButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  clearFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});