export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  category: string;
}

export interface Account {
  id: string;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Platinum Credit Card';
  accountNumber: string;
  balance: number;
  status?: 'Pending' | 'Active' | 'Frozen';
  transactions: Transaction[];
}

export interface Payee {
  id: string;
  name: string;
  nickname?: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  addedDate: string;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  accounts: Account[];
  loans: Loan[];
  payees: Payee[];
  canApplyForPlatinum: boolean;
  locked: boolean;
  unlockPasswordHash?: string;
  /** Marks whether this device/session has previously verified 2FA (persisted client-side for demo convenience). */
  trustedDevice?: boolean;
}

export type CreditDecisionOutcome = 'Approved' | 'Referred' | 'Declined';

export interface Loan {
  id: string;
  type: 'Personal' | 'Auto' | 'Mortgage';
  amount: number;
  interestRate: number;
  status: 'Pending' | 'Approved' | 'Referred' | 'Declined' | 'Active' | 'Paid Off';
  termMonths: number;
  /** Result of the automated credit decision engine, and the human-readable rationale shown to the applicant. */
  decision?: CreditDecisionOutcome;
  decisionReason?: string;
  /** Simple 0-100 affordability/risk score used to drive the decision (kept deterministic for QA automation). */
  riskScore?: number;
  /** True once disbursed funds have been credited to a destination account. */
  disbursed?: boolean;
  disbursedToAccountId?: string;
  disbursedDate?: string;
  /** Remaining principal owed. Set to `amount` at disbursement and reduced by each repayment; 0 once "Paid Off". */
  outstandingBalance?: number;
}

export type ViewType =
  | { name: 'login' }
  | { name: 'verifyOtp' }
  | { name: 'resetPassword' }
  | { name: 'dashboard' }
  | { name: 'documentLibrary' }
  | { name: 'transfer' }
  | { name: 'deposit' }
  | { name: 'payees' }
  | { name: 'loans' }
  | { name: 'contact' }
  | { name: 'security'; action: 'report' | 'lockdown' | 'freeze-all' }
  | { name: 'accountDetails'; accountId: string }
  | { name: 'apply'; for: Account['type'] }
  | { name: 'applyLoan'; loanType: Loan['type'] }
  | { name: 'creditDecision'; loanId: string }
  | { name: 'disbursement'; loanId: string };

export interface ApplicationData {
    firstName: string;
    middleName: string;
    lastName: string;
    dob: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    initialDeposit?: number;
    depositFromAccountId?: string;
}

export interface LoanApplicationData extends ApplicationData {
    employer: string;
    jobTitle: string;
    annualIncome: number;
    loanAmount: number;
    loanTerm: number;
    purpose: string;
    // --- eKYC fields ---
    idType: 'Passport' | 'Driver License' | 'National ID';
    idNumber: string;
    idFrontUploaded: boolean;
    idBackUploaded: boolean;
    livenessVerified: boolean;
}
