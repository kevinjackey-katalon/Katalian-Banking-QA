import React, { useEffect, useMemo, useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { generateAndStoreOtp, verifyOtp, setDeviceTrusted, OtpVerifyResult } from '../../utils/otp';

interface TwoFactorScreenProps {
    userId: string;
    username: string;
    onVerified: (rememberDevice: boolean) => void;
    onCancel: () => void;
}

const RESULT_MESSAGES: Record<OtpVerifyResult, string> = {
    success: '',
    expired: 'That code has expired. A new one has been generated below.',
    invalid: 'Incorrect code. Please try again.',
    locked: 'Too many incorrect attempts. Request a new code to continue.',
    'no-code': 'No active code found. Request a new one below.',
};

const TwoFactorScreen: React.FC<TwoFactorScreenProps> = ({ userId, username, onVerified, onCancel }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberDevice, setRememberDevice] = useState(false);
    const [otpCode, setOtpCode] = useState<string>('');

    // Generate a fresh code the moment this screen mounts (i.e. right after password auth succeeds).
    useEffect(() => {
        const otp = generateAndStoreOtp(userId);
        setOtpCode(otp.code);
    }, [userId]);

    const maskedContact = useMemo(() => `${username.slice(0, 2)}•••@katalian-demo.bank`, [username]);

    const handleResend = () => {
        const otp = generateAndStoreOtp(userId);
        setOtpCode(otp.code);
        setError('');
        setCode('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setTimeout(() => {
            const result = verifyOtp(userId, code);
            setLoading(false);
            if (result === 'success') {
                if (rememberDevice) setDeviceTrusted(userId, true);
                onVerified(rememberDevice);
                return;
            }
            setError(RESULT_MESSAGES[result]);
            if (result === 'expired' || result === 'locked') {
                const otp = generateAndStoreOtp(userId);
                setOtpCode(otp.code);
            }
            setCode('');
        }, 700);
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-10">
                <div className="text-center">
                    <div className="inline-flex p-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 mb-6">
                        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Two-Factor Check</h2>
                    <p className="text-slate-500 text-sm mt-3 font-medium">
                        Enter the 6-digit verification code sent to <span className="text-slate-300">{maskedContact}</span>
                    </p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-8 md:p-10 rounded-[3rem] shadow-2xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div id="otp_error" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase text-center">
                                {error}
                            </div>
                        )}
                        <Input
                            label="Verification Code"
                            id="otp_code"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="000000"
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                            className="text-center text-2xl tracking-[0.5em] font-black"
                        />

                        <label className="flex items-center gap-3 px-1 cursor-pointer">
                            <input
                                id="checkbox_rememberDevice"
                                type="checkbox"
                                checked={rememberDevice}
                                onChange={e => setRememberDevice(e.target.checked)}
                                className="w-4 h-4 rounded accent-emerald-500"
                            />
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Remember this device for 30 days</span>
                        </label>

                        <Button id="button_verifyOtp" type="submit" fullWidth disabled={loading || code.length !== 6} className="py-4 text-base font-black tracking-tight">
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </Button>

                        <div className="flex items-center justify-between pt-2">
                            <button type="button" onClick={onCancel} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                                Cancel
                            </button>
                            <button id="button_resendOtp" type="button" onClick={handleResend} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors">
                                Resend Code
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- Demo / QA Mode panel -------------------------------------------------
                    This app has no real SMS or email gateway wired up. To keep the MFA flow
                    usable by every team member (no phone number required) and trivially
                    automatable in Katalon Studio, the current one-time code is shown here.
                    Katalon can read it via:
                      - WebUI.getText(findTestObject('.../lbl_demoOtpCode'))  -- id="demo_otp_code"
                      - WebUI.executeJavaScript("return localStorage.getItem('katalian_otp_v1')", null)
                   ---------------------------------------------------------------------------- */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Demo Mode — No SMS Gateway Connected</p>
                    <p className="text-[11px] text-slate-400 font-medium">Your one-time code (visible here so QA and teammates don't need a real phone):</p>
                    <p id="demo_otp_code" className="text-3xl font-black text-white tracking-[0.4em] tabular-nums">{otpCode}</p>
                </div>

                <p className="text-center text-[10px] text-slate-700 uppercase font-black tracking-[0.4em]">Protected by AES-256</p>
            </div>
        </div>
    );
};

export default TwoFactorScreen;
