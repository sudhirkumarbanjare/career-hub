import { User, UserRole, AccountStatus, DeviceToken } from '../types/user';
import { validatePhoneNumber, validateOtp } from '../utils/validation';
import { sendFirebasePhoneOtp, verifyFirebasePhoneOtp } from '../firebase/phoneAuth';

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
   * Request OTP for a phone number using Firebase Identity Toolkit
   */
  async sendOtp(phone: string, recaptchaToken?: string): Promise<SendOtpResult> {
    const check = validatePhoneNumber(phone);
    if (!check.isValid || !check.formatted) {
      return {
        success: false,
        verificationId: '',
        formattedPhone: phone,
        error: check.error || 'Invalid phone number format. Use 10-digit number or +91 format.',
      };
    }

    try {
      const fbRes = await sendFirebasePhoneOtp({
        phoneNumber: check.formatted,
        recaptchaToken,
      });

      if (!fbRes.success || !fbRes.sessionInfo) {
        return {
          success: false,
          verificationId: '',
          formattedPhone: check.formatted,
          error: fbRes.error || 'Failed to send OTP code via Firebase.',
        };
      }

      return {
        success: true,
        verificationId: fbRes.sessionInfo,
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
   * Verify OTP and load/create user session with Firebase Auth
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
      const fbVerify = await verifyFirebasePhoneOtp({
        sessionInfo: verificationId,
        code: otp,
      });

      if (!fbVerify.success || !fbVerify.uid) {
        return {
          success: false,
          error: fbVerify.error || 'Invalid OTP code. Please try again.',
        };
      }

      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      const uid = fbVerify.uid;

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
        isNewUser: fbVerify.isNewUser ?? true,
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
