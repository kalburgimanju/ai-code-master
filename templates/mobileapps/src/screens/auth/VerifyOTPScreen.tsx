import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, useAppStore } from '../../providers/Providers';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type VerifyOTPNavigationProp = StackNavigationProp<any, 'VerifyOTP'>;

export const VerifyOTPScreen = () => {
  const navigation = useNavigation<VerifyOTPNavigationProp>();
  const route = useRoute<RouteProp<any, 'VerifyOTP'>>();
  const theme = useAppTheme();
  const { setUser, setIsAuthenticated } = useAppStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const contact = route.params?.email || route.params?.phone || 'your account';

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Error', 'Please enter the complete OTP');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({ id: '1', name: 'User', email: contact, role: 'customer' });
      setIsAuthenticated(true);
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Verify OTP</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter the 6-digit code sent to {contact}
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { inputRefs.current[index] = ref; }}
              value={digit}
              onChangeText={text => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              style={[styles.otpInput, { borderColor: digit ? theme.colors.primary : theme.colors.border, color: theme.colors.text }]}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleVerify} style={[styles.button, { backgroundColor: theme.colors.primary }]} activeOpacity={0.9}>
          <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton} activeOpacity={0.8}>
          <Text style={[styles.resendText, { color: theme.colors.primary }]}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 60, left: 24 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  otpInput: { width: 48, height: 56, borderRadius: 12, borderWidth: 2, fontSize: 24, fontWeight: '700' },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resendButton: { alignItems: 'center', marginTop: 20 },
  resendText: { fontSize: 14, fontWeight: '600' },
});
