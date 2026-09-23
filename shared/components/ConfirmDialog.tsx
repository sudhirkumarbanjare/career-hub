import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING, RADIUS, SHADOWS } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { Button } from './Button';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  requireReason?: boolean;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  requireReason = false,
  reasonPlaceholder = 'Enter reason...',
  onConfirm,
  onCancel,
  loading = false,
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
        <View style={styles.dialogCard}>
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
              size="sm"
              disabled={loading}
              style={styles.btn}
            />
            <Button
              title={confirmText}
              onPress={handleConfirm}
              variant={isDestructive ? 'danger' : 'primary'}
              size="sm"
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
    backgroundColor: COLORS.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  dialogCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 380,
    ...SHADOWS.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  reasonContainer: {
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
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  btn: {
    minWidth: 90,
  },
});
