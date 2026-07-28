import React, { useState } from 'react';
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

export const SellerAnalyticsScreen = () => {
  const theme = useAppTheme();
  const [period, setPeriod] = useState('month');

  const metrics = [
    { label: 'Revenue', value: '$12,450', change: '+12%', icon: 'cash-outline', color: '#10B981' },
    { label: 'Orders', value: '89', change: '+5%', icon: 'bag-handle-outline', color: '#6366F1' },
    { label: 'Avg Order', value: '$139.89', change: '+3%', icon: 'trending-up-outline', color: '#F59E0B' },
    { label: 'Conversion', value: '3.2%', change: '+0.5%', icon: 'pie-chart-outline', color: '#EF4444' },
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro Max', sales: 45, revenue: 53955 },
    { name: 'MacBook Air M2', sales: 32, revenue: 35168 },
    { name: 'iPad Pro 12.9"', sales: 12, revenue: 13188 },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['week', 'month', 'quarter', 'year'].map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodChip, period === p && { backgroundColor: theme.colors.primary }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, { color: period === p ? '#FFFFFF' : theme.colors.text }]}>{p.charAt(0).toUpperCase() + p.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Metrics */}
        <View style={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <View key={i} style={[styles.metricCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.metricIcon, { backgroundColor: m.color + '15' }]}>
                <Ionicons name={m.icon as any} size={20} color={m.color} />
              </View>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: theme.colors.textMuted }]}>{m.label}</Text>
              <Text style={styles.metricChange}>{m.change}</Text>
            </View>
          ))}
        </View>

        {/* Top Products */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Products</Text>
        {topProducts.map((p, i) => (
          <View key={i} style={[styles.productRow, { backgroundColor: theme.colors.card }]}>
            <View style={styles.rankBadge}><Text style={styles.rankText}>{i + 1}</Text></View>
            <View style={styles.productInfo}>
              <Text style={[styles.productName, { color: theme.colors.text }]}>{p.name}</Text>
              <Text style={[styles.productSales, { color: theme.colors.textSecondary }]}>{p.sales} sales</Text>
            </View>
            <Text style={[styles.productRevenue, { color: theme.colors.text }]}>${p.revenue.toLocaleString()}</Text>
          </View>
        ))}

        {/* Chart Placeholder */}
        <View style={[styles.chartPlaceholder, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="bar-chart-outline" size={48} color={theme.colors.textMuted} />
          <Text style={[styles.chartText, { color: theme.colors.textMuted }]}>Sales Chart</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  periodSelector: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  periodChip: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#F1F5F9' },
  periodText: { fontSize: 13, fontWeight: '600' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  metricCard: { width: '47%', borderRadius: 12, padding: 14 },
  metricIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  metricValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  metricLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  metricChange: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  productRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  rankText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  productSales: { fontSize: 12, fontWeight: '500' },
  productRevenue: { fontSize: 15, fontWeight: '700' },
  chartPlaceholder: { height: 200, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  chartText: { fontSize: 14, fontWeight: '500', marginTop: 8 },
});
