import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { FileDown, FileText, Printer, X, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Note } from '../../types';
import { exportAsMarkdown, exportAsPlainText, exportAsPdf } from '../../utils/exportHelper';
import { hapticFeedback } from '../../utils/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  note: Note | null;
}

export const ExportModal: React.FC<Props> = ({ visible, onClose, note }) => {
  const { theme } = useTheme();

  if (!note) return null;

  const handleExportMd = async () => {
    hapticFeedback.medium();
    const success = await exportAsMarkdown(note);
    if (success) onClose();
  };

  const handleExportTxt = async () => {
    hapticFeedback.medium();
    const success = await exportAsPlainText(note);
    if (success) onClose();
  };

  const handleExportPdf = async () => {
    hapticFeedback.medium();
    const success = await exportAsPdf(note);
    if (success) onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.title, { color: theme.text }]}>
                    Export Note
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[styles.subtitle, { color: theme.textMuted }]}
                  >
                    {note.title || 'Untitled Note'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsList}>
                <TouchableOpacity
                  onPress={handleExportMd}
                  activeOpacity={0.7}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: theme.sheetBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View
                    style={[styles.iconBox, { backgroundColor: theme.accentSoft }]}
                  >
                    <FileDown size={20} color={theme.accent} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>
                      Markdown (.md)
                    </Text>
                    <Text
                      style={[styles.optionDescription, { color: theme.textSecondary }]}
                    >
                      Raw markdown format. Perfect for Obsidian, GitHub & backup.
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleExportTxt}
                  activeOpacity={0.7}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: theme.sheetBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: theme.successSoft },
                    ]}
                  >
                    <FileText size={20} color={theme.success} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>
                      Plain Text (.txt)
                    </Text>
                    <Text
                      style={[styles.optionDescription, { color: theme.textSecondary }]}
                    >
                      Compatible with any device, text editor, or note tool.
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleExportPdf}
                  activeOpacity={0.7}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: theme.sheetBg,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
                    ]}
                  >
                    <Printer size={20} color={theme.danger} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, { color: theme.text }]}>
                      PDF Document / Print
                    </Text>
                    <Text
                      style={[styles.optionDescription, { color: theme.textSecondary }]}
                    >
                      Formatted clean document layout via Apple Print or PDF save.
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    maxWidth: 340,
  },
  closeBtn: {
    padding: 4,
  },
  optionsList: {
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  optionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
});
