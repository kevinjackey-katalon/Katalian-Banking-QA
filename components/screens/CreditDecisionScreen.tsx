import React from 'react';
import { Loan, ViewType } from '../../types';
import Button from '../common/Button';

interface CreditDecisionScreenProps {
    loan: Loan;
    onNavigate: (view: ViewType) => void;
}

const DECISION_STYLES: Record<string, { badge: string; icon: string; title: string }> = {
    Approved: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '✅', title: 'Application Approved' },
    Referred: { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: '🕵️', title: 'Referred for Manual Review' },
    Declined: { badge: 'bg-red-500/10 text-red-400 border-red-500/20', icon: '⛔', title: 'Application Declined' },
};

const CreditDecisionScreen: React.FC<CreditDecisionScreenProps> = ({ loan, onNavigate }) => {
    const decision = loan.decision || 'Referred';
    const style = DECISION_STYLES[decision];

    return (
        <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-slate-900 border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>

                <div className="relative z-10 space-y-8">
                    <span className="text-6xl block">{style.icon}</span>
                    <div className="space-y-2">
                        <p id="credit_decision_badge" className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${style.badge}`}>
                            {decision}
                        </p>
                        <h2 className="text-3xl font-black text-white tracking-tight">{style.title}</h2>
                    </div>

                    <div className="bg-slate-950/50 p-8 rounded-3xl border border-white/5 text-left space-y-5">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loan Type</span>
                            <span className="text-sm font-bold text-white">{loan.type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Requested Amount</span>
                            <span className="text-sm font-bold text-white tabular-nums">${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Risk Score</span>
                            <span id="credit_risk_score" className="text-sm font-bold text-white tabular-nums">{loan.riskScore ?? '—'}/100</span>
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <p id="credit_decision_reason" className="text-xs text-slate-400 font-medium leading-relaxed">{loan.decisionReason}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                        {decision === 'Approved' ? (
                            <Button id="button_proceedToDisbursement" onClick={() => onNavigate({ name: 'disbursement', loanId: loan.id })} className="!rounded-full px-10 py-4 text-base font-black">
                                Proceed to Disbursement →
                            </Button>
                        ) : (
                            <Button onClick={() => onNavigate({ name: 'contact' })} variant="secondary" className="!rounded-full px-10">
                                {decision === 'Referred' ? 'Contact Underwriting Team' : 'Speak with an Advisor'}
                            </Button>
                        )}
                        <Button variant="ghost" onClick={() => onNavigate({ name: 'dashboard' })} className="!rounded-full px-10">Return to Dashboard</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditDecisionScreen;
