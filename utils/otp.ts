/**
 * Demo/QA two-factor authentication helper.
 *
 * Design goals for this mock banking app:
 *  1. Zero setup for team members — no real phone number, email inbox, or
 *     authenticator app is required to exercise the MFA flow.
 *  2. Fully automatable in Katalon Studio — the current OTP is written to
 *     localStorage AND rendered on screen (behind a clearly labeled "Demo
 *     Mode" panel) with a stable id/data-testid, so a test can read it with
 *     either WebUI.getText(findTestObject('Object Repository/.../lbl_demoOtpCode'))
 *     or WebUI.executeJavaScript("return localStorage.getItem('katalian_otp_v1')", null).
 *
 * This intentionally is NOT a production MFA implementation (no SMS/email
 * gateway, no TOTP secret exchange). See README.md "Two-Factor Authentication"
 * section for guidance on swapping in a real provider later.
 */

const OTP_STORAGE_KEY = 'katalian_otp_v1';
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface StoredOtp {
    code: string;
    userId: string;
    expiresAt: number;
    attemptsRemaining: number;
}

const generateSixDigitCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateAndStoreOtp = (userId: string): StoredOtp {
    const otp: StoredOtp = {
        code: generateSixDigitCode(),
        userId,
        expiresAt: Date.now() + OTP_TTL_MS,
        attemptsRemaining: 5,
    };
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otp));
    return otp;
};

export const getStoredOtp = (): StoredOtp | null => {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as StoredOtp;
    } catch {
        return null;
    }
};

export const clearStoredOtp = (): void => {
    localStorage.removeItem(OTP_STORAGE_KEY);
};

export type OtpVerifyResult = 'success' | 'expired' | 'invalid' | 'locked' | 'no-code';

export const verifyOtp = (userId: string, submittedCode: string): OtpVerifyResult => {
    const stored = getStoredOtp();
    if (!stored || stored.userId !== userId) return 'no-code';
    if (Date.now() > stored.expiresAt) return 'expired';
    if (stored.attemptsRemaining <= 0) return 'locked';

    if (stored.code === submittedCode.trim()) {
        clearStoredOtp();
        return 'success';
    }

    stored.attemptsRemaining -= 1;
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(stored));
    return stored.attemptsRemaining <= 0 ? 'locked' : 'invalid';
};

const TRUSTED_DEVICE_KEY_PREFIX = 'katalian_trusted_device_';

export const isDeviceTrusted = (userId: string): boolean => {
    return localStorage.getItem(`${TRUSTED_DEVICE_KEY_PREFIX}${userId}`) === 'true';
};

export const setDeviceTrusted = (userId: string, trusted: boolean): void => {
    if (trusted) {
        localStorage.setItem(`${TRUSTED_DEVICE_KEY_PREFIX}${userId}`, 'true');
    } else {
        localStorage.removeItem(`${TRUSTED_DEVICE_KEY_PREFIX}${userId}`);
    }
};
