import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  Button,
  Input,
  AuthService,
  AppLogo,
  APP_NAME,
} from '@gotechplace/shared';

export interface AdminPhoneLoginScreenProps {
  onOtpRequested?: (verificationId: string, phone: string) => void;
  onContinue?: (phone: string) => void;
}

export const AdminPhoneLoginScreen: React.FC<AdminPhoneLoginScreenProps> = ({
  onOtpRequested,
  onContinue,
}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setError('Please enter exactly 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (onContinue) {
        onContinue(cleanDigits);
        return;
      }
      const res = await AuthService.sendOtp(cleanDigits);
      if (res.success && res.verificationId) {
        onOtpRequested?.(res.verificationId, res.formattedPhone);
      } else {
        setError(res.error || 'Failed to send admin verification code.');
      }
    } catch (e: any) {
      setError(e.message || 'Error sending code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AppLogo
            portalLabel="Platform Management Console"
            size="md"
            subtitle="Restricted operations environment for authorized administrators, staff, and superusers."
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Administrator Access</Text>
          <Text style={styles.cardSubtitle}>
            Enter your authorized 10-digit phone number to receive a secure access code.
          </Text>

          <Input
            label="Admin Phone Number (10 Digits)"
            placeholder="Enter 10-digit mobile number"
            value={phone}
            onChangeText={(t) => {
              const digits = t.replace(/\D/g, '').slice(0, 10);
              setPhone(digits);
              if (error) setError('');
            }}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon={<Text style={styles.countryCode}>🇮🇳 +91</Text>}
            error={error}
          />

          <Button
            title="AUTHENTICATE & SEND OTP 🔐"
            onPress={handleSendOtp}
            loading={loading}
            size="lg"
            style={styles.actionBtn}
          />

          <View style={styles.secureNotice}>
            <Text style={styles.secureText}>
              🛡️ All administrative access attempts are permanently logged to immutable audit records.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Sleek dark slate theme for Admin
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: 32,
  },
  appName: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.common.white,
    letterSpacing: -0.5,
  },
  portalTag: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[400],
    letterSpacing: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  tagline: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[400],
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  countryCode: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[700],
  },
  actionBtn: {
    marginTop: SPACING.sm,
  },
  secureNotice: {
    marginTop: SPACING.lg,
    padding: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    alignItems: 'center',
  },
  secureText: {
    fontSize: 10,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 14,
  },
});
