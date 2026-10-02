import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING, RADIUS, SHADOWS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { Button } from './Button';
import { OtpInput } from './OtpInput';
import { User, UserRole } from '../types/user';
import { AccountDeletionService } from '../services/accountDeletionService';

export interface AccountDeletionModalProps {
  visible: boolean;
  user: User;
  onClose: () => void;
  onDeletionSuccess: () => void;
  onDataCleanup?: (uid: string, role: UserRole) => Promise<void> | void;
}

export const AccountDeletionModal: React.FC<AccountDeletionModalProps> = ({
  visible,
  user,
  onClose,
  onDeletionSuccess,
  onDataCleanup,
}) => {
  const [step, setStep] = useState<'warning' | 'otp' | 'processing' | 'error'>('warning');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [errorMessage, setErrorMessage] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setStep('warning');
      setOtp('');
      setErrorMessage('');
      setResendTimer(30);
    }
  }, [visible]);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((t) => (t > 0 ? t - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleStartOtp = () => {
    const res = AccountDeletionService.requestDeletionOtp(user);
    if (res.success) {
      if (res.testOtp) {
        setDemoOtpHint(res.testOtp);
      }
      setResendTimer(30);
      setStep('otp');
    } else {
      setErrorMessage(res.message);
      setStep('error');
    }
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const res = AccountDeletionService.requestDeletionOtp(user);
    if (res.success) {
      if (res.testOtp) setDemoOtpHint(res.testOtp);
      setResendTimer(30);
      setErrorMessage('');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleConfirmDeletion = async () => {
    if (!otp || otp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setStep('processing');
    setErrorMessage('');

    try {
      const result = await AccountDeletionService.executeSelfDeletion(
        user,
        otp,
        onDataCleanup
      );

      if (result.success) {
        onDeletionSuccess();
      } else {
        setErrorMessage(result.error || result.message || 'Deletion failed.');
        setStep('error');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unexpected error occurred during deletion.');
      setStep('error');
    }
  };

  const isStudent = user.role === 'student';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={step === 'processing' ? undefined : onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogCard}>
          {/* STEP 1: WARNING */}
          {step === 'warning' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInside}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🗑️</Text>
              </View>

              <Text style={styles.title}>Delete {isStudent ? 'Student' : 'Employer'} Account</Text>
              <Text style={styles.warningTag}>THIS ACTION IS PERMANENT AND CANNOT BE UNDONE</Text>

              <View style={styles.impactBox}>
                <Text style={styles.impactHeading}>What will happen when you delete:</Text>
                <Text style={styles.impactItem}>
                  • Your {isStudent ? 'student academic profile' : 'organization & company profile'} will be permanently erased.
                </Text>
                <Text style={styles.impactItem}>
                  • All {isStudent ? 'job applications, resumes, and course enrollments' : 'posted jobs, applicant reviews, and company listings'} will be closed and removed.
                </Text>
                <Text style={styles.impactItem}>
                  • Registered devices ({user.phoneNumber}) and push notification tokens will be deleted.
                </Text>
                <Text style={styles.impactItem}>
                  • You will be immediately signed out on all active devices.
                </Text>
              </View>

              <View style={styles.securityNoticeBox}>
                <Text style={styles.securityNoticeText}>
                  🔒 <Text style={{ fontWeight: 'bold' }}>Security Requirement:</Text> Fresh OTP verification is required to confirm identity before account eradication.
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <Button
                  title="Cancel"
                  onPress={onClose}
                  variant="outline"
                  size="md"
                  style={styles.btn}
                />
                <Button
                  title="Continue to Verify →"
                  onPress={handleStartOtp}
                  variant="danger"
                  size="md"
                  style={styles.btn}
                />
              </View>
            </ScrollView>
          )}

          {/* STEP 2: FRESH OTP VERIFICATION */}
          {step === 'otp' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInside}>
              <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                <Text style={styles.iconText}>🔐</Text>
              </View>

              <Text style={styles.title}>Confirm Your Identity</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit verification code sent to{'\n'}
                <Text style={{ fontWeight: 'bold', color: COLORS.gray[900] }}>{user.phoneNumber}</Text>
              </Text>

              {demoOtpHint && (
                <View style={styles.demoHintBox}>
                  <Text style={styles.demoHintText}>Test Verification OTP: {demoOtpHint}</Text>
                </View>
              )}

              <View style={styles.otpContainer}>
                <OtpInput
                  length={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>

              {errorMessage ? (
                <Text style={styles.errorInlineText}>{errorMessage}</Text>
              ) : null}

              <View style={styles.resendRow}>
                {resendTimer > 0 ? (
                  <Text style={styles.resendCountdown}>Resend OTP in {resendTimer}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Text style={styles.resendAction}>Resend Verification Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.buttonRow}>
                <Button
                  title="Back"
                  onPress={() => setStep('warning')}
                  variant="ghost"
                  size="md"
                  style={styles.btn}
                />
                <Button
                  title="DELETE ACCOUNT PERMANENTLY"
                  onPress={handleConfirmDeletion}
                  variant="danger"
                  size="md"
                  style={styles.btn}
                />
              </View>
            </ScrollView>
          )}

          {/* STEP 3: PROCESSING */}
          {step === 'processing' && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={COLORS.danger[500]} style={{ marginBottom: SPACING.base }} />
              <Text style={styles.title}>Erasing Account Data...</Text>
              <Text style={styles.message}>
                Safely removing profile, cloud storage assets, device tokens, and authentication records. Please do not close the app.
              </Text>
            </View>
          )}

          {/* STEP 4: ERROR */}
          {step === 'error' && (
            <View style={styles.processingContainer}>
              <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
                <Text style={styles.iconText}>⚠️</Text>
              </View>
              <Text style={styles.title}>Deletion Unsuccessful</Text>
              <Text style={styles.message}>{errorMessage || 'An error occurred during verification.'}</Text>
              <View style={styles.buttonRow}>
                <Button
                  title="Close"
                  onPress={onClose}
                  variant="outline"
                  size="md"
                  style={styles.btn}
                />
                <Button
                  title="Try Again"
                  onPress={() => setStep('warning')}
                  variant="primary"
                  size="md"
                  style={styles.btn}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  dialogCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '88%',
    ...SHADOWS.lg,
  },
  scrollInside: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  warningTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.danger[600],
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  impactBox: {
    width: '100%',
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.md,
  },
  impactHeading: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[800],
    marginBottom: 4,
  },
  impactItem: {
    fontSize: 11,
    color: COLORS.gray[600],
    lineHeight: 16,
    marginVertical: 2,
  },
  securityNoticeBox: {
    width: '100%',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  securityNoticeText: {
    fontSize: 11,
    color: '#1e40af',
    lineHeight: 16,
  },
  otpContainer: {
    width: '100%',
    marginVertical: SPACING.sm,
    alignItems: 'center',
  },
  demoHintBox: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  demoHintText: {
    fontSize: 11,
    color: '#065f46',
    fontWeight: 'bold',
  },
  errorInlineText: {
    fontSize: 11,
    color: COLORS.danger[600],
    fontWeight: '600',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  resendRow: {
    marginVertical: SPACING.xs,
    alignItems: 'center',
  },
  resendCountdown: {
    fontSize: 11,
    color: COLORS.gray[400],
  },
  resendAction: {
    fontSize: 11,
    color: COLORS.brand[600],
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  btn: {
    flex: 1,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
});
