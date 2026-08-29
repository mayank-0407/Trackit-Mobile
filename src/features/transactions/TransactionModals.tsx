import { useEffect, useState } from 'react';
import { ChevronRight, Wallet, X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Account, Category, formatMoney, Transaction } from '../../store';
import { palette, sharedStyles } from '../../theme';
import { transactionStyles } from './transactionStyles';

type EditorProps = { visible: boolean; transaction?: Transaction; accounts: Account[]; categories: Category[]; onClose: () => void; onSave: (transaction: Transaction, description: string, amount: number, type: 'expense' | 'income', accountId: string, categoryId: string) => void };

export function TransactionDetails({ transaction, onClose, onEdit, onDelete }: { transaction?: Transaction; onClose: () => void; onEdit: () => void; onDelete: (transaction: Transaction) => void }) {
  if (!transaction) return null;
  const description = transaction.description || transaction.title;
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}><View style={transactionStyles.backdrop}><View style={transactionStyles.sheet}>
    <View style={transactionStyles.header}><View><Text style={transactionStyles.eyebrow}>TRANSACTION DETAILS</Text><Text style={transactionStyles.title}>{description}</Text></View><Pressable onPress={onClose}><X color={palette.ink} /></Pressable></View>
    <Text style={transactionStyles.amount}>{transaction.amount > 0 ? '+' : ''}{formatMoney(transaction.amount)}</Text>
    <Text style={transactionStyles.line}>Description <Text style={transactionStyles.value}>{description}</Text></Text><Text style={transactionStyles.line}>Category <Text style={transactionStyles.value}>{transaction.category}</Text></Text><Text style={transactionStyles.line}>Account <Text style={transactionStyles.value}>{transaction.account}</Text></Text><Text style={transactionStyles.line}>Date <Text style={transactionStyles.value}>{transaction.date}</Text></Text>
    <View style={transactionStyles.actions}><Pressable style={transactionStyles.edit} onPress={onEdit}><Text style={transactionStyles.editText}>Edit transaction</Text></Pressable><Pressable style={transactionStyles.delete} onPress={() => onDelete(transaction)}><Text style={transactionStyles.deleteText}>Delete</Text></Pressable></View>
  </View></View></Modal>;
}

export function TransactionEditor({ visible, transaction, accounts, categories, onClose, onSave }: EditorProps) {
  const [description, setDescription] = useState(''); const [amount, setAmount] = useState(''); const [type, setType] = useState<'expense' | 'income'>('expense'); const [accountId, setAccountId] = useState(''); const [categoryId, setCategoryId] = useState('');
  const availableCategories = categories.filter(item => item.kind === type || item.kind === 'both');
  useEffect(() => { if (!transaction) return; setDescription(transaction.description || transaction.title); setAmount(String(Math.abs(transaction.amount))); setType(transaction.type === 'income' ? 'income' : 'expense'); setAccountId(transaction.accountId ?? accounts.find(account => account.name === transaction.account)?.id ?? accounts[0]?.id ?? ''); setCategoryId(transaction.categoryId ?? categories.find(category => category.name === transaction.category)?.id ?? ''); }, [transaction, visible, accounts, categories]);
  useEffect(() => { if (!availableCategories.some(item => item.id === categoryId)) setCategoryId(availableCategories[0]?.id ?? ''); }, [type, categories, categoryId]);
  if (!transaction) return null;
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={transactionStyles.backdrop}><View style={transactionStyles.sheet}>
    <View style={transactionStyles.header}><View><Text style={transactionStyles.eyebrow}>EDIT ENTRY</Text><Text style={transactionStyles.title}>Edit transaction</Text></View><Pressable onPress={onClose}><X color={palette.ink} /></Pressable></View>
    <View style={transactionStyles.toggle}>{(['expense', 'income'] as const).map(item => <Pressable key={item} onPress={() => setType(item)} style={[transactionStyles.option, type === item && transactionStyles.active]}><Text>{item[0].toUpperCase() + item.slice(1)}</Text></Pressable>)}</View>
    <Text style={sharedStyles.inputLabel}>Description</Text><TextInput value={description} onChangeText={setDescription} style={sharedStyles.field} /><Text style={sharedStyles.inputLabel}>Amount</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={sharedStyles.field} />
    <Text style={sharedStyles.inputLabel}>Category</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={transactionStyles.selector}>{availableCategories.map(category => <Pressable key={category.id} onPress={() => setCategoryId(category.id)} style={[transactionStyles.chip, category.id === categoryId && transactionStyles.chipActive]}><Text style={category.id === categoryId ? { color: 'white' } : { color: palette.muted }}>{category.name}</Text></Pressable>)}</ScrollView>
    <Text style={sharedStyles.inputLabel}>Account</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={transactionStyles.selector}>{accounts.map(account => <Pressable key={account.id} onPress={() => setAccountId(account.id)} style={[transactionStyles.chip, account.id === accountId && transactionStyles.chipActive]}><Text style={account.id === accountId ? { color: 'white' } : { color: palette.muted }}>{account.name}</Text></Pressable>)}</ScrollView>
    <Pressable disabled={!description.trim() || !amount || !accountId || !categoryId} onPress={() => onSave(transaction, description.trim(), Number(amount), type, accountId, categoryId)} style={[sharedStyles.saveButton, (!description.trim() || !amount || !accountId || !categoryId) && sharedStyles.saveDisabled]}><Text style={sharedStyles.saveText}>Save changes</Text></Pressable>
  </View></View></Modal>;
}
