import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../theme';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  accentColor?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChangeText,
  error,
  disabled = false,
  autoFocus = true,
  accentColor = COLORS.brand[600],
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const cleanDigits = value.replace(/\D/g, '').slice(0, length);

  const handleBoxPress = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const digits = Array.from({ length }, (_, index) => cleanDigits[index] || '');

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={handleBoxPress} style={styles.cellsContainer}>
        {digits.map((digit, index) => {
          const isCurrentActive = isFocused && (index === cleanDigits.length || (index === length - 1 && cleanDigits.length === length));
          const isFilled = digit.length > 0;
          const hasError = !!error;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                isFilled && styles.cellFilled,
                isCurrentActive && [styles.cellActive, { borderColor: accentColor }],
                hasError && styles.cellError,
              ]}
            >
              {digit ? (
                <Text style={[styles.digitText, hasError && styles.digitTextError]}>
                  {digit}
                </Text>
              ) : isCurrentActive ? (
                <View style={[styles.cursor, { backgroundColor: accentColor }]} />
              ) : (
                <Text style={styles.placeholderDash}>•</Text>
              )}
            </View>
          );
        })}
      </Pressable>

      {/* Hidden real input for accessibility and native keyboard handling */}
      <TextInput
        ref={inputRef}
        value={cleanDigits}
        onChangeText={(text) => {
          const formatted = text.replace(/\D/g, '').slice(0, length);
          onChangeText(formatted);
        }}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        editable={!disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.hiddenInput}
        caretHidden
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: SPACING.md,
    alignItems: 'center',
    width: '100%',
  },
  cellsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  cell: {
    width: 46,
    height: 54,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cellFilled: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.brand[400],
  },
  cellActive: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cellError: {
    borderColor: COLORS.danger[500],
    backgroundColor: '#fef2f2',
  },
  digitText: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[900],
  },
  digitTextError: {
    color: COLORS.danger[600],
  },
  cursor: {
    width: 2,
    height: 24,
    borderRadius: 1,
  },
  placeholderDash: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: COLORS.gray[300],
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    opacity: 0.01,
  },
  errorText: {
    color: COLORS.danger[600],
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
