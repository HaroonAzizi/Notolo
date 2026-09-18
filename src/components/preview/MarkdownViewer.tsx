import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CheckSquare, Square } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useVaultStore } from '../../utils/vaultStore';
import {
  parseMarkdownBlocks,
  parseInlineTokens,
  MarkdownBlock,
} from '../../utils/markdownParser';

interface Props {
  isTablet: boolean;
}

export const MarkdownViewer: React.FC<Props> = ({ isTablet }) => {
  const { theme } = useTheme();
  const { notes, activeNoteId, toggleChecklistInActiveNote } = useVaultStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const content = activeNote?.content || '';
  const blocks = parseMarkdownBlocks(content);

  const renderInline = (text: string) => {
    const tokens = parseInlineTokens(text);
    return (
      <Text style={[styles.inlineBase, { color: theme.text }]}>
        {tokens.map((token, index) => {
          switch (token.type) {
            case 'bold':
              return (
                <Text key={index} style={styles.bold}>
                  {token.text}
                </Text>
              );
            case 'italic':
              return (
                <Text key={index} style={styles.italic}>
                  {token.text}
                </Text>
              );
            case 'strike':
              return (
                <Text key={index} style={styles.strike}>
                  {token.text}
                </Text>
              );
            case 'code':
              return (
                <Text
                  key={index}
                  style={[
                    styles.inlineCode,
                    {
                      backgroundColor: theme.codeBg,
                      color: theme.accent,
                    },
                  ]}
                >
                  {` ${token.text} `}
                </Text>
              );
            case 'link':
              return (
                <Text
                  key={index}
                  style={[styles.link, { color: theme.accent }]}
                >
                  {token.text}
                </Text>
              );
            default:
              return <Text key={index}>{token.text}</Text>;
          }
        })}
      </Text>
    );
  };

  const renderBlock = (block: MarkdownBlock) => {
    switch (block.type) {
      case 'h1':
        return (
          <View key={block.id} style={styles.h1Container}>
            <Text style={[styles.h1, { color: theme.text }]}>
              {block.text}
            </Text>
            <View style={[styles.h1Divider, { backgroundColor: theme.border }]} />
          </View>
        );

      case 'h2':
        return (
          <Text key={block.id} style={[styles.h2, { color: theme.text }]}>
            {block.text}
          </Text>
        );

      case 'h3':
        return (
          <Text key={block.id} style={[styles.h3, { color: theme.text }]}>
            {block.text}
          </Text>
        );

      case 'checklist':
        return (
          <TouchableOpacity
            key={block.id}
            activeOpacity={0.7}
            onPress={() => toggleChecklistInActiveNote(block.lineIndex)}
            style={styles.checkRow}
          >
            {block.checked ? (
              <CheckSquare size={18} color={theme.accent} style={styles.checkIcon} />
            ) : (
              <Square size={18} color={theme.textMuted} style={styles.checkIcon} />
            )}
            <Text
              style={[
                styles.checkText,
                { color: block.checked ? theme.textMuted : theme.text },
                block.checked && styles.strike,
              ]}
            >
              {renderInline(block.text)}
            </Text>
          </TouchableOpacity>
        );

      case 'bullet':
        return (
          <View key={block.id} style={styles.listRow}>
            <View style={[styles.bulletDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.listText, { color: theme.text }]}>
              {renderInline(block.text)}
            </Text>
          </View>
        );

      case 'number':
        return (
          <View key={block.id} style={styles.listRow}>
            <Text style={[styles.numberPrefix, { color: theme.accent }]}>
              {block.raw.match(/^\s*(\d+\.)/)?.[1] || '•'}
            </Text>
            <Text style={[styles.listText, { color: theme.text }]}>
              {renderInline(block.text)}
            </Text>
          </View>
        );

      case 'blockquote':
        return (
          <View
            key={block.id}
            style={[
              styles.blockquote,
              {
                borderLeftColor: theme.quoteBorder,
                backgroundColor: theme.quoteBg,
              },
            ]}
          >
            <Text style={[styles.blockquoteText, { color: theme.textSecondary }]}>
              {renderInline(block.text)}
            </Text>
          </View>
        );

      case 'codeblock':
        return (
          <View
            key={block.id}
            style={[
              styles.codeBlock,
              {
                backgroundColor: theme.codeBg,
                borderColor: theme.border,
              },
            ]}
          >
            {block.codeLang ? (
              <Text style={[styles.codeLang, { color: theme.textMuted }]}>
                {block.codeLang.toUpperCase()}
              </Text>
            ) : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text
                style={[
                  styles.codeText,
                  {
                    color: theme.codeText,
                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                  },
                ]}
              >
                {block.text}
              </Text>
            </ScrollView>
          </View>
        );

      case 'table':
        return (
          <View
            key={block.id}
            style={[
              styles.tableContainer,
              {
                borderColor: theme.tableBorder,
                backgroundColor: theme.cardBg,
              },
            ]}
          >
            {block.tableRows?.map((row, rIdx) => (
              <View
                key={rIdx}
                style={[
                  styles.tableRow,
                  {
                    borderBottomColor: theme.tableBorder,
                    backgroundColor:
                      rIdx === 0 ? theme.accentSoft : 'transparent',
                  },
                ]}
              >
                {row.map((cell, cIdx) => (
                  <View
                    key={cIdx}
                    style={[
                      styles.tableCell,
                      { borderRightColor: theme.tableBorder },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tableCellText,
                        {
                          color: theme.text,
                          fontWeight: rIdx === 0 ? '700' : '400',
                        },
                      ]}
                    >
                      {cell}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        );

      case 'hr':
        return (
          <View
            key={block.id}
            style={[styles.hr, { backgroundColor: theme.border }]}
          />
        );

      default:
        // Paragraph / Blank line
        if (!block.text.trim()) {
          return <View key={block.id} style={styles.blankLine} />;
        }
        return (
          <View key={block.id} style={styles.paragraphContainer}>
            {renderInline(block.text)}
          </View>
        );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        isTablet && styles.tabletScrollContent,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.documentSheet,
          {
            backgroundColor: theme.sheetBg,
            borderColor: theme.borderSubtle,
            shadowColor: theme.shadowColor,
          },
          isTablet && styles.tabletDocumentSheet,
        ]}
      >
        {blocks.map(renderBlock)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 12,
    alignItems: 'center',
  },
  tabletScrollContent: {
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  documentSheet: {
    width: '100%',
    minHeight: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  tabletDocumentSheet: {
    maxWidth: 780,
    padding: 36,
    borderRadius: 16,
  },
  inlineBase: {
    fontSize: 16,
    lineHeight: 26,
  },
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  strike: {
    textDecorationLine: 'line-through',
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    borderRadius: 4,
  },
  link: {
    textDecorationLine: 'underline',
  },
  h1Container: {
    marginTop: 18,
    marginBottom: 12,
  },
  h1: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  h1Divider: {
    height: 1.5,
    width: '100%',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 16,
    marginBottom: 8,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraphContainer: {
    marginVertical: 4,
  },
  blankLine: {
    height: 12,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  checkIcon: {
    marginRight: 10,
    marginTop: 3,
  },
  checkText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
    marginTop: 10,
  },
  numberPrefix: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 10,
    marginTop: 2,
    minWidth: 20,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  blockquote: {
    borderLeftWidth: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    marginVertical: 12,
  },
  blockquoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  codeBlock: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    marginVertical: 12,
  },
  codeLang: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 14,
    lineHeight: 22,
  },
  tableContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRightWidth: 1,
  },
  tableCellText: {
    fontSize: 13,
  },
  hr: {
    height: 1,
    marginVertical: 20,
  },
});
