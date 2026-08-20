import { chromium } from 'playwright';

const url = new URL('./index.html', import.meta.url).href;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1100, height: 1200 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => {
  // ignore network noise (e.g. webfonts offline) — only real JS errors count
  if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('CONSOLE: ' + m.text());
});
await page.goto(url);
await page.waitForTimeout(400);

const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

/* --- the prototype's availability rule, replicated for deterministic expectations --- */
const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const toUTC = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
const fromUTC = (t) => { const d = new Date(t); return iso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()); };
const addDays = (s, n) => fromUTC(toUTC(s) + n * 864e5);
const dowOf = (s) => new Date(toUTC(s)).getUTCDay();
const now = new Date();
const TODAY = iso(now.getFullYear(), now.getMonth() + 1, now.getDate());
const SLOT_POOL = ['09:00', '09:30', '10:00', '11:00', '13:30', '14:00', '15:00', '16:30'];
const availability = (d) => {
  const dw = dowOf(d);
  if (dw === 0 || dw === 6 || dw === 3) return [];
  if (d < TODAY || d > addDays(TODAY, 45)) return [];
  let hash = 0;
  for (const ch of d) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  const n = 1 + (hash % 4);
  return SLOT_POOL.slice(hash % (SLOT_POOL.length - n + 1), hash % (SLOT_POOL.length - n + 1) + n);
};
let OPEN_DAY = TODAY;                             // first bookable day
while (!availability(OPEN_DAY).length) OPEN_DAY = addDays(OPEN_DAY, 1);
const norm = (s) => (s || '').replace(/ | /g, ' ').trim();

const focusedDate = () => page.evaluate(() => document.activeElement?.dataset?.date ?? null);
const statusOf = (host) => page.$eval(`${host} [role="status"]`, (el) => el.textContent);

/* ============ 1. scheduling calendar ============ */
check('grid + heading render', await page.$eval('#schedCalHost [role="grid"]', () => true).catch(() => false));
check('one tab stop (roving tabindex)',
  (await page.$$eval('#schedCalHost .uni-cal__day[tabindex="0"]', (n) => n.length)) === 1);
check('today carries aria-current=date',
  (await page.getAttribute(`#schedCalHost [data-date="${TODAY}"]`, 'aria-current')) === 'date');
check('closed day disabled', await page.$eval(
  `#schedCalHost [data-date]`, () => true) && await page.evaluate(() => {
    const days = [...document.querySelectorAll('#schedCalHost .uni-cal__day')];
    return days.some((b) => b.disabled);
  }));
const openDayMarked = await page.$eval(`#schedCalHost [data-date="${OPEN_DAY}"]`,
  (b) => ({ dots: !!b.querySelector('.uni-cal__dot'), label: b.getAttribute('aria-label') }))
  .catch(() => null);
check('availability markers render dots', !!openDayMarked?.dots, JSON.stringify(openDayMarked));
check('marker label joins the accessible name', /slots? open/.test(openDayMarked?.label || ''), openDayMarked?.label);

// pick a day → slots appear → pick a slot → booking value
await page.click(`#schedCalHost [data-date="${OPEN_DAY}"]`);
await page.waitForTimeout(60);
const slotCount = await page.$$eval('#slotList .slotbtn', (n) => n.length);
check('picking a day loads its slots', slotCount === availability(OPEN_DAY).length,
  `${slotCount} vs ${availability(OPEN_DAY).length}`);
check('selection announced via live region', /selected/i.test(await statusOf('#schedCalHost')));
await page.click('#slotList .slotbtn');
await page.waitForTimeout(40);
const booking = JSON.parse(await page.textContent('#valueLog'));
check('slot click completes the booking value',
  booking.date === OPEN_DAY && booking.time === availability(OPEN_DAY)[0], JSON.stringify(booking));
check('slot button is aria-pressed',
  (await page.getAttribute('#slotList .slotbtn', 'aria-pressed')) === 'true');

// keyboard: arrows skip disabled days, PageDown moves a month
await page.focus(`#schedCalHost [data-date="${OPEN_DAY}"]`);
await page.keyboard.press('ArrowRight');
let f = await focusedDate();
let expectNext = addDays(OPEN_DAY, 1);
while (!availability(expectNext).length) expectNext = addDays(expectNext, 1);
check('ArrowRight skips disabled days', f === expectNext, `${f} vs ${expectNext}`);
const headBefore = await page.textContent('#schedCalHost .uni-cal__heading');
await page.keyboard.press('PageDown');
const headAfter = await page.textContent('#schedCalHost .uni-cal__heading');
check('PageDown moves to the next month', headBefore !== headAfter, `${headBefore} -> ${headAfter}`);
check('focus survives the month change', !!(await focusedDate()));
await page.click('#btnSchedClear');

/* ============ 2. range calendar ============ */
const bandCount = await page.$$eval('#calRangeHost td.inrange', (n) => n.length);
check('preset range paints a band', bandCount >= 4, String(bandCount));
check('band ends have rounded classes',
  await page.$eval('#calRangeHost td.range-start', () => true).catch(() => false) &&
  await page.$eval('#calRangeHost td.range-end', () => true).catch(() => false));
check('band cells are aria-selected',
  (await page.$$eval('#calRangeHost td.inrange[aria-selected="true"]', (n) => n.length)) === bandCount);

// keyboard range: start → preview → end
const rangeFocus = await page.$eval('#calRangeHost .uni-cal__day[tabindex="0"]', (b) => b.dataset.date);
await page.focus(`#calRangeHost [data-date="${rangeFocus}"]`);
await page.keyboard.press('PageDown');                       // clean month, no preset band
const startDay = await focusedDate();
await page.keyboard.press('Enter');
check('first Enter announces a pending start', /Start date/.test(await statusOf('#calRangeHost')));
await page.keyboard.press('ArrowRight');
await page.keyboard.press('ArrowRight');
const previewCells = await page.$$eval('#calRangeHost td.preview', (n) => n.length);
check('moving focus paints a preview band', previewCells === 3, String(previewCells));
await page.keyboard.press('Enter');
check('second Enter commits the range', /Range selected/.test(await statusOf('#calRangeHost')));
check('committed range spans 3 days',
  (await page.$$eval('#calRangeHost td.inrange', (n) => n.length)) === 3);

// backwards commit swaps ends
await page.keyboard.press('Enter');                          // new start at focus
await page.keyboard.press('ArrowLeft');
await page.keyboard.press('ArrowLeft');
await page.keyboard.press('Enter');
const ends = await page.$$eval('#calRangeHost td.inrange .uni-cal__day', (n) => n.map((b) => b.dataset.date));
check('backwards commit swaps the ends', ends.length === 3 && ends[0] < ends[2], JSON.stringify(ends));

// Escape cancels a pending range
await page.keyboard.press('Enter');
await page.keyboard.press('Escape');
check('Escape cancels a pending range', /cancelled/.test(await statusOf('#calRangeHost')));
check('cancel restores the committed band',
  (await page.$$eval('#calRangeHost td.inrange', (n) => n.length)) === 3);
check('range start survived the round trip', startDay !== null);

/* ============ 3. fenced calendar ============ */
const fenceFocus = await page.$eval('#calMinMaxHost .uni-cal__day[tabindex="0"]', (b) => b.dataset.date);
await page.focus(`#calMinMaxHost [data-date="${fenceFocus}"]`);
// walk to the min fence: repeatedly ArrowLeft; focus must never land disabled or pass min
for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowLeft');
const atFence = await focusedDate();
const min = fenceFocus.slice(0, 8) + '05';
check('ArrowLeft stops at the min fence, never wraps', atFence >= min && ![0, 6].includes(dowOf(atFence)),
  `${atFence} (min ${min})`);

/* ============ 4. date input ============ */
const dateBox = '#dateHost .uni-inputbox';
await page.fill('#date-input', '2026-12-01');
await page.keyboard.press('Enter');
check('ISO parses + reformats', norm(await page.inputValue('#date-input')) === 'Dec 1, 2026',
  await page.inputValue('#date-input'));

await page.fill('#date-input', '8/20');
await page.keyboard.press('Enter');
let y = +TODAY.slice(0, 4);
if (iso(y, 8, 20) < TODAY) y += 1;                          // next occurrence
check('locale numeric, year = next occurrence',
  norm(await page.inputValue('#date-input')) === `Aug 20, ${y}`, await page.inputValue('#date-input'));

await page.fill('#date-input', 'mar 1');
await page.keyboard.press('Enter');
let y2 = +TODAY.slice(0, 4);
if (iso(y2, 3, 1) < TODAY) y2 += 1;
check('month name, year = next occurrence',
  norm(await page.inputValue('#date-input')) === `Mar 1, ${y2}`, await page.inputValue('#date-input'));

await page.fill('#date-input', 'aug 32');
await page.keyboard.press('Enter');
check('aug 32 stays in the field, flagged', (await page.inputValue('#date-input')) === 'aug 32' &&
  await page.$eval(dateBox, (el) => el.classList.contains('uni-inputbox--invalid')));
check('rejection announced', /read/i.test(await statusOf('#dateHost')));
await page.keyboard.press('Escape');
check('Escape reverts to the committed value',
  norm(await page.inputValue('#date-input')) === `Mar 1, ${y2}`, await page.inputValue('#date-input'));

await page.keyboard.press('ArrowUp');
check('ArrowUp steps a committed date +1 day',
  norm(await page.inputValue('#date-input')) === `Mar 2, ${y2}`, await page.inputValue('#date-input'));
await page.keyboard.press('ArrowDown');
check('ArrowDown steps it back',
  norm(await page.inputValue('#date-input')) === `Mar 1, ${y2}`, await page.inputValue('#date-input'));

// popup: open with Alt+ArrowDown, select with Enter, focus returns
check('toggle is aria-haspopup=dialog', (await page.getAttribute('#date-input-toggle', 'aria-haspopup')) === 'dialog');
await page.keyboard.press('Alt+ArrowDown');
await page.waitForTimeout(60);
check('Alt+ArrowDown opens the popup', await page.$eval('#date-input-popup', (el) => !el.hidden));
check('toggle reflects aria-expanded', (await page.getAttribute('#date-input-toggle', 'aria-expanded')) === 'true');
check('focus moved into the grid', !!(await focusedDate()));
await page.keyboard.press('ArrowRight');
await page.keyboard.press('Enter');
await page.waitForTimeout(60);
check('Enter in the grid commits + closes + returns focus',
  await page.$eval('#date-input-popup', (el) => el.hidden) &&
  (await page.evaluate(() => document.activeElement?.id)) === 'date-input' &&
  norm(await page.inputValue('#date-input')) === `Mar 2, ${y2}`,
  await page.inputValue('#date-input'));
await page.keyboard.press('Alt+ArrowDown');
await page.keyboard.press('Escape');
check('Escape closes the popup without selecting',
  await page.$eval('#date-input-popup', (el) => el.hidden) &&
  norm(await page.inputValue('#date-input')) === `Mar 2, ${y2}`);

/* ============ 5. time input ============ */
check('time input is a combobox', (await page.getAttribute('#time-input', 'role')) === 'combobox');
const timeCases = [['930', '9:30 AM'], ['3p', '3:00 PM'], ['3', '3:00 PM'], ['15:00', '3:00 PM']];
for (const [typed, expect] of timeCases) {
  await page.fill('#time-input', typed);
  await page.keyboard.press('Enter');
  check(`"${typed}" parses to ${expect}`, norm(await page.inputValue('#time-input')) === expect,
    await page.inputValue('#time-input'));
}
await page.fill('#time-input', '18');
await page.keyboard.press('Enter');
check('18:00 refused out-of-range (max 17:00)',
  await page.$eval('#timeHost .uni-inputbox', (el) => el.classList.contains('uni-inputbox--invalid')) &&
  (await page.inputValue('#time-input')) === '18');
await page.keyboard.press('Escape');

// listbox navigation
await page.keyboard.press('ArrowDown');
check('ArrowDown opens the listbox', (await page.getAttribute('#time-input', 'aria-expanded')) === 'true');
check('aria-activedescendant set', !!(await page.getAttribute('#time-input', 'aria-activedescendant')));
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
check('Enter picks the active option', (await page.getAttribute('#time-input', 'aria-expanded')) === 'false' &&
  !!(await page.inputValue('#time-input')), await page.inputValue('#time-input'));

// slot-pinned field
await page.fill('#slotTime-input', '5pm');
await page.keyboard.press('Enter');
check('parseable but unavailable slot refused', /isn't available/.test(await statusOf('#slotTimeHost')));
await page.fill('#slotTime-input', '11');
await page.keyboard.press('Enter');
check('a listed slot commits', norm(await page.inputValue('#slotTime-input')) === '11:00 AM',
  await page.inputValue('#slotTime-input'));

/* ============ 6. composed date-time ============ */
check('time part disabled until a date is chosen',
  await page.$eval('#dt-time', (el) => el.disabled));
await page.fill('#dt-date', OPEN_DAY);
await page.keyboard.press('Enter');
await page.waitForTimeout(40);
check('choosing a date enables the time part', await page.$eval('#dt-time', (el) => !el.disabled));
await page.focus('#dt-time');
await page.keyboard.press('ArrowDown');
const dtOpts = await page.$$eval('#dt-time-listbox [role="option"]', (n) => n.map((x) => x.dataset.value));
check('time options are that day\'s slots', JSON.stringify(dtOpts) === JSON.stringify(availability(OPEN_DAY)),
  JSON.stringify(dtOpts));
await page.keyboard.press('Enter');
await page.waitForTimeout(40);
const combined = await page.textContent('#dtValue');
check('combined value emits only when both set',
  combined === `${OPEN_DAY}T${availability(OPEN_DAY)[0]}`, combined);

// changing the day clears a slot that no longer exists
let otherDay = addDays(OPEN_DAY, 1);
while (!availability(otherDay).length || availability(otherDay).includes(availability(OPEN_DAY)[0]))
  otherDay = addDays(otherDay, 1);
await page.fill('#dt-date', otherDay);
await page.keyboard.press('Enter');
await page.waitForTimeout(40);
check('changing the day clears a now-invalid slot',
  (await page.inputValue('#dt-time')) === '' && (await page.textContent('#dtValue')) === '—',
  await page.textContent('#dtValue'));

/* ============ 7. a11y wiring ============ */
check('grids labelled by their headings',
  await page.$$eval('[role="grid"]', (grids) => grids.every((g) => !!g.getAttribute('aria-labelledby'))));
check('weekday headers carry full names in abbr',
  await page.$eval('#schedCalHost th abbr', (a) => a.title.length > 3));
check('nav buttons are named', await page.$$eval('#schedCalHost .uni-cal__navbtn',
  (btns) => btns.map((b) => b.getAttribute('aria-label')).join()).then((s) => /Previous month.*Next month/.test(s)));
check('every widget has a polite status region',
  (await page.$$eval('[role="status"]', (n) => n.filter((el) => el.getAttribute('aria-live') === 'polite').length)) >= 6);

/* ============ screenshots ============ */
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: new URL('./shot-light.png', import.meta.url).pathname, fullPage: false });
await page.click('#themeToggle');
await page.waitForTimeout(200);
await page.screenshot({ path: new URL('./shot-dark.png', import.meta.url).pathname, fullPage: false });

await browser.close();

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  — ' + r.detail : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (errors.length) console.log('\nJS ERRORS:\n' + errors.join('\n'));
process.exit(failed.length || errors.length ? 1 : 0);
