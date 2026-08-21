import { chromium } from 'playwright';

const url = new URL('./index.html', import.meta.url).href;
// The container pre-installs Chromium at /opt/pw-browsers/chromium; drop
// executablePath if you have Playwright's own browsers installed.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => {
  // offline runs can't fetch the Google font — that's not a page bug
  if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('CONSOLE: ' + m.text());
});
await page.goto(url);
await page.waitForTimeout(300);

const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

const focusInput = async (id) => { await page.evaluate((i) => document.getElementById(i).focus(), id); await page.waitForTimeout(40); };
const attr = (sel, name) => page.getAttribute(sel, name);
const val = (box) => page.evaluate((b) => window.__proto[b].getValue(), box);
const live = (host) => page.$eval(`#${host} [data-role="live"]`, (n) => n.textContent);
const optionLabels = (id) => page.$$eval(`#${id}-listbox [role="option"] .opt-label`, (n) => n.map((x) => x.textContent));
const blurAll = async () => { await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(60); };

// ---------- 1 · basic open / filter / commit ----------
check('initially closed, empty, no clear button',
  (await attr('#state-input', 'aria-expanded')) === 'false' &&
  (await page.inputValue('#state-input')) === '' &&
  (await page.$eval('#stateHost .uni-combobox__clear', (n) => getComputedStyle(n).display === 'none')));

await page.click('#state-input');
await page.waitForTimeout(60);
check('click opens the full list', (await attr('#state-input', 'aria-expanded')) === 'true' &&
  (await optionLabels('state')).length === 50);
check('list scrolls at maxVisibleOptions (never truncates)',
  await page.$eval('#state-listbox', (n) => n.scrollHeight > n.clientHeight));

await page.type('#state-input', 'ala');
await page.waitForTimeout(60);
let labels = await optionLabels('state');
check('typing filters locally (contains, case-insensitive)',
  labels.length === 2 && labels.includes('Alabama') && labels.includes('Alaska'), JSON.stringify(labels));
check('typing activates nothing', (await attr('#state-input', 'aria-activedescendant')) === null);

await page.keyboard.press('ArrowDown');
check('ArrowDown activates first match',
  (await attr('#state-input', 'aria-activedescendant')) === 'state-option-0');
await page.keyboard.press('Enter');
await page.waitForTimeout(60);
check('Enter commits the active option (rule 1)',
  (await val('stateBox')) === 'ALABAMA' && (await page.inputValue('#state-input')) === 'Alabama' &&
  (await attr('#state-input', 'aria-expanded')) === 'false');
check('commit announced', (await live('stateHost')).includes('Alabama selected'));

// ---------- reopen: committed option marked + active ----------
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(60);
labels = await optionLabels('state');
const committedState = await page.$eval('#state-listbox [aria-selected="true"] .opt-label', (n) => n.textContent);
const activeId = await attr('#state-input', 'aria-activedescendant');
check('ArrowDown on a committed value opens full list with it selected + active',
  labels.length === 50 && committedState === 'Alabama' && activeId === 'state-option-0');
await page.keyboard.press('Escape');

// ---------- clear ----------
check('clear button appears with a value',
  await page.$eval('#stateHost .uni-combobox__clear', (n) => getComputedStyle(n).display !== 'none'));
await page.click('#stateHost .uni-combobox__clear');
await page.waitForTimeout(60);
check('clear nulls the value, empties the field, refocuses, announces',
  (await val('stateBox')) === null && (await page.inputValue('#state-input')) === '' &&
  (await page.evaluate(() => document.activeElement.id)) === 'state-input' &&
  (await live('stateHost')).includes('cleared'));

// ---------- rule 2: exact match on Enter ----------
await page.keyboard.press('Escape'); // close the clear-refocus list if any
await page.type('#state-input', 'ohio');
await page.keyboard.press('Enter');
await page.waitForTimeout(60);
check('Enter commits an exact label match, case-insensitive (rule 2)',
  (await val('stateBox')) === 'OHIO' && (await page.inputValue('#state-input')) === 'Ohio');

// ---------- rule 3: unique filtered candidate, Enter only ----------
await page.fill('#state-input', '');
await page.type('#state-input', 'alab');
await page.keyboard.press('Enter');
await page.waitForTimeout(60);
check('Enter commits a uniquely-filtered option (rule 3)', (await val('stateBox')) === 'ALABAMA');

// blur must NOT apply rule 3
await page.fill('#state-input', '');
await page.type('#state-input', 'alas');
await blurAll();
check('blur reverts a unique-but-inexact draft (rule 3 is Enter-only) + rejected',
  (await val('stateBox')) === 'ALABAMA' && (await page.inputValue('#state-input')) === 'Alabama' &&
  (await page.$eval('#stateLog', (n) => n.textContent)).includes('rejected'));

// ---------- blur commits exact matches ----------
await focusInput('state-input');
await page.fill('#state-input', '');
await page.type('#state-input', 'Texas');
await blurAll();
check('blur commits an exact-match draft', (await val('stateBox')) === 'TEXAS');

// ---------- Enter with no match keeps the list open ----------
await focusInput('state-input');
await page.fill('#state-input', '');
await page.type('#state-input', 'xyzzy');
await page.waitForTimeout(60);
check('no matches renders the empty row',
  (await page.$eval('#state-listbox', (n) => n.textContent)).includes('No matches'));
await page.keyboard.press('Enter');
await page.waitForTimeout(60);
check('Enter on no match keeps the list open, value untouched',
  (await attr('#state-input', 'aria-expanded')) === 'true' && (await val('stateBox')) === 'TEXAS');

// ---------- Escape ladder ----------
await page.keyboard.press('Escape');
check('Escape closes the list, draft kept',
  (await attr('#state-input', 'aria-expanded')) === 'false' &&
  (await page.inputValue('#state-input')) === 'xyzzy');
await page.keyboard.press('Escape');
check('second Escape reverts the draft to the committed label',
  (await page.inputValue('#state-input')) === 'Texas');
await page.keyboard.press('Escape');
check('Escape never clears the committed value', (await val('stateBox')) === 'TEXAS');

// ---------- ArrowUp opens onto last; wrap; Home/End ----------
await page.keyboard.press('ArrowUp');
await page.waitForTimeout(60);
check('ArrowUp from closed opens onto the last option',
  (await attr('#state-input', 'aria-activedescendant')) === 'state-option-49');
await page.keyboard.press('ArrowDown');
check('ArrowDown wraps past the end', (await attr('#state-input', 'aria-activedescendant')) === 'state-option-0');
await page.keyboard.press('End');
check('End jumps to the last option', (await attr('#state-input', 'aria-activedescendant')) === 'state-option-49');
await page.keyboard.press('Home');
check('Home jumps to the first option', (await attr('#state-input', 'aria-activedescendant')) === 'state-option-0');

// ---------- Alt+ArrowDown ----------
await page.keyboard.press('Escape');
await page.keyboard.press('Alt+ArrowDown');
await page.waitForTimeout(60);
check('Alt+ArrowDown opens without activating',
  (await attr('#state-input', 'aria-expanded')) === 'true' &&
  (await attr('#state-input', 'aria-activedescendant')) === null);
await page.keyboard.press('Alt+ArrowUp');
check('Alt+ArrowUp closes', (await attr('#state-input', 'aria-expanded')) === 'false');
await blurAll();

// ---------- 2 · descriptions + disabled ----------
await page.click('#assignee-input');
await page.waitForTimeout(60);
check('descriptions render', (await page.$eval('#assignee-listbox', (n) => n.textContent)).includes('alice@uni.dev'));
check('disabled options are aria-disabled',
  (await page.$$eval('#assignee-listbox [aria-disabled="true"]', (n) => n.length)) === 2);

// Priya (index 4) and Sam (5) are disabled; arrows must skip 4→6
await page.keyboard.press('ArrowDown'); // 0 Alice
await page.keyboard.press('ArrowDown'); // 1 Ben
await page.keyboard.press('ArrowDown'); // 2 Carol
await page.keyboard.press('ArrowDown'); // 3 Dmitri
await page.keyboard.press('ArrowDown'); // skips 4+5 → 6 Tessa
const skipped = await attr('#assignee-input', 'aria-activedescendant');
check('arrows skip disabled options', skipped === 'assignee-option-6', skipped);
await page.keyboard.press('ArrowDown');
check('wrap also skips from the end to the first enabled',
  (await attr('#assignee-input', 'aria-activedescendant')) === 'assignee-option-0');

await page.$eval('#assignee-listbox [aria-disabled="true"]', (n) => n.click());
await page.waitForTimeout(60);
check('clicking a disabled option does not commit', (await val('assigneeBox')) === null);
await page.$eval('#assignee-listbox #assignee-option-0', (n) => n.click());
await page.waitForTimeout(60);
check('clicking an enabled option commits', (await val('assigneeBox')) === 'u1' &&
  (await page.inputValue('#assignee-input')) === 'Alice Chen');
await blurAll();

// ---------- toggle chevron ----------
await page.click('#assigneeHost .uni-combobox__toggle');
await page.waitForTimeout(60);
check('chevron opens with committed option active',
  (await attr('#assignee-input', 'aria-expanded')) === 'true' &&
  (await attr('#assignee-input', 'aria-activedescendant')) === 'assignee-option-0' &&
  (await page.evaluate(() => document.activeElement.id)) === 'assignee-input');
check('chevron is out of the tab order and hidden from AT',
  await page.$eval('#assigneeHost .uni-combobox__toggle', (n) => n.tabIndex === -1 && n.getAttribute('aria-hidden') === 'true'));
await page.click('#assigneeHost .uni-combobox__toggle');
check('chevron toggles closed', (await attr('#assignee-input', 'aria-expanded')) === 'false');
await blurAll();

// ---------- 3 · async (filterLocally=false) ----------
await focusInput('country-input');
await page.type('#country-input', 'ja');
await page.waitForTimeout(700); // debounce 250 + latency 300
labels = await optionLabels('country');
check('async: debounced query emitted and options render verbatim',
  (await page.$eval('#countryLog', (n) => n.textContent)).includes('query "ja"') &&
  labels.includes('Japan') && labels.includes('Jamaica'), JSON.stringify(labels));
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.waitForTimeout(60);
check('async: commit works on server-provided options', (await val('countryBox')) === 'Jamaica');
await blurAll();

// ---------- 4 · showError gating ----------
const teamError = () => page.$eval('#teamHost .uni-combobox', (n) => n.classList.contains('uni-combobox--error'));
check('required+empty shows no error before touch', !(await teamError()) &&
  (await attr('#team-input', 'aria-invalid')) === 'false');
await focusInput('team-input');
await blurAll();
check('blur without choosing shows the error (touched gate)', (await teamError()) &&
  (await attr('#team-input', 'aria-invalid')) === 'true');
await focusInput('team-input');
await page.type('#team-input', 'Growth');
await page.keyboard.press('Enter');
await page.waitForTimeout(60);
check('choosing a value clears the error', !(await teamError()) && (await val('teamBox')) === 'growth');
await blurAll();

// ---------- focus retention on option mousedown ----------
await page.click('#state-input');
await page.waitForTimeout(60);
await page.dispatchEvent('#state-listbox [role="option"]', 'mousedown');
check('option mousedown never steals focus from the input',
  (await page.evaluate(() => document.activeElement.id)) === 'state-input');
await blurAll();

// ---------- report ----------
const passed = results.filter((r) => r.pass).length;
for (const r of results) console.log(`${r.pass ? '✓' : '✗'} ${r.name}${r.pass ? '' : '   ← ' + r.detail}`);
console.log(`\n${passed}/${results.length} passed`);
if (errors.length) { console.log('\nPage errors:'); errors.forEach((e) => console.log('  ' + e)); }
await browser.close();
process.exit(passed === results.length && errors.length === 0 ? 0 : 1);
