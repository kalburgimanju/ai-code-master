import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { Order } from '../types';

type OrdersScreenNavigationProp = StackNavigationProp<any, 'Orders'>;

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  processing: '#8B5CF6',
  shipped: '#6366F1',
  out_for_delivery: '#10B981',
  delivered: '#10B981',
  cancelled: '#EF4444',
  returned: '#F97316',
  refunded: '#6B7280',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
  refunded: 'Refunded',
};

export const OrdersScreen = () => {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const theme = useAppTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const fetchOrders = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          userId: 'u1',
          items: [
            {
              id: 'oi1',
              productId: '1',
              productName: 'iPhone 15 Pro Max',
              productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200',
              price: 1199,
              quantity: 1,
              total: 1199,
              sellerId: '1',
              sellerName: 'Apple Store',
            },
          ],
          subtotal: 1199,
          discount: 0,
          shippingCost: 0,
          tax: 95.92,
          total: 1294.92,
          currency: 'USD',
          status: 'delivered',
          paymentStatus: 'paid',
          paymentMethod: { id: 'pm1', type: 'card', isDefault: true },
          shippingAddress: {
            id: 'addr1',
            type: 'home',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1 555-123-4567',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'USA',
            isDefault: true,
          },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
          deliveredAt: '2024-01-20T14:30:00Z',
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          userId: 'u1',
          items: [
            {
              id: 'oi2',
              productId: '3',
              productName: 'Sony WH-1000XM5',
              productImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=200',
              price: 349,
              quantity: 1,
              total: 349,
              sellerId: '2',
              sellerName: 'Sony Official',
            },
          ],
          subtotal: 349,
          discount: 34.9,
          shippingCost: 0,
          tax: 25.12,
          total: 339.22,
          currency: 'USD',
          status: 'shipped',
          paymentStatus: 'paid',
          paymentMethod: { id: 'pm1', type: 'card', isDefault: true },
          shippingAddress: {
            id: 'addr1',
            type: 'home',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1 555-123-4567',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'USA',
            isDefault: true,
          },
          trackingInfo: {
            carrier: 'FedEx',
            trackingNumber: 'FX123456789',
            estimatedDelivery: '2024-01-25',
            events: [],
          },
          createdAt: '2024-01-22T10:00:00Z',
          updatedAt: '2024-01-23T10:00:00Z',
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          userId: 'u1',
          items: [
            {
              id: 'oi3',
              productId: '4',
              productName: 'Nike Air Max 270',
              productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
              price: 129,
              quantity: 2,
              total: 258,
              sellerId: '3',
              sellerName: 'Nike Store',
            },
          ],
          subtotal: 258,
          discount: 0,
          shippingCost: 9.99,
          tax: 20.64,
          total: 288.63,
          currency: 'USD',
          status: 'processing',
          paymentStatus: 'paid',
          paymentMethod: { id: 'pm1', type: 'card', isDefault: true },
          shippingAddress: {
            id: 'addr1',
            type: 'home',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1 555-123-4567',
            addressLine1: '123 Main St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94102',
            country: 'USA',
            isDefault: true,
          },
          createdAt: '2024-01-24T10:00:00Z',
          updatedAt: '2024-01-24T10:00:00Z',
        },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      style={[styles.orderCard, { backgroundColor: theme.colors.card }]}
      activeOpacity={0.8}
    >
      <View style={styles.orderHeader}>
        <Text style={[styles.orderNumber, { color: theme.colors.text }]}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] || '#6B7280') + '15' }]}>
          <Text style={[styles.statusText, { color: statusColors[item.status] || '#6B7280' }]}>
            {statusLabels[item.status] || item.status}
          </Text>
        </View>
      </View>

      {item.items.slice(0, 2).map((orderItem) => (
        <View key={orderItem.id} style={styles.orderItem}>
          <Image source={{ uri: orderItem.productImage }} style={styles.orderItemImage} />
          <View style={styles.orderItemInfo}>
            <Text style={[styles.orderItemName, { color: theme.colors.text }]} numberOfLines={1}>
              {orderItem.productName}
            </Text>
            <Text style={[styles.orderItemQty, { color: theme.colors.textSecondary }]}>
              Qty: {orderItem.quantity} · ${orderItem.price.toLocaleString()}
            </Text>
          </View>
        </View>
      ))}

      {item.items.length > 2 && (
        <Text style={[styles.moreItems, { color: theme.colors.textMuted }]}>
          +{item.items.length - 2} more item(s)
        </Text>
      )}

      <View style={styles.orderFooter}>
        <Text style={[styles.orderDate, { color: theme.colors.textSecondary }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={[styles.orderTotal, { color: theme.colors.text }]}>
          ${item.total.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
      {/* Filter Tabs */}
      <FlatList
        horizontal
        data={filters}
        keyExtractor={item => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveFilter(item.key)}
            style={[
              styles.filterChip,
              activeFilter === item.key && styles.filterChipActive,
              { backgroundColor: activeFilter === item.key ? theme.colors.primary : theme.colors.card },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.filterChipText,
              { color: activeFilter === item.key ? '#FFFFFF' : theme.colors.text },
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        onRefresh={onRefresh}
        refreshing={refreshing}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={64} color={theme.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No orders found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              {activeFilter === 'all' ? "You haven't placed any orders yet" : `No ${activeFilter} orders`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filtersContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  orderCard: { borderRadius: 12, padding: 16 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderNumber: { fontSize: 14, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderItem: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  orderItemImage: { width: 50, height: 50, borderRadius: 8 },
  orderItemInfo: { flex: 1, justifyContent: 'center' },
  orderItemName: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  orderItemQty: { fontSize: 12, fontWeight: '500' },
  moreItems: { fontSize: 12, fontWeight: '500', marginBottom: 8 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12, marginTop: 4 },
  orderDate: { fontSize: 12, fontWeight: '500' },
  orderTotal: { fontSize: 16, fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, marginTop: 8, textAlign: 'center' },
});
