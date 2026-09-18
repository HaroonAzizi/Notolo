import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table as TableIcon,
  Minus,
  RotateCcw,
  RotateCw,
  Indent,
  Outdent,
  PenTool,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { hapticFeedback } from '../../utils/haptics';

export interface ToolbarActions {
  onFormatH1: () => void;
  onFormatH2: () => void;
  onFormatH3: () => void;
  onFormatBold: () => void;
  onFormatItalic: () => void;
  onFormatStrike: () => void;
  onFormatCode: () => void;
  onFormatBullet: () => void;
  onFormatNumber: () => void;
  onFormatChecklist: () => void;
  onFormatQuote: () => void;
  onInsertCodeBlock: () => void;
  onInsertTable: () => void;
  onInsertDivider: () => void;
  onOpenDrawing?: () => void;
  onIndent?: () => void;
  onOutdent?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

interface Props {
  actions: ToolbarActions;
}

export const GoogleDocsToolbar: React.FC<Props> = ({ actions }) => {
  const { theme } = useTheme();

  const handleAction = (callback?: () => void) => {
    if (!callback) return;
    hapticFeedback.light();
    callback();
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: theme.toolbarBg,
          borderTopColor: theme.border,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
      >
        {/* Stylus Drawing Pad button */}
        {actions.onOpenDrawing && (
          <TouchableOpacity
            onPress={() => handleAction(actions.onOpenDrawing)}
            style={[
              styles.toolBtn,
              { backgroundColor: theme.accentSoft, borderRadius: 8 },
            ]}
          >
            <PenTool size={16} color={theme.accent} />
          </TouchableOpacity>
        )}

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Undo / Redo group */}
        {actions.onUndo && (
          <TouchableOpacity
            onPress={() => handleAction(actions.onUndo)}
            disabled={!actions.canUndo}
            style={[
              styles.toolBtn,
              !actions.canUndo && { opacity: 0.35 },
            ]}
          >
            <RotateCcw size={16} color={theme.text} />
          </TouchableOpacity>
        )}

        {actions.onRedo && (
          <TouchableOpacity
            onPress={() => handleAction(actions.onRedo)}
            disabled={!actions.canRedo}
            style={[
              styles.toolBtn,
              !actions.canRedo && { opacity: 0.35 },
            ]}
          >
            <RotateCw size={16} color={theme.text} />
          </TouchableOpacity>
        )}

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Headings */}
        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatH1)}
          style={styles.toolBtn}
        >
          <Heading1 size={17} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatH2)}
          style={styles.toolBtn}
        >
          <Heading2 size={17} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatH3)}
          style={styles.toolBtn}
        >
          <Heading3 size={17} color={theme.text} />
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Text styling */}
        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatBold)}
          style={styles.toolBtn}
        >
          <Bold size={16} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatItalic)}
          style={styles.toolBtn}
        >
          <Italic size={16} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatStrike)}
          style={styles.toolBtn}
        >
          <Strikethrough size={16} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatCode)}
          style={styles.toolBtn}
        >
          <Code size={16} color={theme.text} />
        </TouchableOpacity>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Lists & Tasks */}
        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatChecklist)}
          style={styles.toolBtn}
        >
          <CheckSquare size={16} color={theme.accent} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatBullet)}
          style={styles.toolBtn}
        >
          <List size={16} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatNumber)}
          style={styles.toolBtn}
        >
          <ListOrdered size={16} color={theme.text} />
        </TouchableOpacity>

        {/* Indent / Outdent */}
        {actions.onOutdent && (
          <TouchableOpacity
            onPress={() => handleAction(actions.onOutdent)}
            style={styles.toolBtn}
          >
            <Outdent size={16} color={theme.text} />
          </TouchableOpacity>
        )}

        {actions.onIndent && (
          <TouchableOpacity
            onPress={() => handleAction(actions.onIndent)}
            style={styles.toolBtn}
          >
            <Indent size={16} color={theme.text} />
          </TouchableOpacity>
        )}

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Inserts: Quote, Table, Codeblock, Divider */}
        <TouchableOpacity
          onPress={() => handleAction(actions.onFormatQuote)}
          style={styles.toolBtn}
        >
          <Quote size={16} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction(actions.onInsertTable)}
          style={styles.toolBtn}
        >
          <TableIcon size={16} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction(actions.onInsertCodeBlock)}
          style={styles.toolBtn}
        >
          <Text style={[styles.codeBlockLabel, { color: theme.text }]}>
            {`{ }`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleAction(actions.onInsertDivider)}
          style={styles.toolBtn}
        >
          <Minus size={16} color={theme.text} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 44,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  toolBtn: {
    width: 36,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBlockLabel: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  separator: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
});
