import { useEffect, useState } from 'react';
import { ChevronRight, Wallet, X } from 'lucide-react-native';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Account, Category } from '../../store';
import { palette, sharedStyles } from '../../theme';
import { transactionStyles } from './transactionStyles';

type Props = {
  visible: boolean;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSave: (description: string, amount: number, type: 'expense' | 'income', accountId: string, categoryId: string) => void;
};

export function AddTransactionModal({ visible, accounts, categories, onClose, onSave }: Props) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const availableCategories = categories.filter(item => item.kind === type || item.kind === 'both');
  const selectedAccount = accounts.find(item => item.id === accountId);

  useEffect(() => {
    setAccountId(current => accounts.some(item => item.id === current) ? current : accounts[0]?.id ?? '');
  }, [accounts, visible]);

  useEffect(() => {
    setCategoryId(current => availableCategories.some(item => item.id === current) ? current : availableCategories[0]?.id ?? '');
  }, [type, categories, visible]);

  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={transactionStyles.backdrop}><View style={transactionStyles.sheet}>
      <View style={transactionStyles.header}><View><Text style={transactionStyles.eyebrow}>NEW ENTRY</Text><Text style={transactionStyles.title}>Add transaction</Text></View><Pressable onPress={onClose}><X color={palette.ink} /></Pressable></View>
      <View style={transactionStyles.toggle}>{(['expense', 'income'] as const).map(item => <Pressable key={item} onPress={() => setType(item)} style={[transactionStyles.option, type === item && transactionStyles.active]}><Text>{item[0].toUpperCase() + item.slice(1)}</Text></Pressable>)}</View>
      <Text style={sharedStyles.inputLabel}>Amount</Text><TextInput keyboardType="decimal-pad" value={amount} onChangeText={setAmount} placeholder="₹ 0" placeholderTextColor={palette.muted} style={sharedStyles.field} />
      <Text style={sharedStyles.inputLabel}>Description</Text><TextInput value={description} onChangeText={setDescription} placeholder="e.g. Dinner with friends" placeholderTextColor={palette.muted} style={sharedStyles.field} />
      <Text style={sharedStyles.inputLabel}>Category</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={transactionStyles.selector}>{availableCategories.map(category => <Pressable key={category.id} onPress={() => setCategoryId(category.id)} style={[transactionStyles.chip, category.id === categoryId && transactionStyles.chipActive]}><Text style={category.id === categoryId ? { color: 'white' } : { color: palette.muted }}>{category.name}</Text></Pressable>)}</ScrollView>
      <Text style={sharedStyles.inputLabel}>Account</Text><Pressable style={transactionStyles.accountSelect} onPress={() => setAccountMenuOpen(open => !open)}><Wallet color={selectedAccount?.color ?? palette.green} size={17} /><Text style={transactionStyles.accountText}>{selectedAccount?.name ?? 'Select account'}</Text><ChevronRight color={palette.muted} size={17} style={accountMenuOpen ? { transform: [{ rotate: '90deg' }] } : undefined} /></Pressable>{accountMenuOpen && <View style={transactionStyles.accountMenu}>{accounts.map(account => <Pressable key={account.id} onPress={() => { setAccountId(account.id); setAccountMenuOpen(false); }} style={[transactionStyles.accountOption, account.id === accountId && transactionStyles.accountOptionActive]}><View style={[transactionStyles.accountDot, { backgroundColor: account.color }]} /><Text style={transactionStyles.accountOptionName}>{account.name}</Text><Text style={transactionStyles.accountOptionBalance}>{account.balance.toLocaleString('en-IN')}</Text></Pressable>)}</View>}
      <Pressable disabled={!description.trim() || !amount || !accountId || !categoryId} onPress={() => onSave(description.trim(), Number(amount), type, accountId, categoryId)} style={[sharedStyles.saveButton, (!description.trim() || !amount || !accountId || !categoryId) && sharedStyles.saveDisabled]}><Text style={sharedStyles.saveText}>Save transaction</Text></Pressable>
    </View></View>
  </Modal>;
}
