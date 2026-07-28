import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Order } from '../types';

type OrderDetailNavigationProp = StackNavigationProp<any, 'OrderDetail'>;
type OrderDetailRouteProp = RouteProp<any, 'OrderDetail'>;

export const OrderDetailScreen = () => {
  const navigation = useNavigation<OrderDetailNavigationProp>();
  const route = useRoute<OrderDetailRouteProp>();
  const theme = useAppTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = route.params?.orderId;

  const fetchOrder = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setOrder({
        id: orderId || '1',
        orderNumber: 'ORD-2024-001',
        userId: 'u1',
        items: [
          {
            id: 'oi1',
            productId: '1',
            productName: 'iPhone 15 Pro Max 256GB Natural Titanium',
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
          addressLine1: '123 Main Street',
          addressLine2: 'Apt 4B',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94102',
          country: 'USA',
          isDefault: true,
        },
        trackingInfo: {
          carrier: 'FedEx',
          trackingNumber: 'FX123456789',
          estimatedDelivery: '2024-01-20',
          events: [
            { timestamp: '2024-01-20T14:30:00Z', status: 'Delivered', location: 'San Francisco, CA', description: 'Package delivered to front door' },
            { timestamp: '2024-01-20T08:15:00Z', status: 'Out for Delivery', location: 'San Francisco, CA', description: 'Package is out for delivery' },
            { timestamp: '2024-01-19T22:00:00Z', status: 'At Local Facility', location: 'Oakland, CA', description: 'Package arrived at local facility' },
            { timestamp: '2024-01-18T10:00:00Z', status: 'In Transit', location: 'Memphis, TN', description: 'Package in transit' },
            { timestamp: '2024-01-17T14:00:00Z', status: 'Shipped', location: 'Cupertino, CA', description: 'Package picked up by carrier' },
          ],
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        deliveredAt: '2024-01-20T14:30:00Z',
      });
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading || !order) {
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.orderHeaderRow}>
            <View>
              <Text style={[styles.orderNumber, { color: theme.colors.text }]}>{order.orderNumber}</Text>
              <Text style={[styles.orderDate, { color: theme.colors.textSecondary }]}>
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#10B981' + '15' }]}>
              <Text style={[styles.statusText, { color: '#10B981' }]}>Delivered</Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.productImage }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>{item.productName}</Text>
                <Text style={[styles.itemQty, { color: theme.colors.textSecondary }]}>Qty: {item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: theme.colors.text }]}>${item.total.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Order Summary</Text>
          {[
            { label: 'Subtotal', value: `$${order.subtotal.toLocaleString()}` },
            { label: 'Shipping', value: order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}` },
            { label: 'Tax', value: `$${order.tax.toFixed(2)}` },
          ].map((row, i) => (
            <View key={i} style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: theme.colors.text }]}>${order.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Shipping Address</Text>
          <Text style={[styles.addressText, { color: theme.colors.textSecondary }]}>
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}{'\n'}
            {order.shippingAddress.addressLine1}{'\n'}
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
          </Text>
        </View>

        {/* Tracking */}
        {order.trackingInfo && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Tracking</Text>
            <Text style={[styles.trackingCarrier, { color: theme.colors.textSecondary }]}>
              {order.trackingInfo.carrier} · {order.trackingInfo.trackingNumber}
            </Text>
            {order.trackingInfo.events.map((event, i) => (
              <View key={i} style={styles.trackingEvent}>
                <View style={[styles.trackingDot, i === 0 && styles.trackingDotActive]} />
                <View style={styles.trackingEventContent}>
                  <Text style={[styles.trackingStatus, { color: i === 0 ? theme.colors.primary : theme.colors.text }]}>{event.status}</Text>
                  <Text style={[styles.trackingDesc, { color: theme.colors.textSecondary }]}>{event.description}</Text>
                  <Text style={[styles.trackingDate, { color: theme.colors.textMuted }]}>{new Date(event.timestamp).toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Help */}
        <TouchableOpacity style={[styles.helpButton, { borderColor: theme.colors.border }]} activeOpacity={0.8}>
          <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.helpText, { color: theme.colors.primary }]}>Need help with this order?</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },
  card: { borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  orderDate: { fontSize: 13, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  itemRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  itemImage: { width: 60, height: 60, borderRadius: 8 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  itemQty: { fontSize: 12, fontWeight: '500' },
  itemPrice: { fontSize: 14, fontWeight: '700' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 14, fontWeight: '500' },
  summaryValue: { fontSize: 14, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800' },
  addressText: { fontSize: 14, lineHeight: 22 },
  trackingCarrier: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  trackingEvent: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  trackingDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E2E8F0', marginTop: 4 },
  trackingDotActive: { backgroundColor: '#6366F1' },
  trackingEventContent: { flex: 1 },
  trackingStatus: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  trackingDesc: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  trackingDate: { fontSize: 12, fontWeight: '500' },
  helpButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  helpText: { fontSize: 14, fontWeight: '600' },
});
