import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Note } from '../types';

function sanitizeFilename(title: string): string {
  return (title || 'untitled')
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

/**
 * Export note as .md file and share/save
 */
export async function exportAsMarkdown(note: Note): Promise<boolean> {
  try {
    const filename = `${sanitizeFilename(note.title)}.md`;
    if (Platform.OS === 'web') {
      const blob = new Blob([note.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }

    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, note.content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/markdown',
        dialogTitle: `Export ${note.title}`,
        UTI: 'public.plain-text',
      });
      return true;
    } else {
      Alert.alert('File Saved', `Saved to ${fileUri}`);
      return true;
    }
  } catch (error) {
    console.error('Error exporting markdown:', error);
    Alert.alert('Export Error', 'Could not export Markdown file.');
    return false;
  }
}

/**
 * Export note as .txt file and share/save
 */
export async function exportAsPlainText(note: Note): Promise<boolean> {
  try {
    const filename = `${sanitizeFilename(note.title)}.txt`;
    if (Platform.OS === 'web') {
      const blob = new Blob([note.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }

    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, note.content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: `Export ${note.title}`,
        UTI: 'public.plain-text',
      });
      return true;
    } else {
      Alert.alert('File Saved', `Saved to ${fileUri}`);
      return true;
    }
  } catch (error) {
    console.error('Error exporting plain text:', error);
    Alert.alert('Export Error', 'Could not export plain text file.');
    return false;
  }
}

/**
 * Convert Note Markdown into clean HTML and print / export to PDF
 */
export async function exportAsPdf(note: Note): Promise<boolean> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${note.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 40px auto;
            max-width: 800px;
            padding: 0 24px;
            color: #111827;
            line-height: 1.6;
          }
          h1 { font-size: 28px; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #E5E7EB; padding-bottom: 8px; }
          h2 { font-size: 22px; margin-top: 20px; margin-bottom: 8px; }
          h3 { font-size: 18px; margin-top: 16px; margin-bottom: 6px; }
          p { margin: 10px 0; }
          blockquote {
            border-left: 4px solid #4F46E5;
            margin: 16px 0;
            padding-left: 16px;
            color: #4B5563;
            background: #F9FAFB;
            padding-top: 8px;
            padding-bottom: 8px;
          }
          pre {
            background-color: #F3F4F6;
            padding: 14px;
            border-radius: 8px;
            font-family: Courier, monospace;
            font-size: 14px;
            overflow-x: auto;
          }
          code {
            background-color: #F3F4F6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: Courier, monospace;
            font-size: 14px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
          }
          th, td {
            border: 1px solid #E5E7EB;
            padding: 8px 12px;
            text-align: left;
          }
          th { background-color: #F9FAFB; }
          hr { border: none; border-top: 1px solid #E5E7EB; margin: 24px 0; }
          .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #9CA3AF;
            border-top: 1px solid #E5E7EB;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        ${formatMarkdownForHtml(note.content)}
        <div class="footer">
          Generated with Notolo • developed by code.af • ${new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', calendar: 'gregory' }).format(new Date())}
        </div>
      </body>
      </html>
    `;

    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        return true;
      }
      return false;
    }

    await Print.printAsync({ html: htmlContent });
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('PDF Export Error', 'Could not open print / PDF view.');
    return false;
  }
}

function formatMarkdownForHtml(content: string): string {
  return content
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
    .replace(/\*(.*)\*/gim, '<i>$1</i>')
    .replace(/~~(.*)~~/gim, '<del>$1</del>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/^---$/gim, '<hr/>')
    .replace(/^- \[x\] (.*$)/gim, '<div>☑ $1</div>')
    .replace(/^- \[ \] (.*$)/gim, '<div>☐ $1</div>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/gim, '<br/><br/>');
}
