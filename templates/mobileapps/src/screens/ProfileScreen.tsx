import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../providers/Providers';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';

type ProfileScreenNavigationProp = StackNavigationProp<any, 'Profile'>;

const menuItems = [
  { icon: 'heart-outline', label: 'Wishlist', screen: 'Wishlist', color: '#EF4444' },
  { icon: 'wallet-outline', label: 'Wallet', screen: 'Wallet', color: '#10B981' },
  { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications', color: '#F59E0B' },
  { icon: 'chatbubble-outline', label: 'Messages', screen: 'Chat', color: '#6366F1' },
  { icon: 'gift-outline', label: 'Refer & Earn', screen: 'Referral', color: '#EC4899' },
  { icon: 'settings-outline', label: 'Settings', screen: 'Settings', color: '#64748B' },
  { icon: 'help-circle-outline', label: 'Help & Support', screen: 'Help', color: '#3B82F6' },
  { icon: 'information-circle-outline', label: 'About', screen: 'About', color: '#8B5CF6' },
];

export const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const theme = useAppTheme();
  const { user, isDarkMode, toggleTheme, setIsAuthenticated, setUser } = useAppStore();

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                  {user?.name?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name || 'Guest User'}</Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>{user?.email || 'Sign in to your account'}</Text>
          <TouchableOpacity style={[styles.editButton, { borderColor: theme.colors.primary }]} activeOpacity={0.8}>
            <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          {[
            { label: 'Orders', value: '12', icon: 'bag-outline' },
            { label: 'Wishlist', value: '8', icon: 'heart-outline' },
            { label: 'Reviews', value: '5', icon: 'star-outline' },
            { label: 'Points', value: '2,450', icon: 'gift-outline' },
          ].map((stat, i) => (
            <TouchableOpacity key={i} style={styles.statItem} activeOpacity={0.8}>
              <Ionicons name={stat.icon as any} size={22} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dark Mode Toggle */}
        <View style={[styles.settingRow, { backgroundColor: theme.colors.card }]}>
          <View style={styles.settingLeft}>
            <Ionicons name={isDarkMode ? 'moon' : 'sunny'} size={22} color={theme.colors.primary} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E2E8F0', true: theme.colors.primary + '50' }}
            thumbColor={isDarkMode ? theme.colors.primary : '#FFFFFF'}
          />
        </View>

        {/* Menu Items */}
        <View style={[styles.menuCard, { backgroundColor: theme.colors.card }]}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(item.screen)}
              style={[styles.menuItem, i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
                <Text style={[styles.menuLabel, { color: theme.colors.text }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={[styles.logoutButton, { borderColor: '#EF4444' }]} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.colors.textMuted }]}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  profileCard: { alignItems: 'center', padding: 24, margin: 16, borderRadius: 16 },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: '700' },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  userEmail: { fontSize: 14, fontWeight: '500', marginBottom: 16 },
  editButton: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  editButtonText: { fontSize: 14, fontWeight: '600' },
  statsCard: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 12 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  menuCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 15, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
  version: { textAlign: 'center', fontSize: 12, fontWeight: '500', marginTop: 16 },
});
