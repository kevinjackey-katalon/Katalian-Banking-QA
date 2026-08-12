import React, { useMemo, useState } from 'react';
import { User, Loan, ViewType } from '../../types';
import { LOAN_PRODUCTS } from '../../constants';
import Button from '../common/Button';
import Input from '../common/Input';

interface LoansScreenProps {
    user: User;
    onNavigate: (view: ViewType) => void;
    onRepayLoan: (loanId: string, fromAccountId: string, amount: number) => Promise<void>;
}

const STATUS_BADGES: Record<Loan['status'], { label: string; classes: string }> = {
    Pending: { label: 'Pending', classes: 'bg-white/5 text-slate-400 border-white/10' },
    Approved: { label: 'Awaiting Disbursement', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    Referred: { label: 'Under Review', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    Declined: { label: 'Declined', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
    Active: { label: 'Active', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    'Paid Off': { label: 'Paid in Full', classes: 'bg-slate-500/10 text-slate-300 border-slate-500/20' },
};

const LoansScreen: React.FC<LoansScreenProps> = ({ user, onNavigate, onRepayLoan }) => {
    const loans = user.loans || [];
    const depositAccounts = useMemo(() => user.accounts.filter(acc => acc.type === 'Checking' || acc.type === 'Savings'), [user.accounts]);

    const [payingLoanId, setPayingLoanId] = useState<string | null>(null);
    const [repayAccountId, setRepayAccountId] = useState(depositAccounts[0]?.id || '');
    const [repayAmount, setRepayAmount] = useState('');
    const [repayError, setRepayError] = useState('');
    const [repaying, setRepaying] = useState(false);

    const outstandingTotal = loans.reduce((sum, loan) => sum + (loan.status === 'Active' ? (loan.outstandingBalance ?? loan.amount) : 0), 0);

    const openPaymentForm = (loan: Loan) => {
        setPayingLoanId(loan.id);
        setRepayAccountId(depositAccounts[0]?.id || '');
        setRepayAmount('');
        setRepayError('');
    };

    const closePaymentForm = () => {
        setPayingLoanId(null);
        setRepayError('');
    };

    const handleSubmitPayment = async (loan: Loan) => {
        setRepayError('');
        const outstanding = loan.outstandingBalance ?? loan.amount;
        const amount = parseFloat(repayAmount);
        const account = depositAccounts.find(acc => acc.id === repayAccountId);

        if (!account) {
            setRepayError('Please select an account to pay from.');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            setRepayError('Enter a valid payment amount.');
            return;
        }
        if (amount > outstanding + 0.005) {
            setRepayError(`Payment cannot exceed the outstanding balance of $${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`);
            return;
        }
        if (amount > account.balance) {
            setRepayError('Insufficient funds in the selected account.');
            return;
        }

        setRepaying(true);
        await onRepayLoan(loan.id, repayAccountId, amount);
        setRepaying(false);
        closePaymentForm();
    };

    return (
        <div className="space-y-16 animate-in fade-in duration-700">
            {/* --- Your Loans -------------------------------------------------------- */}
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white tracking-tighter">Your Loans</h2>
                        <p className="text-slate-400">Outstanding balances across every facility, with repayment on demand.</p>
                    </div>
                    {outstandingTotal > 0 && (
                        <div className="bg-slate-900/60 border border-white/5 rounded-3xl px-8 py-5 text-right shrink-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Total Outstanding</p>
                            <p id="total_outstanding_balance" className="text-3xl font-black text-white tabular-nums">${outstandingTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    )}
                </div>

                {loans.length === 0 ? (
                    <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] py-16 text-center text-slate-500 font-bold">
                        You don't have any loan applications yet. Explore the facilities below to get started.
                    </div>
                ) : (
                    <div id="your_loans_list" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loans.map(loan => {
                            const badge = STATUS_BADGES[loan.status];
                            const outstanding = loan.outstandingBalance ?? (loan.status === 'Active' ? loan.amount : 0);
                            const isPaying = payingLoanId === loan.id;

                            return (
                                <div key={loan.id} data-loan-id={loan.id} className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 space-y-6 shadow-xl">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tight">{loan.type} Loan</h3>
                                            <p className="text-[11px] text-slate-500 font-bold">{loan.termMonths} months • {loan.interestRate}% APR</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${badge.classes}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Original Principal</p>
                                            <p className="text-lg font-bold text-white tabular-nums">${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Outstanding Balance</p>
                                            <p className="text-lg font-bold tabular-nums text-white loan-outstanding-balance">
                                                {loan.status === 'Active' || loan.status === 'Paid Off' ? `$${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                                            </p>
                                        </div>
                                    </div>

                                    {loan.status === 'Active' && !isPaying && (
                                        <Button id={`button_makePayment_${loan.id}`} onClick={() => openPaymentForm(loan)} fullWidth className="!rounded-full">Make a Payment</Button>
                                    )}
                                    {loan.status === 'Approved' && (
                                        <Button onClick={() => onNavigate({ name: 'disbursement', loanId: loan.id })} fullWidth variant="secondary" className="!rounded-full">Complete Disbursement</Button>
                                    )}
                                    {(loan.status === 'Referred' || loan.status === 'Declined') && (
                                        <Button onClick={() => onNavigate({ name: 'creditDecision', loanId: loan.id })} fullWidth variant="ghost" className="!rounded-full">View Decision</Button>
                                    )}

                                    {isPaying && (
                                        <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-6 space-y-5 animate-in fade-in slide-in-from-top-2">
                                            {repayError && (
                                                <div id="repayment_error" className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-[10px] font-black uppercase text-center">
                                                    {repayError}
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Pay From</label>
                                                <select
                                                    id={`select_repayAccount_${loan.id}`}
                                                    value={repayAccountId}
                                                    onChange={e => setRepayAccountId(e.target.value)}
                                                    className="block w-full px-4 py-3 bg-slate-950 border border-white/5 rounded-2xl text-sm text-white font-medium outline-none focus:border-emerald-500/50"
                                                >
                                                    {depositAccounts.map(acc => (
                                                        <option key={acc.id} value={acc.id}>{acc.type} ({acc.accountNumber}) — ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Input
                                                id={`input_repayAmount_${loan.id}`}
                                                label="Payment Amount ($)"
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={repayAmount}
                                                onChange={e => setRepayAmount(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setRepayAmount(outstanding.toFixed(2))}
                                                className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
                                            >
                                                Pay Full Balance (${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                                            </button>
                                            <div className="flex gap-3 pt-1">
                                                <Button type="button" variant="secondary" onClick={closePaymentForm} className="!rounded-full px-6" disabled={repaying}>Cancel</Button>
                                                <Button id={`button_confirmPayment_${loan.id}`} type="button" onClick={() => handleSubmitPayment(loan)} disabled={repaying} className="flex-1 !rounded-full">
                                                    {repaying ? 'Processing...' : 'Confirm Payment'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- Explore new products ----------------------------------------------- */}
            <div className="space-y-8">
                <div className="text-center max-w-3xl mx-auto space-y-6">
                    <h2 className="text-5xl font-black text-white tracking-tighter">Private Credit Solutions</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">Sophisticated lending for your primary residence, luxury vehicles, or personal capital requirements.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {LOAN_PRODUCTS.map((loan) => (
                        <div key={loan.type} className="bg-slate-900/50 rounded-[2rem] border border-white/5 p-10 flex flex-col justify-between hover:bg-slate-900 transition-all shadow-2xl group border-transparent hover:border-emerald-500/20">
                            <div>
                                <span className="text-6xl mb-8 block group-hover:scale-110 transition-transform origin-left">{loan.icon}</span>
                                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{loan.type}</h3>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">{loan.description}</p>

                                <div className="bg-white/5 p-6 rounded-3xl mb-10 border border-white/5">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Rates from</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-emerald-500 tracking-tighter tabular-nums">{loan.rate}</span>
                                        <span className="text-xs font-black text-emerald-500/50 uppercase">APR</span>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={() => onNavigate({ name: 'applyLoan', loanType: loan.type as any })} fullWidth className="py-4">Apply for Funding</Button>
                        </div>
                    ))}
                </div>

                <div className="bg-emerald-500/10 rounded-[2.5rem] p-12 border border-emerald-500/20 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full translate-y-1/2"></div>
                    <div className="relative z-10 space-y-4">
                        <h4 className="text-white text-2xl font-black tracking-tight">Need a custom lending solution?</h4>
                        <p className="text-slate-400 max-w-xl mx-auto font-medium">Contact our wealth management team for commercial facilities or high-limit liquidity lines.</p>
                        <div className="pt-4">
                            <Button variant="secondary" className="px-10 border-white/20 hover:border-emerald-500/50" onClick={() => onNavigate({ name: 'contact' })}>Contact Asset Division</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoansScreen;
