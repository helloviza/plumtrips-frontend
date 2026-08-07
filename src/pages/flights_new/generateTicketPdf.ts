// ============================================================
//  generateTicketPdf.ts — builds a branded PlumTrips e-ticket
//  PDF entirely in the browser using pdf-lib.
//
//  npm install pdf-lib
//
//  pdf-lib is written for browsers from the ground up — no Node
//  stream/buffer polyfills required, unlike pdfkit + blob-stream.
// ============================================================

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
  type RGB,
} from "pdf-lib";
import type { DisplayFlight, FareTier } from "../../lib/types_t";

// ---- brand palette (as RGB 0-1 for pdf-lib) --------------------------
const NAVY = rgb(0x0f / 255, 0x17 / 255, 0x2a / 255);
const BLUE = rgb(0x1d / 255, 0x4e / 255, 0xd8 / 255);
const BLUE_LIGHT = rgb(0xef / 255, 0xf6 / 255, 0xff / 255);
const BLUE_MID = rgb(0x3b / 255, 0x82 / 255, 0xf6 / 255);
const SLATE = rgb(0x47 / 255, 0x55 / 255, 0x69 / 255);
const SLATE_LIGHT = rgb(0x94 / 255, 0xa3 / 255, 0xb8 / 255);
const BORDER = rgb(0xe2 / 255, 0xe8 / 255, 0xf0 / 255);
const EMERALD = rgb(0x05 / 255, 0x96 / 255, 0x69 / 255);
const WHITE = rgb(1, 1, 1);

const PAGE_MARGIN = 40;
const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

export interface TicketLeg {
  flight: DisplayFlight;
  tier: FareTier;
  label: string; // "Outbound" | "Return" | "Leg 1" | "Flight"
}

export interface TicketPdfData {
  bookingId?: number;
  pnrList: string[];
  legs: TicketLeg[];
  tripType: "One-way" | "Round Trip" | "Multi-City";
  passengerNames: string[];
  contactEmail?: string;
  totalPaid: number;
  isInternational: boolean;
  formatAmount: (n: number) => string;
}

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
}

interface Ctx {
  doc: PDFDocument;
  page: PDFPage;
  fonts: Fonts;
  data: TicketPdfData;
}

// ---- small drawing helpers ------------------------------------------
// pdf-lib's y=0 is the BOTTOM of the page, and text is drawn from its
// baseline. To keep the rest of this file reading top-down like the
// old pdfkit version, everything below takes a "yFromTop" and converts
// internally.
function toPdfY(page: PDFPage, yFromTop: number, height = 0) {
  return page.getHeight() - yFromTop - height;
}

// pdf-lib's Standard 14 fonts (Helvetica etc.) only support WinAnsi
// encoding. Characters outside that set — ₹, em/en dashes, curly
// quotes, most accented/Indic characters — throw at draw time and
// silently blow up PDF generation. Everything drawn goes through this
// first so a stray character never crashes the whole ticket.
function sanitizeForPdf(text: string): string {
  return text
    .replace(/₹/g, "Rs. ")
    .replace(/[–—]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/[^\x20-\xFF]/g, "?"); // anything else outside WinAnsi's range
}

function drawText(
  page: PDFPage,
  text: string,
  xFromLeft: number,
  yFromTop: number,
  font: PDFFont,
  size: number,
  color: RGB,
  options?: { width?: number; align?: "left" | "right" | "center" }
) {
  text = sanitizeForPdf(text);
  const textWidth = font.widthOfTextAtSize(text, size);
  let x = xFromLeft;
  if (options?.width && options.align && options.align !== "left") {
    const slack = options.width - textWidth;
    if (options.align === "right") x += slack;
    if (options.align === "center") x += slack / 2;
  }
  // baseline sits ~size*0.8 below the top of the glyph box
  const baselineY = toPdfY(page, yFromTop, 0) - size * 0.85;
  page.drawText(text, { x, y: baselineY, size, font, color });
  return textWidth;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = sanitizeForPdf(text).split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedRect(
  page: PDFPage,
  xFromLeft: number,
  yFromTop: number,
  width: number,
  height: number,
  radius: number,
  opts: { fill?: RGB; stroke?: RGB; strokeWidth?: number }
) {
  page.drawRectangle({
    x: xFromLeft,
    y: toPdfY(page, yFromTop, height),
    width,
    height,
    color: opts.fill,
    borderColor: opts.stroke,
    borderWidth: opts.stroke ? opts.strokeWidth ?? 1 : undefined,
    // pdf-lib has no native rounded-rect radius on drawRectangle in
    // older versions; recent versions accept borderRadius directly.
    // Left flat-cornered for maximum version compatibility — visually
    // very close to the 8-10px radius used previously.
  });
  void radius;
}

function badgeWidth(font: PDFFont, text: string, size = 8) {
  return font.widthOfTextAtSize(sanitizeForPdf(text).toUpperCase(), size) + 16;
}

function drawBadge(
  page: PDFPage,
  x: number,
  yFromTop: number,
  text: string,
  bg: RGB,
  fg: RGB,
  font: PDFFont
) {
  const w = badgeWidth(font, text);
  const h = 16;
  drawRoundedRect(page, x, yFromTop, w, h, 8, { fill: bg });
  drawText(page, text.toUpperCase(), x + 8, yFromTop + 4, font, 8, fg);
  return w;
}

function drawHeader(ctx: Ctx) {
  const { page, fonts, data } = ctx;
  const headerH = 92;

  page.drawRectangle({
    x: 0,
    y: toPdfY(page, 0, headerH),
    width: PAGE_WIDTH,
    height: headerH,
    color: BLUE,
  });

  // logo mark — plain circle + "PT" monogram
  const cx = PAGE_MARGIN + 20;
  const cyFromTop = 40;
  page.drawCircle({
    x: cx,
    y: toPdfY(page, cyFromTop, 0),
    size: 20,
    color: WHITE,
  });
  drawText(page, "PT", cx - 12, cyFromTop - 8, fonts.bold, 15, BLUE, {
    width: 24,
    align: "center",
  });

  drawText(page, "PlumTrips", PAGE_MARGIN + 50, 26, fonts.bold, 20, WHITE);
  drawText(
    page,
    "E-TICKET · ITINERARY RECEIPT",
    PAGE_MARGIN + 50,
    50,
    fonts.regular,
    9,
    BLUE_LIGHT
  );

  // right-aligned booking ref block
  const refX = PAGE_WIDTH - PAGE_MARGIN - 200;
  if (data.bookingId) {
    drawText(page, "BOOKING ID", refX, 22, fonts.regular, 8, BLUE_LIGHT, {
      width: 200,
      align: "right",
    });
    drawText(
      page,
      `#${data.bookingId}`,
      refX,
      33,
      fonts.bold,
      13,
      WHITE,
      { width: 200, align: "right" }
    );
  }
  if (data.pnrList.length) {
    drawText(
      page,
      data.pnrList.length > 1 ? "PNRs" : "PNR",
      refX,
      55,
      fonts.regular,
      8,
      BLUE_LIGHT,
      { width: 200, align: "right" }
    );
    drawText(
      page,
      data.pnrList.join("   ·   "),
      refX,
      66,
      fonts.bold,
      13,
      WHITE,
      { width: 200, align: "right" }
    );
  }

  return headerH + 20;
}

function ensureSpace(ctx: Ctx, y: number, needed: number) {
  if (y + needed > PAGE_HEIGHT - PAGE_MARGIN - 60) {
    ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return drawHeader(ctx);
  }
  return y;
}

function drawLeg(ctx: Ctx, y: number, leg: TicketLeg, index: number, total: number) {
  const { page, fonts } = ctx;
  const f = leg.flight;
  const cardH = 70;

  drawRoundedRect(page, PAGE_MARGIN, y, CONTENT_WIDTH, cardH, 10, {
    stroke: BORDER,
    strokeWidth: 1,
  });

  // airline chip
  drawRoundedRect(page, PAGE_MARGIN + 14, y + 14, 34, 34, 8, { fill: BLUE_MID });
  drawText(page, f.airlineCode, PAGE_MARGIN + 14, y + 26, fonts.bold, 9, WHITE, {
    width: 34,
    align: "center",
  });

  const textX = PAGE_MARGIN + 60;
  const nameLine = `${f.airline} · ${f.flightNumber}`;
  drawText(page, nameLine, textX, y + 14, fonts.bold, 11, NAVY);

  const nameWidth = fonts.bold.widthOfTextAtSize(sanitizeForPdf(nameLine), 11);
  drawBadge(page, textX + nameWidth + 10, y + 12, leg.label, BLUE_LIGHT, BLUE, fonts.bold);

  drawText(
    page,
    `${f.fromCode} -> ${f.toCode}   ·   ${f.departDate}   ·   ${leg.tier?.name ?? "Fare"}`,
    textX,
    y + 32,
    fonts.regular,
    9,
    SLATE
  );

  // times, right aligned
  const timeX = PAGE_WIDTH - PAGE_MARGIN - 160;
  drawText(
    page,
    `${f.departTime}  ->  ${f.arriveTime}`,
    timeX,
    y + 20,
    fonts.bold,
    12,
    NAVY,
    { width: 160, align: "right" }
  );
  drawText(
    page,
    `Leg ${index + 1} of ${total}`,
    timeX,
    y + 38,
    fonts.regular,
    8,
    SLATE_LIGHT,
    { width: 160, align: "right" }
  );

  return y + cardH + 12;
}

/**
 * Builds the full ticket PDF and resolves with a browser Blob.
 */
export async function generateTicketPdf(data: TicketPdfData): Promise<Blob> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const ctx: Ctx = { doc, page, fonts: { regular, bold }, data };

  let y = drawHeader(ctx);

  // trip type + summary strip
  let badgeX = PAGE_MARGIN;
  badgeX += drawBadge(ctx.page, badgeX, y, data.tripType, NAVY, WHITE, bold) + 8;
  badgeX +=
    drawBadge(
      ctx.page,
      badgeX,
      y,
      `${data.passengerNames.length} PAX`,
      BLUE_LIGHT,
      BLUE,
      bold
    ) + 8;
  if (data.isInternational) {
    drawBadge(ctx.page, badgeX, y, "International", BLUE_LIGHT, BLUE, bold);
  }
  y += 30;

  // section title
  drawText(ctx.page, "FLIGHT ITINERARY", PAGE_MARGIN, y, bold, 9, SLATE);
  y += 16;

  for (let i = 0; i < data.legs.length; i++) {
    y = ensureSpace(ctx, y, 82);
    y = drawLeg(ctx, y, data.legs[i], i, data.legs.length);
  }

  // passengers
  y = ensureSpace(ctx, y, 40 + data.passengerNames.length * 22);
  y += 6;
  drawText(ctx.page, "PASSENGERS", PAGE_MARGIN, y, bold, 9, SLATE);
  y += 16;

  const passengerBoxH = data.passengerNames.length * 22 + 12;
  drawRoundedRect(ctx.page, PAGE_MARGIN, y, CONTENT_WIDTH, passengerBoxH, 10, {
    fill: WHITE,
    stroke: BORDER,
    strokeWidth: 1,
  });

  data.passengerNames.forEach((name, i) => {
    const rowY = y + 12 + i * 22;
    ctx.page.drawCircle({
      x: PAGE_MARGIN + 24,
      y: toPdfY(ctx.page, rowY + 6, 0),
      size: 9,
      color: BLUE_LIGHT,
    });
    drawText(ctx.page, String(i + 1), PAGE_MARGIN + 24 - 9, rowY + 1, bold, 8, BLUE, {
      width: 18,
      align: "center",
    });
    drawText(ctx.page, name, PAGE_MARGIN + 44, rowY, bold, 10, NAVY, {
      width: CONTENT_WIDTH - 60,
    });
  });
  y += passengerBoxH + 16;

  // fare summary
  y = ensureSpace(ctx, y, 70);
  drawRoundedRect(ctx.page, PAGE_MARGIN, y, CONTENT_WIDTH, 56, 10, { fill: BLUE_LIGHT });
  drawText(ctx.page, "TOTAL AMOUNT PAID", PAGE_MARGIN + 18, y + 14, bold, 8, BLUE);
  drawText(ctx.page, "Inclusive of all taxes & fees", PAGE_MARGIN + 18, y + 30, bold, 9, EMERALD);
  drawText(
    ctx.page,
    data.formatAmount(data.totalPaid),
    PAGE_MARGIN,
    y + 14,
    bold,
    22,
    NAVY,
    { width: CONTENT_WIDTH - 18, align: "right" }
  );
  y += 56 + 24;

  // footer
  y = ensureSpace(ctx, y, 60);
  ctx.page.drawLine({
    start: { x: PAGE_MARGIN, y: toPdfY(ctx.page, y, 0) },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: toPdfY(ctx.page, y, 0) },
    thickness: 1,
    color: BORDER,
    dashArray: [2, 3],
  });
  y += 14;

  const footerText =
    "This is a computer-generated e-ticket and does not require a physical signature. " +
    (data.contactEmail ? `A copy was also emailed to ${data.contactEmail}. ` : "") +
    "Carry a valid photo ID for domestic travel or a valid passport for international travel.";
  const footerLines = wrapText(footerText, regular, 8, CONTENT_WIDTH);
  footerLines.forEach((line, i) => {
    drawText(ctx.page, line, PAGE_MARGIN, y + i * 11, regular, 8, SLATE_LIGHT);
  });

  const bytes = await doc.save();
  // doc.save() returns a Uint8Array whose `.buffer` is typed as
  // ArrayBufferLike (which can include SharedArrayBuffer), so TS won't
  // accept it directly as a BlobPart. Slicing out a concrete ArrayBuffer
  // keeps this type-safe without any risk of copying the wrong bytes.
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
  return new Blob([arrayBuffer], { type: "application/pdf" });
}

/**
 * Convenience wrapper: builds the PDF and immediately triggers a
 * browser download with a sensible filename.
 */
export async function downloadTicketPdf(data: TicketPdfData, filename?: string) {
  const blob = await generateTicketPdf(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    filename ?? `PlumTrips_Ticket_${data.pnrList[0] ?? data.bookingId ?? "eticket"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}