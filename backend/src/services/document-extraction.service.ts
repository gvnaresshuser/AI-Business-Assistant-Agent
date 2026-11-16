
import mammoth from "mammoth";
import WordExtractor from "word-extractor";
import { PDFParse } from "pdf-parse";

const wordExtractor = new WordExtractor();

export const extractDocumentText = async (
  fileName: string,
  buffer: Buffer
): Promise<string> => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) {
    throw new Error("File extension is missing.");
  }

  let extractedText = "";

  switch (extension) {
    case "txt": {
      extractedText = buffer.toString("utf-8");
      break;
    }

    case "pdf": {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });

      try {
        const result = await parser.getText();
        extractedText = result.text;
      } finally {
        await parser.destroy();
      }

      break;
    }

    case "docx": {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
      break;
    }

    case "doc": {
      const document = await wordExtractor.extract(buffer);
      extractedText = document.getBody();
      break;
    }

    default:
      throw new Error(
        `Unsupported file format: .${extension}. Supported formats: PDF, DOCX, DOC and TXT.`
      );
  }

  const cleanedText = extractedText.trim();

  if (!cleanedText) {
    throw new Error("No readable text found in the uploaded document.");
  }

  return cleanedText;
};
