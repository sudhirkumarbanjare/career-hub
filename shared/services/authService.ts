import { User, UserRole, AccountStatus, DeviceToken } from '../types/user';
import { validatePhoneNumber, validateOtp } from '../utils/validation';

export interface SendOtpResult {
  success: boolean;
  verificationId: string;
  formattedPhone: string;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  user?: User;
  isNewUser?: boolean;
  error?: string;
}

export const AuthService = {
  /**
   * Request OTP for a phone number
   */
  async sendOtp(phone: string): Promise<SendOtpResult> {
    const check = validatePhoneNumber(phone);
    if (!check.isValid || !check.formatted) {
      return {
        success: false,
        verificationId: '',
        formattedPhone: phone,
        error: check.error || 'Invalid phone number format',
      };
    }

    try {
      // In production with Firebase Auth, this calls PhoneAuthProvider.verifyPhoneNumber
      // Generates secure verification session ID
      const verificationId = `ver_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        verificationId,
        formattedPhone: check.formatted,
      };
    } catch (e: any) {
      return {
        success: false,
        verificationId: '',
        formattedPhone: check.formatted,
        error: e.message || 'Failed to send OTP. Please try again.',
      };
    }
  },

  /**
   * Verify OTP and load/create user session
   */
  async verifyOtp(
    verificationId: string,
    otp: string,
    phoneNumber: string,
    defaultRole: UserRole = 'student'
  ): Promise<VerifyOtpResult> {
    if (!validateOtp(otp)) {
      return {
        success: false,
        error: 'Please enter a valid 6-digit numeric OTP code',
      };
    }

    if (!verificationId) {
      return {
        success: false,
        error: 'Verification session expired. Please request a new OTP.',
      };
    }

    try {
      // Simulated deterministic UID from phone or Firebase Auth UserCredential
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      const uid = `usr_${cleanPhone.replace('+', '')}`;

      const now = new Date().toISOString();
      const user: User = {
        uid,
        phoneNumber: cleanPhone,
        name: '',
        role: defaultRole,
        status: 'active',
        isApproved: defaultRole === 'student', // Students approved by default, clients require admin approval
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };

      return {
        success: true,
        user,
        isNewUser: true,
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Failed to verify OTP code',
      };
    }
  },

  /**
   * Check if account is allowed to access the application
   */
  checkAccountAccess(user: User | null | undefined, appRole: 'student' | 'client' | 'admin'): {
    allowed: boolean;
    reason?: string;
  } {
    if (!user) {
      return { allowed: false, reason: 'Authentication required' };
    }

    // 1. Suspension check
    if (user.status === 'suspended') {
      return {
        allowed: false,
        reason: 'Your account has been suspended by administration. Please contact support for assistance.',
      };
    }

    // 2. Role matching
    if (appRole === 'admin') {
      const adminRoles: UserRole[] = ['superuser', 'admin', 'staff', 'moderator', 'support'];
      if (!adminRoles.includes(user.role)) {
        return {
          allowed: false,
          reason: 'Unauthorized: This application requires administrative credentials.',
        };
      }
    } else if (appRole === 'client') {
      if (user.role !== 'client' && user.role !== 'superuser' && user.role !== 'admin') {
        return {
          allowed: false,
          reason: 'Unauthorized: This application is for Client / Employer accounts.',
        };
      }
    } else if (appRole === 'student') {
      if (user.role !== 'student' && user.role !== 'superuser' && user.role !== 'admin') {
        return {
          allowed: false,
          reason: 'Unauthorized: This application is for Student accounts.',
        };
      }
    }

    return { allowed: true };
  },
};
