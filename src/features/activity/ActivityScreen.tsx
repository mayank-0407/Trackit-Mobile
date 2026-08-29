import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Transaction } from '../../store';
import { palette, sharedStyles } from '../../theme';
import { TransactionRow } from '../../components/TransactionRow';

export function ActivityScreen({ transactions, onTransaction }: { transactions: Transaction[]; onTransaction: (transaction: Transaction) => void }) { const [query, setQuery] = useState(''); const filtered = transactions.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.category.toLowerCase().includes(query.toLowerCase())); return <View style={sharedStyles.page}><Text style={sharedStyles.pageTitle}>Activity</Text><Text style={sharedStyles.pageSubtitle}>Everything in one place</Text><View style={styles.search}><Search size={18} color={palette.muted} /><TextInput placeholder="Search transactions" placeholderTextColor={palette.muted} value={query} onChangeText={setQuery} style={styles.input} /></View><ScrollView showsVerticalScrollIndicator={false}>{filtered.map(item => <TransactionRow key={item.id} transaction={item} onPress={() => onTransaction(item)} />)}</ScrollView></View>; }
const styles = StyleSheet.create({ search: { height: 46, backgroundColor: 'white', borderWidth: 1, borderColor: palette.line, borderRadius: 13, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, marginBottom: 15 }, input: { flex: 1, marginLeft: 9, color: palette.ink, fontSize: 13 } });
