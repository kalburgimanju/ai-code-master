import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { WalletTransaction } from '../types';

export const WalletScreen = () => {
  const theme = useAppTheme();
  const [balance, setBalance] = useState(245.50);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTransactions([
        { id: 't1', walletId: 'w1', type: 'credit', amount: 50, description: 'Referral bonus - John signed up', referenceType: 'referral', status: 'completed', createdAt: '2024-01-22T10:00:00Z' },
        { id: 't2', walletId: 'w1', type: 'debit', amount: 25, description: 'Applied to order #ORD-2024-001', referenceType: 'order', status: 'completed', createdAt: '2024-01-20T14:30:00Z' },
        { id: 't3', walletId: 'w1', type: 'credit', amount: 100, description: 'Refund for order #ORD-2023-015', referenceType: 'refund', status: 'completed', createdAt: '2024-01-18T10:00:00Z' },
        { id: 't4', walletId: 'w1', type: 'credit', amount: 25, description: 'Promotional cashback', referenceType: 'promotion', status: 'completed', createdAt: '2024-01-15T10:00:00Z' },
        { id: 't5', walletId: 'w1', type: 'debit', amount: 50, description: 'Withdrawal to bank account', referenceType: 'withdrawal', status: 'completed', createdAt: '2024-01-10T10:00:00Z' },
      ]);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity style={styles.balanceActionBtn} activeOpacity={0.8}>
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.balanceActionText}>Add Money</Text>
            </TouchableOpacity>
            <View style={styles.balanceDivider} />
            <TouchableOpacity style={styles.balanceActionBtn} activeOpacity={0.8}>
              <Ionicons name="arrow-up-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.balanceActionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.quickActions, { backgroundColor: theme.colors.card }]}>
          {[
            { icon: 'gift-outline', label: 'Rewards', color: '#EC4899' },
            { icon: 'ticket-outline', label: 'Coupons', color: '#F59E0B' },
            { icon: 'wallet-outline', label: 'Top Up', color: '#10B981' },
            { icon: 'history-outline', label: 'History', color: '#6366F1' },
          ].map((action, i) => (
            <TouchableOpacity key={i} style={styles.quickActionItem} activeOpacity={0.8}>
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: theme.colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Transactions</Text>
        <View style={[styles.transactionsCard, { backgroundColor: theme.colors.card }]}>
          {transactions.map((tx, i) => (
            <View key={tx.id} style={[styles.transactionRow, i < transactions.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}>
              <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? '#10B981' + '15' : '#EF4444' + '15' }]}>
                <Ionicons
                  name={tx.type === 'credit' ? 'arrow-down-outline' : 'arrow-up-outline'}
                  size={18}
                  color={tx.type === 'credit' ? '#10B981' : '#EF4444'}
                />
              </View>
              <View style={styles.txContent}>
                <Text style={[styles.txDescription, { color: theme.colors.text }]} numberOfLines={1}>{tx.description}</Text>
                <Text style={[styles.txDate, { color: theme.colors.textMuted }]}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'credit' ? '#10B981' : '#EF4444' }]}>
                {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  balanceCard: { borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center' },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500', marginBottom: 8 },
  balanceAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginBottom: 20 },
  balanceActions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  balanceActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  balanceDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.3)' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', padding: 16, borderRadius: 12, marginBottom: 20 },
  quickActionItem: { alignItems: 'center', gap: 8 },
  quickActionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  quickActionLabel: { fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  transactionsCard: { borderRadius: 12, overflow: 'hidden' },
  transactionRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  txContent: { flex: 1 },
  txDescription: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  txDate: { fontSize: 12, fontWeight: '500' },
  txAmount: { fontSize: 15, fontWeight: '700' },
});
