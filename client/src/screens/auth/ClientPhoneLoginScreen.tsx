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

export interface ClientPhoneLoginScreenProps {
  onOtpRequested: (verificationId: string, phone: string) => void;
}

export const ClientPhoneLoginScreen: React.FC<ClientPhoneLoginScreenProps> = ({
  onOtpRequested,
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
      const res = await AuthService.sendOtp(cleanDigits);
      if (res.success && res.verificationId) {
        onOtpRequested(res.verificationId, res.formattedPhone);
      } else {
        setError(res.error || 'Failed to send OTP code.');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred.');
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
            portalLabel="Client & Employer Portal"
            size="md"
            subtitle="Hire skilled engineering students and sponsor innovative real-world projects."
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Client Phone Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Enter your 10-digit mobile number to access your employer account.
          </Text>

          <Input
            label="Employer Phone Number (10 Digits)"
            placeholder="Enter 10-digit mobile number"
            value={phone}
            onChangeText={(text) => {
              const digits = text.replace(/\D/g, '').slice(0, 10);
              setPhone(digits);
              if (error) setError('');
            }}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon={<Text style={styles.countryCode}>🇮🇳 +91</Text>}
            error={error}
          />

          <Button
            title="SEND LOGIN OTP"
            onPress={handleSendOtp}
            loading={loading}
            size="lg"
            style={styles.actionBtn}
          />

          <View style={styles.secureNotice}>
            <Text style={styles.secureText}>
              🔒 Secure phone authentication powered by Firebase Auth.
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
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.brand[800],
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
    color: COLORS.brand[900],
    letterSpacing: -0.5,
  },
  portalTag: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
    letterSpacing: 1.5,
    marginTop: 2,
    marginBottom: 4,
  },
  tagline: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    maxWidth: 290,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
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
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
});
