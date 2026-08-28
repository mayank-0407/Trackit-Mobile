import { BarChart3, Landmark, Receipt, Settings, Wallet } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette } from '../theme';

export type AppTab = 'home' | 'activity' | 'insights' | 'accounts' | 'settings' | 'categories';

type Props = { activeTab: AppTab; onChange: (tab: AppTab) => void };

const items: Array<[AppTab, string, React.ReactNode]> = [['home', 'Overview', <Wallet size={21} />], ['activity', 'Activity', <Receipt size={21} />], ['insights', 'Insights', <BarChart3 size={21} />], ['accounts', 'Accounts', <Landmark size={21} />], ['settings', 'Settings', <Settings size={21} />]];

export function BottomNav({ activeTab, onChange }: Props) { return <View style={styles.nav}>{items.map(([key, label, icon]) => <Pressable key={key} onPress={() => onChange(key)} style={styles.item}><View style={[styles.icon, activeTab === key && styles.active]}>{icon}</View><Text style={[styles.label, activeTab === key && styles.activeLabel]}>{label}</Text></Pressable>)}</View>; }

const styles = StyleSheet.create({ nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 79, backgroundColor: 'rgba(255,255,255,.97)', borderTopWidth: 1, borderTopColor: palette.line, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 9 }, item: { alignItems: 'center', width: 75 }, icon: { padding: 5, borderRadius: 12 }, active: { backgroundColor: palette.mint }, label: { color: palette.muted, fontSize: 10, marginTop: 3 }, activeLabel: { color: palette.green, fontWeight: '700' } });
