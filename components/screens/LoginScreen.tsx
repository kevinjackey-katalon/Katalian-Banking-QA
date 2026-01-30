
import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { ViewType } from '../../types';

interface LoginScreenProps {
    onLogin: (username: string, password: string) => 'success' | 'locked' | 'invalid';
    onNavigate: (view: ViewType) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigate }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setTimeout(() => {
            const result = onLogin(username, password);
            setLoading(false);
            if (result === 'invalid') setError('Authentication failed. Check Secure ID and Code.');
            else if (result === 'locked') setError('Account locked for security reasons.');
        }, 1000);
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="w-full max-w-md space-y-12">
                <div className="text-center">
                    <div className="inline-flex p-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 mb-6">
                        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Katalian</h2>
                    <p className="text-slate-500 text-sm mt-3 font-medium">Private Banking & Asset Management</p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-8 md:p-10 rounded-[3rem] shadow-2xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase text-center">{error}</div>}
                        <div className="space-y-4">
                            <Input label="Secure ID" id="username" placeholder="USER_0000" value={username} onChange={e => setUsername(e.target.value)} required />
                            <Input label="Access Code" id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <Button type="submit" fullWidth disabled={loading} className="py-4 text-base font-black tracking-tight">
                            {loading ? 'Authorizing...' : 'Enter Vault Access'}
                        </Button>
                        <button type="button" onClick={() => onNavigate({name:'resetPassword'})} className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors">
                            Lost Access Credentials?
                        </button>
                    </form>
                </div>
                <p className="text-center text-[10px] text-slate-700 uppercase font-black tracking-[0.4em]">Protected by AES-256</p>
            </div>
        </div>
    );
};

export default LoginScreen;
