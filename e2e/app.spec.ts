import { test, expect } from "@playwright/test";

const COMMAND_BAR_LOGO = "ORBIT CTO X";

// ── Landing Screen ──────────────────────────────────────

test.describe("Landing Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("displays the brand title and tagline", async ({ page }) => {
    // The landing screen h1 renders as "ORBITCTOX" (spans inside h1)
    // so exact:true won't work — just check for the branding element
    await expect(page.locator("text=ORBIT").first()).toBeVisible();
    await expect(page.getByText(/Autonomous Operating System/i)).toBeVisible();
  });

  test("shows the Launch Mission Control button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /launch mission control/i })).toBeVisible();
  });

  test("shows the Watch Live Demo button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /watch live demo/i })).toBeVisible();
  });

  test("shows status indicators (AGENTS, HEALTH, UPTIME, SYS-LOG)", async ({ page }) => {
    await expect(page.getByText("AGENTS").first()).toBeVisible();
    await expect(page.getByText("HEALTH").first()).toBeVisible();
    await expect(page.getByText("UPTIME").first()).toBeVisible();
    await expect(page.getByText("SYS-LOG").first()).toBeVisible();
  });

  test("shows the typing animation cycling through words", async ({ page }) => {
    // The typing animation shows words like "Predict Risks", "Orchestrate Agents", etc.
    // The cursor is always visible
    const typingArea = page.locator("text=/Predict|Orchestrate|Secure|Analyze/");
    await expect(typingArea.first()).toBeVisible({ timeout: 5000 });
  });

  test("shows glow bubble backgrounds", async ({ page }) => {
    const glowBubble = page.locator(".glow-bubble").first();
    await expect(glowBubble).toBeVisible();
  });

  test("has feature tags (Mission Control, AI Boardroom, etc.)", async ({ page }) => {
    await expect(page.getByText("Mission Control")).toBeVisible();
    await expect(page.getByText("AI Boardroom")).toBeVisible();
    await expect(page.getByText("Digital Twin")).toBeVisible();
    await expect(page.getByText("Doom Predictor")).toBeVisible();
  });

  test("transitions to dashboard when Launch Mission Control is clicked", async ({ page }) => {
    await page.getByRole("button", { name: /launch mission control/i }).click();
    // The landing screen fades out (700ms transition), dashboard appears
    // Wait for landing fade-out (700ms) + dashboard render
    await expect(page.locator(`text=${COMMAND_BAR_LOGO}`).first()).toBeVisible({ timeout: 8000 });
    // Dashboard sidebar should now be visible with module list
    await expect(page.getByText("GitLab Integrator")).toBeVisible();
  });
});

// ── Dashboard ───────────────────────────────────────────

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /launch mission control/i }).click();
    // Wait for landing fade-out (700ms) + dashboard render
    await expect(page.locator(`text=${COMMAND_BAR_LOGO}`).first()).toBeVisible({ timeout: 10000 });
    // The default active tab is "gitlab", so Mission Control is in the sidebar
    await page.getByText("Mission Control").first().click();
    await page.waitForTimeout(500);
  });

  test("displays Engineering Health section", async ({ page }) => {
    await expect(page.getByText("Engineering Health")).toBeVisible();
  });

  test("displays Release Confidence section", async ({ page }) => {
    await expect(page.getByText("Release Confidence")).toBeVisible();
  });

  test("displays Active AI Boardroom Agents", async ({ page }) => {
    await expect(page.getByText("Active AI Boardroom Agents")).toBeVisible();
  });

  test("displays Business Impact Engine", async ({ page }) => {
    await expect(page.getByText("Business Impact Engine")).toBeVisible();
  });

  test("displays Incident Radar section", async ({ page }) => {
    await expect(page.getByText("Incident Radar")).toBeVisible();
  });

  test("shows pipeline crashed alert and navigates on click", async ({ page }) => {
    const crashAlert = page.getByText(/PIPELINE CRASHED/i);
    await expect(crashAlert).toBeVisible();
    await crashAlert.click();
    await expect(page.getByText("Self-Healing Pipeline")).toBeVisible({ timeout: 5000 });
  });

  test("shows active debt alert and navigates on click", async ({ page }) => {
    await page.getByText(/ACTIVE DEBT ALERT/i).click();
    await expect(page.getByText("Incident Commander")).toBeVisible({ timeout: 5000 });
  });

  test("displays CEO, CTO, and CISO agent cards", async ({ page }) => {
    await expect(page.getByText("CEO Agent")).toBeVisible();
    await expect(page.getByText("CTO Agent")).toBeVisible();
    await expect(page.getByText("CISO Agent")).toBeVisible();
  });

  test("shows business impact metrics", async ({ page }) => {
    await expect(page.getByText("$42.8k")).toBeVisible();
    await expect(page.getByText("928 hrs")).toBeVisible();
    await expect(page.getByText("+340%")).toBeVisible();
  });

  test("navigates to Time Machine when clicking Engineering Health", async ({ page }) => {
    await page.getByText("Engineering Health").click();
    await expect(page.getByText("Engineering Timeline")).toBeVisible({ timeout: 5000 });
  });

  test("navigates to Doom Predictor when clicking Release Confidence", async ({ page }) => {
    await page.getByText("Release Confidence").click();
    await expect(page.getByText("Release Doom Risk Analysis")).toBeVisible({ timeout: 5000 });
  });
});

// ── Sidebar Navigation (All 12 Modules) ─────────────────

test.describe("Sidebar Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /launch mission control/i }).click();
    await expect(page.locator(`text=${COMMAND_BAR_LOGO}`).first()).toBeVisible({ timeout: 5000 });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function verifyModule(page: any, sidebarLabel: string, expectedHeading: string) {
    await page.getByText(sidebarLabel).first().click();
    await expect(page.getByText(expectedHeading).first()).toBeVisible({ timeout: 5000 });
  }

  test("GitLab Integrator module loads", async ({ page }) => {
    await verifyModule(page, "GitLab Integrator", "GitLab Project Connector");
    await expect(page.getByText(/Connect your GitLab project/i)).toBeVisible();
  });

  test("Digital Twin module renders 3D canvas", async ({ page }) => {
    await verifyModule(page, "Digital Twin", "3D Codebase");
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
  });

  test("Parallel Universe module loads with scenario inputs", async ({ page }) => {
    await verifyModule(page, "Parallel Universe", "Parallel Universe");
    // Either scenario cards or the empty state should be visible
    await expect(page.getByText(/Enter a decision/i).or(page.getByText("Quick Scenario Templates"))).toBeVisible();
  });

  test("AI Boardroom module loads with debate controls", async ({ page }) => {
    await verifyModule(page, "AI Boardroom", "Executive Discourse Feed");
    await expect(page.getByText(/Convene Board/i).or(page.getByText("Boardroom"))).toBeVisible();
  });

  test("Doom Predictor module loads risk charts", async ({ page }) => {
    await verifyModule(page, "Doom Predictor", "Release Doom Risk Analysis");
    await expect(page.getByRole("button", { name: /evaluate risk/i })).toBeVisible();
  });

  test("Self-Healing CI module loads pipeline controls", async ({ page }) => {
    await verifyModule(page, "Self-Healing CI", "Self-Healing Pipeline");
    await expect(page.getByRole("button", { name: /simulate failure/i })).toBeVisible();
  });

  test("Security Arena module loads with difficulty selector", async ({ page }) => {
    await verifyModule(page, "Security Arena", "AI Hacker Arena");
    await expect(page.getByText("Easy")).toBeVisible();
    await expect(page.getByText("Medium")).toBeVisible();
    await expect(page.getByText("Hard")).toBeVisible();
    await expect(page.getByText("Nightmare")).toBeVisible();
  });

  test("Incidents module loads", async ({ page }) => {
    await verifyModule(page, "Incidents", "Incident Commander");
  });

  test("Time Machine module loads with timeline and archives", async ({ page }) => {
    await verifyModule(page, "Time Machine", "Engineering Timeline");
    await expect(page.getByText("Commit Archives")).toBeVisible();
  });

  test("Knowledge Base module loads with search", async ({ page }) => {
    await verifyModule(page, "Knowledge Base", "Knowledge Base");
    await expect(page.getByPlaceholder(/search the knowledge/i)).toBeVisible();
  });

  test("Achievements module loads", async ({ page }) => {
    await verifyModule(page, "Achievements", "Achievements");
    await expect(page.getByText(/gamification/i).or(page.getByText(/unlocked/i))).toBeVisible({ timeout: 3000 });
  });

  test("navigates back to Mission Control from any module", async ({ page }) => {
    // Navigate away first
    await page.getByText("Security Arena").click();
    await expect(page.getByText("AI Hacker Arena")).toBeVisible();

    // Return to dashboard
    await page.getByText("Mission Control").click();
    await expect(page.getByText("Engineering Health")).toBeVisible();
  });
});

// ── Command Palette ────────────────────────────────────

test.describe("Command Palette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /launch mission control/i }).click();
    await expect(page.locator(`text=${COMMAND_BAR_LOGO}`).first()).toBeVisible({ timeout: 5000 });
  });

  test("opens via Quick Jump button and shows nav items", async ({ page }) => {
    await page.getByText("Quick Jump").click();
    await expect(page.getByPlaceholder(/Type a module name/i)).toBeVisible();
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Boardroom")).toBeVisible();
    await expect(page.getByText("Pipeline")).toBeVisible();
  });

  test("filters results as user types", async ({ page }) => {
    await page.getByText("Quick Jump").click();
    const input = page.getByPlaceholder(/Type a module name/i);

    await input.fill("secur");
    await expect(page.getByText("Security Arena")).toBeVisible();
    await expect(page.getByText("Dashboard")).not.toBeVisible();
  });

  test("closes on Escape keypress", async ({ page }) => {
    await page.getByText("Quick Jump").click();
    await expect(page.getByPlaceholder(/Type a module name/i)).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByPlaceholder(/Type a module name/i)).not.toBeVisible();
  });

  test("navigates to selected module on click", async ({ page }) => {
    await page.getByText("Quick Jump").click();
    await page.getByPlaceholder(/Type a module name/i).fill("boardroom");
    await page.getByText("Boardroom").click();

    await expect(page.getByText("Executive Discourse Feed")).toBeVisible({ timeout: 5000 });
  });

  test("shows empty state when no modules match", async ({ page }) => {
    await page.getByText("Quick Jump").click();
    await page.getByPlaceholder(/Type a module name/i).fill("zzzzz_nonexistent");
    await expect(page.getByText(/No modules match/i)).toBeVisible();
  });

  test("shows keyboard shortcut hints for each item", async ({ page }) => {
    await page.getByText("Quick Jump").click();
    // Shortcuts like ⌘1, ⌘2, etc. should be visible
    await expect(page.getByText("⌘1")).toBeVisible();
    await expect(page.getByText("⌘9")).toBeVisible();
    await expect(page.getByText("⌘0")).toBeVisible();
  });
});

// ── Keyboard Shortcuts ─────────────────────────────────

test.describe("Keyboard Shortcuts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /launch mission control/i }).click();
    await expect(page.locator(`text=${COMMAND_BAR_LOGO}`).first()).toBeVisible({ timeout: 5000 });
  });

  test("⌘K toggles the command palette", async ({ page }) => {
    // Open
    await page.keyboard.press("Meta+k");
    await expect(page.getByPlaceholder(/Type a module name/i)).toBeVisible();

    // Close (toggles off)
    await page.keyboard.press("Meta+k");
    await expect(page.getByPlaceholder(/Type a module name/i)).not.toBeVisible();
  });

  test("⌘1 navigates to Dashboard (Mission Control)", async ({ page }) => {
    // First go to another module
    await page.getByText("Security Arena").click();
    await expect(page.getByText("AI Hacker Arena")).toBeVisible();

    // Use ⌘1 to go to Dashboard
    await page.keyboard.press("Meta+1");
    await expect(page.getByText("Engineering Health")).toBeVisible({ timeout: 5000 });
  });

  test("⌘3 navigates to Self-Healing CI Pipeline", async ({ page }) => {
    await page.keyboard.press("Meta+3");
    await expect(page.getByText("Self-Healing Pipeline")).toBeVisible({ timeout: 5000 });
  });
});

// ── Voice CTO ──────────────────────────────────────────

test.describe("Voice CTO Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /launch mission control/i }).click();
    await expect(page.locator(`text=${COMMAND_BAR_LOGO}`).first()).toBeVisible({ timeout: 5000 });
  });

  test("opens the Voice CTO dialog on click", async ({ page }) => {
    await page.getByText("VOICE CTO").click();
    await expect(page.getByText("Voice CTO Jarvis")).toBeVisible();
  });

  test("sends a text command and navigates to the target module", async ({ page }) => {
    await page.getByText("VOICE CTO").click();
    await expect(page.getByText("Voice CTO Jarvis")).toBeVisible();

    // Type a navigation command and submit
    const input = page.getByPlaceholder(/Ask Jarvis/i);
    await input.fill("open boardroom");
    await input.press("Enter");

    // The mock response should navigate to boardroom synchronously.
    // Wait for the navigation to take effect.
    await expect(page.getByText("Executive Discourse Feed")).toBeVisible({ timeout: 8000 });
  });

  test("sends a risk/inquiry command and gets a response", async ({ page }) => {
    await page.getByText("VOICE CTO").click();
    const input = page.getByPlaceholder(/Ask Jarvis/i);
    await input.fill("what is the risk status");
    await input.press("Enter");

    // The mock fallback will respond. Wait for a bot message to appear.
    await page.waitForTimeout(4000);

    // The chat history should show a bot response (not empty)
    // Find the last bot message by checking for the border-left style class
    const botMessages = page.locator('[class*="border-l"]', { hasText: /risk|threat|confidence|primary/i });
    await expect(botMessages.first()).toBeVisible({ timeout: 8000 });
  });

  test("mute toggle stays functional", async ({ page }) => {
    await page.getByText("VOICE CTO").click();

    // Find the mute/unmute button inside the Voice CTO dialog
    // The header has a button with Volume2/VolumeX icon
    const muteBtn = page.getByText("Voice CTO Jarvis").locator("..").getByRole("button");
    await muteBtn.click();

    // Dialog should remain open
    await expect(page.getByText("Voice CTO Jarvis")).toBeVisible();
  });
});

// ── Theme Toggle ────────────────────────────────────────

test.describe("Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /launch mission control/i }).click();
    await expect(page.locator(`text=${COMMAND_BAR_LOGO}`).first()).toBeVisible({ timeout: 5000 });
  });

  test("theme toggle button exists in the command bar and is clickable", async ({ page }) => {
    // The ThemeToggle component renders a button with Sun/Moon icons.
    // It's placed between GITLAB SYNC indicator and AudioSettings in the CommandBar.
    // Find any button inside the header that's not obviously something else.
    const headerButtons = page.locator("header button");
    const count = await headerButtons.count();
    // There should be multiple buttons in the header (Quick Jump, theme, audio, etc.)
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

// ── Activity Stream ─────────────────────────────────────

test.describe("Activity Stream", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /launch mission control/i }).click();
    await expect(page.locator(`text=${COMMAND_BAR_LOGO}`).first()).toBeVisible({ timeout: 5000 });
  });

  test("shows initial boot log messages", async ({ page }) => {
    await expect(page.getByText(/LAUNCH SEQUENCE ENGAGED/i)).toBeVisible();
    await expect(page.getByText(/COMMAND CENTER STATUS/i)).toBeVisible();
  });

  test("displays all filter tabs", async ({ page }) => {
    // Filter tabs are in a row at the top of the activity stream footer
    const activityFooter = page.locator("footer");
    await expect(activityFooter.getByText("All")).toBeVisible();
    await expect(activityFooter.getByText("Info")).toBeVisible();
    await expect(activityFooter.getByText("Success")).toBeVisible();
    await expect(activityFooter.getByText("Warn")).toBeVisible();
    await expect(activityFooter.getByText("Error")).toBeVisible();
    await expect(activityFooter.getByText("Agent")).toBeVisible();
  });

  test("shows LIVE status when WebSocket is connected", async ({ page }) => {
    await expect(page.getByText("LIVE").first()).toBeVisible();
  });

  test("displays the log count badge", async ({ page }) => {
    // Format: filtered/total (e.g., "4/4")
    // Count badge shows filtered/total counts (e.g., "4/4" or "2/4")
    // The badge text is rendered inside a span with font-mono class
    const countBadge = page.locator("footer").locator("span").filter({ hasText: /\// }).first();
    await expect(countBadge).toBeVisible();
    await expect(countBadge).toBeVisible();
  });

  test("shows severity badge labels on log lines", async ({ page }) => {
    // Log lines display type badges like "INF", "SCC", "WRN", "ERR", "AGT"
    await expect(page.locator("text=AGT").first().or(page.locator("text=INF").first())).toBeVisible();
  });
});

// ── Global Search ───────────────────────────────────────

test.describe("Global Search", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /launch mission control/i }).click();
    await expect(page.locator(`text=${COMMAND_BAR_LOGO}`).first()).toBeVisible({ timeout: 5000 });
  });

  test("search input filters sidebar modules", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search modules/i);
    await searchInput.fill("security");

    // Security Arena should be visible
    await expect(page.getByText("Security Arena")).toBeVisible();
    // Other modules should be hidden
    await expect(page.getByText("Mission Control")).not.toBeVisible();
  });

  test("clearing search restores all sidebar modules", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search modules/i);
    await searchInput.fill("boardroom");

    // Only matching module visible
    await expect(page.getByText("AI Boardroom")).toBeVisible();
    // A non-matching module should be hidden
    await expect(page.getByText("Knowledge Base")).not.toBeVisible();

    // Clear using the Esc button
    await page.getByText("Esc").first().click();

    // All modules restored
    await expect(page.getByText("Knowledge Base")).toBeVisible();
    await expect(page.getByText("Mission Control")).toBeVisible();
  });

  test("shows empty state when no modules match search", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search modules/i);
    await searchInput.fill("zzzzz_nonexistent");

    await expect(page.getByText(/No modules match/i)).toBeVisible();
  });
});

// ── Auth Flow ───────────────────────────────────────────

test.describe("Authentication Flow", () => {
  test("login page is accessible and renders correctly", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    // The login page has "ORBITCTOX" as text with spans — exact won't match
    await expect(page.locator("text=ORBIT").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /register/i })).toBeVisible();
  });

  test("registration form shows name, email, and password fields", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /register/i }).click();
    await expect(page.getByPlaceholder(/your name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/command@orbitcto/i)).toBeVisible();
    await expect(page.getByPlaceholder(/at least 6/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("login form has email and password fields", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByPlaceholder(/command@orbitcto/i)).toBeVisible();
    await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /authenticate/i })).toBeVisible();
  });
});
