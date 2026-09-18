import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CheckSquare, Square, PenTool } from 'lucide-react-native';
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
  const { width, height } = useWindowDimensions();
  const { theme } = useTheme();
  const { notes, activeNoteId, toggleChecklistInActiveNote } = useVaultStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const content = activeNote?.content || '';
  const blocks = parseMarkdownBlocks(content);

  const getIndentLevel = (raw: string): number => {
    const match = raw.match(/^(\s*)/);
    const spaces = match ? match[1].length : 0;
    return Math.min(Math.floor(spaces / 2), 4);
  };

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
    const indentLevel = getIndentLevel(block.raw);
    const indentMargin = indentLevel * 18;

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

      case 'drawing': {
        const dData = block.drawingData;
        if (!dData || !dData.paths || dData.paths.length === 0) return null;
        const origWidth = dData.width || 600;
        const origHeight = dData.height || 400;
        const containerWidth = Math.min(width - (isTablet ? 80 : 40), 780);
        const scale = containerWidth / origWidth;
        const containerHeight = origHeight * scale;

        return (
          <View
            key={block.id}
            style={[
              styles.drawingContainer,
              {
                backgroundColor: theme.sheetBg,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.drawingBadge}>
              <PenTool size={12} color={theme.accent} style={{ marginRight: 4 }} />
              <Text style={[styles.drawingBadgeText, { color: theme.textMuted }]}>
                Sketch
              </Text>
            </View>
            <Svg
              width={containerWidth}
              height={containerHeight}
              viewBox={`0 0 ${origWidth} ${origHeight}`}
            >
              {dData.paths.map((p, idx) => (
                <Path
                  key={idx}
                  d={p.d}
                  stroke={p.color}
                  strokeWidth={p.width}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </Svg>
          </View>
        );
      }

      case 'checklist':
        return (
          <TouchableOpacity
            key={block.id}
            activeOpacity={0.7}
            onPress={() => toggleChecklistInActiveNote(block.lineIndex)}
            style={[styles.checkRow, { marginLeft: 4 + indentMargin }]}
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
          <View
            key={block.id}
            style={[styles.listRow, { marginLeft: 6 + indentMargin }]}
          >
            <View style={[styles.bulletDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.listText, { color: theme.text }]}>
              {renderInline(block.text)}
            </Text>
          </View>
        );

      case 'number':
        return (
          <View
            key={block.id}
            style={[styles.listRow, { marginLeft: 6 + indentMargin }]}
          >
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
              <Text style={[styles.codeLang, { color: theme.accent }]}>
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

  const overscrollBottomPadding = Math.max(height * 0.55, 350);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: overscrollBottomPadding },
        isTablet && styles.tabletScrollContent,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {blocks.map(renderBlock)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabletScrollContent: {
    paddingHorizontal: 40,
    paddingTop: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 820,
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
    marginTop: 18,
    marginBottom: 8,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
  },
  paragraphContainer: {
    marginVertical: 4,
  },
  blankLine: {
    height: 12,
  },
  drawingContainer: {
    marginVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  drawingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  drawingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    marginVertical: 5,
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
    borderLeftWidth: 3.5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginVertical: 14,
    marginLeft: 4,
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
    fontWeight: '800',
    letterSpacing: 0.6,
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
