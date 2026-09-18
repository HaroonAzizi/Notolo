import { EditorSelection } from '../types';

export interface FormattedChangeResult {
  newText: string;
  newSelection: EditorSelection;
  handled: boolean;
}

/**
 * Handles smart Enter key press:
 * - Bullet lists (- item -> Enter -> - next)
 * - Numbered lists (1. item -> Enter -> 2. next)
 * - Checklist (- [ ] item -> Enter -> - [ ] next)
 * - Empty list item -> Enter -> exits list mode (clears bullet)
 */
export function handleSmartEnter(
  currentText: string,
  selection: EditorSelection
): FormattedChangeResult {
  const cursor = selection.start;
  const textBeforeCursor = currentText.slice(0, cursor);
  const textAfterCursor = currentText.slice(cursor);

  // Find the current line before cursor
  const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n');
  const currentLine = textBeforeCursor.slice(lastNewlineIndex + 1);

  // Check empty checklist: e.g. "  - [ ] " -> clears and exits
  const emptyChecklistMatch = currentLine.match(/^(\s*)-\s*\[([ xX])?\]\s*$/);
  if (emptyChecklistMatch) {
    const lineStart = lastNewlineIndex + 1;
    const newText = currentText.slice(0, lineStart) + textAfterCursor;
    return {
      newText,
      newSelection: { start: lineStart, end: lineStart },
      handled: true,
    };
  }

  // Check active checklist with text: preserve indentation
  const activeChecklistMatch = currentLine.match(/^(\s*)-\s*\[([ xX])?\]\s+(.+)$/);
  if (activeChecklistMatch) {
    const indent = activeChecklistMatch[1];
    const insertion = `\n${indent}- [ ] `;
    const newText = textBeforeCursor + insertion + textAfterCursor;
    const newPos = cursor + insertion.length;
    return {
      newText,
      newSelection: { start: newPos, end: newPos },
      handled: true,
    };
  }

  // Check empty bullet list: e.g. "  - " -> clears and exits
  const emptyBulletMatch = currentLine.match(/^(\s*)([-*+])\s*$/);
  if (emptyBulletMatch) {
    const lineStart = lastNewlineIndex + 1;
    const newText = currentText.slice(0, lineStart) + textAfterCursor;
    return {
      newText,
      newSelection: { start: lineStart, end: lineStart },
      handled: true,
    };
  }

  // Check active bullet list: preserve indentation
  const activeBulletMatch = currentLine.match(/^(\s*)([-*+])\s+(.+)$/);
  if (activeBulletMatch) {
    const indent = activeBulletMatch[1];
    const bulletChar = activeBulletMatch[2];
    const insertion = `\n${indent}${bulletChar} `;
    const newText = textBeforeCursor + insertion + textAfterCursor;
    const newPos = cursor + insertion.length;
    return {
      newText,
      newSelection: { start: newPos, end: newPos },
      handled: true,
    };
  }

  // Check empty numbered list: e.g. "  1. " -> clears and exits
  const emptyNumberMatch = currentLine.match(/^(\s*)(\d+)\.\s*$/);
  if (emptyNumberMatch) {
    const lineStart = lastNewlineIndex + 1;
    const newText = currentText.slice(0, lineStart) + textAfterCursor;
    return {
      newText,
      newSelection: { start: lineStart, end: lineStart },
      handled: true,
    };
  }

  // Check active numbered list: increment number and preserve indentation
  const activeNumberMatch = currentLine.match(/^(\s*)(\d+)\.\s+(.+)$/);
  if (activeNumberMatch) {
    const indent = activeNumberMatch[1];
    const currentNum = parseInt(activeNumberMatch[2], 10);
    const nextNum = currentNum + 1;
    const insertion = `\n${indent}${nextNum}. `;
    const newText = textBeforeCursor + insertion + textAfterCursor;
    const newPos = cursor + insertion.length;
    return {
      newText,
      newSelection: { start: newPos, end: newPos },
      handled: true,
    };
  }

  // Check blockquote
  const emptyQuoteMatch = currentLine.match(/^(\s*)>\s*$/);
  if (emptyQuoteMatch) {
    const lineStart = lastNewlineIndex + 1;
    const newText = currentText.slice(0, lineStart) + textAfterCursor;
    return {
      newText,
      newSelection: { start: lineStart, end: lineStart },
      handled: true,
    };
  }

  const activeQuoteMatch = currentLine.match(/^(\s*)>\s+(.+)$/);
  if (activeQuoteMatch) {
    const indent = activeQuoteMatch[1];
    const insertion = `\n${indent}> `;
    const newText = textBeforeCursor + insertion + textAfterCursor;
    const newPos = cursor + insertion.length;
    return {
      newText,
      newSelection: { start: newPos, end: newPos },
      handled: true,
    };
  }

  return {
    newText: currentText,
    newSelection: selection,
    handled: false,
  };
}

/**
 * Indent current line or selection (adds 2 spaces)
 */
export function indentLines(
  text: string,
  selection: EditorSelection
): FormattedChangeResult {
  const cursor = selection.start;
  const lastNewline = text.lastIndexOf('\n', Math.max(0, cursor - 1));
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

  const newText = text.slice(0, lineStart) + '  ' + text.slice(lineStart);
  const newPos = cursor + 2;

  return {
    newText,
    newSelection: { start: newPos, end: newPos },
    handled: true,
  };
}

/**
 * Outdent current line or selection (removes up to 2 spaces)
 */
export function outdentLines(
  text: string,
  selection: EditorSelection
): FormattedChangeResult {
  const cursor = selection.start;
  const lastNewline = text.lastIndexOf('\n', Math.max(0, cursor - 1));
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

  const line = text.slice(lineStart);
  let spacesToRemove = 0;
  if (line.startsWith('  ')) {
    spacesToRemove = 2;
  } else if (line.startsWith(' ')) {
    spacesToRemove = 1;
  }

  if (spacesToRemove === 0) {
    return { newText: text, newSelection: selection, handled: false };
  }

  const newText = text.slice(0, lineStart) + line.slice(spacesToRemove);
  const newPos = Math.max(lineStart, cursor - spacesToRemove);

  return {
    newText,
    newSelection: { start: newPos, end: newPos },
    handled: true,
  };
}

/**
 * Wrap selection with markdown symbols (e.g. **bold**, *italic*, `code`, ~~strikethrough~~)
 * When nothing is selected, places cursor inside WITHOUT highlighting any text.
 */
export function wrapSelection(
  text: string,
  selection: EditorSelection,
  prefix: string,
  suffix: string = prefix
): FormattedChangeResult {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);

  if (start !== end) {
    const selectedText = text.slice(start, end);
    const before = text.slice(Math.max(0, start - prefix.length), start);
    const after = text.slice(end, end + suffix.length);

    if (before === prefix && after === suffix) {
      // Unwrap
      const unwrapStart = start - prefix.length;
      const unwrapEnd = end + suffix.length;
      const newText = text.slice(0, unwrapStart) + selectedText + text.slice(unwrapEnd);
      return {
        newText,
        newSelection: { start: unwrapStart, end: unwrapStart + selectedText.length },
        handled: true,
      };
    }

    const newText = text.slice(0, start) + prefix + selectedText + suffix + text.slice(end);
    const newStart = start + prefix.length;
    const newEnd = newStart + selectedText.length;
    return {
      newText,
      newSelection: { start: newStart, end: newEnd },
      handled: true,
    };
  } else {
    // No text selected: insert prefix and suffix with cursor collapsed inside (no highlight)
    const insertion = prefix + suffix;
    const newText = text.slice(0, start) + insertion + text.slice(start);
    const newPos = start + prefix.length;
    return {
      newText,
      newSelection: { start: newPos, end: newPos },
      handled: true,
    };
  }
}

/**
 * Modify line prefix (Headings, bullet, numbered, checklist, quote)
 */
export function toggleLinePrefix(
  text: string,
  selection: EditorSelection,
  prefix: string,
  regexToReplace?: RegExp
): FormattedChangeResult {
  const cursor = selection.start;
  const lastNewline = text.lastIndexOf('\n', Math.max(0, cursor - 1));
  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
  const nextNewline = text.indexOf('\n', cursor);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;

  const line = text.slice(lineStart, lineEnd);

  // If line already starts with prefix, toggle it off
  if (line.startsWith(prefix)) {
    const updatedLine = line.slice(prefix.length);
    const newText = text.slice(0, lineStart) + updatedLine + text.slice(lineEnd);
    const diff = prefix.length;
    const newPos = Math.max(lineStart, cursor - diff);
    return {
      newText,
      newSelection: { start: newPos, end: newPos },
      handled: true,
    };
  }

  let cleanLine = line;
  if (regexToReplace) {
    cleanLine = line.replace(regexToReplace, '');
  } else {
    cleanLine = line.replace(/^(#{1,6}\s+|-\s*\[([ xX])?\]\s+|[-*+]\s+|\d+\.\s+|>\s+)/, '');
  }

  const updatedLine = prefix + cleanLine;
  const newText = text.slice(0, lineStart) + updatedLine + text.slice(lineEnd);
  const diff = updatedLine.length - line.length;
  const newPos = Math.max(lineStart, cursor + diff);

  return {
    newText,
    newSelection: { start: newPos, end: newPos },
    handled: true,
  };
}

export function insertMarkdownTable(
  text: string,
  selection: EditorSelection
): FormattedChangeResult {
  const cursor = selection.start;
  const table =
    `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Item 1 | Details | Status |\n| Item 2 | Details | Status |\n\n`;
  const newText = text.slice(0, cursor) + table + text.slice(cursor);
  const newPos = cursor + table.length;
  return {
    newText,
    newSelection: { start: newPos, end: newPos },
    handled: true,
  };
}

export function insertCodeBlockTemplate(
  text: string,
  selection: EditorSelection
): FormattedChangeResult {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);
  const selectedText = text.slice(start, end);
  const snippet = `\n\`\`\`typescript\n${selectedText || '// Code here'}\n\`\`\`\n`;
  const newText = text.slice(0, start) + snippet + text.slice(end);
  const newPos = start + snippet.length;
  return {
    newText,
    newSelection: { start: newPos, end: newPos },
    handled: true,
  };
}

export function insertDividerTemplate(
  text: string,
  selection: EditorSelection
): FormattedChangeResult {
  const cursor = selection.start;
  const divider = `\n\n---\n\n`;
  const newText = text.slice(0, cursor) + divider + text.slice(cursor);
  const newPos = cursor + divider.length;
  return {
    newText,
    newSelection: { start: newPos, end: newPos },
    handled: true,
  };
}
