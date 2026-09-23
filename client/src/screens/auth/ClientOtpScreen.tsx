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
  Button,
  Input,
  AuthService,
  User,
} from '@tech2place/shared';

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
  const [otp, setOtp] = useState('123456');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await AuthService.verifyOtp(verificationId, otp, phoneNumber, 'client');
      if (res.success && res.user) {
        onOtpVerified(res.user);
      } else {
        setError(res.error || 'Invalid OTP code.');
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
          <Text style={styles.cardTitle}>Verify Client Mobile</Text>
          <Text style={styles.cardSubtitle}>
            Enter the 6-digit code sent to <Text style={styles.highlightPhone}>{phoneNumber}</Text>
          </Text>

          <Input
            label="Verification Code"
            placeholder="123456"
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              if (error) setError('');
            }}
            keyboardType="number-pad"
            maxLength={6}
            error={error}
            inputStyle={styles.otpInput}
          />

          <Button
            title="VERIFY & SIGN IN"
            onPress={handleVerify}
            loading={loading}
            size="lg"
            style={styles.verifyBtn}
          />

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend code in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={() => setTimer(30)} activeOpacity={0.7}>
                <Text style={styles.resendLink}>Resend OTP Code</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={onChangePhone} activeOpacity={0.7} style={styles.changeBtn}>
              <Text style={styles.changeText}>Use different number</Text>
            </TouchableOpacity>
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
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  highlightPhone: {
    color: COLORS.brand[700],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  otpInput: {
    letterSpacing: 6,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
  },
  verifyBtn: {
    marginTop: SPACING.sm,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  timerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[400],
  },
  resendLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.brand[600],
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  changeBtn: {
    marginTop: SPACING.md,
  },
  changeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    textDecorationLine: 'underline',
  },
});
