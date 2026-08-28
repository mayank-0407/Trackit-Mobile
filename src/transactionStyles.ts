import { StyleSheet } from 'react-native';
import { palette } from './store';

export const transactionStyles = StyleSheet.create({
  detailSheet: { backgroundColor: palette.paper, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: 35 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  detailIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: palette.mint, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { color: palette.ink, fontSize: 20, fontWeight: '700' },
  detailCategory: { color: palette.muted, fontSize: 12, marginTop: 4 },
  detailAmount: { color: palette.ink, fontSize: 30, fontWeight: '700', marginBottom: 18 },
  detailLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderTopWidth: 1, borderTopColor: palette.line },
  detailLabel: { color: palette.muted, fontSize: 12 },
  detailValue: { color: palette.ink, fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 23 },
  editButton: { flex: 1, borderRadius: 14, backgroundColor: palette.navy, alignItems: 'center', paddingVertical: 15 },
  deleteButton: { flex: 1, borderRadius: 14, backgroundColor: '#FBE9E5', alignItems: 'center', paddingVertical: 15 },
  editButtonText: { color: 'white', fontSize: 14, fontWeight: '700' },
  deleteButtonText: { color: palette.coral, fontSize: 14, fontWeight: '700' },
  selectorRow: { gap: 8, paddingBottom: 2 },
  selectorChip: { borderWidth: 1, borderColor: palette.line, backgroundColor: 'white', borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8 },
  selectorChipActive: { backgroundColor: palette.ink, borderColor: palette.ink },
  selectorText: { color: palette.muted, fontSize: 12, fontWeight: '600' },
  selectorTextActive: { color: 'white' },
});
