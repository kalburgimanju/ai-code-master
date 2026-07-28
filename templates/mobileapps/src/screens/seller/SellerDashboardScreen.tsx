import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../providers/Providers';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';

type SellerDashboardNavigationProp = StackNavigationProp<any, 'SellerDashboard'>;

export const SellerDashboardScreen = () => {
  const navigation = useNavigation<SellerDashboardNavigationProp>();
  const theme = useAppTheme();

  const stats = [
    { label: 'Total Sales', value: '$12,450', icon: 'trending-up-outline', color: '#10B981', change: '+12%' },
    { label: 'Orders', value: '89', icon: 'bag-handle-outline', color: '#6366F1', change: '+5%' },
    { label: 'Products', value: '24', icon: 'cube-outline', color: '#F59E0B', change: '+2' },
    { label: 'Rating', value: '4.8', icon: 'star-outline', color: '#EF4444', change: '+0.1' },
  ];

  const quickActions = [
    { label: 'Add Product', icon: 'add-circle-outline', screen: 'AddProduct', color: '#6366F1' },
    { label: 'Manage Products', icon: 'cube-outline', screen: 'ManageProducts', color: '#10B981' },
    { label: 'Orders', icon: 'bag-handle-outline', screen: 'SellerOrders', color: '#F59E0B' },
    { label: 'Analytics', icon: 'bar-chart-outline', screen: 'SellerAnalytics', color: '#EF4444' },
  ];

  const recentOrders = [
    { id: '1', customer: 'John D.', product: 'iPhone 15 Pro Max', amount: 1199, status: 'pending' },
    { id: '2', customer: 'Sarah M.', product: 'MacBook Air M2', amount: 1099, status: 'processing' },
    { id: '3', customer: 'Mike R.', product: 'Sony WH-1000XM5', amount: 349, status: 'shipped' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{stat.label}</Text>
              <Text style={[styles.statChange, { color: '#10B981' }]}>{stat.change}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(action.screen)}
              style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
              activeOpacity={0.8}
            >
              <Ionicons name={action.icon as any} size={28} color={action.color} />
              <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SellerOrders')} activeOpacity={0.8}>
            <Text style={[styles.viewAll, { color: theme.colors.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentOrders.map((order, i) => (
          <View key={i} style={[styles.orderRow, { backgroundColor: theme.colors.card }]}>
            <View style={styles.orderInfo}>
              <Text style={[styles.orderCustomer, { color: theme.colors.text }]}>{order.customer}</Text>
              <Text style={[styles.orderProduct, { color: theme.colors.textSecondary }]} numberOfLines={1}>{order.product}</Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={[styles.orderAmount, { color: theme.colors.text }]}>${order.amount.toLocaleString()}</Text>
              <View style={[styles.statusBadge, { backgroundColor: order.status === 'pending' ? '#F59E0B' + '15' : order.status === 'processing' ? '#6366F1' + '15' : '#10B981' + '15' }]}>
                <Text style={[styles.statusText, { color: order.status === 'pending' ? '#F59E0B' : order.status === 'processing' ? '#6366F1' : '#10B981' }]}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { width: '47%', borderRadius: 12, padding: 14 },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  statChange: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAll: { fontSize: 14, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  actionCard: { width: '47%', borderRadius: 12, padding: 16, alignItems: 'center', gap: 8 },
  actionLabel: { fontSize: 13, fontWeight: '600' },
  orderRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 8 },
  orderInfo: { flex: 1 },
  orderCustomer: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  orderProduct: { fontSize: 12, fontWeight: '500' },
  orderRight: { alignItems: 'flex-end', gap: 4 },
  orderAmount: { fontSize: 15, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
});
