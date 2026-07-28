import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { Notification } from '../types';

const iconMap: Record<string, { icon: string; color: string }> = {
  order_placed: { icon: 'bag-check-outline', color: '#10B981' },
  order_shipped: { icon: 'car-outline', color: '#6366F1' },
  order_delivered: { icon: 'checkmark-circle-outline', color: '#10B981' },
  payment_success: { icon: 'card-outline', color: '#10B981' },
  price_drop: { icon: 'trending-down-outline', color: '#F59E0B' },
  flash_sale: { icon: 'flash-outline', color: '#EF4444' },
  new_message: { icon: 'chatbubble-outline', color: '#6366F1' },
  promotion: { icon: 'gift-outline', color: '#EC4899' },
  system: { icon: 'information-circle-outline', color: '#64748B' },
};

export const NotificationsScreen = () => {
  const theme = useAppTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications([
        { id: '1', userId: 'u1', type: 'order_shipped', title: 'Order Shipped', message: 'Your order #ORD-2024-002 has been shipped via FedEx.', read: false, createdAt: '2024-01-23T10:00:00Z' },
        { id: '2', userId: 'u1', type: 'price_drop', title: 'Price Drop Alert', message: 'Sony WH-1000XM5 is now $349 (was $399).', read: false, createdAt: '2024-01-22T15:00:00Z' },
        { id: '3', userId: 'u1', type: 'flash_sale', title: 'Flash Sale Starting', message: 'Flash sale on Electronics starts in 1 hour!', read: true, createdAt: '2024-01-22T10:00:00Z' },
        { id: '4', userId: 'u1', type: 'order_delivered', title: 'Order Delivered', message: 'Your order #ORD-2024-001 has been delivered.', read: true, createdAt: '2024-01-20T14:30:00Z' },
        { id: '5', userId: 'u1', type: 'payment_success', title: 'Payment Confirmed', message: 'Payment of $1,294.92 confirmed for order #ORD-2024-001.', read: true, createdAt: '2024-01-15T10:05:00Z' },
      ]);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const iconInfo = iconMap[item.type] || iconMap.system;
    return (
      <TouchableOpacity
        onPress={() => markAsRead(item.id)}
        style={[styles.notifCard, { backgroundColor: item.read ? theme.colors.background : theme.colors.card + '80' }]}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconInfo.color + '15' }]}>
          <Ionicons name={iconInfo.icon as any} size={22} color={iconInfo.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, { color: theme.colors.text }]}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.notifMessage, { color: theme.colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>
          <Text style={[styles.notifTime, { color: theme.colors.textMuted }]}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color={theme.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No notifications</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>You're all caught up!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40, gap: 12 },
  notifCard: { flexDirection: 'row', borderRadius: 12, padding: 14, gap: 12 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  notifTitle: { fontSize: 14, fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1' },
  notifMessage: { fontSize: 13, fontWeight: '500', lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, fontWeight: '500' },
  emptyContainer: { alignItems: 'center', paddingTop: 120 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 8 },
});
