import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../providers/Providers';

const mockOrders = [
  { id: '1', orderNumber: 'ORD-001', customer: 'John D.', product: 'iPhone 15 Pro Max', amount: 1199, status: 'pending', date: '2024-01-24' },
  { id: '2', orderNumber: 'ORD-002', customer: 'Sarah M.', product: 'MacBook Air M2', amount: 1099, status: 'processing', date: '2024-01-23' },
  { id: '3', orderNumber: 'ORD-003', customer: 'Mike R.', product: 'iPad Pro 12.9"', amount: 1099, status: 'shipped', date: '2024-01-22' },
];

export const SellerOrdersScreen = () => {
  const theme = useAppTheme();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? mockOrders : mockOrders.filter(o => o.status === filter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        horizontal
        data={[{ key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' }, { key: 'processing', label: 'Processing' }, { key: 'shipped', label: 'Shipped' }]}
        keyExtractor={item => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFilter(item.key)}
            style={[styles.chip, filter === item.key && { backgroundColor: theme.colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, { color: filter === item.key ? '#FFFFFF' : theme.colors.text }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.orderCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.orderHeader}>
              <Text style={[styles.orderNumber, { color: theme.colors.text }]}>{item.orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'pending' ? '#F59E0B' + '15' : item.status === 'processing' ? '#6366F1' + '15' : '#10B981' + '15' }]}>
                <Text style={[styles.statusText, { color: item.status === 'pending' ? '#F59E0B' : item.status === 'processing' ? '#6366F1' : '#10B981' }]}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
              </View>
            </View>
            <Text style={[styles.customer, { color: theme.colors.textSecondary }]}>{item.customer}</Text>
            <Text style={[styles.product, { color: theme.colors.text }]} numberOfLines={1}>{item.product}</Text>
            <View style={styles.footer}>
              <Text style={[styles.date, { color: theme.colors.textMuted }]}>{item.date}</Text>
              <Text style={[styles.amount, { color: theme.colors.text }]}>${item.amount.toLocaleString()}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F1F5F9' },
  chipText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16, gap: 12, paddingBottom: 40 },
  orderCard: { borderRadius: 12, padding: 16 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderNumber: { fontSize: 14, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  customer: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  product: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 12, fontWeight: '500' },
  amount: { fontSize: 16, fontWeight: '700' },
});
