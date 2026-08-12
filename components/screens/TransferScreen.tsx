import React, { useState, useMemo } from 'react';
import { User, ViewType, Account, Payee } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface TransferScreenProps {
    user: User;
    onNavigate: (view: ViewType) => void;
    onTransfer: (fromAccountId: string, toAccountId: string, amount: number) => void;
    onPayeeTransfer: (fromAccountId: string, payeeId: string, amount: number) => void;
}

type TransferMode = 'internal' | 'payee';

const TransferScreen: React.FC<TransferScreenProps> = ({ user, onNavigate, onTransfer, onPayeeTransfer }) => {
    const [mode, setMode] = useState<TransferMode>('internal');

    // Source must be a deposit account (Checking or Savings)
    const sourceAccounts = useMemo(() => user.accounts.filter(acc => acc.type === 'Checking' || acc.type === 'Savings'), [user.accounts]);

    // Recipient can be ANY account (Checking, Savings, OR Credit Card)
    const recipientAccounts = useMemo(() => user.accounts, [user.accounts]);
    const payees = user.payees || [];

    const initialFromId = sourceAccounts[0]?.id || '';
    const initialToId = recipientAccounts.find(acc => acc.id !== initialFromId)?.id || '';

    const [fromAccountId, setFromAccountId] = useState(initialFromId);
    const [toAccountId, setToAccountId] = useState(initialToId);
    const [payeeId, setPayeeId] = useState(payees[0]?.id || '');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    const fromAccount = useMemo(() => sourceAccounts.find(acc => acc.id === fromAccountId), [sourceAccounts, fromAccountId]);
    const toAccount = useMemo(() => recipientAccounts.find(acc => acc.id === toAccountId), [recipientAccounts, toAccountId]);
    const selectedPayee = useMemo(() => payees.find(p => p.id === payeeId), [payees, payeeId]);

    const isCreditPayment = mode === 'internal' && toAccount?.type.includes('Credit Card');

    const handleModeChange = (newMode: TransferMode) => {
        setMode(newMode);
        setError('');
        setIsConfirming(false);
    };

    const handleFromAccountChange = (newFromId: string) => {
        setFromAccountId(newFromId);
        if (mode === 'internal' && newFromId === toAccountId) {
            const fallback = recipientAccounts.find(acc => acc.id !== newFromId);
            if (fallback) setToAccountId(fallback.id);
        }
    };

    const handleReview = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const transferAmount = parseFloat(amount);

        if (!fromAccountId) {
            setError('Please select an origin facility.');
            return;
        }
        if (mode === 'internal' && !toAccountId) {
            setError('Please select a destination facility.');
            return;
        }
        if (mode === 'internal' && fromAccountId === toAccountId) {
            setError('Self-transfer to identical facility is prohibited.');
            return;
        }
        if (mode === 'payee' && !payeeId) {
            setError('Please select a payee, or add one first.');
            return;
        }
        if (isNaN(transferAmount) || transferAmount <= 0) {
            setError('Valid capital amount required.');
            return;
        }
        if (fromAccount && transferAmount > fromAccount.balance) {
            setError('Insufficient liquidity in origin facility.');
            return;
        }

        setIsConfirming(true);
    };

    const handleConfirm = () => {
        const transferAmount = parseFloat(amount);
        if (mode === 'internal') {
            onTransfer(fromAccountId, toAccountId, transferAmount);
        } else {
            onPayeeTransfer(fromAccountId, payeeId, transferAmount);
        }
    };

    const SelectAccount: React.FC<{ id: string, label: string, value: string, options: Account[], onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ id, label, value, options, onChange }) => (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{label}</label>
            <div className="relative">
                <select
                    id={id}
                    value={value}
                    onChange={onChange}
                    className="block w-full px-4 py-4 bg-slate-950 border border-white/5 rounded-2xl shadow-inner focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm text-white font-medium appearance-none"
                >
                    <option value="" disabled>Select facility...</option>
                    {options.map(acc => (
                        <option key={acc.id} value={acc.id}>
                            {acc.type} ({acc.accountNumber}) — ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
            </div>
        </div>
    );

    const SelectPayee: React.FC<{ value: string, options: Payee[], onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ value, options, onChange }) => (
        <div className="space-y-2">
            <label htmlFor="payeeAccount" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Recipient Payee</label>
            <div className="relative">
                <select
                    id="payeeAccount"
                    value={value}
                    onChange={onChange}
                    className="block w-full px-4 py-4 bg-slate-950 border border-white/5 rounded-2xl shadow-inner focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm text-white font-medium appearance-none"
                >
                    <option value="" disabled>Select payee...</option>
                    {options.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name}{p.nickname ? ` (${p.nickname})` : ''} — {p.bankName} {p.accountNumber}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-slate-900 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            {mode === 'payee' ? 'Payee' : isCreditPayment ? 'Credit' : 'Asset'} <span className="text-slate-500 font-normal">{mode === 'payee' ? 'Payment' : isCreditPayment ? 'Liquidation' : 'Movement'}</span>
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                            {isConfirming ? 'Final Authorization' : mode === 'payee' ? 'External Payee Payment' : isCreditPayment ? 'Payment Facility' : 'Internal Transfer'}
                        </p>
                    </div>
                    <button onClick={() => onNavigate({ name: 'dashboard' })} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {!isConfirming && (
                    <div id="transferModeToggle" className="flex gap-2 mb-10 relative z-10 bg-slate-950/50 p-1.5 rounded-full border border-white/5">
                        <button
                            id="button_modeInternal"
                            type="button"
                            onClick={() => handleModeChange('internal')}
                            className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'internal' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
                        >
                            My Accounts
                        </button>
                        <button
                            id="button_modePayee"
                            type="button"
                            onClick={() => handleModeChange('payee')}
                            className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'payee' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
                        >
                            Pay a Payee
                        </button>
                    </div>
                )}

                {isConfirming ? (
                    <div className="space-y-10 relative z-10 animate-in fade-in zoom-in-95">
                        <div className="bg-slate-950/50 p-8 rounded-3xl border border-white/5 space-y-6 shadow-inner">
                            <div className="text-center pb-6 border-b border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Amount to Send</p>
                                <p className="text-5xl font-black text-white tracking-tighter tabular-nums">${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Origin Facility</p>
                                        <p className="text-sm font-bold text-white">{fromAccount?.type} <span className="text-slate-500 font-mono text-xs">{fromAccount?.accountNumber}</span></p>
                                    </div>
                                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <div className="space-y-1 text-right">
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">{mode === 'payee' ? 'Payee' : 'Recipient Facility'}</p>
                                        {mode === 'payee' ? (
                                            <p className="text-sm font-bold text-white">{selectedPayee?.name} <span className="text-slate-500 font-mono text-xs">{selectedPayee?.accountNumber}</span></p>
                                        ) : (
                                            <p className="text-sm font-bold text-white">{toAccount?.type} <span className="text-slate-500 font-mono text-xs">{toAccount?.accountNumber}</span></p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button onClick={() => setIsConfirming(false)} variant="secondary" className="px-10 !rounded-full">Back</Button>
                            <Button id="button_authorizeTransfer" onClick={handleConfirm} className="flex-1 !rounded-full py-4 text-lg font-black italic uppercase tracking-tight">
                                Authorize {mode === 'payee' ? 'Payment' : isCreditPayment ? 'Payment' : 'Transfer'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleReview} className="space-y-8 relative z-10">
                        {error && (
                            <div id="transfer_error" className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase text-center animate-in shake">
                                {error}
                            </div>
                        )}

                        <SelectAccount id="fromAccount" label="Origin Liquidity" value={fromAccountId} options={sourceAccounts} onChange={(e) => handleFromAccountChange(e.target.value)} />

                        <div className="relative h-1">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 border border-white/5 rounded-full flex items-center justify-center text-emerald-500 z-10">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>

                        {mode === 'internal' ? (
                            <SelectAccount id="toAccount" label={isCreditPayment ? "Credit Facility Recipient" : "Recipient Facility"} value={toAccountId} options={recipientAccounts} onChange={(e) => setToAccountId(e.target.value)} />
                        ) : payees.length === 0 ? (
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center space-y-4">
                                <p className="text-sm text-slate-400 font-medium">You haven't saved any payees yet.</p>
                                <Button type="button" variant="secondary" onClick={() => onNavigate({ name: 'payees' })} className="!rounded-full px-8">Add a Payee</Button>
                            </div>
                        ) : (
                            <>
                                <SelectPayee value={payeeId} options={payees} onChange={(e) => setPayeeId(e.target.value)} />
                                <button type="button" onClick={() => onNavigate({ name: 'payees' })} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors">
                                    + Manage Payees
                                </button>
                            </>
                        )}

                        {isCreditPayment && toAccount && (
                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl animate-in slide-in-from-top-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Indebtedness</p>
                                        <p className="text-2xl font-black text-white tabular-nums">${toAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Credit Limit</p>
                                        <p className="text-sm font-bold text-slate-400">$10,000.00</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAmount("25.00")}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all border border-transparent hover:border-white/5"
                                    >
                                        Min Payment ($25)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAmount(toAccount.balance.toString())}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all border border-transparent hover:border-white/5"
                                    >
                                        Pay Full Balance
                                    </button>
                                </div>
                            </div>
                        )}

                        <Input
                            id="amount"
                            label="Liquid Capital Amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            step="0.01"
                            min="0.01"
                            required
                            className="text-2xl font-black tabular-nums tracking-tighter"
                        />

                        <div className="flex gap-4 pt-6">
                            <Button type="button" onClick={() => onNavigate({ name: 'dashboard' })} variant="ghost" className="px-8 !rounded-full">Cancel</Button>
                            <Button id="button_reviewTransfer" type="submit" className="flex-1 !rounded-full py-4 text-lg font-black italic uppercase tracking-tight">Review Protocol</Button>
                        </div>
                    </form>
                )}
            </div>

            <p className="mt-8 text-center text-[10px] text-slate-700 uppercase font-black tracking-[0.4em]">Secure Ledger Protocol Active</p>
        </div>
    );
};

export default TransferScreen;
