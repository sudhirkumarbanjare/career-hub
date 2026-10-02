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

export interface ClientPhoneLoginScreenProps {
  onOtpRequested: (verificationId: string, phone: string) => void;
}

export const ClientPhoneLoginScreen: React.FC<ClientPhoneLoginScreenProps> = ({
  onOtpRequested,
}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const appVersion = DEFAULT_APP_VERSIONS.client.latestVersion || '1.0.0';

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
      setError(e.message || 'An error occurred.');
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
            portalLabel="CLIENT & EMPLOYER PORTAL"
            size="md"
            subtitle="Hire skilled engineering students and sponsor innovative real-world projects."
          />
        </View>

        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>🏢 Employer Login</Text>
            </View>
            <Text style={styles.versionBadge}>v{appVersion}</Text>
          </View>

          <Text style={styles.cardTitle}>Welcome to GoTechPlace</Text>
          <Text style={styles.cardSubtitle}>
            Login to post jobs, manage candidate applications, and hire engineering talent.
          </Text>

          <Input
            label="Employer Phone Number"
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
            title={loading ? 'SENDING OTP...' : 'SEND LOGIN OTP ➔'}
            onPress={handleSendOtp}
            loading={loading}
            size="lg"
            style={styles.actionBtn}
          />

          <View style={styles.secureNotice}>
            <Text style={styles.secureText}>
              🔒 Secure phone authentication powered by Firebase Auth.
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
    backgroundColor: '#f0fdf4',
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  roleBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: '#15803d',
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
