import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  Button,
  OtpInput,
  AuthService,
  User,
  maskPhoneNumber,
  DEFAULT_APP_VERSIONS,
} from '@gotechplace/shared';

export interface ClientOtpScreenProps {
  verificationId: string;
  phoneNumber: string;
  onOtpVerified: (user: User) => void;
  onChangePhone: () => void;
}

export const ClientOtpScreen: React.FC<ClientOtpScreenProps> = ({
  verificationId,
  phoneNumber,
  onOtpVerified,
  onChangePhone,
}) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const appVersion = DEFAULT_APP_VERSIONS.client.latestVersion || '1.0.0';
  const maskedPhone = maskPhoneNumber(phoneNumber);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    const cleanOtp = otp.replace(/\D/g, '').slice(0, 6);
    if (cleanOtp.length !== 6) {
      setError('Please enter complete 6-digit verification code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await AuthService.verifyOtp(verificationId, cleanOtp, phoneNumber, 'client');
      if (res.success && res.user) {
        onOtpVerified(res.user);
      } else {
        setError(res.error || 'Invalid OTP code. Please try again.');
      }
    } catch (e: any) {
      setError(e.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await AuthService.sendOtp(phoneNumber);
      if (res.success) {
        setTimer(30);
      } else {
        setError(res.error || 'Could not resend OTP code');
      }
    } catch (e: any) {
      setError(e.message || 'Resend failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Security Shield Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🏢</Text>
          </View>

          <Text style={styles.cardTitle}>Verify Employer Mobile</Text>
          <Text style={styles.cardSubtitle}>
            Enter the 6-digit verification code sent to your registered hiring phone number.
          </Text>

          {/* Number Pill with Quick Edit */}
          <View style={styles.phonePillRow}>
            <View style={styles.phonePill}>
              <Text style={styles.flagText}>🇮🇳</Text>
              <Text style={styles.phoneText}>{maskedPhone}</Text>
            </View>
            <TouchableOpacity onPress={onChangePhone} activeOpacity={0.7} style={styles.editPhoneBtn}>
              <Text style={styles.editPhoneText}>Change ✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Segmented OTP Input */}
          <OtpInput
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              if (error) setError('');
            }}
            error={error}
            accentColor={COLORS.brand[700] || '#0f766e'}
          />

          <Button
            title={loading ? 'AUTHENTICATING...' : 'VERIFY & ACCESS PORTAL ➔'}
            onPress={handleVerify}
            loading={loading}
            size="lg"
            style={styles.verifyBtn}
          />

          {/* Resend & Timer */}
          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>
                  Resend code in <Text style={styles.timerCount}>00:{timer < 10 ? `0${timer}` : timer}</Text>
                </Text>
              </View>
            ) : (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7} style={styles.resendActiveBtn}>
                <Text style={styles.resendLink}>🔄 Resend OTP Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Security Guarantee */}
          <View style={styles.footerNotice}>
            <Text style={styles.footerText}>
              🔒 Enterprise security • Verified organization access
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
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS['2xl'] || 24,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  iconText: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.gray[900],
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  phonePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    marginBottom: SPACING.md,
    gap: 8,
  },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagText: {
    fontSize: 14,
  },
  phoneText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    letterSpacing: 0.5,
  },
  editPhoneBtn: {
    paddingLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gray[300],
  },
  editPhoneText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.brand[700] || '#0f766e',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  verifyBtn: {
    width: '100%',
    marginTop: SPACING.md,
  },
  resendContainer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  timerBadge: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.gray[100],
    borderRadius: RADIUS.full,
  },
  timerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  timerCount: {
    color: COLORS.brand[700] || '#0f766e',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  resendActiveBtn: {
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
  resendLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.brand[700] || '#0f766e',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  footerNotice: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: COLORS.gray[400],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
