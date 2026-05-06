// -- Report renderer (HTML -> PDF via Puppeteer) -------------
// Single source of truth for browser launch options + page setup.
// Keeps a long-lived browser instance per process so we don't pay
// the ~1s cold-start cost on every report. The first call to
// renderPdf() boots Chrome; subsequent calls reuse it.
//
// On Linode prod we'll want to install the matching Chromium
// binary at image-build time rather than letting Puppeteer pull
// it at runtime — that's a deploy-time concern, not a code one.

import puppeteer, { type Browser } from 'puppeteer';

let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    });
  }
  return browserPromise;
}

export interface RenderOptions {
  /** A4 portrait by default; pass false for landscape. */
  landscape?: boolean;
  /** Header/footer template HTML. Use `<span class="pageNumber"></span>`
   *  and `<span class="totalPages"></span>` for pagination. */
  headerTemplate?: string;
  footerTemplate?: string;
  /** Whether the header/footer are shown. Defaults to true when
   *  either template is provided. */
  displayHeaderFooter?: boolean;
  margin?: { top?: string; bottom?: string; left?: string; right?: string };
}

/** Render a fully-formed HTML document to a PDF buffer. */
export async function renderPdf(html: string, opts: RenderOptions = {}): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      landscape: opts.landscape ?? false,
      printBackground: true,
      displayHeaderFooter: opts.displayHeaderFooter ?? Boolean(opts.headerTemplate || opts.footerTemplate),
      headerTemplate: opts.headerTemplate ?? '<div></div>',
      footerTemplate: opts.footerTemplate ?? '<div></div>',
      margin: {
        top: opts.margin?.top ?? '20mm',
        bottom: opts.margin?.bottom ?? '20mm',
        left: opts.margin?.left ?? '14mm',
        right: opts.margin?.right ?? '14mm',
      },
    });
    return Buffer.from(pdf);
  } finally {
    await page.close();
  }
}

/** Graceful shutdown — call from server.ts on SIGTERM. */
export async function closeRenderer(): Promise<void> {
  if (browserPromise) {
    const b = await browserPromise;
    await b.close();
    browserPromise = null;
  }
}
