import { test as setup, request } from "@playwright/test";

const AUTH_FILE = ".auth/user.json";
const TEST_EMAIL = "cto@orbitcto.test";
const TEST_PASSWORD = "orbitcto-x-e2e-2026";
const TEST_NAME = "CTO Command";

setup("authenticate via register API", async ({ page }) => {
  // Register via API request context
  const apiCtx = await request.newContext({ baseURL: "http://localhost:3000" });

  let resp = await apiCtx.post("/api/auth/register", {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD, name: TEST_NAME },
  });

  // If user already exists, login instead
  if (resp.status() === 409) {
    resp = await apiCtx.post("/api/auth/login", {
      data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
  }

  if (!resp.ok()) {
    throw new Error(`Auth API returned ${resp.status()}: ${await resp.text()}`);
  }

  // Get the session cookie and set it directly on the browser context
  const apiStorage = await apiCtx.storageState();
  await page.context().addCookies(apiStorage.cookies);

  // Navigate to app root
  await page.goto("/", { waitUntil: "networkidle" });

  // The authenticated user should see the landing screen
  // Look for the "Launch Mission Control" button
  await page.waitForSelector("button:has-text('Launch Mission Control')", {
    timeout: 15000,
  });

  // Click it to show the dashboard
  await page.click("button:has-text('Launch Mission Control')");

  // Wait for dashboard to fully render — the CommandBar header has the text
  await page.waitForTimeout(2000);

  // Try to find dashboard elements — check for the CommandBar or any module header
  // The dashboard CommandBar has "ORBIT CTO X" as a gradient text span
  // There could be rendering differences — try multiple possible indicators
  const dashboardReady = await Promise.race([
    page.waitForSelector("text=ORBIT CTO X", { timeout: 10000 }).then(() => true).catch(() => false),
    page.waitForSelector("text=Mission Control", { timeout: 10000 }).then(() => true).catch(() => false),
    page.waitForSelector("text=COMMAND CENTER", { timeout: 10000 }).then(() => true).catch(() => false),
  ]);

  if (!dashboardReady) {
    // Debug: capture what's on the page
    const pageText = await page.evaluate(() => document.body.innerText.substring(0, 1500));
    console.log("PAGE CONTENT AFTER LAUNCH:", pageText);
    throw new Error("Dashboard did not appear after launching");
  }

  // Save storage state for subsequent tests
  await page.context().storageState({ path: AUTH_FILE });
});
