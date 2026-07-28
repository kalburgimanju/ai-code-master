import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../providers/Providers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ProductSummary } from '../types';
import { ProductCard } from '../components/ProductCard';

type SearchNavigationProp = StackNavigationProp<any, 'Search'>;
type SearchRouteProp = RouteProp<any, 'Search'>;

export const SearchScreen = () => {
  const navigation = useNavigation<SearchNavigationProp>();
  const route = useRoute<SearchRouteProp>();
  const theme = useAppTheme();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState(route.params?.initialQuery || '');
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches] = useState(['iPhone', 'Nike shoes', 'Headphones', 'Laptop']);

  const handleSearch = (text?: string) => {
    const searchQuery = text || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    setTimeout(() => {
      setResults([
        { id: '1', name: 'iPhone 15 Pro Max', price: 1199, originalPrice: 1299, rating: 4.8, reviewCount: 2341, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300', category: 'Electronics', inStock: true, seller: { id: '1', name: 'Apple Store', rating: 4.9 } },
        { id: '2', name: 'MacBook Air M2', price: 1099, originalPrice: 1199, rating: 4.9, reviewCount: 1876, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300', category: 'Electronics', inStock: true, seller: { id: '1', name: 'Apple Store', rating: 4.9 } },
      ]);
      setLoading(false);
    }, 800);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Input */}
      <View style={[styles.searchBar, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          ref={inputRef}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch()}
          placeholder="Search products..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {!searched ? (
        <View style={styles.suggestionsContainer}>
          <Text style={[styles.suggestionsTitle, { color: theme.colors.textSecondary }]}>Recent Searches</Text>
          {recentSearches.map((term, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => { setQuery(term); handleSearch(term); }}
              style={[styles.suggestionItem, { borderBottomColor: theme.colors.border }]}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={18} color={theme.colors.textMuted} />
              <Text style={[styles.suggestionText, { color: theme.colors.text }]}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              variant="list"
            />
          )}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={theme.colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No results found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>Try different keywords</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, gap: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#1E293B', paddingVertical: 0 },
  suggestionsContainer: { paddingHorizontal: 16 },
  suggestionsTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase' },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  suggestionText: { fontSize: 15, fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultsList: { padding: 16, gap: 12, paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', paddingTop: 120 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtitle: { fontSize: 14, marginTop: 8 },
});
