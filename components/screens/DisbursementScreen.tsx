import React, { useState } from 'react';
import { Loan, User, ViewType } from '../../types';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

interface DisbursementScreenProps {
    loan: Loan;
    user: User;
    onNavigate: (view: ViewType) => void;
    onDisburse: (loanId: string, toAccountId: string) => Promise<void>;
}

const DisbursementScreen: React.FC<DisbursementScreenProps> = ({ loan, user, onNavigate, onDisburse }) => {
    const depositAccounts = user.accounts.filter(acc => acc.type === 'Checking' || acc.type === 'Savings');
    const [toAccountId, setToAccountId] = useState(depositAccounts[0]?.id || '');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleDisburse = async () => {
        if (!toAccountId) return;
        setLoading(true);
        await onDisburse(loan.id, toAccountId);
        setLoading(false);
        setDone(true);
    };

    if (loan.disbursed || done) {
        return (
            <div className="max-w-xl mx-auto py-8 text-center animate-in fade-in zoom-in-95 duration-700">
                <div className="bg-slate-900 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl space-y-8">
                    <span className="text-6xl block">🎉</span>
                    <h2 className="text-3xl font-black text-white tracking-tight">Funds Disbursed</h2>
                    <p id="disbursement_success_message" className="text-slate-400 text-sm font-medium">
                        ${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been credited to your account. Your {loan.type.toLowerCase()} loan is now active.
                    </p>
                    <Button onClick={() => onNavigate({ name: 'dashboard' })} className="!rounded-full px-10">Return to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-slate-900 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl space-y-10">
                <div className="space-y-1 text-center">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Fund <span className="text-slate-500 font-normal">Disbursement</span></h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Select Destination Account</p>
                </div>

                {loading ? (
                    <div className="py-16 flex flex-col items-center justify-center space-y-8">
                        <Spinner />
                        <h4 className="text-lg font-black text-white uppercase tracking-widest">Crediting Funds</h4>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-950/50 p-6 rounded-3xl border border-white/5 text-center">
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Approved Amount</p>
                            <p className="text-4xl font-black text-white tracking-tighter tabular-nums">${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="disbursementAccount" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Deposit To</label>
                            <select
                                id="disbursementAccount"
                                value={toAccountId}
                                onChange={e => setToAccountId(e.target.value)}
                                className="block w-full px-4 py-4 bg-slate-950 border border-white/5 rounded-2xl shadow-inner focus:outline-none focus:border-emerald-500/50 text-sm text-white font-medium appearance-none"
                            >
                                {depositAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.type} ({acc.accountNumber})</option>
                                ))}
                            </select>
                        </div>

                        <Button id="button_confirmDisbursement" onClick={handleDisburse} disabled={!toAccountId} fullWidth className="!rounded-full py-4 text-lg font-black italic uppercase tracking-tight">
                            Confirm Disbursement
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DisbursementScreen;
