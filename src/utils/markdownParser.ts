import { DrawingData } from '../types';

export type MarkdownBlockType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'p'
  | 'blockquote'
  | 'codeblock'
  | 'drawing'
  | 'checklist'
  | 'bullet'
  | 'number'
  | 'hr'
  | 'table';

export interface MarkdownBlock {
  id: string;
  type: MarkdownBlockType;
  raw: string;
  text: string;
  checked?: boolean;
  codeLang?: string;
  tableRows?: string[][];
  drawingData?: DrawingData;
  lineIndex: number;
}

export interface InlineToken {
  type: 'text' | 'bold' | 'italic' | 'code' | 'strike' | 'link';
  text: string;
  url?: string;
}

/**
 * Tokenize markdown text into blocks
 */
export function parseMarkdownBlocks(content: string): MarkdownBlock[] {
  const lines = content.split('\n');
  const blocks: MarkdownBlock[] = [];

  let inCodeBlock = false;
  let codeLang = '';
  let codeBuffer: string[] = [];
  let codeStartLine = 0;

  let inTable = false;
  let tableBuffer: string[] = [];
  let tableStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code fence
    const codeMatch = line.match(/^```(\w*)/);
    if (codeMatch) {
      if (!inCodeBlock) {
        if (inTable) {
          blocks.push(buildTableBlock(tableBuffer, tableStartLine));
          inTable = false;
          tableBuffer = [];
        }
        inCodeBlock = true;
        codeLang = codeMatch[1] || '';
        codeBuffer = [];
        codeStartLine = i;
        continue;
      } else {
        inCodeBlock = false;
        const codeText = codeBuffer.join('\n');

        // Check if this is an embedded stylus drawing
        if (codeLang === 'drawing' || codeLang === 'sketch') {
          try {
            const parsedData: DrawingData = JSON.parse(codeText);
            blocks.push({
              id: `draw_${codeStartLine}`,
              type: 'drawing',
              raw: `\`\`\`${codeLang}\n${codeText}\n\`\`\``,
              text: codeText,
              codeLang,
              drawingData: parsedData,
              lineIndex: codeStartLine,
            });
            codeBuffer = [];
            continue;
          } catch {
            // fallback to codeblock if JSON is invalid
          }
        }

        blocks.push({
          id: `code_${codeStartLine}`,
          type: 'codeblock',
          raw: codeText,
          text: codeText,
          codeLang: codeLang || 'code',
          lineIndex: codeStartLine,
        });
        codeBuffer = [];
        continue;
      }
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Check table line
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    if (isTableRow) {
      if (!inTable) {
        inTable = true;
        tableStartLine = i;
        tableBuffer = [line];
      } else {
        tableBuffer.push(line);
      }
      continue;
    } else if (inTable) {
      blocks.push(buildTableBlock(tableBuffer, tableStartLine));
      inTable = false;
      tableBuffer = [];
    }

    // Check Horizontal Rule
    if (/^(---+|\*\*\*+|___+)\s*$/.test(line.trim())) {
      blocks.push({
        id: `hr_${i}`,
        type: 'hr',
        raw: line,
        text: '',
        lineIndex: i,
      });
      continue;
    }

    // Check Headings
    const h1Match = line.match(/^#\s+(.+)$/);
    if (h1Match) {
      blocks.push({
        id: `h1_${i}`,
        type: 'h1',
        raw: line,
        text: h1Match[1],
        lineIndex: i,
      });
      continue;
    }

    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      blocks.push({
        id: `h2_${i}`,
        type: 'h2',
        raw: line,
        text: h2Match[1],
        lineIndex: i,
      });
      continue;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      blocks.push({
        id: `h3_${i}`,
        type: 'h3',
        raw: line,
        text: h3Match[1],
        lineIndex: i,
      });
      continue;
    }

    // Check Checklist
    const checkMatch = line.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
    if (checkMatch) {
      const isChecked = checkMatch[2].toLowerCase() === 'x';
      blocks.push({
        id: `check_${i}`,
        type: 'checklist',
        raw: line,
        text: checkMatch[3] || '',
        checked: isChecked,
        lineIndex: i,
      });
      continue;
    }

    // Check Bullet
    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (bulletMatch) {
      blocks.push({
        id: `bullet_${i}`,
        type: 'bullet',
        raw: line,
        text: bulletMatch[2],
        lineIndex: i,
      });
      continue;
    }

    // Check Numbered
    const numberMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/);
    if (numberMatch) {
      blocks.push({
        id: `num_${i}`,
        type: 'number',
        raw: line,
        text: numberMatch[3],
        lineIndex: i,
      });
      continue;
    }

    // Check Blockquote
    const quoteMatch = line.match(/^>\s*(.*)$/);
    if (quoteMatch) {
      blocks.push({
        id: `quote_${i}`,
        type: 'blockquote',
        raw: line,
        text: quoteMatch[1],
        lineIndex: i,
      });
      continue;
    }

    // Regular paragraph / blank line
    blocks.push({
      id: `p_${i}`,
      type: 'p',
      raw: line,
      text: line,
      lineIndex: i,
    });
  }

  if (inCodeBlock) {
    blocks.push({
      id: `code_${codeStartLine}`,
      type: 'codeblock',
      raw: codeBuffer.join('\n'),
      text: codeBuffer.join('\n'),
      codeLang: codeLang || 'code',
      lineIndex: codeStartLine,
    });
  }

  if (inTable) {
    blocks.push(buildTableBlock(tableBuffer, tableStartLine));
  }

  return blocks;
}

function buildTableBlock(lines: string[], startLine: number): MarkdownBlock {
  const rows = lines
    .filter((l) => !l.match(/^\s*\|(\s*[-:]+[-|\s:]*)\|\s*$/))
    .map((l) =>
      l
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim())
    );

  return {
    id: `table_${startLine}`,
    type: 'table',
    raw: lines.join('\n'),
    text: '',
    tableRows: rows,
    lineIndex: startLine,
  };
}

export function parseInlineTokens(text: string): InlineToken[] {
  if (!text) return [];

  const tokens: InlineToken[] = [];
  const regex = /(`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|~~([^~]+)~~|\[([^\]]+)\]\(([^)]+)\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        text: text.substring(lastIndex, match.index),
      });
    }

    if (match[2]) {
      tokens.push({ type: 'code', text: match[2] });
    } else if (match[3]) {
      tokens.push({ type: 'bold', text: match[3] });
    } else if (match[4]) {
      tokens.push({ type: 'italic', text: match[4] });
    } else if (match[5]) {
      tokens.push({ type: 'strike', text: match[5] });
    } else if (match[6] && match[7]) {
      tokens.push({ type: 'link', text: match[6], url: match[7] });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      text: text.substring(lastIndex),
    });
  }

  return tokens;
}
