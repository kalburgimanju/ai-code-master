import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { ProductSummary } from '../types';

type WishlistNavigationProp = StackNavigationProp<any, 'Wishlist'>;

export const WishlistScreen = () => {
  const navigation = useNavigation<WishlistNavigationProp>();
  const theme = useAppTheme();
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setItems([
        { id: '1', name: 'iPhone 15 Pro Max', price: 1199, originalPrice: 1299, rating: 4.8, reviewCount: 2341, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300', category: 'Electronics', inStock: true, seller: { id: '1', name: 'Apple Store', rating: 4.9 } },
        { id: '4', name: 'Nike Air Max 270', price: 129, originalPrice: 150, rating: 4.6, reviewCount: 5672, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300', category: 'Fashion', inStock: true, seller: { id: '3', name: 'Nike Store', rating: 4.7 } },
        { id: '6', name: 'Dyson V15 Vacuum', price: 599, originalPrice: 749, rating: 4.8, reviewCount: 892, image: 'https://images.unsplash.com/photo-1558316327-748488487b21?w=300', category: 'Home & Garden', inStock: true, seller: { id: '5', name: 'Dyson Official', rating: 4.8 } },
      ]);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const renderItem = ({ item }: { item: ProductSummary }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      style={[styles.itemCard, { backgroundColor: theme.colors.card }]}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={[styles.itemSeller, { color: theme.colors.textSecondary }]}>{item.seller?.name}</Text>
        <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={[styles.itemPrice, { color: theme.colors.text }]}>${item.price.toLocaleString()}</Text>
          {item.originalPrice && item.originalPrice > item.price && (
            <Text style={[styles.originalPrice, { color: theme.colors.textMuted }]}>${item.originalPrice.toLocaleString()}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton} activeOpacity={0.8}>
        <Ionicons name="heart" size={22} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWishlist(); }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={theme.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Your wishlist is empty</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>Save items you love for later</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },
  itemCard: { flexDirection: 'row', borderRadius: 12, padding: 12, gap: 12 },
  itemImage: { width: 80, height: 80, borderRadius: 8 },
  itemInfo: { flex: 1, justifyContent: 'center' },
  itemSeller: { fontSize: 11, fontWeight: '500', marginBottom: 4 },
  itemName: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  itemPrice: { fontSize: 16, fontWeight: '700' },
  originalPrice: { fontSize: 13, fontWeight: '500', textDecorationLine: 'line-through' },
  removeButton: { justifyContent: 'center', alignItems: 'center', padding: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 120 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 8 },
});
