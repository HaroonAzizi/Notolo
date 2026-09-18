import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useVaultStore } from '../../utils/vaultStore';
import { GoogleDocsToolbar, ToolbarActions } from './GoogleDocsToolbar';
import {
  handleSmartEnter,
  wrapSelection,
  toggleLinePrefix,
  indentLines,
  outdentLines,
  insertMarkdownTable,
  insertCodeBlockTemplate,
  insertDividerTemplate,
} from '../../utils/autoFormatter';
import { EditorSelection } from '../../types';

interface Props {
  isTablet: boolean;
}

export const SmartEditor: React.FC<Props> = ({ isTablet }) => {
  const { theme } = useTheme();
  const { notes, activeNoteId, updateActiveNoteContent } = useVaultStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const content = activeNote?.content || '';

  const [selection, setSelection] = useState<EditorSelection>({ start: 0, end: 0 });
  const inputRef = useRef<TextInput>(null);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    if (!isInternalChangeRef.current) {
      setHistory([content]);
      setHistoryIndex(0);
    }
    isInternalChangeRef.current = false;
  }, [activeNoteId]);

  const pushHistory = (newContent: string) => {
    isInternalChangeRef.current = true;
    const trimmedHistory = history.slice(0, historyIndex + 1);
    const updated = [...trimmedHistory, newContent];
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    updateActiveNoteContent(newContent);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      isInternalChangeRef.current = true;
      updateActiveNoteContent(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      isInternalChangeRef.current = true;
      updateActiveNoteContent(next);
    }
  };

  const handleSelectionChange = (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>
  ) => {
    setSelection(e.nativeEvent.selection);
  };

  // Unified text change handler that supports both physical and software keyboards
  const handleChangeText = (newText: string) => {
    // Check if the user just pressed Enter (inserted a newline)
    if (newText.length === content.length + 1) {
      const cursor = selection.start;
      if (newText[cursor] === '\n') {
        const result = handleSmartEnter(content, selection);
        if (result.handled) {
          pushHistory(result.newText);
          setTimeout(() => {
            inputRef.current?.setNativeProps({
              selection: result.newSelection,
            });
            setSelection(result.newSelection);
          }, 10);
          return;
        }
      }
    }

    pushHistory(newText);
  };

  // Formatting actions
  const applyChange = (result: { newText: string; newSelection: EditorSelection }) => {
    pushHistory(result.newText);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setNativeProps({
        selection: result.newSelection,
      });
      setSelection(result.newSelection);
    }, 10);
  };

  const toolbarActions: ToolbarActions = {
    onFormatH1: () => applyChange(toggleLinePrefix(content, selection, '# ')),
    onFormatH2: () => applyChange(toggleLinePrefix(content, selection, '## ')),
    onFormatH3: () => applyChange(toggleLinePrefix(content, selection, '### ')),
    onFormatBold: () => applyChange(wrapSelection(content, selection, '**')),
    onFormatItalic: () => applyChange(wrapSelection(content, selection, '*')),
    onFormatStrike: () => applyChange(wrapSelection(content, selection, '~~')),
    onFormatCode: () => applyChange(wrapSelection(content, selection, '`')),
    onFormatBullet: () => applyChange(toggleLinePrefix(content, selection, '- ')),
    onFormatNumber: () => applyChange(toggleLinePrefix(content, selection, '1. ')),
    onFormatChecklist: () => applyChange(toggleLinePrefix(content, selection, '- [ ] ')),
    onFormatQuote: () => applyChange(toggleLinePrefix(content, selection, '> ')),
    onIndent: () => applyChange(indentLines(content, selection)),
    onOutdent: () => applyChange(outdentLines(content, selection)),
    onInsertCodeBlock: () => applyChange(insertCodeBlockTemplate(content, selection)),
    onInsertTable: () => applyChange(insertMarkdownTable(content, selection)),
    onInsertDivider: () => applyChange(insertDividerTemplate(content, selection)),
    onUndo: handleUndo,
    onRedo: handleRedo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Google Docs Formatting Toolbar Ribbon */}
      <GoogleDocsToolbar actions={toolbarActions} />

      {/* Seamless Edge-to-Edge Document Canvas */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isTablet && styles.tabletScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            ref={inputRef}
            multiline
            value={content}
            onChangeText={handleChangeText}
            onSelectionChange={handleSelectionChange}
            placeholder="Start typing your thoughts..."
            placeholderTextColor={theme.textMuted}
            selectionColor={theme.accent}
            textAlignVertical="top"
            scrollEnabled={false}
            autoCapitalize="sentences"
            autoCorrect={true}
            style={[
              styles.input,
              {
                color: theme.text,
                fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
              },
            ]}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 80,
  },
  tabletScrollContent: {
    paddingHorizontal: 40,
    paddingTop: 24,
    paddingBottom: 100,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 820,
  },
  input: {
    fontSize: 16,
    lineHeight: 26,
    padding: 0,
    minHeight: 600,
  },
});
