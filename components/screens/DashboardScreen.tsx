
import React from 'react';
import { User, ViewType, Account } from '../../types';
import Button from '../common/Button';

interface DashboardScreenProps {
    user: User;
    onNavigate: (view: ViewType) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, onNavigate }) => {
    const totalBalance = user.accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const applicationOptions: { label: string; type: Account['type']; icon: string; requiresPlatinum: boolean }[] = [
        { label: 'Checking', type: 'Checking', icon: '💳', requiresPlatinum: false },
        { label: 'Savings', type: 'Savings', icon: '💰', requiresPlatinum: false },
        { label: 'Credit', type: 'Credit Card', icon: '💳', requiresPlatinum: false },
        { label: 'Platinum', type: 'Platinum Credit Card', icon: '💎', requiresPlatinum: true },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Total Balance Hero */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-4">Net Liquidity</p>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter tabular-nums flex items-baseline gap-2">
                                <span className="text-emerald-500 text-3xl md:text-4xl font-normal">$</span>
                                {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h2>
                            <div className="flex gap-4 mt-6">
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Active Assets</span>
                                <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">Member since 2021</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => onNavigate({name:'transfer'})} variant="primary" className="!rounded-full px-8">Move Funds</Button>
                            <Button onClick={() => onNavigate({name:'deposit'})} variant="secondary" className="!rounded-full px-8">Deposit</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Account List */}
                <div className="lg:col-span-8 space-y-8">
                    <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        Accounts & Cards
                        <span className="w-12 h-[1px] bg-slate-800"></span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {user.accounts.map(acc => {
                            const isFrozen = acc.status === 'Frozen';
                            return (
                                <div 
                                    key={acc.id} 
                                    onClick={() => !isFrozen && onNavigate({name: 'accountDetails', accountId: acc.id})}
                                    className={`group border rounded-3xl p-7 transition-all shadow-lg relative overflow-hidden ${
                                        isFrozen 
                                        ? 'bg-slate-950 border-red-500/20 cursor-not-allowed opacity-75' 
                                        : 'bg-slate-900/50 border-white/5 hover:bg-slate-900 hover:border-emerald-500/30 cursor-pointer active:scale-[0.98]'
                                    }`}
                                >
                                    {isFrozen && (
                                        <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[2px] flex items-center justify-center z-10">
                                            <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Frozen</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                            {acc.type === 'Checking' ? '💳' : acc.type === 'Savings' ? '💰' : acc.type === 'Credit Card' ? '💳' : '💎'}
                                        </div>
                                        <span className="font-mono text-[10px] text-slate-500 tracking-widest">{acc.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{acc.type}</p>
                                            <p className="text-3xl font-black text-white tabular-nums">${acc.balance.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                                        </div>
                                        {!isFrozen && (
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity mb-1">View Ledger →</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                            Apply for New Products
                            <span className="w-12 h-[1px] bg-slate-800"></span>
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {applicationOptions.map(opt => {
                                if (opt.requiresPlatinum && !user.canApplyForPlatinum) return null;
                                return (
                                    <button 
                                        key={opt.type}
                                        onClick={() => onNavigate({ name: 'apply', for: opt.type })}
                                        className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl text-center hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all group"
                                    >
                                        <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">{opt.icon}</span>
                                        <p className="text-xs font-black uppercase tracking-tighter text-slate-400 group-hover:text-emerald-400">{opt.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Asset Management</h4>
                        <div className="space-y-4">
                                    <QuickLink label="Document Library" icon="📚" onClick={() => onNavigate({name: 'documentLibrary'})} />
                           <QuickLink label="Request Lending" icon="🏛️" onClick={() => onNavigate({name: 'loans'})} />
                           <QuickLink 
                                label="Freeze All Cards" 
                                icon="❄️" 
                                onClick={() => onNavigate({name: 'security', action: 'freeze-all'})} 
                           />
                           <QuickLink label="Fraud Reporting" icon="🛡️" onClick={() => onNavigate({name: 'contact'})} />
                           <QuickLink label="Help Center" icon="📞" onClick={() => onNavigate({name:'contact'})} />
                        </div>
                    </section>

                    <div className="bg-emerald-500 rounded-[2.5rem] p-10 relative overflow-hidden group cursor-pointer shadow-[0_20px_40px_rgba(16,185,129,0.2)]" onClick={() => onNavigate({name:'loans'})}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <h4 className="text-slate-950 font-black text-2xl mb-3 leading-tight">Mortgage Rates dropped to 5.2%</h4>
                        <p className="text-slate-900/60 text-sm font-bold mb-6">Exclusive refinancing options for existing Katalian members.</p>
                        <span className="text-slate-950 font-black text-xs uppercase tracking-widest bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm group-hover:bg-white/40 transition-colors">Apply Today →</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickLink: React.FC<{label: string, icon: string, onClick?: () => void}> = ({ label, icon, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-5 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group border border-transparent hover:border-white/5">
        <div className="flex items-center gap-4">
            <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-sm font-bold text-slate-300 group-hover:text-white">{label}</span>
        </div>
        <svg className="w-4 h-4 text-slate-600 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
);

export default DashboardScreen;
