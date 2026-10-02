import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  Button,
  Input,
  AuthService,
  AppLogo,
  DEFAULT_APP_VERSIONS,
} from '@gotechplace/shared';

export interface PhoneLoginScreenProps {
  onOtpRequested: (verificationId: string, formattedPhone: string) => void;
}

export const PhoneLoginScreen: React.FC<PhoneLoginScreenProps> = ({ onOtpRequested }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const appVersion = DEFAULT_APP_VERSIONS.student.latestVersion || '1.0.0';

  const handleSendOtp = async () => {
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await AuthService.sendOtp(cleanDigits);
      if (res.success && res.verificationId) {
        onOtpRequested(res.verificationId, res.formattedPhone);
      } else {
        setError(res.error || 'Failed to send OTP code. Please try again.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openLegal = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <AppLogo
            portalLabel="STUDENT PORTAL"
            size="md"
            subtitle="Empowering student projects, practical skills, and client career opportunities."
          />
        </View>

        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>🎓 Student Login</Text>
            </View>
            <Text style={styles.versionBadge}>v{appVersion}</Text>
          </View>

          <Text style={styles.cardTitle}>Welcome to GoTechPlace</Text>
          <Text style={styles.cardSubtitle}>
            Login to discover verified jobs, book engineering projects, and manage your opportunities.
          </Text>

          <Input
            label="Mobile Number"
            placeholder="Enter 10-digit mobile number"
            value={phone}
            onChangeText={(text) => {
              const digits = text.replace(/\D/g, '').slice(0, 10);
              setPhone(digits);
              if (error) setError('');
            }}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon={<Text style={styles.countryCode}>🇮🇳 +91</Text>}
            error={error}
          />

          <Button
            title={loading ? 'SENDING OTP...' : 'SEND VERIFICATION OTP ➔'}
            onPress={handleSendOtp}
            loading={loading}
            size="lg"
            style={styles.actionBtn}
          />

          <View style={styles.secureNotice}>
            <Text style={styles.secureText}>
              🔒 Secure phone-only authentication powered by Firebase Auth.
            </Text>
          </View>

          {/* Legal / Policy links */}
          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => openLegal('https://gotechplace.com/privacy')} activeOpacity={0.7}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity onPress={() => openLegal('https://gotechplace.com/terms')} activeOpacity={0.7}>
              <Text style={styles.legalLink}>Terms of Service</Text>
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
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS['2xl'] || 24,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    backgroundColor: COLORS.brand[50] || '#eff6ff',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.brand[200] || '#bfdbfe',
  },
  roleBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.brand[700],
  },
  versionBadge: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.gray[400],
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray[500],
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  countryCode: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.gray[700],
  },
  actionBtn: {
    marginTop: SPACING.sm,
    width: '100%',
  },
  secureNotice: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  secureText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: 8,
  },
  legalLink: {
    fontSize: 11,
    color: COLORS.gray[400],
    textDecorationLine: 'underline',
  },
  legalDot: {
    fontSize: 11,
    color: COLORS.gray[300],
  },
});
