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
import { useAppTheme } from '../providers/Providers';

export const AboutScreen = () => {
  const theme = useAppTheme();

  const links = [
    { label: 'Terms of Service', icon: 'document-text-outline' },
    { label: 'Privacy Policy', icon: 'shield-checkmark-outline' },
    { label: 'Refund Policy', icon: 'return-down-back-outline' },
    { label: 'Shipping Policy', icon: 'car-outline' },
    { label: 'Licenses', icon: 'book-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="bag-handle" size={40} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: theme.colors.text }]}>MobileApps</Text>
          <Text style={[styles.version, { color: theme.colors.textMuted }]}>Version 1.0.0 (Build 1)</Text>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          MobileApps is your one-stop shopping destination. Discover millions of products, enjoy fast shipping, and shop with confidence.
        </Text>

        {/* Links */}
        <View style={[styles.linksCard, { backgroundColor: theme.colors.card }]}>
          {links.map((link, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.linkItem, i < links.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
              activeOpacity={0.7}
            >
              <Ionicons name={link.icon as any} size={22} color={theme.colors.primary} />
              <Text style={[styles.linkLabel, { color: theme.colors.text }]}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Social Links */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Follow Us</Text>
        <View style={styles.socialRow}>
          {['logo-facebook', 'logo-twitter', 'logo-instagram', 'logo-youtube'].map((icon, i) => (
            <TouchableOpacity key={i} style={[styles.socialIcon, { backgroundColor: theme.colors.card }]} activeOpacity={0.8}>
              <Ionicons name={icon as any} size={22} color={theme.colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.copyright, { color: theme.colors.textMuted }]}>
          © 2024 MobileApps. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  appName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  version: { fontSize: 13, fontWeight: '500' },
  description: { fontSize: 14, fontWeight: '500', lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  linksCard: { width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 24 },
  linkItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  linkLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  socialIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  copyright: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
});
