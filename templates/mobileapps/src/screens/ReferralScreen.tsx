import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../providers/Providers';

export const ReferralScreen = () => {
  const theme = useAppTheme();
  const { user } = useAppStore();
  const referralCode = user?.referralCode || 'JOHN2024';
  const [referralStats] = useState({ totalReferrals: 3, pendingRewards: 2, earnedRewards: 50 });

  const handleCopyCode = async () => {
    Alert.alert('Copied!', `Referral code "${referralCode}" copied to clipboard.`);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality would open here.');
  };

  const steps = [
    { icon: 'share-outline', title: 'Share Your Code', description: 'Share your referral code with friends and family' },
    { icon: 'person-add-outline', title: 'Friend Signs Up', description: 'Your friend creates an account using your code' },
    { icon: 'gift-outline', title: 'Both Get Rewards', description: 'You both receive $25 in wallet credit' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}>
          <Ionicons name="gift-outline" size={48} color="#FFFFFF" />
          <Text style={styles.heroTitle}>Refer & Earn</Text>
          <Text style={styles.heroSubtitle}>Invite friends and earn $25 for each successful referral</Text>
        </View>

        {/* Referral Code */}
        <View style={[styles.codeCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.codeLabel, { color: theme.colors.textSecondary }]}>Your Referral Code</Text>
          <Text style={[styles.codeValue, { color: theme.colors.text }]}>{referralCode}</Text>
          <View style={styles.codeActions}>
            <TouchableOpacity onPress={handleCopyCode} style={[styles.codeBtn, { backgroundColor: theme.colors.primaryLight }]} activeOpacity={0.8}>
              <Ionicons name="copy-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.codeBtnText, { color: theme.colors.primary }]}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={[styles.codeBtn, { backgroundColor: theme.colors.primary }]} activeOpacity={0.8}>
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              <Text style={styles.codeBtnTextWhite}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          {[
            { label: 'Total Referrals', value: referralStats.totalReferrals },
            { label: 'Pending Rewards', value: `$${referralStats.pendingRewards * 25}` },
            { label: 'Earned Rewards', value: `$${referralStats.earnedRewards}` },
          ].map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* How It Works */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>How It Works</Text>
        {steps.map((step, i) => (
          <View key={i} style={[styles.stepCard, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>{step.title}</Text>
              <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>{step.description}</Text>
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
  heroCard: { borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 16 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 12, marginBottom: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '500', textAlign: 'center' },
  codeCard: { borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 12 },
  codeLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  codeValue: { fontSize: 28, fontWeight: '800', letterSpacing: 4, marginBottom: 16 },
  codeActions: { flexDirection: 'row', gap: 12 },
  codeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  codeBtnText: { fontSize: 14, fontWeight: '600' },
  codeBtnTextWhite: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  statsCard: { flexDirection: 'row', padding: 16, borderRadius: 12, marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  stepCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, gap: 14, marginBottom: 8 },
  stepNumber: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  stepDesc: { fontSize: 13, fontWeight: '500' },
});
