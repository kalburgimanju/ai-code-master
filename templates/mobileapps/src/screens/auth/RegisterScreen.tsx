import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../../providers/Providers';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';

type RegisterNavigationProp = StackNavigationProp<any, 'Register'>;

export const RegisterScreen = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const theme = useAppTheme();
  const { setUser, setIsAuthenticated } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ id: '1', name, email, phone, role: 'customer' });
      setIsAuthenticated(true);
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Sign up to get started</Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name="person-outline" size={20} color={theme.colors.textMuted} />
              <TextInput value={name} onChangeText={setName} placeholder="Full Name *" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text }]} />
            </View>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />
              <TextInput value={email} onChangeText={setEmail} placeholder="Email *" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text }]} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name="call-outline" size={20} color={theme.colors.textMuted} />
              <TextInput value={phone} onChangeText={setPhone} placeholder="Phone (optional)" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text }]} keyboardType="phone-pad" />
            </View>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />
              <TextInput value={password} onChangeText={setPassword} placeholder="Password *" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text }]} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} />
              <TextInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm Password *" placeholderTextColor={theme.colors.textMuted} style={[styles.input, { color: theme.colors.text }]} secureTextEntry />
            </View>

            <TouchableOpacity onPress={() => setAgreedToTerms(!agreedToTerms)} style={styles.checkboxRow} activeOpacity={0.8}>
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked, { borderColor: theme.colors.primary }]}>
                {agreedToTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
              </View>
              <Text style={[styles.checkboxText, { color: theme.colors.textSecondary }]}>I agree to the Terms & Conditions</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRegister} style={[styles.registerButton, { backgroundColor: theme.colors.primary }]} activeOpacity={0.9}>
              <Text style={styles.registerButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16, fontWeight: '500' },
  form: { gap: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 0 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  checkboxText: { fontSize: 13, fontWeight: '500' },
  registerButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  registerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, paddingBottom: 20 },
  footerText: { fontSize: 14, fontWeight: '500' },
  footerLink: { fontSize: 14, fontWeight: '700' },
});
