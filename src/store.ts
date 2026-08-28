import AsyncStorage from '@react-native-async-storage/async-storage';

export type Account = { id: string; name: string; type: 'cash' | 'bank' | 'card'; balance: number; color: string; last4?: string };
export type Transaction = { id: string; title: string; category: string; categoryId?: string; amount: number; type: 'expense' | 'income' | 'transfer'; date: string; account: string; accountId?: string; icon: string };
export type Category = { id: string; name: string; icon: string; color: string; kind: 'expense' | 'income' | 'both' };
export type Profile = { name: string; email: string };
export type Store = { accounts: Account[]; transactions: Transaction[]; categories: Category[]; profile: Profile };

export const STORAGE_KEY = 'trackit-mobile-store-v1';
export const palette = { ink: '#17221B', muted: '#829087', line: '#E4E9E4', green: '#49A078', mint: '#E5F3EA', coral: '#E9785F', navy: '#1D3C4A', paper: '#F8FAF7' };

export const seed: Store = {
  profile: { name: 'Mayank Aggarwal', email: 'mayank@example.com' },
  accounts: [
    { id: 'cash', name: 'Cash wallet', type: 'cash', balance: 18420, color: palette.green },
    { id: 'hdfc', name: 'HDFC Bank', type: 'bank', balance: 67280, color: palette.navy, last4: '4821' },
    { id: 'visa', name: 'Visa credit', type: 'card', balance: -12840, color: palette.coral, last4: '0932' },
  ],
  transactions: [
    { id: '1', title: 'Salary credited', category: 'Income', amount: 85000, type: 'income', date: 'Today, 09:42', account: 'HDFC Bank', icon: 'income' },
    { id: '2', title: 'Blue Tokai Coffee', category: 'Food & drink', amount: -380, type: 'expense', date: 'Today, 08:15', account: 'Cash wallet', icon: 'food' },
    { id: '3', title: 'Monthly rent', category: 'Home', amount: -24000, type: 'expense', date: 'Yesterday', account: 'HDFC Bank', icon: 'home' },
    { id: '4', title: 'Sent to Priya', category: 'Transfer', amount: -2500, type: 'transfer', date: '16 Jun 2024', account: 'HDFC Bank', icon: 'transfer' },
    { id: '5', title: 'Grocery run', category: 'Groceries', amount: -2160, type: 'expense', date: '15 Jun 2024', account: 'Visa credit', icon: 'bag' },
  ],
  categories: [
    { id: 'food', name: 'Food & drink', icon: 'utensils', color: '#E9785F', kind: 'expense' },
    { id: 'home', name: 'Home', icon: 'home', color: '#6D8EAD', kind: 'expense' },
    { id: 'groceries', name: 'Groceries', icon: 'bag', color: '#D69E4B', kind: 'expense' },
    { id: 'transport', name: 'Transport', icon: 'car', color: '#8B72A8', kind: 'expense' },
    { id: 'salary', name: 'Salary', icon: 'income', color: '#49A078', kind: 'income' },
  ],
};

export function formatMoney(value: number) { return `${value < 0 ? '-' : ''}₹${Math.abs(value).toLocaleString('en-IN')}`; }
export async function loadStore() { const value = await AsyncStorage.getItem(STORAGE_KEY); if (!value) return seed; const stored = JSON.parse(value) as Partial<Store>; const accounts = stored.accounts ?? seed.accounts; const categories = (stored.categories ?? seed.categories).map(category => ({ ...category, kind: category.kind ?? 'expense' } as Category)); const transactions = (stored.transactions ?? seed.transactions).map(transaction => ({ ...transaction, accountId: transaction.accountId ?? accounts.find(account => account.name === transaction.account)?.id, categoryId: transaction.categoryId ?? categories.find(category => category.name === transaction.category)?.id })); return { ...seed, ...stored, accounts, categories, transactions, profile: stored.profile ?? seed.profile }; }
export async function saveStore(store: Store) { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
