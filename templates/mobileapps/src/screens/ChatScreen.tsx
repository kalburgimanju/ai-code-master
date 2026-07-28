import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Conversation } from '../types';

type ChatNavigationProp = StackNavigationProp<any, 'Chat'>;

export const ChatScreen = () => {
  const navigation = useNavigation<ChatNavigationProp>();
  const theme = useAppTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setConversations([
        {
          id: 'c1',
          participants: [{ id: 's1', name: 'Apple Store', type: 'seller', avatar: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100' }],
          lastMessage: { id: 'm1', conversationId: 'c1', senderId: 's1', senderName: 'Apple Store', senderType: 'seller', message: 'Your order has been shipped!', type: 'text', read: false, createdAt: '2024-01-23T10:00:00Z' },
          unreadCount: 1,
          type: 'seller',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-23T10:00:00Z',
        },
        {
          id: 'c2',
          participants: [{ id: 'sup1', name: 'Support Team', type: 'support', avatar: undefined }],
          lastMessage: { id: 'm2', conversationId: 'c2', senderId: 'sup1', senderName: 'Support Team', senderType: 'support', message: 'How can we help you today?', type: 'text', read: true, createdAt: '2024-01-22T15:00:00Z' },
          unreadCount: 0,
          type: 'support',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-22T15:00:00Z',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const renderItem = ({ item }: { item: Conversation }) => {
    const participant = item.participants[0];
    return (
      <TouchableOpacity
        style={[styles.conversationCard, { backgroundColor: theme.colors.card }]}
        activeOpacity={0.8}
      >
        <View style={styles.avatarContainer}>
          {participant.avatar ? (
            <Image source={{ uri: participant.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name={item.type === 'support' ? 'headset-outline' : 'storefront-outline'} size={24} color={theme.colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.participantName, { color: theme.colors.text }]}>{participant.name}</Text>
            {item.lastMessage && (
              <Text style={[styles.timestamp, { color: theme.colors.textMuted }]}>
                {new Date(item.lastMessage.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>
          {item.lastMessage && (
            <Text style={[styles.lastMessage, { color: theme.colors.textSecondary }]} numberOfLines={1}>
              {item.lastMessage.message}
            </Text>
          )}
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(); }} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No messages yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>Start a conversation with sellers</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 40, gap: 8 },
  conversationCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, gap: 12 },
  avatarContainer: {},
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  conversationContent: { flex: 1 },
  conversationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  participantName: { fontSize: 15, fontWeight: '600' },
  timestamp: { fontSize: 11, fontWeight: '500' },
  lastMessage: { fontSize: 13, fontWeight: '500' },
  unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  unreadText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingTop: 120 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 8 },
});
