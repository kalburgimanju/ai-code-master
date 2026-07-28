import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../providers/Providers';

interface SellerProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  status: 'active' | 'inactive' | 'draft';
  sales: number;
}

export const ManageProductsScreen = () => {
  const theme = useAppTheme();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchProducts = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts([
        { id: '1', name: 'iPhone 15 Pro Max', price: 1199, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200', stock: 45, status: 'active', sales: 120 },
        { id: '2', name: 'MacBook Air M2', price: 1099, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200', stock: 20, status: 'active', sales: 89 },
        { id: '3', name: 'iPad Pro 12.9"', price: 1099, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200', stock: 0, status: 'inactive', sales: 45 },
      ]);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filteredProducts = filter === 'all' ? products : products.filter(p => p.status === filter);

  const renderProduct = ({ item }: { item: SellerProduct }) => (
    <View style={[styles.productCard, { backgroundColor: theme.colors.card }]}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: theme.colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.productPrice, { color: theme.colors.text }]}>${item.price.toLocaleString()}</Text>
        <View style={styles.productMeta}>
          <Text style={[styles.productStock, { color: item.stock > 0 ? '#10B981' : '#EF4444' }]}>
            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
          </Text>
          <Text style={[styles.productSales, { color: theme.colors.textMuted }]}>{item.sales} sold</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#10B981' + '15' : '#F59E0B' + '15' }]}>
        <Text style={[styles.statusText, { color: item.status === 'active' ? '#10B981' : '#F59E0B' }]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </View>
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
        horizontal
        data={[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'inactive', label: 'Inactive' }, { key: 'draft', label: 'Draft' }]}
        keyExtractor={item => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFilter(item.key)}
            style={[styles.filterChip, filter === item.key && { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterText, { color: filter === item.key ? '#FFFFFF' : theme.colors.text }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filtersContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  filterText: { fontSize: 13, fontWeight: '600' },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },
  productCard: { flexDirection: 'row', borderRadius: 12, padding: 12, gap: 12 },
  productImage: { width: 70, height: 70, borderRadius: 8 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  productPrice: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  productMeta: { flexDirection: 'row', gap: 12 },
  productStock: { fontSize: 12, fontWeight: '600' },
  productSales: { fontSize: 12, fontWeight: '500' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
