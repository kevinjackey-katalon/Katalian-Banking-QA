import React, { useState } from 'react';
import { Payee, ViewType } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface PayeesScreenProps {
    payees: Payee[];
    onNavigate: (view: ViewType) => void;
    onAddPayee: (payee: Omit<Payee, 'id' | 'addedDate'>) => void;
    onDeletePayee: (payeeId: string) => void;
}

const emptyForm = { name: '', nickname: '', bankName: '', accountNumber: '', routingNumber: '' };

const PayeesScreen: React.FC<PayeesScreenProps> = ({ payees, onNavigate, onAddPayee, onDeletePayee }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [error, setError] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim() || !form.bankName.trim() || !form.accountNumber.trim() || !form.routingNumber.trim()) {
            setError('Please complete all required payee fields.');
            return;
        }
        if (!/^\d{4,17}$/.test(form.routingNumber.trim())) {
            setError('Routing number must be numeric (4-17 digits).');
            return;
        }
        onAddPayee({
            name: form.name.trim(),
            nickname: form.nickname.trim() || undefined,
            bankName: form.bankName.trim(),
            accountNumber: form.accountNumber.trim(),
            routingNumber: form.routingNumber.trim(),
        });
        setForm(emptyForm);
        setIsAdding(false);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <button
                        onClick={() => onNavigate({ name: 'dashboard' })}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors mb-2"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Back to Portfolio
                    </button>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Manage Payees</h2>
                    <p className="text-slate-400 max-w-2xl">Save external recipients once to send them money faster from the Payments screen.</p>
                </div>
                {!isAdding && (
                    <Button id="button_addPayee" onClick={() => setIsAdding(true)} className="!rounded-full px-8 shrink-0">+ Add New Payee</Button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} id="form_addPayee" className="bg-slate-900 border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-4">
                    {error && (
                        <div id="payee_error" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase text-center">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input id="payee_name" name="name" label="Payee Full Name" value={form.name} onChange={handleChange} required />
                        <Input id="payee_nickname" name="nickname" label="Nickname (optional)" value={form.nickname} onChange={handleChange} />
                    </div>
                    <Input id="payee_bankName" name="bankName" label="Payee's Bank Name" value={form.bankName} onChange={handleChange} required />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input id="payee_accountNumber" name="accountNumber" label="Account Number" value={form.accountNumber} onChange={handleChange} required />
                        <Input id="payee_routingNumber" name="routingNumber" label="Routing Number" value={form.routingNumber} onChange={handleChange} required />
                    </div>
                    <div className="flex gap-4 pt-2">
                        <Button type="button" variant="secondary" onClick={() => { setIsAdding(false); setForm(emptyForm); setError(''); }} className="!rounded-full px-8">Cancel</Button>
                        <Button id="button_savePayee" type="submit" className="flex-1 !rounded-full">Save Payee</Button>
                    </div>
                </form>
            )}

            <div className="bg-slate-900/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                {payees.length === 0 ? (
                    <div className="py-20 text-center text-slate-500 font-bold">No saved payees yet. Add one to get started.</div>
                ) : (
                    <ul className="divide-y divide-white/5">
                        {payees.map(payee => (
                            <li key={payee.id} data-payee-id={payee.id} className="flex items-center justify-between gap-6 px-8 py-6 hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl font-black text-emerald-400">
                                        {payee.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tight">{payee.name}</p>
                                        <p className="text-[11px] text-slate-500 font-bold">
                                            {payee.nickname ? `${payee.nickname} • ` : ''}{payee.bankName} • {payee.accountNumber}
                                        </p>
                                    </div>
                                </div>
                                {confirmDeleteId === payee.id ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase text-slate-500">Remove?</span>
                                        <Button variant="danger" className="!rounded-full px-4 py-2 text-[10px]" onClick={() => { onDeletePayee(payee.id); setConfirmDeleteId(null); }}>Confirm</Button>
                                        <Button variant="ghost" className="!rounded-full px-4 py-2 text-[10px]" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDeleteId(payee.id)}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors px-4 py-2"
                                    >
                                        Remove
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex justify-center">
                <Button variant="secondary" onClick={() => onNavigate({ name: 'transfer' })} className="!rounded-full px-10">Send Money to a Payee →</Button>
            </div>
        </div>
    );
};

export default PayeesScreen;
