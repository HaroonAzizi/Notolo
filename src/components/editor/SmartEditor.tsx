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

  // Use a ref for selection to avoid stale state and unwanted re-renders
  const selectionRef = useRef<EditorSelection>({ start: 0, end: 0 });
  const inputRef = useRef<TextInput>(null);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    if (!isInternalChangeRef.current) {
      setHistory([content]);
      setHistoryIndex(0);
      selectionRef.current = { start: content.length, end: content.length };
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
    selectionRef.current = e.nativeEvent.selection;
  };

  // Text change handler:
  // - Handles smart list continuation when Enter is pressed
  // - Does NOT force setNativeProps on standard typing/autocorrect (prevents unwanted highlighting)
  const handleChangeText = (newText: string) => {
    // Check if the user pressed Enter (newline added at cursor position)
    if (newText.length === content.length + 1) {
      const cursor = selectionRef.current.start;
      if (newText[cursor] === '\n') {
        const result = handleSmartEnter(content, selectionRef.current);
        if (result.handled) {
          pushHistory(result.newText);
          selectionRef.current = result.newSelection;
          return;
        }
      }
    }

    pushHistory(newText);
  };

  // Toolbar actions: only explicitly set cursor when user taps a formatting tool
  const applyChange = (result: { newText: string; newSelection: EditorSelection }) => {
    pushHistory(result.newText);
    selectionRef.current = result.newSelection;
    // Set selection for toolbar action
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setNativeProps({
        selection: result.newSelection,
      });
    }, 15);
  };

  const toolbarActions: ToolbarActions = {
    onFormatH1: () => applyChange(toggleLinePrefix(content, selectionRef.current, '# ')),
    onFormatH2: () => applyChange(toggleLinePrefix(content, selectionRef.current, '## ')),
    onFormatH3: () => applyChange(toggleLinePrefix(content, selectionRef.current, '### ')),
    onFormatBold: () => applyChange(wrapSelection(content, selectionRef.current, '**')),
    onFormatItalic: () => applyChange(wrapSelection(content, selectionRef.current, '*')),
    onFormatStrike: () => applyChange(wrapSelection(content, selectionRef.current, '~~')),
    onFormatCode: () => applyChange(wrapSelection(content, selectionRef.current, '`')),
    onFormatBullet: () => applyChange(toggleLinePrefix(content, selectionRef.current, '- ')),
    onFormatNumber: () => applyChange(toggleLinePrefix(content, selectionRef.current, '1. ')),
    onFormatChecklist: () => applyChange(toggleLinePrefix(content, selectionRef.current, '- [ ] ')),
    onFormatQuote: () => applyChange(toggleLinePrefix(content, selectionRef.current, '> ')),
    onIndent: () => applyChange(indentLines(content, selectionRef.current)),
    onOutdent: () => applyChange(outdentLines(content, selectionRef.current)),
    onInsertCodeBlock: () => applyChange(insertCodeBlockTemplate(content, selectionRef.current)),
    onInsertTable: () => applyChange(insertMarkdownTable(content, selectionRef.current)),
    onInsertDivider: () => applyChange(insertDividerTemplate(content, selectionRef.current)),
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
