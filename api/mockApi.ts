import { User, Account, ApplicationData, Loan, LoanApplicationData, Payee, CreditDecisionOutcome } from '../types';
import { USERS } from '../constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Deterministic, dependency-free "credit decision engine" for demo/QA purposes.
 * Deterministic on the same inputs so Katalon Studio assertions stay stable
 * across runs (no external bureau call, no randomness).
 */
const runCreditDecision = (loanData: LoanApplicationData): { decision: CreditDecisionOutcome; reason: string; riskScore: number } => {
    if (!loanData.livenessVerified || !loanData.idFrontUploaded || !loanData.idBackUploaded) {
        return {
            decision: 'Declined',
            reason: 'Identity verification (eKYC) could not be completed for this application.',
            riskScore: 5,
        };
    }

    const annualIncome = Number(loanData.annualIncome) || 0;
    const loanAmount = Number(loanData.loanAmount) || 0;
    const affordabilityRatio = annualIncome > 0 ? loanAmount / annualIncome : Infinity;

    // Higher score = lower risk. Fully deterministic given the same application data.
    const riskScore = Math.max(0, Math.min(100, Math.round(100 - affordabilityRatio * 100)));

    if (affordabilityRatio <= 0.2) {
        return {
            decision: 'Approved',
            reason: 'Requested amount falls well within verified income and affordability thresholds.',
            riskScore,
        };
    }
    if (affordabilityRatio <= 0.5) {
        return {
            decision: 'Referred',
            reason: 'Requested amount requires manual underwriting review relative to reported income.',
            riskScore,
        };
    }
    return {
        decision: 'Declined',
        reason: 'Requested amount significantly exceeds affordability thresholds for reported income.',
        riskScore,
    };
};

export const mockApi = {
    async getUsers(): Promise<User[]> {
        await delay(500);
        return [...USERS];
    },

    async submitApplication(_userId: string, appData: ApplicationData, accountType: Account['type']): Promise<Account> {
        await delay(1500);
        return {
            id: `acc-${Math.random().toString(36).substr(2, 9)}`,
            type: accountType,
            accountNumber: `...${Math.floor(1000 + Math.random() * 9000)}`,
            balance: appData.initialDeposit || 0,
            status: accountType.includes('Card') ? 'Pending' : 'Active',
            transactions: [],
        };
    },

    async executeTransfer(_fromId: string, _toId: string, _amount: number): Promise<{ success: boolean }> {
        await delay(800);
        return { success: true };
    },

    async executeExternalTransfer(_fromId: string, _payeeId: string, _amount: number): Promise<{ success: boolean }> {
        await delay(1000);
        return { success: true };
    },

    async executeDeposit(_toId: string, _amount: number): Promise<{ success: boolean }> {
        await delay(1200);
        return { success: true };
    },

    async addPayee(payeeData: Omit<Payee, 'id' | 'addedDate'>): Promise<Payee> {
        await delay(600);
        return {
            ...payeeData,
            id: `payee-${Math.random().toString(36).substr(2, 9)}`,
            addedDate: new Date().toISOString(),
        };
    },

    async deletePayee(_payeeId: string): Promise<{ success: boolean }> {
        await delay(400);
        return { success: true };
    },

    // --- Lending: application -> eKYC (validated client-side) -> credit decision -> disbursement ---

    async submitLoanApplication(_userId: string, loanData: LoanApplicationData, type: Loan['type']): Promise<Loan> {
        await delay(2000);
        const { decision, reason, riskScore } = runCreditDecision(loanData);
        const status: Loan['status'] = decision === 'Approved' ? 'Approved' : decision === 'Referred' ? 'Referred' : 'Declined';

        return {
            id: `loan-${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            amount: loanData.loanAmount,
            interestRate: type === 'Mortgage' ? 6.45 : type === 'Auto' ? 4.25 : 5.99,
            status,
            termMonths: loanData.loanTerm,
            decision,
            decisionReason: reason,
            riskScore,
            disbursed: false,
        };
    },

    async disburseLoan(_loanId: string, _toAccountId: string): Promise<{ success: boolean; disbursedDate: string }> {
        await delay(1500);
        return { success: true, disbursedDate: new Date().toISOString() };
    },
};
