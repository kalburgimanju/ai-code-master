import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';

type HelpNavigationProp = StackNavigationProp<any, 'Help'>;

export const HelpScreen = () => {
  const navigation = useNavigation<HelpNavigationProp>();
  const theme = useAppTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    { q: 'How do I track my order?', a: 'Go to Orders > select your order > view tracking information.' },
    { q: 'How do I return an item?', a: 'Go to Orders > select the order > tap Return Item. You have 30 days from delivery.' },
    { q: 'How do I apply a promo code?', a: 'Enter your promo code at checkout or in your cart before proceeding.' },
    { q: 'How do I update my payment method?', a: 'Go to Profile > Settings > Payment Methods to add or remove cards.' },
    { q: 'How do I contact support?', a: 'Use the chat feature in the app or email us at support@mobileapps.com.' },
  ];

  const contactOptions = [
    { icon: 'chatbubble-ellipses-outline', label: 'Live Chat', subtitle: 'Chat with our support team', color: '#6366F1' },
    { icon: 'mail-outline', label: 'Email', subtitle: 'support@mobileapps.com', color: '#3B82F6' },
    { icon: 'call-outline', label: 'Phone', subtitle: '+1 (555) 123-4567', color: '#10B981' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact Us</Text>
        {contactOptions.map((opt, i) => (
          <TouchableOpacity key={i} style={[styles.contactCard, { backgroundColor: theme.colors.card }]} activeOpacity={0.8}>
            <View style={[styles.contactIcon, { backgroundColor: opt.color + '15' }]}>
              <Ionicons name={opt.icon as any} size={22} color={opt.color} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: theme.colors.text }]}>{opt.label}</Text>
              <Text style={[styles.contactSubtitle, { color: theme.colors.textSecondary }]}>{opt.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ))}

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 24 }]}>Frequently Asked Questions</Text>
        {faqs.map((faq, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
            style={[styles.faqCard, { backgroundColor: theme.colors.card }]}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQuestion, { color: theme.colors.text }]}>{faq.q}</Text>
              <Ionicons
                name={expandedFaq === i ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.textMuted}
              />
            </View>
            {expandedFaq === i && (
              <Text style={[styles.faqAnswer, { color: theme.colors.textSecondary }]}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  contactCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, gap: 14, marginBottom: 8 },
  contactIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1 },
  contactLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  contactSubtitle: { fontSize: 13, fontWeight: '500' },
  faqCard: { borderRadius: 12, padding: 16, marginBottom: 8 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  faqAnswer: { fontSize: 14, fontWeight: '500', lineHeight: 22, marginTop: 12 },
});
