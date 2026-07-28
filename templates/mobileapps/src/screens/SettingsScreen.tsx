import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../providers/Providers';

export const SettingsScreen = () => {
  const theme = useAppTheme();
  const { isDarkMode, toggleTheme, language, setLanguage, currency, setCurrency } = useAppStore();
  const [notifications, setNotifications] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  const sections = [
    {
      title: 'Appearance',
      items: [
        { label: 'Dark Mode', type: 'switch', value: isDarkMode, onToggle: toggleTheme, icon: 'moon-outline', color: '#8B5CF6' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { label: 'Push Notifications', type: 'switch', value: notifications, onToggle: () => setNotifications(!notifications), icon: 'notifications-outline', color: '#F59E0B' },
        { label: 'Email Notifications', type: 'toggle', value: true, icon: 'mail-outline', color: '#3B82F6' },
        { label: 'SMS Notifications', type: 'toggle', value: false, icon: 'chatbubble-outline', color: '#10B981' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Language', type: 'value', value: language === 'en' ? 'English' : language, icon: 'globe-outline', color: '#6366F1' },
        { label: 'Currency', type: 'value', value: currency, icon: 'cash-outline', color: '#10B981' },
        { label: 'Data Saver', type: 'switch', value: dataSaver, onToggle: () => setDataSaver(!dataSaver), icon: 'speedometer-outline', color: '#F97316' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Change Password', type: 'nav', icon: 'lock-closed-outline', color: '#EF4444' },
        { label: 'Two-Factor Authentication', type: 'nav', icon: 'shield-checkmark-outline', color: '#10B981' },
        { label: 'Privacy Settings', type: 'nav', icon: 'eye-outline', color: '#64748B' },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', type: 'nav', icon: 'help-circle-outline', color: '#3B82F6' },
        { label: 'Contact Us', type: 'nav', icon: 'chatbubble-ellipses-outline', color: '#6366F1' },
        { label: 'Report a Problem', type: 'nav', icon: 'flag-outline', color: '#EF4444' },
      ],
    },
  ];

  const handlePress = (item: any) => {
    if (item.type === 'switch' && item.onToggle) {
      item.onToggle();
    } else {
      Alert.alert(item.label, 'Feature coming soon');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}>
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  onPress={() => handlePress(item)}
                  style={[styles.settingRow, ii < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconBg, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{item.label}</Text>
                  </View>
                  {item.type === 'switch' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#E2E8F0', true: theme.colors.primary + '50' }}
                      thumbColor={item.value ? theme.colors.primary : '#FFFFFF'}
                    />
                  ) : item.type === 'value' ? (
                    <View style={styles.settingRight}>
                      <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>{item.value}</Text>
                      <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 8 },
  sectionCard: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingValue: { fontSize: 14, fontWeight: '500' },
});
