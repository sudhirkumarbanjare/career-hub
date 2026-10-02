import React, { useState } from 'react';
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

export interface AdminOtpScreenProps {
  verificationId?: string;
  phoneNumber: string;
  onOtpVerified?: (user: User) => void;
  onSuccess?: (user: User) => void;
  onChangePhone?: () => void;
  onBack?: () => void;
}

export const AdminOtpScreen: React.FC<AdminOtpScreenProps> = ({
  verificationId = 'mock_verification_id',
  phoneNumber,
  onOtpVerified,
  onSuccess,
  onChangePhone,
  onBack,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const maskedPhone = maskPhoneNumber(phoneNumber);

  const handleVerify = async () => {
    const cleanOtp = otp.replace(/\D/g, '').slice(0, 6);
    if (cleanOtp.length !== 6) {
      setError('Please enter valid 6-digit administrative security code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await AuthService.verifyOtp(verificationId, cleanOtp, phoneNumber, 'superuser');
      if (res.success && res.user) {
        const accessCheck = AuthService.checkAccountAccess(res.user, 'admin');
        if (!accessCheck.allowed) {
          setError(accessCheck.reason || 'Access denied: Not an administrative account.');
          return;
        }
        onOtpVerified?.(res.user);
        onSuccess?.(res.user);
      } else {
        setError(res.error || 'Invalid admin OTP security code.');
      }
    } catch (e: any) {
      setError(e.message || 'Administrative verification failed');
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
          {/* Admin Shield Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🛡️</Text>
          </View>

          <Text style={styles.cardTitle}>Superuser Verification</Text>
          <Text style={styles.cardSubtitle}>
            Administrative 2-Factor Authentication required for console access.
          </Text>

          {/* Admin Phone Pill */}
          <View style={styles.phonePillRow}>
            <View style={styles.phonePill}>
              <Text style={styles.flagText}>🇮🇳</Text>
              <Text style={styles.phoneText}>{maskedPhone}</Text>
            </View>
            <TouchableOpacity onPress={onChangePhone || onBack} activeOpacity={0.7} style={styles.editPhoneBtn}>
              <Text style={styles.editPhoneText}>Change ✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Segmented OTP Input */}
          <OtpInput
            value={otp}
            onChangeText={(t) => {
              setOtp(t);
              if (error) setError('');
            }}
            error={error}
            accentColor="#6366f1"
          />

          <Button
            title={loading ? 'AUTHENTICATING...' : 'VERIFY & UNLOCK CONSOLE ➔'}
            onPress={handleVerify}
            loading={loading}
            size="lg"
            style={styles.verifyBtn}
          />

          <TouchableOpacity onPress={onChangePhone || onBack} activeOpacity={0.7} style={styles.changeBtn}>
            <Text style={styles.changeText}>Cancel / Switch Admin Account</Text>
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={styles.footerNotice}>
            <Text style={styles.footerText}>
              🔒 Encrypted 256-Bit Administrative Gateway
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
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: RADIUS['2xl'] || 24,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#312e81',
    borderWidth: 2,
    borderColor: '#6366f1',
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
    color: '#f8fafc',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  phonePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#334155',
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
    color: '#f1f5f9',
    letterSpacing: 0.5,
  },
  editPhoneBtn: {
    paddingLeft: 6,
    borderLeftWidth: 1,
    borderLeftColor: '#475569',
  },
  editPhoneText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#818cf8',
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  verifyBtn: {
    width: '100%',
    marginTop: SPACING.md,
  },
  changeBtn: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  changeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#94a3b8',
    textDecorationLine: 'underline',
  },
  footerNotice: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    width: '100%',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
