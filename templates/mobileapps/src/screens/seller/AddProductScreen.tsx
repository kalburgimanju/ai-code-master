import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../providers/Providers';

export const AddProductScreen = () => {
  const theme = useAppTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Product added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Photo Upload */}
        <TouchableOpacity style={[styles.photoUpload, { borderColor: theme.colors.border }]} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={32} color={theme.colors.textMuted} />
          <Text style={[styles.photoText, { color: theme.colors.textMuted }]}>Add Photos</Text>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Product Name *</Text>
          <TextInput value={name} onChangeText={setName} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} placeholder="Enter product name" placeholderTextColor={theme.colors.textMuted} />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
          <TextInput value={description} onChangeText={setDescription} style={[styles.textArea, { color: theme.colors.text, borderColor: theme.colors.border }]} placeholder="Describe your product" placeholderTextColor={theme.colors.textMuted} multiline numberOfLines={4} textAlignVertical="top" />
        </View>

        <View style={styles.formRow}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Price *</Text>
            <TextInput value={price} onChangeText={setPrice} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} placeholder="$0.00" placeholderTextColor={theme.colors.textMuted} keyboardType="decimal-pad" />
          </View>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Stock *</Text>
            <TextInput value={stock} onChangeText={setStock} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]} placeholder="0" placeholderTextColor={theme.colors.textMuted} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChips}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive, { backgroundColor: category === cat ? theme.colors.primary : theme.colors.card }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryChipText, { color: category === cat ? '#FFFFFF' : theme.colors.text }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: theme.colors.primary }]} activeOpacity={0.9}>
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Add Product'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  photoUpload: { height: 150, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 20, gap: 8 },
  photoText: { fontSize: 14, fontWeight: '500' },
  formGroup: { marginBottom: 16 },
  formRow: { flexDirection: 'row', gap: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, fontSize: 15 },
  textArea: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, fontSize: 15, minHeight: 100 },
  categoryChips: { gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  saveButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
