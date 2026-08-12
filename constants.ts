import { User, Transaction } from './types';

const generateMockTransactions = (count: number, baseDescription: string): Transaction[] => {
  return Array.from({ length: count }).map((_, i) => {
    const isCredit = Math.random() > 0.6;
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 4));
    date.setDate(Math.floor(Math.random() * 28) + 1);
    
    return {
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      date: date.toISOString(),
      description: `${baseDescription} ${i + 1}`,
      amount: parseFloat((Math.random() * 500 + 10).toFixed(2)),
      type: isCredit ? 'Credit' : 'Debit',
      category: isCredit ? 'Income' : 'General',
    };
  });
};

export const USERS: User[] = [
  {
    id: 'user1',
    username: 'bankinguser123',
    passwordHash: 'notapassword@123',
    locked: false,
    canApplyForPlatinum: true,
    accounts: [
      { 
        id: 'acc1-1', 
        type: 'Checking', 
        accountNumber: '...7890', 
        balance: 5345.54,
        transactions: [
          { id: 'tx1', date: '2025-05-10T10:00:00Z', description: 'Apple Store Cupertino', amount: 1299.00, type: 'Debit', category: 'Technology' },
          { id: 'tx2', date: '2025-05-08T14:30:00Z', description: 'Katalian Payroll Deposit', amount: 4500.00, type: 'Credit', category: 'Salary' },
          { id: 'tx3', date: '2025-04-25T12:00:00Z', description: 'Whole Foods Market', amount: 156.43, type: 'Debit', category: 'Groceries' },
          ...generateMockTransactions(12, 'Point of Sale')
        ]
      },
      { 
        id: 'acc1-2', 
        type: 'Savings', 
        accountNumber: '...1234', 
        balance: 104456.67,
        transactions: [
          { id: 'tx4', date: '2025-05-01T00:00:00Z', description: 'Interest Credit', amount: 456.67, type: 'Credit', category: 'Interest' },
          ...generateMockTransactions(5, 'Internal Transfer')
        ]
      },
      { 
        id: 'acc1-3', 
        type: 'Credit Card', 
        accountNumber: '...9921', 
        balance: 1250.00, // Debt
        transactions: [
          { id: 'tx5', date: '2025-05-12T10:00:00Z', description: 'Gas Station X', amount: 55.00, type: 'Debit', category: 'Transport' },
          ...generateMockTransactions(8, 'Merchant Purchase')
        ]
      },
    ],
    loans: [],
    payees: [
      {
        id: 'payee-1001',
        name: 'Alex Rivera',
        nickname: 'Roommate - Rent Split',
        bankName: 'First Continental Bank',
        accountNumber: '...4471',
        routingNumber: '021000021',
        addedDate: '2025-02-14T00:00:00Z',
      },
      {
        id: 'payee-1002',
        name: 'Katalian Power & Utilities',
        nickname: 'Electric Bill',
        bankName: 'Metro Regional Bank',
        accountNumber: '...8820',
        routingNumber: '011401533',
        addedDate: '2025-03-02T00:00:00Z',
      },
    ],
  },
  {
    id: 'user4',
    username: 'lockedout25',
    passwordHash: 'lockedoutpassword343',
    unlockPasswordHash: 'resetpassword@45',
    locked: true,
    canApplyForPlatinum: false,
    accounts: [
      { 
        id: 'acc4-1', 
        type: 'Checking', 
        accountNumber: '...3456', 
        balance: 12.14,
        transactions: generateMockTransactions(3, 'Emergency Withdrawal')
      },
    ],
    loans: [],
    payees: [],
  },
];

export const STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

export const LOAN_PRODUCTS = [
    { type: 'Personal', rate: '5.99%', description: 'Flexible funds for life\'s unexpected moments.', icon: '💰' },
    { type: 'Auto', rate: '4.25%', description: 'Get behind the wheel of your dream car faster.', icon: '🚗' },
    { type: 'Mortgage', rate: '6.45%', description: 'Your journey to home ownership starts here.', icon: '🏠' },
];

export const ID_TYPES: Array<'Passport' | 'Driver License' | 'National ID'> = ['Passport', 'Driver License', 'National ID'];
