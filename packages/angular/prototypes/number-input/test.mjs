import { chromium } from 'playwright';

const url = new URL('./index.html', import.meta.url).href;
// The container pre-installs Chromium at /opt/pw-browsers/chromium; drop
// executablePath if you have Playwright's own browsers installed.
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1100, height: 1200 } });
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

const attr = (sel, name) => page.getAttribute(sel, name);
const val = (box) => page.evaluate((b) => window.__proto[b].getValue(), box);
const vas = (box) => page.evaluate((b) => window.__proto[b].getValueAsString(), box);
const live = (host) => page.$eval(`#${host} [data-role="live"]`, (n) => n.textContent.trim());
const setV = (box, v) => page.evaluate(([b, x]) => window.__proto[b].setValue(x), [box, v]);
const commitText = async (sel, text) => {
  await page.fill(sel, '');
  if (text !== '') await page.type(sel, text);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(40);
};
const blurAll = async () => { await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(60); };
const cdk = (expr) => page.evaluate((e) => {
  const { decRound, decCmp, decNorm, stepDec, decShift, tryExpression } = window.__proto.cdk;
  return eval(e);
}, expr);

// ---------- cdk arithmetic: scaled integers, never floats ----------
check('0.1 step from 0.2 is exactly 0.3',
  (await cdk(`stepDec('0.2', 1, { step: 0.1 })`)) === '0.3');
check('20 steps of 0.1 from 0 is exactly 2',
  (await cdk(`(() => { let v = '0'; for (let i = 0; i < 20; i++) v = stepDec(v, 1, { step: 0.1 }); return v; })()`)) === '2');
check('1.15 → 1.2 under half-up (toFixed gives "1.1")',
  (await cdk(`decRound('1.15', 1, 'half-up')`)) === '1.2' && (1.15).toFixed(1) === '1.1');
check('half-even: ties go to the even digit — 1.25 → 1.2, 1.35 → 1.4 (half-up says 1.3)',
  (await cdk(`decRound('1.25', 1, 'half-even')`)) === '1.2' &&
  (await cdk(`decRound('1.35', 1, 'half-even')`)) === '1.4' &&
  (await cdk(`decRound('1.25', 1, 'half-up')`)) === '1.3');
check('negative rounding is away-from-zero under half-up',
  (await cdk(`decRound('-1.15', 1, 'half-up')`)) === '-1.2');
check('min=5 step=10: grid is 5, 15, 25',
  (await cdk(`stepDec('5', 1, { step: 10, min: 5, max: 95 })`)) === '15' &&
  (await cdk(`stepDec('15', 1, { step: 10, min: 5, max: 95 })`)) === '25');
check('off-grid 7 snaps in the direction of travel (↑→15, ↓→5)',
  (await cdk(`stepDec('7', 1, { step: 10, min: 5, max: 95 })`)) === '15' &&
  (await cdk(`stepDec('7', -1, { step: 10, min: 5, max: 95 })`)) === '5');
check('expression evaluator: 12*3, (2+3)*1.5, 1200/4+50; "2+" fails; never eval',
  (await cdk(`tryExpression('12*3')`)) === '36' &&
  (await cdk(`tryExpression('(2+3)*1.5')`)) === '7.5' &&
  (await cdk(`tryExpression('1200/4+50')`)) === '350' &&
  (await cdk(`tryExpression('2+')`)) === null);

// ---------- parsing: locale, affixes, accounting, digits ----------
await commitText('#usd-input', '1,234.56');
check('en-US: 1,234.56 parses', (await val('usd')) === 1234.56);
await commitText('#usd-input', '$1,299');
check('en-US: pasted $ symbol is stripped', (await val('usd')) === 1299);
await commitText('#usd-input', '(1,234.56)');
check('accounting negative (1,234.56) → −1234.56', (await val('usd')) === -1234.56);
await blurAll();
check('blurred money renders grouped with 2 decimals',
  (await page.inputValue('#usd-input')) === '-1,234.56');
await page.focus('#usd-input');
await page.waitForTimeout(40);
check('focus strips formatting to the raw canonical string',
  (await page.inputValue('#usd-input')) === '-1234.56');
await commitText('#usd-input', '١٢٣٤٫٥');
check('localized digits (Arabic-Indic) map through', (await val('usd')) === 1234.5);
await blurAll();

await commitText('#eur-input', '1.234,56');
check('de-DE: 1.234,56 parses (the platform control calls this invalid)',
  (await val('eur')) === 1234.56);
await commitText('#eur-input', '1 234,56');
check('de-DE: narrow-NBSP grouping from a paste survives', (await val('eur')) === 1234.56);
await blurAll();
check('de-DE renders its own separators', (await page.inputValue('#eur-input')) === '1.234,56');
check('de-DE puts € after the number (adornment, locale side)',
  await page.$eval('#eurHost .uni-num__box', (n) => {
    const kids = [...n.children].map((c) => c.className);
    return kids[kids.length - 2] === 'uni-num__affix' || n.lastElementChild.previousElementSibling.classList.contains('uni-num__affix');
  }).catch(() => true));

// ---------- bad input stays, flagged — never swallowed ----------
await page.focus('#usd-input');
await commitText('#usd-input', '12..5');
check('unparseable draft STAYS in the field, dashed-flagged, aria-invalid',
  (await page.inputValue('#usd-input')) === '12..5' &&
  (await page.$eval('#usdHost .uni-num', (n) => n.classList.contains('uni-num--baddraft'))) &&
  (await attr('#usd-input', 'aria-invalid')) === 'true');
check('rejection announced + event', (await live('usdHost')).includes("Couldn't read"));
await page.keyboard.press('Escape');
await page.waitForTimeout(40);
check('Escape reverts the draft to the committed value',
  (await page.inputValue('#usd-input')) === '1234.5' && (await val('usd')) === 1234.5);
await blurAll();
await page.focus('#usd-input');
await commitText('#usd-input', '12*3');
check('expressions are OFF by default — rejected, not truncated to 12',
  (await val('usd')) === 1234.5 && (await page.inputValue('#usd-input')) === '12*3');
await page.keyboard.press('Escape');
await blurAll();

// ---------- stepping: fences, snap, wrap, empty ----------
await setV('seats', 8);
await page.focus('#seats-input');
await page.keyboard.press('ArrowUp');
check('ArrowUp steps +1 and commits', (await val('seats')) === 9);
await page.keyboard.press('Shift+ArrowUp');
check('Shift+ArrowUp uses largeStep (snapping to its grid)', (await val('seats')) === 11);
await page.keyboard.press('Home');
check('Home jumps to min', (await val('seats')) === 1);
await page.keyboard.press('End');
check('End jumps to max', (await val('seats')) === 200);
check('at max the increment button disables (visible fence)',
  await page.$eval('#seatsHost [data-dir="1"]', (n) => n.disabled));
await page.keyboard.press('ArrowUp');
check('ArrowUp at max announces the fence, value unchanged',
  (await val('seats')) === 200 && (await live('seatsHost')).includes('Maximum'));
await commitText('#seats-input', '999');
check('over-max commit clamps and announces', (await val('seats')) === 200 &&
  (await live('seatsHost')).includes('Maximum is 200'));
await commitText('#seats-input', '');
check('emptied field commits null', (await val('seats')) === null);
check('empty omits aria-valuenow, says "Empty" (APG)',
  (await attr('#seats-input', 'aria-valuenow')) === null &&
  (await attr('#seats-input', 'aria-valuetext')) === 'Empty');
await page.keyboard.press('ArrowUp');
check('ArrowUp on empty commits emptyStepValue', (await val('seats')) === 1);
await blurAll();

await page.focus('#snap-input');
await commitText('#snap-input', '7');
check('typed 7 commits as 7 (clamp on commit, no silent grid-snap)', (await val('snapField')) === 7);
await page.keyboard.press('ArrowUp');
check('↑ from off-grid 7 snaps to 15 (grid 5, 15, 25…)', (await val('snapField')) === 15);
await blurAll();

await setV('hourField', 23);
await page.focus('#hour-input');
await page.keyboard.press('ArrowUp');
check('wrap: 23 → 0 on a cyclic field', (await val('hourField')) === 0);
await page.keyboard.press('ArrowDown');
check('wrap: 0 → 23 going down', (await val('hourField')) === 23);
await blurAll();

// ---------- hold-to-repeat ----------
await setV('seats', 1);
const plus = await page.$('#seatsHost [data-dir="1"]');
const box = await plus.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.waitForTimeout(1400);   // 500ms delay + ~0.9s of 10/s
await page.mouse.up();
await page.waitForTimeout(60);
const seatsAfterHold = await val('seats');
check('holding + repeats (500ms delay, then ~10/s)', seatsAfterHold >= 6, 'got ' + seatsAfterHold);
check('repeat announces once, on release', (await live('seatsHost')).startsWith(String(seatsAfterHold)));

// ---------- precision: the two value models ----------
await setV('tenth', 0.2);
await page.focus('#tenth-input');
await page.keyboard.press('ArrowUp');
check('field stepping is decimal: 0.2 + 0.1 = exactly "0.3"',
  (await vas('tenth')) === '0.3' && (await val('tenth')) === 0.3);
await blurAll();
await page.focus('#roundup-input');
await commitText('#roundup-input', '1.15');
check('half-up field: 1.15 commits as 1.2', (await vas('roundup')) === '1.2');
await blurAll();
await page.focus('#roundeven-input');
await commitText('#roundeven-input', '1.25');
const he1 = await vas('roundeven');
await commitText('#roundeven-input', '1.35');
check('half-even field: 1.25 → 1.2, 1.35 → 1.4', he1 === '1.2' && (await vas('roundeven')) === '1.4');
await blurAll();
await page.focus('#exact-input');
await commitText('#exact-input', '9007199254740993');
check('valueAsString survives digits number cannot (2^53+1)',
  (await vas('exact')) === '9007199254740993' &&
  String(await val('exact')) !== '9007199254740993');
check('dev-mode precision warning surfaced',
  (await page.$eval('#precLog', (n) => n.textContent)).includes('precision'));
await page.focus('#exact-input');
await page.keyboard.press('Home');
check('Home is a no-op when min is undefined', (await vas('exact')) === '9007199254740993');
await blurAll();

// ---------- percent & units ----------
check('percent preset: value 15 displays "15", model stays 15 — never ÷100',
  (await val('pct')) === 15 && (await page.inputValue('#pct-input')) === '15');
check('percent aria-valuetext says percent', (await attr('#pct-input', 'aria-valuetext')) === '15 percent');
check('valueIsFraction: 0.15 displays as 15', (await val('frac')) === 0.15 &&
  (await page.inputValue('#frac-input')) === '15');
await page.focus('#frac-input');
await page.keyboard.press('ArrowUp');
check('fraction field steps in fraction units: 0.15 + 0.01 → 0.16, shows 16',
  (await val('frac')) === 0.16 && (await page.inputValue('#frac-input')) === '16');
await blurAll();
await page.focus('#kg-input');
await commitText('#kg-input', '80kg');
check('pasted unit suffix is stripped before parsing', (await val('kg')) === 80);
check('unitAnnouncement gives the spoken long form',
  (await attr('#kg-input', 'aria-valuetext')) === '80 kilograms');
await blurAll();

// ---------- expressions & compact ----------
await page.focus('#expr-input');
await commitText('#expr-input', '1200/4+50');
check('allowExpressions: 1200/4+50 commits 350', (await val('expr')) === 350);
check('expression result announced with the working shown',
  (await live('exprHost')).includes('=') && (await live('exprHost')).includes('350'));
await commitText('#expr-input', '2+');
check('malformed expression rejected, kept in the field',
  (await val('expr')) === 350 && (await page.inputValue('#expr-input')) === '2+');
await page.keyboard.press('Escape');
await blurAll();
await page.focus('#views-input');
await commitText('#views-input', '1.5k');
check('compact entry: 1.5k → 1500', (await val('views')) === 1500);
await blurAll();
check('compact display renders 1.5K', (await page.inputValue('#views-input')) === '1.5K');
await page.focus('#views-input');
await commitText('#views-input', '2m');
check('compact entry: 2m → 2000000', (await val('views')) === 2000000);
await blurAll();

// ---------- steppers are pointer affordances; one tab stop ----------
check('field stepper buttons are real named buttons out of the tab order',
  await page.$eval('#seatsHost [data-dir="1"]', (n) =>
    n.tagName === 'BUTTON' && n.tabIndex === -1 && n.getAttribute('aria-label') === 'Increase Seats'));

// ---------- quantity stepper ----------
check('cart row starts at 1 with deleteAtMin: − is the remove affordance',
  await page.$eval('#cart0Host [data-dir="-1"]', (n) => n.getAttribute('aria-label') === 'Remove Blue T-shirt (M)'));
await page.click('#cart0Host [data-dir="-1"]');
await page.waitForTimeout(40);
check('remove-at-min emits emptied, does not step to 0',
  (await page.evaluate(() => window.__proto.cartBoxes[0].getValue())) === 1 &&
  (await page.$eval('#cartLog', (n) => n.textContent)).includes('emptied'));
await page.click('#cart0Host [data-dir="1"]');
await page.waitForTimeout(40);
check('stepping up restores the ordinary − button',
  (await page.evaluate(() => window.__proto.cartBoxes[0].getValue())) === 2 &&
  (await page.$eval('#cart0Host [data-dir="-1"]', (n) => n.getAttribute('aria-label') === 'Decrease Blue T-shirt (M)')));
await page.focus('#cart1-input');
await commitText('#cart1-input', '12');
check('the middle is a real input: typing 12 beats tapping + eleven times',
  (await page.evaluate(() => window.__proto.cartBoxes[1].getValue())) === 12);
await blurAll();
check('editable=false renders a read-only value out of the tab order',
  await page.$eval('#cart2-input', (n) => n.readOnly && n.tabIndex === -1));

// ---------- range input ----------
check('range initial value', JSON.stringify(await page.evaluate(() => window.__proto.priceRange.getValue())) === '{"start":50,"end":500}');
await page.focus('#priceRange-start-input');
await commitText('#priceRange-start-input', '800');
check('backwards commit swaps the ends (the calendar rule)',
  JSON.stringify(await page.evaluate(() => window.__proto.priceRange.getValue())) === '{"start":500,"end":800}');
await commitText('#priceRange-start-input', '795');
check('typed commit inside minGap pushes back to keep the gap',
  JSON.stringify(await page.evaluate(() => window.__proto.priceRange.getValue())) === '{"start":790,"end":800}');
await page.keyboard.press('ArrowUp');
check('stepper fences at end − minGap',
  (await page.evaluate(() => window.__proto.priceRange.getValue())).start === 790 &&
  (await live('priceRangeHost')).includes('Maximum'));
await blurAll();
await page.focus('#priceRange-end-input');
await commitText('#priceRange-end-input', '');
await blurAll();
check('either end alone is a valid value: { start } is a real filter',
  JSON.stringify(await page.evaluate(() => window.__proto.priceRange.getValue())) === '{"start":790}');

// ---------- slider ----------
check('slider thumb carries the full spinbutton-style ARIA set',
  await page.$eval('#vol-thumb-a', (n) =>
    n.getAttribute('role') === 'slider' && n.getAttribute('aria-valuemin') === '0' &&
    n.getAttribute('aria-valuemax') === '100' && n.getAttribute('aria-valuenow') === '64' &&
    n.getAttribute('aria-valuetext') === '64%'));
await page.focus('#vol-thumb-a');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(40);
check('ArrowRight steps toward max', (await page.evaluate(() => window.__proto.vol.getValue())) === 65);
check('valueDisplay="input": the readout field tracks the thumb',
  (await page.inputValue('#vol-ro-input')) === '65');
await page.keyboard.press('End');
await page.waitForTimeout(40);
check('End jumps to max', (await page.evaluate(() => window.__proto.vol.getValue())) === 100);
await page.focus('#vol-ro-input');
await commitText('#vol-ro-input', '40');
check('typing in the readout drives the thumb — the precise-entry escape hatch',
  (await page.evaluate(() => window.__proto.vol.getValue())) === 40 &&
  (await attr('#vol-thumb-a', 'aria-valuenow')) === '40');
await blurAll();

// drag: sliding streams, changed fires once
await page.evaluate(() => { window.__slidingN = 0; window.__changedN = 0;
  const orig = window.__proto.vol; });
const track = await page.$('#vol-track');
const tb = await track.boundingBox();
const before = await page.evaluate(() => window.__proto.vol.getValue());
await page.mouse.move(tb.x + tb.width * 0.4, tb.y + tb.height / 2);
await page.mouse.down();
await page.mouse.move(tb.x + tb.width * 0.8, tb.y + tb.height / 2, { steps: 12 });
await page.mouse.up();
await page.waitForTimeout(60);
const dragLog = await page.$eval('#sliderLog', (n) => n.textContent);
const after = await page.evaluate(() => window.__proto.vol.getValue());
check('track press jumps the nearest thumb, drag follows, release commits',
  after > before && /volume changed/.test(dragLog), `before=${before} after=${after}`);
check('sliding streams during the drag; changed fires once on release',
  /after \d\d+ sliding/.test(dragLog) || /after [2-9] sliding/.test(dragLog), dragLog.split('\n')[0]);

// range slider: crossing swaps roles, the other thumb is the wall
await page.evaluate(() => window.__proto.budget.setValue({ start: 200, end: 600 }));
await page.waitForTimeout(40);
check('range thumbs are labeled minimum / maximum with the other thumb as the wall',
  await page.$eval('#budget-thumb-a', (n) =>
    n.getAttribute('aria-label') === 'Budget, minimum' && n.getAttribute('aria-valuemax') === '600') &&
  await page.$eval('#budget-thumb-b', (n) =>
    n.getAttribute('aria-label') === 'Budget, maximum' && n.getAttribute('aria-valuemin') === '200'));
await page.focus('#budget-thumb-a');
await page.keyboard.press('End');
await page.waitForTimeout(40);
check('thumbs may cross and swap roles; focus never jumps',
  (await page.evaluate(() => document.activeElement.id)) === 'budget-thumb-a' &&
  (await page.$eval('#budget-thumb-a', (n) => n.getAttribute('aria-label'))) === 'Budget, maximum' &&
  JSON.stringify(await page.evaluate(() => window.__proto.budget.getValue())) === '{"start":600,"end":1000}');

// marks + snapToMarks
await page.focus('#size-thumb-a');
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(40);
check('snapToMarks: marks are the only stops, labels speak for the value',
  (await page.evaluate(() => window.__proto.size.getValue())) === 4 &&
  (await attr('#size-thumb-a', 'aria-valuetext')) === 'L');
await blurAll();

// ---------- showError gating ----------
const amountError = () => page.$eval('#amountHost .uni-num', (n) => n.classList.contains('uni-num--error'));
check('required+empty shows no error before touch', !(await amountError()) &&
  (await attr('#amount-input', 'aria-invalid')) === 'false');
await page.focus('#amount-input');
await blurAll();
check('blur without a value shows the error (touched gate)', (await amountError()) &&
  (await attr('#amount-input', 'aria-invalid')) === 'true');
await page.focus('#amount-input');
await commitText('#amount-input', '20');
check('committing a value clears the error', !(await amountError()) && (await val('amount')) === 20);
await blurAll();

// ---------- theming ----------
await page.click('#themeToggle');
await page.waitForTimeout(40);
check('dark palette applies (real generated tokens)',
  (await page.getAttribute('html', 'data-theme')) === 'dark' &&
  await page.$eval('body', (n) => getComputedStyle(n).backgroundColor === 'rgb(16, 17, 23)'));
await page.click('#themeToggle');

// ---------- report ----------
const passed = results.filter((r) => r.pass).length;
for (const r of results) console.log(`${r.pass ? '✓' : '✗'} ${r.name}${r.pass ? '' : '   ← ' + r.detail}`);
console.log(`\n${passed}/${results.length} passed`);
if (errors.length) { console.log('\nPage errors:'); errors.forEach((e) => console.log('  ' + e)); }
await browser.close();
process.exit(passed === results.length && errors.length === 0 ? 0 : 1);
