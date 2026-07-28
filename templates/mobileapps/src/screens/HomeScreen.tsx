import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../providers/Providers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { BannerCarousel } from '../components/BannerCarousel';
import { SectionHeader } from '../components/SectionHeader';
import { SearchBar } from '../components/SearchBar';
import { FlashSaleTimer } from '../components/FlashSaleTimer';
import { ProductSummary as Product, Category, Banner } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const theme = useAppTheme();
  const { isDarkMode } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data
      setBanners([
        { id: '1', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800', title: 'Summer Sale', subtitle: 'Up to 50% off', actionUrl: '/categories/summer' },
        { id: '2', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', title: 'Electronics', subtitle: 'Latest gadgets', actionUrl: '/categories/electronics' },
        { id: '3', image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800', title: 'Fashion', subtitle: 'New arrivals', actionUrl: '/categories/fashion' },
      ]);

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

      const mockProducts: Product[] = [
        { id: '1', name: 'iPhone 15 Pro Max', price: 1199, originalPrice: 1299, discount: 8, rating: 4.8, reviewCount: 2341, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', category: 'Electronics', isFlashSale: true, flashSaleEndTime: Date.now() + 86400000, inStock: true, seller: { id: '1', name: 'Apple Store', rating: 4.9 } },
        { id: '2', name: 'MacBook Air M2', price: 1099, originalPrice: 1199, discount: 8, rating: 4.9, reviewCount: 1876, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', category: 'Electronics', isFlashSale: true, flashSaleEndTime: Date.now() + 86400000, inStock: true, seller: { id: '1', name: 'Apple Store', rating: 4.9 } },
        { id: '3', name: 'Sony WH-1000XM5', price: 349, originalPrice: 399, discount: 13, rating: 4.7, reviewCount: 3421, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', category: 'Electronics', isFlashSale: false, inStock: true, seller: { id: '2', name: 'Sony Official', rating: 4.8 } },
        { id: '4', name: 'Nike Air Max 270', price: 129, originalPrice: 150, discount: 14, rating: 4.6, reviewCount: 5672, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: 'Fashion', isFlashSale: false, inStock: true, seller: { id: '3', name: 'Nike Store', rating: 4.7 } },
        { id: '5', name: 'Samsung 65" 4K TV', price: 799, originalPrice: 999, discount: 20, rating: 4.5, reviewCount: 1234, image: 'https://images.unsplash.com/photo-1593784991089-a27c6f9c6b7a?w=400', category: 'Electronics', isFlashSale: true, flashSaleEndTime: Date.now() + 43200000, inStock: true, seller: { id: '4', name: 'Samsung Official', rating: 4.6 } },
        { id: '6', name: 'Dyson V15 Vacuum', price: 599, originalPrice: 749, discount: 20, rating: 4.8, reviewCount: 892, image: 'https://images.unsplash.com/photo-1558316327-748488487b21?w=400', category: 'Home & Garden', isFlashSale: false, inStock: true, seller: { id: '5', name: 'Dyson Official', rating: 4.8 } },
        { id: '7', name: 'Adidas Ultraboost 22', price: 180, originalPrice: 180, discount: 0, rating: 4.7, reviewCount: 3421, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', category: 'Fashion', isFlashSale: false, inStock: true, seller: { id: '3', name: 'Adidas Store', rating: 4.7 } },
        { id: '8', name: 'Instant Pot Duo', price: 89, originalPrice: 119, discount: 25, rating: 4.8, reviewCount: 12450, image: 'https://images.unsplash.com/photo-1584990347976-139f2a7d1f99?w=400', category: 'Home & Garden', isFlashSale: false, inStock: true, seller: { id: '6', name: 'Instant Brands', rating: 4.7 } },
      ];

      setFlashSaleProducts(mockProducts.filter(p => p.isFlashSale));
      setTrendingProducts(mockProducts.slice(0, 4));
      setRecommendedProducts(mockProducts.slice(2, 6));
      setNewArrivals(mockProducts.slice(4, 8));
      setBestSellers(mockProducts.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchHomeData();
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('Categories', { categoryId: category.id, categoryName: category.name });
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleViewAll = (section: string) => {
    navigation.navigate('Products', { section });
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.card}
          />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search products, brands, categories..."
            onPress={handleSearchPress}
            showFilter={true}
            onFilterPress={() => navigation.navigate('Search', { showFilters: true })}
          />
        </View>

        {/* Banner Carousel */}
        <View style={styles.section}>
          <BannerCarousel
            banners={banners}
            onPress={(banner) => {
              if (banner.actionUrl) {
                navigation.navigate('Products', { section: banner.actionUrl.replace('/', '') });
              }
            }}
          />
        </View>

        {/* Flash Sale */}
        {flashSaleProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Flash Sale"
              subtitle="Limited time offers"
              onViewAllPress={() => handleViewAll('flash-sale')}
              showTimer
              endTime={flashSaleProducts[0].flashSaleEndTime}
            />
            <FlashSaleTimer endTime={flashSaleProducts[0].flashSaleEndTime!} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {flashSaleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                  style={styles.flashSaleCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader
            title="Categories"
            subtitle="Shop by category"
            onViewAllPress={() => navigation.navigate('Categories')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Trending Products */}
        {trendingProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Trending Now"
              subtitle="Popular this week"
              onViewAllPress={() => handleViewAll('trending')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {trendingProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                  style={styles.productCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Recommended for You"
              subtitle="Based on your browsing history"
              onViewAllPress={() => handleViewAll('recommended')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                  style={styles.productCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="New Arrivals"
              subtitle="Freshly added products"
              onViewAllPress={() => handleViewAll('new-arrivals')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                  style={styles.productCard}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <View style={[styles.section, styles.lastSection]}>
            <SectionHeader
              title="Best Sellers"
              subtitle="Top rated products"
              onViewAllPress={() => handleViewAll('best-sellers')}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {bestSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => handleProductPress(product)}
                  style={styles.productCard}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 30,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  lastSection: {
    marginBottom: 0,
  },
  horizontalList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  flashSaleCard: {
    width: 160,
  },
  productCard: {
    width: 170,
  },
});