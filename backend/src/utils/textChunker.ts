export const chunkText = (
  text: string,
  chunkSize = 1000,
  overlap = 150
): string[] => {
  const cleanText = text
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) {
    return [];
  }

  if (overlap >= chunkSize || overlap < 0) {
    throw new Error("Overlap must be smaller than chunk size");
  }

  const chunks: string[] = [];

  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);

    const chunk = cleanText.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end === cleanText.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
};