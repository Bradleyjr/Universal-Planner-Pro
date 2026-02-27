// Minimal type to avoid requiring playwright as a build dependency.
// Playwright is only installed in CI (GitHub Actions) for scraping.
interface Browser {
  close(): Promise<void>;
  newContext(...args: unknown[]): Promise<unknown>;
  newPage(...args: unknown[]): Promise<unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let browser: any = null;

export async function getBrowser(): Promise<Browser> {
  if (browser) return browser;

  // Dynamic import — Playwright is only needed during scraping (GitHub Actions),
  // not at runtime on Vercel where it isn't installed.
  // @ts-expect-error — playwright is only installed in CI, not during Vercel builds
  const { chromium } = await import("playwright");

  browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox"],
  });

  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
