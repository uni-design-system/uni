import { chromium } from 'playwright';

const url = new URL('./index.html', import.meta.url).href;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
const errors = [];
const warnings = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('Failed to load resource')) errors.push('CONSOLE: ' + m.text());
  if (m.type() === 'warning') warnings.push(m.text());
});
await page.goto(url);
await page.waitForTimeout(400);

const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

const clickId = async (id, ms = 120) => { await page.evaluate((i) => document.getElementById(i).click(), id); await page.waitForTimeout(ms); };
const isOpen = (id) => page.evaluate((i) => document.getElementById(i)?.matches(':popover-open') ?? false, id);
const attr = (id, a) => page.evaluate(({ i, a }) => document.getElementById(i)?.getAttribute(a), { i: id, a });
const activeId = () => page.evaluate(() => document.activeElement?.id || document.activeElement?.textContent?.trim());
const rect = (id) => page.evaluate((i) => { const r = document.getElementById(i).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; }, id);
const logHas = (s) => page.evaluate((t) => document.getElementById('eventLog').textContent.includes(t), s);
const mouseClickCenter = async (id) => {
  const r = await rect(id);
  await page.mouse.click(r.x + r.w / 2, r.y + r.h / 2);
  await page.waitForTimeout(100);
};
const scrollTo = async (id) => {
  await page.evaluate((i) => document.getElementById(i).scrollIntoView({ block: 'center' }), id);
  await page.waitForTimeout(120);
};

/* ============ 1 · popover, rich mode ============ */
await scrollTo('po-basic-btn');
await clickId('po-basic-btn');
check('rich: click opens', await isOpen('po-basic-panel'));
check('rich: aria-expanded=true', (await attr('po-basic-btn', 'aria-expanded')) === 'true');
check('rich: aria-controls wired', (await attr('po-basic-btn', 'aria-controls')) === 'po-basic-panel');
await page.keyboard.press('Escape');
await page.waitForTimeout(120);
check('rich: Escape light-dismisses', !(await isOpen('po-basic-panel')));
check('rich: aria-expanded back to false', (await attr('po-basic-btn', 'aria-expanded')) === 'false');
await clickId('po-basic-btn');
await page.mouse.click(20, 400); // outside
await page.waitForTimeout(120);
check('rich: outside click light-dismisses', !(await isOpen('po-basic-panel')));

// structured + autofocus form
await clickId('po-filter-btn');
check('structured: opens with header', await isOpen('po-filter-panel'));
check('structured: aria-labelledby → title', (await attr('po-filter-panel', 'aria-labelledby')) === 'po-filter-title');
check('structured: autofocus input focused on open', (await activeId()) === 'po-filter-input');
await page.type('#po-filter-input', 'design');
await clickId('po-filter-apply');
check('structured: Apply closes', !(await isOpen('po-filter-panel')));
check('structured: focus returns to trigger', (await activeId()) === 'po-filter-btn');
await clickId('po-filter-btn');
await clickId('po-filter-close');
check('structured: ✕ closes and restores focus', !(await isOpen('po-filter-panel')) && (await activeId()) === 'po-filter-btn');

// detached anchor
await clickId('po-detached-btn');
check('detached: opens', await isOpen('po-detached-panel'));
check('detached: controller keeps ARIA', (await attr('po-detached-btn', 'aria-controls')) === 'po-detached-panel' && (await attr('po-detached-btn', 'aria-expanded')) === 'true');
{
  const p = await rect('po-detached-panel');
  const f = await rect('email-field');
  check('detached: panel anchored to the field, not the trigger',
    Math.abs(p.x - f.x) < 2 && Math.abs(p.y - (f.b + 7)) < 2,
    `panel(${p.x.toFixed(1)},${p.y.toFixed(1)}) field-left=${f.x.toFixed(1)} field-bottom+7=${(f.b + 7).toFixed(1)}`);
}
await page.keyboard.press('Escape');
await page.waitForTimeout(120);

/* ============ 2 · tooltip mode ============ */
await scrollTo('tt-bold');
{
  const r = await rect('tt-bold');
  await page.mouse.move(r.x + r.w / 2, r.y + r.h / 2);
  await page.waitForTimeout(200);
  check('tooltip: not open before 500ms delay', !(await isOpen('tt-bold-tip-panel')));
  await page.waitForTimeout(600);
  check('tooltip: opens after hover delay', await isOpen('tt-bold-tip-panel'));
  check('tooltip: role=tooltip', (await attr('tt-bold-tip-panel', 'role')) === 'tooltip');
  check('tooltip: aria-describedby on trigger', (await attr('tt-bold', 'aria-describedby')) === 'tt-bold-tip-panel');
  check('tooltip: no aria-expanded in this mode', (await attr('tt-bold', 'aria-expanded')) === null);
  // hoverable: travel into the panel, it must stay
  const p = await rect('tt-bold-tip-panel');
  await page.mouse.move(p.x + p.w / 2, p.y + p.h / 2);
  await page.waitForTimeout(400);
  check('tooltip: pointer can rest inside the panel (WCAG 1.4.13 hoverable)', await isOpen('tt-bold-tip-panel'));
  await page.mouse.move(10, 600);
  await page.waitForTimeout(350);
  check('tooltip: closes after pointer leaves', !(await isOpen('tt-bold-tip-panel')));
}
await page.evaluate(() => document.getElementById('tt-italic').focus());
await page.waitForTimeout(120);
check('tooltip: focus opens instantly', await isOpen('tt-italic-tip-panel'));
await page.keyboard.press('Escape');
await page.waitForTimeout(120);
check('tooltip: Escape dismisses without moving focus', !(await isOpen('tt-italic-tip-panel')) && (await activeId()) === 'tt-italic');
await page.evaluate(() => document.activeElement.blur());

/* ============ 3 · callout — spotlight ============ */
await scrollTo('app-card');
await page.evaluate(() => document.getElementById('btnSpot').focus());
await clickId('btnSpot', 200);
check('spotlight: panel + scrim open', (await isOpen('co-panel')) && (await isOpen('co-scrim')));
check('spotlight: initial focus lands in the panel', (await activeId()) === 'co-gotit');
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
check('spotlight: Escape dismisses with reason', await logHas('reason=escape'));
check('spotlight: focus restored to the opener', (await activeId()) === 'btnSpot');

await clickId('btnSpot', 200);
{
  const w = await rect('co-window');
  const t = await rect('app-name');
  const pad = 8; // spotlightPadding 6 + ring 2
  const ok = Math.abs(w.x - (t.x - pad)) < 1.5 && Math.abs(w.y - (t.y - pad)) < 1.5 &&
             Math.abs(w.r - (t.r + pad)) < 1.5 && Math.abs(w.b - (t.b + pad)) < 1.5;
  check('spotlight: hole hugs the target (+pad)', ok, `win(${w.x.toFixed(1)},${w.y.toFixed(1)}) target(${t.x.toFixed(1)},${t.y.toFixed(1)})`);
}
// native tracking: scroll with it open, hole must follow with zero JS
await page.evaluate(() => window.scrollBy(0, 120));
await page.waitForTimeout(150);
{
  const w = await rect('co-window');
  const t = await rect('app-name');
  check('spotlight: hole tracks the target through scroll (no listeners)',
    Math.abs(w.x - (t.x - 8)) < 1.5 && Math.abs(w.y - (t.y - 8)) < 1.5,
    `win.y=${w.y.toFixed(1)} target.y-8=${(t.y - 8).toFixed(1)}`);
}
// the target is genuinely interactive through the hole
await mouseClickCenter('app-name');
check('spotlight: target clickable through the hole', (await activeId()) === 'app-name');
await page.keyboard.type('hello');
check('spotlight: typing lands in the target', (await page.inputValue('#app-name')) === 'hello');
// everything else is blocked
{
  const before = await page.evaluate(() => document.getElementById('eventLog').textContent);
  await mouseClickCenter('btnDim'); // strip intercepts this
  const after = await page.evaluate(() => document.getElementById('eventLog').textContent);
  check('spotlight: clicks outside the hole are blocked', (await isOpen('co-panel')) && !after.replace(before, '').includes('welcome-back'));
}
// duet loop
await page.evaluate(() => document.getElementById('co-gotit').focus());
await page.keyboard.press('Tab');
check('duet loop: Tab from last panel action reaches the target', (await activeId()) === 'app-name');
await page.keyboard.press('Tab');
check('duet loop: Tab from target wraps to the ✕', (await activeId()) === 'co-close');
await page.keyboard.press('Shift+Tab');
check('duet loop: Shift+Tab walks backwards', (await activeId()) === 'app-name');
// focus stays in the target on dismiss when the user went there deliberately
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
check('spotlight: focus STAYS in the target after dismiss (user was sent there)', (await activeId()) === 'app-name');
await page.evaluate(() => { document.getElementById('app-name').value = ''; document.activeElement.blur(); });

// non-interactive spotlight
await scrollTo('btnSpotLocked');
await clickId('btnSpotLocked', 200);
check('locked spotlight: cover over the hole is visible', await page.evaluate(() => !document.getElementById('co-cover').hidden));
{
  const before = await page.evaluate(() => document.getElementById('eventLog').textContent);
  await mouseClickCenter('app-save');
  const after = await page.evaluate(() => document.getElementById('eventLog').textContent);
  check('locked spotlight: target is NOT clickable', !after.replace(before, '').includes('Save clicked') && (await isOpen('co-panel')));
}
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

// dim, no target
await clickId('btnDim', 200);
check('dim: full-viewport scrim, no window', await page.evaluate(() =>
  !document.getElementById('co-cover').hidden &&
  document.getElementById('co-cover').classList.contains('co-cover--full') &&
  document.getElementById('co-window').hidden));
{
  const p = await rect('co-panel');
  const centered = Math.abs((p.x + p.w / 2) - 550) < 4;
  check('dim: panel centers in the viewport', centered, `center=${(p.x + p.w / 2).toFixed(1)}`);
}
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

// backdrop none
await clickId('btnNoBackdrop', 200);
check('backdrop none: no scrim at all', (await isOpen('co-panel')) && !(await isOpen('co-scrim')));
await page.keyboard.press('Escape');
await page.waitForTimeout(150);

/* ============ 4 · tour ============ */
await scrollTo('btnTour');
await clickId('btnTour', 250);
check('tour: step 1 labelled with progress', ((await attr('tour-panel', 'aria-label')) || '').includes('Welcome to Projects, step 1 of 6'));
check('tour: welcome step dims (no target)', await page.evaluate(() => document.getElementById('tour-cover').classList.contains('co-cover--full')));
check('tour: no Back on the first step', await page.evaluate(() => !document.getElementById('tour-back')));
await clickId('tour-next', 250);
check('tour: step 2 spotlights the search field', ((await attr('tour-panel', 'aria-label')) || '').includes('step 2 of 6'));
check('tour: read-only step covers the hole', await page.evaluate(() => !document.getElementById('tour-cover').hidden && !document.getElementById('tour-cover').classList.contains('co-cover--full')));
check('tour: Back appears from step 2', await page.evaluate(() => !!document.getElementById('tour-back')));
// arrow keys from inside the panel
await page.evaluate(() => document.getElementById('tour-next').focus());
await page.keyboard.press('ArrowLeft');
await page.waitForTimeout(200);
check('tour: ArrowLeft goes back (focus in panel)', ((await attr('tour-panel', 'aria-label')) || '').includes('step 1 of 6'));
await page.evaluate(() => document.getElementById('tour-next').focus());
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(200);
check('tour: ArrowRight advances (focus in panel)', ((await attr('tour-panel', 'aria-label')) || '').includes('step 2 of 6'));
await clickId('tour-next', 250);

// step 3 — input-gated
check('gate(input): Next starts disabled', await page.evaluate(() => document.getElementById('tour-next')?.disabled === true));
await mouseClickCenter('app-name');
await page.keyboard.type('My project');
await page.waitForTimeout(150);
check('gate(input): typing in the target enables Next', await page.evaluate(() => document.getElementById('tour-next')?.disabled === false));
check('gate(input): unlock announced', await page.evaluate(() => document.getElementById('live').textContent === 'Next available'));
check('gate(input): no auto-advance mid-typing', ((await attr('tour-panel', 'aria-label')) || '').includes('step 3 of 6'));
await clickId('tour-next', 250);

// step 4 — click-gated: the action IS the advance
check('gate(click): step 4 shows no Next button', await page.evaluate(() => !document.getElementById('tour-next')));
check('gate(click): still on step 4', ((await attr('tour-panel', 'aria-label')) || '').includes('step 4 of 6'));
await mouseClickCenter('app-save');
await page.waitForTimeout(250);
check('gate(click): clicking the spotlit target advances', ((await attr('tour-panel', 'aria-label')) || '').includes('step 6 of 6'));
check('tour: missing-target step skipped with a warning', warnings.some((w) => w.includes('[uni-tour] step "ghost"')));
check('tour: skip logged for the ghost step', await logHas('tour step skipped'));
check('tour: last step button reads Done', await page.evaluate(() => document.getElementById('tour-next')?.textContent === 'Done'));
await clickId('tour-next', 250);
check('tour: Done finishes', (await logHas('tour finished')) && !(await isOpen('tour-panel')));

// Escape skips with the step payload
await clickId('btnTour', 250);
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
check('tour: Escape skips and reports the step', (await logHas('tour skipped')) && (await logHas('at "welcome"')) && !(await isOpen('tour-panel')));

/* ============ screenshots ============ */
await page.evaluate(() => { document.getElementById('app-name').value = ''; });
await scrollTo('app-card');
await clickId('btnSpot', 300);
await page.screenshot({ path: new URL('./shot-light.png', import.meta.url).pathname });
await page.keyboard.press('Escape');
await page.waitForTimeout(150);
await clickId('themeToggle', 100);
await clickId('btnTour', 300);
await clickId('tour-next', 300);
await page.screenshot({ path: new URL('./shot-dark.png', import.meta.url).pathname });
await page.keyboard.press('Escape');

await browser.close();

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  — ' + r.detail : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (errors.length) console.log('\nJS ERRORS:\n' + errors.join('\n'));
process.exit(failed.length || errors.length ? 1 : 0);
