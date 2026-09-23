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

export interface OtpScreenProps {
  verificationId: string;
  phoneNumber: string;
  onOtpVerified: (user: User) => void;
  onChangePhone: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({
  verificationId,
  phoneNumber,
  onOtpVerified,
  onChangePhone,
}) => {
  const [otp, setOtp] = useState('123456'); // Pre-fill mock test OTP
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
      const res = await AuthService.verifyOtp(verificationId, otp, phoneNumber, 'student');
      if (res.success && res.user) {
        onOtpVerified(res.user);
      } else {
        setError(res.error || 'Invalid OTP code. Please try again.');
      }
    } catch (e: any) {
      setError(e.message || 'Verification failed');
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
        setError(res.error || 'Could not resend OTP');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verify Mobile OTP</Text>
          <Text style={styles.cardSubtitle}>
            Enter the 6-digit verification code sent to{' '}
            <Text style={styles.highlightPhone}>{phoneNumber}</Text>
          </Text>

          <Input
            label="6-Digit Verification Code"
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
            title="VERIFY & CONTINUE"
            onPress={handleVerify}
            loading={loading}
            size="lg"
            style={styles.verifyBtn}
          />

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendLink}>Resend OTP Code</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={onChangePhone} activeOpacity={0.7} style={styles.changePhoneBtn}>
              <Text style={styles.changePhoneText}>Change Mobile Number</Text>
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
    lineHeight: 20,
    marginBottom: SPACING.xl,
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
  changePhoneBtn: {
    marginTop: SPACING.md,
  },
  changePhoneText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    textDecorationLine: 'underline',
  },
});
