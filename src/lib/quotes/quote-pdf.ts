import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type PdfQuote = {
  id: string;
  title: string;
  description: string | null;
  amount: number | string;
  currency: string;
  status: string;
  created_at: string;
  valid_until: string | null;
};
export type PdfClient = { full_name: string; email: string };

// Standard PDF fonts only support WinAnsi. Replace unsupported symbols instead of failing
// on normal punctuation or user-provided notes; display amounts with the INR code.
function safe(value: unknown): string {
  return String(value ?? "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u20B9/g, "INR ")
    .replace(/[\u2022]/g, "-")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E\n]/g, "")
    .trim();
}
const dateLabel = (value: string | null) => value
  ? new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC"
  }) : "Not specified";

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of safe(text).split("\n")) {
    if (!paragraph.trim()) { lines.push(""); continue; }
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      const combined = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(combined, size) <= maxWidth) {
        current = combined;
        continue;
      }
      if (current) { lines.push(current); current = ""; }
      // Break extremely long URLs/words as well.
      for (const char of word) {
        if (current && font.widthOfTextAtSize(current + char, size) > maxWidth) {
          lines.push(current);
          current = "";
        }
        current += char;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export async function generateQuotePdf(quote: PdfQuote, client: PdfClient): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Quotation - ${safe(quote.title)}`);
  pdf.setAuthor("Bhavik's Interior");
  pdf.setSubject("Project estimate for client review");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, M = 48;
  const cocoa = rgb(0.20, 0.12, 0.086);
  const accent = rgb(0.50, 0.32, 0.19);
  const muted = rgb(0.42, 0.36, 0.32);
  const cream = rgb(0.973, 0.961, 0.946);
  let page: PDFPage = pdf.addPage([W, H]);
  let y = 0;
  const pages: PDFPage[] = [];
  function freshPage(first = false) {
    if (!first) page = pdf.addPage([W, H]);
    pages.push(page);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: cream });
    if (first) {
      page.drawRectangle({ x: 0, y: H - 178, width: W, height: 178, color: cocoa });
      page.drawText("BHAVIK'S INTERIOR", { x: M, y: H - 73, size: 23, font: bold, color: rgb(1, 1, 1) });
      page.drawText("PROJECT QUOTATION", { x: M, y: H - 110, size: 11, font: regular, color: rgb(0.88, 0.81, 0.75) });
      page.drawText(`REFERENCE  ${safe(quote.id.slice(0, 8)).toUpperCase()}`, {
        x: M, y: H - 149, size: 9, font: bold, color: rgb(0.88, 0.81, 0.75)
      });
      y = H - 216;
    } else {
      page.drawText("BHAVIK'S INTERIOR  /  QUOTATION CONTINUED", {
        x: M, y: H - 56, size: 10, font: bold, color: accent
      });
      y = H - 91;
    }
  }
  function textLine(label: string, font = regular, size = 11, color = cocoa, gap = 22) {
    if (y < 90) freshPage();
    page.drawText(safe(label), { x: M, y, font, size, color });
    y -= gap;
  }
  freshPage(true);
  for (const line of wrap(quote.title, bold, 18, W - 2 * M)) {
    textLine(line, bold, 18, cocoa, 25);
  }
  y -= 9;
  for (const line of wrap(`Prepared for: ${client.full_name}`, regular, 11, W - 2 * M)) {
    textLine(line, regular, 11, cocoa, 22);
  }
  for (const line of wrap(`Client email: ${client.email}`, regular, 10, W - 2 * M)) {
    textLine(line, regular, 10, muted, 22);
  }
  textLine(`Created: ${dateLabel(quote.created_at)}     Valid until: ${dateLabel(quote.valid_until)}`, regular, 10, muted, 29);
  textLine(`Status: ${safe(quote.status).toUpperCase()}`, bold, 10, accent, 28);
  page.drawLine({ start: { x: M, y: y + 5 }, end: { x: W - M, y: y + 5 }, thickness: 0.8, color: accent });
  y -= 22;
  textLine("ESTIMATED PROJECT AMOUNT", bold, 10, accent, 27);
  const amount = Number(quote.amount);
  textLine(`INR ${Number.isFinite(amount) ? amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}`, bold, 25, cocoa, 48);
  textLine("PROJECT SCOPE / NOTES", bold, 11, accent, 29);
  for (const line of wrap(quote.description || "No additional scope details provided.", regular, 11, W - M * 2)) {
    textLine(line, regular, 11, cocoa, 18);
  }
  y -= 23;
  for (const line of wrap("This document is a quotation for review, not a tax invoice. Acceptance is recorded separately in your client portal.", regular, 9, W - M * 2)) {
    textLine(line, regular, 9, muted, 15);
  }
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 65 }, end: { x: W - M, y: 65 }, thickness: 0.5, color: accent });
    p.drawText("BHAVIK'S INTERIOR  /  PRIVATE CLIENT QUOTATION", {
      x: M, y: 46, size: 8, font: regular, color: muted
    });
    p.drawText(`${i + 1} / ${pages.length}`, { x: W - M - 36, y: 46, size: 8, font: regular, color: muted });
  });
  return pdf.save();
}
