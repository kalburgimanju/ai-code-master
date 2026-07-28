import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../providers/Providers';

export const SellerProfileScreen = () => {
  const theme = useAppTheme();

  const stats = [
    { label: 'Products', value: '24' },
    { label: 'Sales', value: '$12.4K' },
    { label: 'Rating', value: '4.8' },
    { label: 'Followers', value: '1.2K' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200' }} style={styles.avatar} />
          <Text style={[styles.name, { color: theme.colors.text }]}>Apple Official Store</Text>
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.verifiedText, { color: '#10B981' }]}>Verified Seller</Text>
          </View>
          <Text style={[styles.location, { color: theme.colors.textSecondary }]}>Cupertino, CA · Since 2020</Text>

          <View style={styles.statsRow}>
            {stats.map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        {[
          { icon: 'cube-outline', label: 'My Products', color: '#6366F1' },
          { icon: 'bar-chart-outline', label: 'Analytics', color: '#10B981' },
          { icon: 'bag-handle-outline', label: 'Orders', color: '#F59E0B' },
          { icon: 'settings-outline', label: 'Store Settings', color: '#64748B' },
          { icon: 'help-circle-outline', label: 'Seller Support', color: '#3B82F6' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={[styles.menuItem, { backgroundColor: theme.colors.card }]} activeOpacity={0.8}>
            <Ionicons name={item.icon as any} size={22} color={item.color} />
            <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  profileCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 20, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  verifiedText: { fontSize: 13, fontWeight: '600' },
  location: { fontSize: 13, fontWeight: '500', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 24 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '500' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, marginBottom: 8 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});
