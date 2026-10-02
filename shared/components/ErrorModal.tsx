import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING, RADIUS, SHADOWS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { Button } from './Button';

export interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose?: () => void;
  onDismiss?: () => void;
  onRetry?: () => void;
  icon?: string;
}

export function sanitizeErrorMessage(rawMessage: string): string {
  if (!rawMessage) return 'An unexpected issue occurred. Please try again.';
  const msg = rawMessage.toLowerCase();
  
  if (msg.includes('auth/invalid-verification-code') || msg.includes('invalid otp')) {
    return 'Invalid verification code. Please check and try again.';
  }
  if (msg.includes('auth/code-expired') || msg.includes('otp expired')) {
    return 'The verification code has expired. Please request a new one.';
  }
  if (msg.includes('auth/too-many-requests') || msg.includes('quota exceeded')) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  if (msg.includes('network') || msg.includes('internet') || msg.includes('offline') || msg.includes('timeout')) {
    return 'Network connection issue. Please check your internet and try again.';
  }
  if (msg.includes('permission-denied') || msg.includes('insufficient permissions')) {
    return 'You do not have permission to perform this action.';
  }
  if (msg.includes('not-found') || msg.includes('document does not exist')) {
    return 'The requested resource could not be found.';
  }
  if (msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
    return 'Invalid credentials. Please verify your details.';
  }
  if (msg.includes('undefined') || msg.includes('null') || msg.includes('uncaught') || msg.includes('stacktrace')) {
    return 'Something went wrong while processing your request. Please try again.';
  }

  // If message looks clean, return it, otherwise fallback
  if (rawMessage.length > 140 && (rawMessage.includes('at ') || rawMessage.includes('Error:'))) {
    return 'We encountered an error processing your request. Please try again.';
  }

  return rawMessage;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = 'Something went wrong',
  message,
  buttonText = 'Close',
  onClose,
  onDismiss,
  onRetry,
  icon = '⚠️',
}) => {
  const friendlyMessage = sanitizeErrorMessage(message);

  const handleClose = () => {
    if (onDismiss) {
      onDismiss();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.dialogCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{friendlyMessage}</Text>

          <View style={styles.buttonRow}>
            {onRetry && (
              <Button
                title="Try Again"
                onPress={() => {
                  handleClose();
                  onRetry();
                }}
                variant="primary"
                size="md"
                style={styles.btn}
              />
            )}
            <Button
              title={buttonText}
              onPress={handleClose}
              variant={onRetry ? 'outline' : 'danger'}
              size="md"
              style={styles.btn}
            />
          </View>
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
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.danger[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  btn: {
    flex: 1,
  },
});
