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
  useWindowDimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useVaultStore } from '../../utils/vaultStore';
import { GoogleDocsToolbar, ToolbarActions } from './GoogleDocsToolbar';
import { DrawingPadModal } from '../drawing/DrawingPadModal';
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
import { EditorSelection, DrawingData } from '../../types';

interface Props {
  isTablet: boolean;
}

export const SmartEditor: React.FC<Props> = ({ isTablet }) => {
  const { height } = useWindowDimensions();
  const { theme } = useTheme();
  const { notes, activeNoteId, updateActiveNoteContent } = useVaultStore();

  const activeNote = notes.find((n) => n.id === activeNoteId);
  const content = activeNote?.content || '';

  const selectionRef = useRef<EditorSelection>({ start: 0, end: 0 });
  const inputRef = useRef<TextInput>(null);

  // Drawing Pad state
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [editingDrawing, setEditingDrawing] = useState<DrawingData | null>(null);

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

  const handleChangeText = (newText: string) => {
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

  const applyChange = (result: { newText: string; newSelection: EditorSelection }) => {
    pushHistory(result.newText);
    selectionRef.current = result.newSelection;
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setNativeProps({
        selection: result.newSelection,
      });
    }, 15);
  };

  const handleCanvasPress = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSaveDrawing = (drawing: DrawingData) => {
    const cursor = selectionRef.current.start;
    const drawingBlock = `\n\n\`\`\`drawing\n${JSON.stringify(drawing)}\n\`\`\`\n\n`;
    const newText = content.slice(0, cursor) + drawingBlock + content.slice(cursor);
    const newPos = cursor + drawingBlock.length;
    applyChange({
      newText,
      newSelection: { start: newPos, end: newPos },
    });
  };

  const toolbarActions: ToolbarActions = {
    onOpenDrawing: () => {
      setEditingDrawing(null);
      setIsDrawingOpen(true);
    },
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

  const overscrollBottomPadding = Math.max(height * 0.65, 450);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Google Docs Formatting Toolbar Ribbon */}
      <GoogleDocsToolbar actions={toolbarActions} />

      {/* Seamless Edge-to-Edge Document Canvas with Infinite Scroll */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: overscrollBottomPadding },
            isTablet && styles.tabletScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={handleCanvasPress}>
            <View style={styles.editorArea}>
              <TextInput
                ref={inputRef}
                multiline
                value={content}
                onChangeText={handleChangeText}
                onSelectionChange={handleSelectionChange}
                placeholder="Start typing your thoughts or sketch with stylus..."
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
                    minHeight: Math.max(height * 0.45, 300),
                  },
                ]}
              />
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Stylus Drawing Pad Modal */}
      <DrawingPadModal
        visible={isDrawingOpen}
        onClose={() => setIsDrawingOpen(false)}
        onSave={handleSaveDrawing}
        initialData={editingDrawing}
      />
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
  },
  tabletScrollContent: {
    paddingHorizontal: 40,
    paddingTop: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 820,
  },
  editorArea: {
    flex: 1,
    minHeight: '100%',
  },
  input: {
    fontSize: 16,
    lineHeight: 26,
    padding: 0,
  },
});
