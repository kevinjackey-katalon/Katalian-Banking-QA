
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

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  accounts: Account[];
  loans: Loan[];
  canApplyForPlatinum: boolean;
  locked: boolean;
  unlockPasswordHash?: string;
}

export interface Loan {
  id: string;
  type: 'Personal' | 'Auto' | 'Mortgage';
  amount: number;
  interestRate: number;
  status: 'Pending' | 'Approved' | 'Active';
  termMonths: number;
}

export type ViewType =
  | { name: 'login' }
  | { name: 'resetPassword' }
  | { name: 'dashboard' }
  | { name: 'documentLibrary' }
  | { name: 'transfer' }
  | { name: 'deposit' }
  | { name: 'loans' }
  | { name: 'contact' }
  | { name: 'security'; action: 'report' | 'lockdown' | 'freeze-all' }
  | { name: 'accountDetails'; accountId: string }
  | { name: 'apply'; for: Account['type'] }
  | { name: 'applyLoan'; loanType: Loan['type'] };

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
}
