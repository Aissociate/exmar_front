import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
} from 'docx';
import { saveAs } from 'file-saver';

interface ReportSection {
  title: string;
  content: string;
}

interface ReportData {
  sections: ReportSection[];
  title?: string;
}

async function fetchImageAsBase64(url: string): Promise<{ data: ArrayBuffer; width: number; height: number }> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        resolve({ data: arrayBuffer, width, height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
}

function parseMarkdownLine(line: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  if (line.match(/^#{1,6}\s/)) {
    const level = line.match(/^(#{1,6})\s/)![1].length;
    const text = line.replace(/^#{1,6}\s/, '').trim();

    const headingLevels = [
      HeadingLevel.HEADING_1,
      HeadingLevel.HEADING_2,
      HeadingLevel.HEADING_3,
      HeadingLevel.HEADING_4,
      HeadingLevel.HEADING_5,
      HeadingLevel.HEADING_6,
    ];

    paragraphs.push(
      new Paragraph({
        text,
        heading: headingLevels[level - 1],
        spacing: { before: 240, after: 120 },
      })
    );
  } else if (line.match(/^[-*]\s/)) {
    const text = line.replace(/^[-*]\s/, '').trim();
    const textRuns = parseInlineFormatting(text);

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: '• ', bold: true }),
          ...textRuns,
        ],
        spacing: { before: 60, after: 60 },
        indent: { left: 360 },
      })
    );
  } else if (line.match(/^\d+\.\s/)) {
    const match = line.match(/^(\d+)\.\s(.*)$/);
    if (match) {
      const [, number, text] = match;
      const textRuns = parseInlineFormatting(text.trim());

      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${number}. `, bold: true }),
            ...textRuns,
          ],
          spacing: { before: 60, after: 60 },
          indent: { left: 360 },
        })
      );
    }
  } else if (line.match(/^>\s/)) {
    const text = line.replace(/^>\s/, '').trim();
    const textRuns = parseInlineFormatting(text);

    paragraphs.push(
      new Paragraph({
        children: textRuns,
        spacing: { before: 120, after: 120 },
        indent: { left: 720 },
        italics: true,
      })
    );
  } else if (line.trim() === '---' || line.trim() === '***') {
    paragraphs.push(
      new Paragraph({
        text: '',
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
        spacing: { before: 120, after: 120 },
      })
    );
  } else if (line.trim() !== '') {
    const textRuns = parseInlineFormatting(line);
    paragraphs.push(
      new Paragraph({
        children: textRuns,
        spacing: { before: 100, after: 100 },
      })
    );
  } else {
    paragraphs.push(new Paragraph({ text: '' }));
  }

  return paragraphs;
}

function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let currentPos = 0;

  const patterns = [
    { regex: /\*\*\*(.+?)\*\*\*/g, bold: true, italics: true },
    { regex: /\*\*(.+?)\*\*/g, bold: true, italics: false },
    { regex: /\*(.+?)\*/g, bold: false, italics: true },
    { regex: /__(.+?)__/g, bold: true, italics: false },
    { regex: /_(.+?)_/g, bold: false, italics: true },
    { regex: /`(.+?)`/g, code: true },
  ];

  const matches: Array<{ start: number; end: number; text: string; bold?: boolean; italics?: boolean; code?: boolean }> = [];

  patterns.forEach(({ regex, bold, italics, code }) => {
    let match;
    const regexCopy = new RegExp(regex.source, regex.flags);
    while ((match = regexCopy.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
        bold,
        italics,
        code,
      });
    }
  });

  matches.sort((a, b) => a.start - b.start);

  const usedRanges: Array<{ start: number; end: number }> = [];
  const validMatches = matches.filter(match => {
    const overlaps = usedRanges.some(
      range => !(match.end <= range.start || match.start >= range.end)
    );
    if (!overlaps) {
      usedRanges.push({ start: match.start, end: match.end });
      return true;
    }
    return false;
  });

  validMatches.forEach(match => {
    if (match.start > currentPos) {
      runs.push(new TextRun({ text: text.substring(currentPos, match.start) }));
    }

    const runOptions: any = { text: match.text };
    if (match.bold) runOptions.bold = true;
    if (match.italics) runOptions.italics = true;
    if (match.code) {
      runOptions.font = 'Courier New';
      runOptions.shading = { fill: 'E8E8E8' };
    }

    runs.push(new TextRun(runOptions));
    currentPos = match.end;
  });

  if (currentPos < text.length) {
    runs.push(new TextRun({ text: text.substring(currentPos) }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
}

async function parseMarkdownContent(content: string): Promise<(Paragraph | Table | ImageRun)[]> {
  const elements: (Paragraph | Table)[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i)) {
      const match = line.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/i);
      if (match) {
        const [, url, alt] = match;
        try {
          const { data, width, height } = await fetchImageAsBase64(url);
          elements.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data,
                  transformation: { width, height },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            })
          );

          let captionLine = lines[i + 1] || '';
          if (captionLine.match(/<p[^>]*>.*?Figure \d+:.*?<\/p>/i)) {
            const captionMatch = captionLine.match(/>([^<]+)</);
            if (captionMatch) {
              elements.push(
                new Paragraph({
                  children: [new TextRun({ text: captionMatch[1], italics: true, size: 20 })],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 80, after: 120 },
                })
              );
            }
            i++;
          }
        } catch (error) {
          console.error('Error loading image:', error);
          elements.push(
            new Paragraph({
              children: [new TextRun({ text: `[Image: ${alt || url}]`, italics: true })],
              spacing: { before: 100, after: 100 },
            })
          );
        }
      }
      i++;
      continue;
    }

    if (line.match(/^!\[.*?\]\(.*?\)/)) {
      const match = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, alt, url] = match;
        try {
          const { data, width, height } = await fetchImageAsBase64(url);
          elements.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data,
                  transformation: { width, height },
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 200, after: 200 },
            })
          );
        } catch (error) {
          elements.push(
            new Paragraph({
              children: [new TextRun({ text: `[Image: ${alt || url}]`, italics: true })],
              spacing: { before: 100, after: 100 },
            })
          );
        }
      }
      i++;
      continue;
    }

    if (line.match(/<div[^>]*>/i) || line.match(/<\/div>/i) || line.match(/<p[^>]*style=/i)) {
      i++;
      continue;
    }

    if (line.match(/^\|/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].match(/^\|/)) {
        tableLines.push(lines[i]);
        i++;
      }

      if (tableLines.length > 2) {
        const headerRow = tableLines[0].split('|').filter(cell => cell.trim() !== '');
        const dataRows = tableLines.slice(2).map(row =>
          row.split('|').filter(cell => cell.trim() !== '')
        );

        const table = new Table({
          rows: [
            new TableRow({
              children: headerRow.map(
                cell =>
                  new TableCell({
                    children: [new Paragraph({ text: cell.trim(), bold: true })],
                    shading: { fill: 'D9E2F3' },
                  })
              ),
            }),
            ...dataRows.map(
              row =>
                new TableRow({
                  children: row.map(
                    cell =>
                      new TableCell({
                        children: [new Paragraph({ text: cell.trim() })],
                      })
                  ),
                })
            ),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
        });

        elements.push(table);
      }
      continue;
    }

    const paragraphs = parseMarkdownLine(line);
    elements.push(...paragraphs);
    i++;
  }

  return elements;
}

export async function exportToDocx(reportData: ReportData, filename: string = 'rapport_expertise.docx') {
  const children: (Paragraph | Table)[] = [];

  if (reportData.title) {
    children.push(
      new Paragraph({
        text: reportData.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  for (const section of reportData.sections) {
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        border: {
          bottom: {
            color: '2563EB',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
      })
    );

    const contentElements = await parseMarkdownContent(section.content);
    children.push(...contentElements);

    children.push(new Paragraph({ text: '' }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
