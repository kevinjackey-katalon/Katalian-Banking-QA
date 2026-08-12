import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, Outlet, useParams } from 'react-router-dom';
import { User, Account, ApplicationData, Loan, LoanApplicationData, ViewType, Payee, Transaction } from './types';
import { USERS } from './constants';
import LoginScreen from './components/screens/LoginScreen';
import TwoFactorScreen from './components/screens/TwoFactorScreen';
import DashboardScreen from './components/screens/DashboardScreen';
import PasswordResetScreen from './components/screens/PasswordResetScreen';
import TransferScreen from './components/screens/TransferScreen';
import PayeesScreen from './components/screens/PayeesScreen';
import ApplicationScreen from './components/screens/ApplicationScreen';
import LoanApplicationScreen from './components/screens/LoanApplicationScreen';
import LoansScreen from './components/screens/LoansScreen';
import CreditDecisionScreen from './components/screens/CreditDecisionScreen';
import DisbursementScreen from './components/screens/DisbursementScreen';
import ContactScreen from './components/screens/ContactScreen';
import SecurityScreen from './components/screens/SecurityScreen';
import DepositScreen from './components/screens/DepositScreen';
import AccountDetailsScreen from './components/screens/AccountDetailsScreen';
import DocumentLibraryScreen from './components/screens/DocumentLibraryScreen';
import AdminScreen from './components/screens/AdminScreen';
import Header from './components/common/Header';
import AiAssistant from './components/common/AiAssistant';
import { mockApi } from './api/mockApi';
import { isDeviceTrusted } from './utils/otp';

const STORAGE_KEYS = {
    USERS: 'katalian_users_v1',
    SESSION: 'katalian_session_v1'
};

/**
 * Records saved to localStorage before certain fields existed (Payees, loan
 * repayment tracking, etc.) won't have every field on the current shape.
 * Loading that raw JSON back in leaves those fields `undefined`, which
 * crashes any screen that calls .map/.find/.length on them (e.g. Manage
 * Payees rendering blank). Normalize on every load so the app is always
 * working with a well-formed User/Loan, and that well-formed shape is what
 * gets persisted going forward.
 */
const normalizeLoan = (loan: Loan): Loan => ({
    ...loan,
    // Loans disbursed before `outstandingBalance` existed are assumed to still owe
    // the full original principal (we have no repayment history to reconstruct).
    outstandingBalance: loan.outstandingBalance ?? (loan.status === 'Active' ? loan.amount : 0),
});

const normalizeUser = (user: User): User => ({
    ...user,
    payees: user.payees ?? [],
    loans: (user.loans ?? []).map(normalizeLoan),
});

const ApplicationScreenWrapper: React.FC<{
    user: User, 
    onSubmit: (appData: ApplicationData, accountType: Account['type']) => void
}> = ({ user, onSubmit }) => {
    const { accountType: accountTypeFromUrl } = useParams<{ accountType: string }>();
    const navigate = useNavigate();
    const accountType = accountTypeFromUrl ? decodeURIComponent(accountTypeFromUrl) as Account['type'] : undefined;
    const validAccountTypes: Account['type'][] = ['Checking', 'Savings', 'Credit Card', 'Platinum Credit Card'];
    
    if (!accountType || !validAccountTypes.includes(accountType)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <ApplicationScreen 
        user={user} 
        accountType={accountType} 
        onNavigate={(view) => {
            if (view.name === 'dashboard') navigate('/dashboard');
        }} 
        onSubmit={onSubmit} 
    />;
}

const LoanApplicationWrapper: React.FC<{
    user: User,
    onSubmit: (loanData: LoanApplicationData, type: Loan['type']) => void
}> = ({ user, onSubmit }) => {
    const { loanType } = useParams<{ loanType: string }>();
    const navigate = useNavigate();
    const type = loanType ? decodeURIComponent(loanType) as Loan['type'] : undefined;
    if (!type) return <Navigate to="/loans" replace />;
    return <LoanApplicationScreen user={user} loanType={type} onNavigate={() => navigate('/loans')} onSubmit={onSubmit} />;
}

const SecurityScreenWrapper: React.FC<{
    user: User,
    onActionComplete: (action: 'report' | 'lockdown' | 'freeze-all') => void
}> = ({ user, onActionComplete }) => {
    const { action } = useParams<{ action: string }>();
    const navigate = useNavigate();
    const validAction = (action === 'report' || action === 'lockdown' || action === 'freeze-all') ? action : 'report';
    
    return <SecurityScreen 
        user={user} 
        action={validAction} 
        onNavigate={(view) => {
            if (view.name === 'dashboard') navigate('/dashboard');
            if (view.name === 'contact') navigate('/contact');
        }}
        onActionComplete={onActionComplete}
    />;
}

const AccountDetailsWrapper: React.FC<{ user: User }> = ({ user }) => {
    const { accountId } = useParams<{ accountId: string }>();
    const navigate = useNavigate();
    const account = user.accounts.find(a => a.id === accountId);
    if (!account) return <Navigate to="/dashboard" replace />;

    return <AccountDetailsScreen 
        account={account} 
        onNavigate={(view) => {
            if (view.name === 'dashboard') navigate('/dashboard');
        }} 
    />;
}

const CreditDecisionWrapper: React.FC<{ user: User }> = ({ user }) => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    const loan = user.loans.find(l => l.id === loanId);
    if (!loan) return <Navigate to="/loans" replace />;

    return <CreditDecisionScreen
        loan={loan}
        onNavigate={(view) => {
            if (view.name === 'dashboard') navigate('/dashboard');
            if (view.name === 'contact') navigate('/contact');
            if (view.name === 'disbursement') navigate(`/disburse/${view.loanId}`);
        }}
    />;
}

const DisbursementWrapper: React.FC<{
    user: User,
    onDisburse: (loanId: string, toAccountId: string) => Promise<void>
}> = ({ user, onDisburse }) => {
    const { loanId } = useParams<{ loanId: string }>();
    const navigate = useNavigate();
    const loan = user.loans.find(l => l.id === loanId);
    if (!loan || loan.decision !== 'Approved') return <Navigate to="/dashboard" replace />;

    return <DisbursementScreen
        loan={loan}
        user={user}
        onDisburse={onDisburse}
        onNavigate={(view) => {
            if (view.name === 'dashboard') navigate('/dashboard');
        }}
    />;
}

const App: React.FC = () => {
    // Account/transaction data persists across visits (localStorage).
    const [users, setUsers] = useState<User[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.USERS);
        const parsed: User[] = saved ? JSON.parse(saved) : USERS;
        return parsed.map(normalizeUser);
    });
    // The logged-in session itself does NOT persist across visits: sessionStorage is
    // cleared when the browser tab/window closes, so a fresh visit always requires login.
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const saved = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        return saved ? normalizeUser(JSON.parse(saved)) : null;
    });
    const [pendingUser, setPendingUser] = useState<User | null>(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }, [users]);

    // Persist session on change (sessionStorage only -- see note above)
    useEffect(() => {
        if (currentUser) {
            sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(currentUser));
        } else {
            sessionStorage.removeItem(STORAGE_KEYS.SESSION);
        }
    }, [currentUser]);

    const handleNavigate = useCallback((view: ViewType) => {
        switch (view.name) {
            case 'login': navigate('/login'); break;
            case 'verifyOtp': navigate('/verify-otp'); break;
            case 'dashboard': navigate('/dashboard'); break;
            case 'documentLibrary': navigate('/document-library'); break;
            case 'transfer': navigate('/transfer'); break;
            case 'deposit': navigate('/deposit'); break;
            case 'payees': navigate('/payees'); break;
            case 'resetPassword': navigate('/reset-password'); break;
            case 'contact': navigate('/contact'); break;
            case 'loans': navigate('/loans'); break;
            case 'accountDetails': navigate(`/account/${view.accountId}`); break;
            case 'security': navigate(`/security/${view.action}`); break;
            case 'apply': navigate(`/apply/${encodeURIComponent(view.for)}`); break;
            case 'applyLoan': navigate(`/apply-loan/${encodeURIComponent(view.loanType)}`); break;
            case 'creditDecision': navigate(`/loan-decision/${view.loanId}`); break;
            case 'disbursement': navigate(`/disburse/${view.loanId}`); break;
        }
    }, [navigate]);

    const handleLogin = (username: string, password: string): 'success' | 'locked' | 'invalid' => {
        const user = users.find(u => u.username === username);
        if (!user) return 'invalid';
        if (user.locked) return 'locked';
        if (user.passwordHash !== password) return 'invalid';

        if (isDeviceTrusted(user.id)) {
            setCurrentUser(user);
            navigate('/dashboard');
        } else {
            setPendingUser(user);
            navigate('/verify-otp');
        }
        return 'success';
    };

    const handleOtpVerified = useCallback((_rememberDevice: boolean) => {
        if (!pendingUser) return;
        setCurrentUser(pendingUser);
        setPendingUser(null);
        navigate('/dashboard');
    }, [pendingUser, navigate]);

    const handleOtpCancel = useCallback(() => {
        setPendingUser(null);
        navigate('/login');
    }, [navigate]);

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        setPendingUser(null);
        navigate('/login');
    }, [navigate]);

    const handleSecurityAction = (action: 'report' | 'lockdown' | 'freeze-all') => {
        if (!currentUser) return;
        
        if (action === 'lockdown') {
            const updatedUser = { ...currentUser, locked: true };
            setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
            handleLogout();
        } else if (action === 'freeze-all') {
            const updatedAccounts = currentUser.accounts.map(acc => 
                (acc.type.includes('Card') || acc.type === 'Checking') ? { ...acc, status: 'Frozen' as const } : acc
            );
            const updatedUser = { ...currentUser, accounts: updatedAccounts };
            setCurrentUser(updatedUser);
            setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
            navigate('/dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    const handleApplicationSubmit = async (appData: ApplicationData, accountType: Account['type']) => {
        if (!currentUser) return;
        const newAccount = await mockApi.submitApplication(currentUser.id, appData, accountType);
        const updatedUser = { ...currentUser, accounts: [...currentUser.accounts, newAccount] };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        navigate('/dashboard');
    };

    const handleLoanSubmit = async (loanData: LoanApplicationData, type: Loan['type']) => {
        if (!currentUser) return;
        const newLoan = await mockApi.submitLoanApplication(currentUser.id, loanData, type);
        const updatedUser = { ...currentUser, loans: [...(currentUser.loans || []), newLoan] };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        navigate(`/loan-decision/${newLoan.id}`);
    };

    const handleDisburseLoan = async (loanId: string, toAccountId: string) => {
        if (!currentUser) return;
        const result = await mockApi.disburseLoan(loanId, toAccountId);
        const loan = currentUser.loans.find(l => l.id === loanId);
        if (!loan) return;

        const disbursementTx: Transaction = {
            id: `tx-${Math.random().toString(36).substr(2, 9)}`,
            date: result.disbursedDate,
            description: `${loan.type} Loan Disbursement`,
            amount: loan.amount,
            type: 'Credit',
            category: 'Loan Disbursement',
        };

        const updatedAccounts = currentUser.accounts.map(acc =>
            acc.id === toAccountId
                ? { ...acc, balance: acc.balance + loan.amount, transactions: [disbursementTx, ...acc.transactions] }
                : acc
        );
        const updatedLoans = currentUser.loans.map(l =>
            l.id === loanId
                ? { ...l, status: 'Active' as const, disbursed: true, disbursedToAccountId: toAccountId, disbursedDate: result.disbursedDate, outstandingBalance: l.amount }
                : l
        );
        const updatedUser = { ...currentUser, accounts: updatedAccounts, loans: updatedLoans };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    };

    // Repay an active loan from a deposit account. Validation (amount vs. outstanding
    // balance, amount vs. account balance) happens in LoansScreen before this is called.
    const handleRepayLoan = async (loanId: string, fromAccountId: string, amount: number) => {
        if (!currentUser) return;
        const loan = currentUser.loans.find(l => l.id === loanId);
        if (!loan) return;

        const result = await mockApi.repayLoan(loanId, fromAccountId, amount);

        const repaymentTx: Transaction = {
            id: `tx-${Math.random().toString(36).substr(2, 9)}`,
            date: result.repaidDate,
            description: `${loan.type} Loan Repayment`,
            amount,
            type: 'Debit',
            category: 'Loan Repayment',
        };

        const outstanding = loan.outstandingBalance ?? loan.amount;
        const remainingBalance = Math.max(0, Math.round((outstanding - amount) * 100) / 100);

        const updatedAccounts = currentUser.accounts.map(acc =>
            acc.id === fromAccountId
                ? { ...acc, balance: acc.balance - amount, transactions: [repaymentTx, ...acc.transactions] }
                : acc
        );
        const updatedLoans = currentUser.loans.map(l =>
            l.id === loanId
                ? { ...l, outstandingBalance: remainingBalance, status: remainingBalance <= 0 ? 'Paid Off' as const : l.status }
                : l
        );

        const updatedUser = { ...currentUser, accounts: updatedAccounts, loans: updatedLoans };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    };

    const handleTransfer = async (fromAccountId: string, toAccountId: string, amount: number) => {
        if (!currentUser) return;
        await mockApi.executeTransfer(fromAccountId, toAccountId, amount);
        
        const fromAcc = currentUser.accounts.find(a => a.id === fromAccountId);
        const toAcc = currentUser.accounts.find(a => a.id === toAccountId);
        
        if (!fromAcc || !toAcc) return;

        const updatedAccounts = currentUser.accounts.map(acc => {
            if (acc.id === fromAccountId) {
                return { ...acc, balance: acc.balance - amount };
            }
            if (acc.id === toAccountId) {
                const isCreditCard = acc.type.includes('Credit Card');
                return { 
                    ...acc, 
                    balance: isCreditCard ? acc.balance - amount : acc.balance + amount 
                };
            }
            return acc;
        });

        const updatedUser = { ...currentUser, accounts: updatedAccounts };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        navigate('/dashboard');
    };

    const handlePayeeTransfer = async (fromAccountId: string, payeeId: string, amount: number) => {
        if (!currentUser) return;
        await mockApi.executeExternalTransfer(fromAccountId, payeeId, amount);

        const payee = currentUser.payees.find(p => p.id === payeeId);
        if (!payee) return;

        const debitTx: Transaction = {
            id: `tx-${Math.random().toString(36).substr(2, 9)}`,
            date: new Date().toISOString(),
            description: `Payment to ${payee.name}`,
            amount,
            type: 'Debit',
            category: 'Payee Payment',
        };

        const updatedAccounts = currentUser.accounts.map(acc =>
            acc.id === fromAccountId
                ? { ...acc, balance: acc.balance - amount, transactions: [debitTx, ...acc.transactions] }
                : acc
        );

        const updatedUser = { ...currentUser, accounts: updatedAccounts };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        navigate('/dashboard');
    };

    const handleAddPayee = async (payeeData: Omit<Payee, 'id' | 'addedDate'>) => {
        if (!currentUser) return;
        const newPayee = await mockApi.addPayee(payeeData);
        const updatedUser = { ...currentUser, payees: [...(currentUser.payees || []), newPayee] };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    };

    const handleDeletePayee = async (payeeId: string) => {
        if (!currentUser) return;
        await mockApi.deletePayee(payeeId);
        const updatedUser = { ...currentUser, payees: currentUser.payees.filter(p => p.id !== payeeId) };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    };

    const handleDeposit = async (toAccountId: string, amount: number) => {
        if (!currentUser) return;
        await mockApi.executeDeposit(toAccountId, amount);
        const updatedAccounts = currentUser.accounts.map(acc => 
            acc.id === toAccountId ? { ...acc, balance: acc.balance + amount } : acc
        );
        const updatedUser = { ...currentUser, accounts: updatedAccounts };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-emerald-500/30 font-sans">
            <Header user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
            <main className="px-6 py-12 md:py-20 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/login" element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />} />
                    <Route path="/verify-otp" element={
                        currentUser ? <Navigate to="/dashboard" replace /> :
                        pendingUser ? <TwoFactorScreen userId={pendingUser.id} username={pendingUser.username} onVerified={handleOtpVerified} onCancel={handleOtpCancel} /> :
                        <Navigate to="/login" replace />
                    } />
                    <Route path="/reset-password" element={<PasswordResetScreen onNavigate={handleNavigate} />} />
                    
                    <Route element={<ProtectedRoute user={currentUser} />}>
                        <Route path="/dashboard" element={currentUser && <DashboardScreen user={currentUser} onNavigate={handleNavigate} />} />
                        <Route path="/document-library" element={<DocumentLibraryScreen onNavigate={handleNavigate} />} />
                        <Route path="/account/:accountId" element={currentUser && <AccountDetailsWrapper user={currentUser} />} />
                        <Route path="/transfer" element={currentUser && <TransferScreen user={currentUser} onTransfer={handleTransfer} onPayeeTransfer={handlePayeeTransfer} onNavigate={handleNavigate} />} />
                        <Route path="/payees" element={currentUser && <PayeesScreen payees={currentUser.payees} onNavigate={handleNavigate} onAddPayee={handleAddPayee} onDeletePayee={handleDeletePayee} />} />
                        <Route path="/deposit" element={currentUser && <DepositScreen user={currentUser} onNavigate={handleNavigate} onDeposit={handleDeposit} />} />
                        <Route path="/loans" element={currentUser && <LoansScreen user={currentUser} onNavigate={handleNavigate} onRepayLoan={handleRepayLoan} />} />
                        <Route path="/loan-decision/:loanId" element={currentUser && <CreditDecisionWrapper user={currentUser} />} />
                        <Route path="/disburse/:loanId" element={currentUser && <DisbursementWrapper user={currentUser} onDisburse={handleDisburseLoan} />} />
                        <Route path="/contact" element={<ContactScreen onNavigate={handleNavigate} />} />
                        <Route path="/security/:action" element={currentUser && <SecurityScreenWrapper user={currentUser} onActionComplete={handleSecurityAction} />} />
                        <Route path="/apply/:accountType" element={currentUser && <ApplicationScreenWrapper user={currentUser} onSubmit={handleApplicationSubmit} />} />
                        <Route path="/apply-loan/:loanType" element={currentUser && <LoanApplicationWrapper user={currentUser} onSubmit={handleLoanSubmit} />} />
                        <Route path="/admin" element={<AdminScreen />} />
                    </Route>

                    <Route path="*" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
                </Routes>
            </main>
            {currentUser && <AiAssistant allUsers={users} />}
        </div>
    );
};

const ProtectedRoute: React.FC<{ user: User | null }> = ({ user }) => {
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
};

export default App;
