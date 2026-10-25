import { After, AfterAll, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { Cast, configure } from '@serenity-js/core';
import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { CallAnApi } from '@serenity-js/rest';
import { Browser, chromium } from 'playwright';

let browser: Browser;

setDefaultTimeout(40_000);

export const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'https://whats-due-tomorrow-frontend.vercel.app';
export const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://whatsduetomorrow-backed.onrender.com';

BeforeAll(async () => {
  const isHeadless = process.env.HEADLESS !== 'false';
  browser = await chromium.launch({
    headless: isHeadless,
  });

  configure({
    actors: Cast.where(actor => {
      actor.whoCan(
        CallAnApi.at(BACKEND_BASE_URL),
        BrowseTheWebWithPlaywright.using(browser, {
          baseURL: FRONTEND_BASE_URL,
          permissions: ['clipboard-read', 'clipboard-write'],
          viewport: { width: 1366, height: 2000 },
        })
      );
      return actor;
    }),
    crew: [
      '@serenity-js/console-reporter',
      ['@serenity-js/html-reporter', { specDirectory: './features' }],
    ],
  });
});

After(async () => {
  if (browser) {
    for (const context of browser.contexts()) {
      await context.clearCookies().catch(() => {});
      for (const page of context.pages()) {
        try {
          await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          });
          await page.goto('about:blank');
        } catch {}
      }
    }
  }
});

AfterAll(async () => {
  if (browser) {
    await browser.close();
  }
});
