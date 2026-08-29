import { ArrowDownLeft, Receipt, Send, ShoppingBag, Utensils } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Transaction } from '../store';
import { palette } from '../theme';

type Props = { transaction: Transaction; onPress?: () => void };

function TransactionIcon({ kind }: { kind: string }) { const props = { size: 18, color: palette.ink }; if (kind === 'income') return <ArrowDownLeft {...props} color={palette.green} />; if (kind === 'food') return <Utensils {...props} />; if (kind === 'bag') return <ShoppingBag {...props} />; if (kind === 'transfer') return <Send {...props} />; return <Receipt {...props} />; }

export function TransactionRow({ transaction, onPress }: Props) { const description = transaction.description || transaction.title; return <Pressable onPress={onPress} style={styles.row}><View style={styles.icon}><TransactionIcon kind={transaction.icon} /></View><View style={styles.main}><Text style={styles.title}>{description}</Text><Text style={styles.meta}>{transaction.category} · {transaction.date}</Text></View><Text style={[styles.amount, { color: transaction.amount > 0 ? palette.green : palette.ink }]}>{transaction.amount > 0 ? '+' : ''}{transaction.amount < 0 ? '-' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}</Text></Pressable>; }

const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F3F0' }, icon: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#F0F4EF', alignItems: 'center', justifyContent: 'center', marginRight: 11 }, main: { flex: 1 }, title: { fontSize: 13, color: palette.ink, fontWeight: '700' }, meta: { color: palette.muted, fontSize: 11, marginTop: 4 }, amount: { fontSize: 13, fontWeight: '700' } });
