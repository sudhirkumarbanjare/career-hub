import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING, RADIUS, SHADOWS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { Button } from './Button';

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  loading?: boolean;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  icon?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  requireReason = false,
  reasonPlaceholder = 'Enter reason...',
  loading = false,
  onConfirm,
  onCancel,
  icon,
}) => {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      setReasonError('Please provide a reason to continue');
      return;
    }
    setReasonError('');
    onConfirm(reason.trim());
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    setReasonError('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.dialogCard}>
          <View style={[styles.iconContainer, isDestructive ? styles.iconDanger : styles.iconPrimary]}>
            <Text style={styles.iconText}>
              {icon || (isDestructive ? '🗑️' : '❓')}
            </Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {requireReason ? (
            <View style={styles.reasonContainer}>
              <TextInput
                value={reason}
                onChangeText={(text) => {
                  setReason(text);
                  if (reasonError) setReasonError('');
                }}
                placeholder={reasonPlaceholder}
                placeholderTextColor={COLORS.gray[400]}
                multiline
                numberOfLines={3}
                style={[
                  styles.reasonInput,
                  reasonError ? styles.reasonInputError : null,
                ]}
              />
              {reasonError ? (
                <Text style={styles.errorText}>{reasonError}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            <Button
              title={cancelText}
              onPress={handleCancel}
              variant="outline"
              size="md"
              disabled={loading}
              style={styles.btn}
            />
            <Button
              title={confirmText}
              onPress={handleConfirm}
              variant={isDestructive ? 'danger' : 'primary'}
              size="md"
              loading={loading}
              style={styles.btn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  iconPrimary: {
    backgroundColor: COLORS.brand[50],
  },
  iconDanger: {
    backgroundColor: COLORS.danger[50],
  },
  iconText: {
    fontSize: 24,
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
  reasonContainer: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[900],
    minHeight: 64,
    textAlignVertical: 'top',
  },
  reasonInputError: {
    borderColor: COLORS.danger[500],
  },
  errorText: {
    color: COLORS.danger[600],
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 4,
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
