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
  Button,
  Input,
  AuthService,
  RbacService,
  User,
} from '@tech2place/shared';

export interface AdminOtpScreenProps {
  verificationId: string;
  phoneNumber: string;
  onOtpVerified: (user: User) => void;
  onChangePhone: () => void;
}

export const AdminOtpScreen: React.FC<AdminOtpScreenProps> = ({
  verificationId,
  phoneNumber,
  onOtpVerified,
  onChangePhone,
}) => {
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await AuthService.verifyOtp(verificationId, otp, phoneNumber, 'superuser');
      if (res.success && res.user) {
        // Enforce RBAC access check on the client as well as server
        const accessCheck = AuthService.checkAccountAccess(res.user, 'admin');
        if (!accessCheck.allowed) {
          setError(accessCheck.reason || 'Access denied: Not an administrative account.');
          return;
        }
        onOtpVerified(res.user);
      } else {
        setError(res.error || 'Invalid admin OTP code.');
      }
    } catch (e: any) {
      setError(e.message || 'Verification failed');
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
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verify Security Code</Text>
          <Text style={styles.cardSubtitle}>
            Administrative code sent to <Text style={styles.highlightPhone}>{phoneNumber}</Text>
          </Text>

          <Input
            label="6-Digit Admin Passcode"
            placeholder="123456"
            value={otp}
            onChangeText={(t) => {
              setOtp(t);
              if (error) setError('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            error={error}
            inputStyle={styles.otpInput}
          />

          <Button
            title="VERIFY & UNLOCK CONSOLE"
            onPress={handleVerify}
            loading={loading}
            size="lg"
            style={styles.verifyBtn}
          />

          <TouchableOpacity onPress={onChangePhone} activeOpacity={0.7} style={styles.changeBtn}>
            <Text style={styles.changeText}>Cancel / Use another number</Text>
          </TouchableOpacity>
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
    padding: SPACING.xl,
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
    marginBottom: SPACING.xl,
  },
  highlightPhone: {
    color: COLORS.brand[700],
    fontWeight: 'bold',
  },
  otpInput: {
    letterSpacing: 6,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  verifyBtn: {
    marginTop: SPACING.sm,
  },
  changeBtn: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  changeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    textDecorationLine: 'underline',
  },
});
