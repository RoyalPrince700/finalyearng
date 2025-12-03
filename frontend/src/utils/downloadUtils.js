export const getDefaultFilename = (prefix, timestamp) => {
  const date = new Date(timestamp || Date.now());
  const safe =
    date
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19) || 'response';
  return `${prefix}-${safe}`;
};

export const handleDownloadDocx = async (content, filenamePrefix = 'finalyearng-content') => {
  try {
    const { Document, Packer, Paragraph, TextRun } = await import('docx');

    const raw = content || '';
    const lines = raw.split('\n');

    const paragraphs = [];

    if (lines.length > 0) {
      // Treat first line as a bold title/heading
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: lines[0].trim(),
              bold: true
            })
          ]
        })
      );

      const rest = lines.slice(1);
      rest.forEach((line) => {
        const text = line.trim();
        // Preserve blank lines as spacing paragraphs
        if (text === '') {
          paragraphs.push(new Paragraph(''));
        } else {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text
                })
              ]
            })
          );
        }
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs.length ? paragraphs : [new Paragraph('')]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${getDefaultFilename(filenamePrefix)}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate DOCX:', error);
  }
};

export const handleDownloadPdf = async (content, filenamePrefix = 'finalyearng-content') => {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    const text = content || '';
    const maxWidth = 180;
    const lines = doc.splitTextToSize(text, maxWidth);

    doc.text(lines, 10, 10);
    doc.save(`${getDefaultFilename(filenamePrefix)}.pdf`);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
  }
};

