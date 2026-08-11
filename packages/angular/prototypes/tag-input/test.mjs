import { chromium } from 'playwright';

const url = 'file:///root/proto/tag-input/index.html';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1100, height: 1000 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
await page.goto(url);
await page.waitForTimeout(400);


const clickId = async (id) => { await page.evaluate((i) => document.getElementById(i).click(), id); await page.waitForTimeout(80); };
const focusInput = async (id) => { await page.evaluate((i) => document.getElementById(i).focus(), id); await page.waitForTimeout(60); };

const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

const chipLabels = () => page.$$eval('#toHost .uni-tag__label', (n) => n.map((x) => x.textContent.trim()));
const val = () => page.evaluate(() => JSON.parse(document.getElementById('valueLog').textContent));

// --- initial state
let labels = await chipLabels();
check('initial 3 chips', labels.length === 3, JSON.stringify(labels));
check('invalid chip flagged', await page.$eval('#toHost .uni-tag--invalid', () => true).catch(() => false));

// --- type + Enter commits
await focusInput('to-input');
await page.type('#to-input', 'carol@uni.dev');
await page.keyboard.press('Enter');
labels = await chipLabels();
check('Enter commits + enriches label to Carol Nwosu', labels.includes('Carol Nwosu'), JSON.stringify(labels));

// --- comma commits
await page.type('#to-input', 'dmitri@partners.io,');
labels = await chipLabels();
check('comma commits', labels.includes('Dmitri Volkov'), JSON.stringify(labels));

// --- duplicate rejected
const before = (await chipLabels()).length;
await page.type('#to-input', 'carol@uni.dev');
await page.keyboard.press('Enter');
check('duplicate rejected', (await chipLabels()).length === before, `${before} -> ${(await chipLabels()).length}`);

// --- suggestion listbox + arrow keys
await page.fill('#to-input', '');
await page.type('#to-input', 'pri');
await page.waitForTimeout(80);
const listVisible = await page.$eval('#toHost .uni-taginput__list', (el) => !el.hidden);
check('listbox opens on type', listVisible);
check('aria-expanded true', (await page.getAttribute('#to-input', 'aria-expanded')) === 'true');
await page.keyboard.press('ArrowDown');
const activeDesc = await page.getAttribute('#to-input', 'aria-activedescendant');
check('aria-activedescendant set', !!activeDesc, String(activeDesc));
await page.keyboard.press('Enter');
labels = await chipLabels();
check('Enter picks active suggestion', labels.includes('Priya Raman'), JSON.stringify(labels));

// --- Backspace on empty focuses last chip (does not delete)
const countBefore = (await chipLabels()).length;
await focusInput('to-input');
await page.keyboard.press('Backspace');
const focusIsChip = await page.evaluate(() => document.activeElement?.classList.contains('uni-tag__body'));
check('Backspace on empty focuses last chip', focusIsChip && (await chipLabels()).length === countBefore);

// --- Backspace on chip removes, focus moves left
await page.keyboard.press('Backspace');
const afterDel = await chipLabels();
check('Backspace on chip removes it', afterDel.length === countBefore - 1, `${countBefore} -> ${afterDel.length}`);
const focusedLabel = await page.evaluate(() => document.activeElement?.querySelector('.uni-tag__label')?.textContent?.trim());
check('focus moved left after Backspace', focusedLabel === afterDel[afterDel.length - 1], String(focusedLabel));

// --- ArrowLeft/Right navigation
await page.keyboard.press('ArrowLeft');
const l1 = await page.evaluate(() => document.activeElement?.textContent?.trim());
await page.keyboard.press('ArrowRight');
const l2 = await page.evaluate(() => document.activeElement?.textContent?.trim());
check('ArrowLeft/Right move between chips', l1 !== l2, `${l1} | ${l2}`);
await page.keyboard.press('Home');
const homeLabel = await page.evaluate(() => document.activeElement?.textContent?.trim());
check('Home goes to first chip', homeLabel === (await chipLabels())[0], String(homeLabel));

// --- Delete removes, focus moves right
const beforeDel = await chipLabels();
await page.keyboard.press('Delete');
const afterDel2 = await chipLabels();
const focusedAfter = await page.evaluate(() => document.activeElement?.querySelector('.uni-tag__label')?.textContent?.trim());
check('Delete removes first chip', afterDel2.length === beforeDel.length - 1);
check('Delete keeps focus rightward', focusedAfter === afterDel2[0], `${focusedAfter} vs ${afterDel2[0]}`);

// --- Right from last chip returns to input
await page.keyboard.press('End');
await page.keyboard.press('ArrowRight');
check('ArrowRight past last chip returns to input',
  await page.evaluate(() => document.activeElement?.id === 'to-input'));

// --- printable char on chip returns to input and types
await page.keyboard.press('Backspace'); // to chip
await page.keyboard.press('x');
const inputVal = await page.inputValue('#to-input');
check('printable char on chip types into input',
  inputVal === 'x' && (await page.evaluate(() => document.activeElement?.id === 'to-input')), inputVal);
await page.keyboard.press('Escape');

// --- Edit on Enter (chip -> input text)
await page.fill('#to-input', '');
await page.keyboard.press('Backspace'); // focus last chip
const chipToEdit = await page.evaluate(() => document.activeElement?.textContent?.trim());
await page.keyboard.press('Enter');
const editText = await page.inputValue('#to-input');
check('Enter on chip lifts it into the input', editText.length > 0 && editText.includes('@'), `${chipToEdit} -> ${editText}`);
await page.keyboard.press('Enter'); // put it back

// --- Escape clears typed text (after closing list)
await page.fill('#to-input', '');
await page.type('#to-input', 'zzz-no-match');
await page.keyboard.press('Escape'); // closes list (empty anyway)
await page.keyboard.press('Escape');
check('Escape clears typed text', (await page.inputValue('#to-input')) === '');

// --- Paste parsing via the simulate button (covers Name <email> + invalid)
await clickId('btnClear');
await clickId('btnPaste');
labels = await chipLabels();
const v = await val();
check('paste created 4 chips', labels.length === 4, JSON.stringify(labels));
check('paste unwrapped "Priya Raman <priya@uni.dev>"',
  v.some((i) => i.label === 'Priya Raman' && i.value === 'priya@uni.dev'), JSON.stringify(v[0]));
check('paste flagged nope@@x invalid', v.some((i) => i.value === 'nope@@x' && i.invalid === true));
check('field shows error state when any chip invalid',
  await page.$eval('#toHost .uni-taginput--error', () => true).catch(() => false));

// --- real paste event with an unterminated tail
await clickId('btnClear');
await page.evaluate(() => {
  const dt = new DataTransfer();
  dt.setData('text', 'alice@uni.dev, ben.ortiz@uni.dev, carol@uni');
  const input = document.getElementById('to-input');
  input.focus();
  input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
});
await page.waitForTimeout(60);
check('real paste: 2 committed', (await chipLabels()).length === 2, JSON.stringify(await chipLabels()));
check('real paste: tail stays in the input', (await page.inputValue('#to-input')) === 'carol@uni',
  await page.inputValue('#to-input'));

// --- max + disabled chip on the Cc field
await focusInput('cc-input');
for (const a of ['alice@uni.dev', 'ben.ortiz@uni.dev', 'carol@uni.dev']) {
  await page.type('#cc-input', a);
  await page.keyboard.press('Enter');
}
const ccLabels = await page.$$eval('#ccHost .uni-tag__label', (n) => n.map((x) => x.textContent.trim()));
check('max=3 enforced', ccLabels.length === 3, JSON.stringify(ccLabels));
const lockedHasRemove = await page.$$eval('#ccHost .uni-tag', (chips) => {
  const locked = chips.find((c) => c.classList.contains('uni-tag--disabled'));
  return locked ? !!locked.querySelector('[data-act=remove]') : 'no-locked-chip';
});
check('disabled chip renders no remove button', lockedHasRemove === false, String(lockedHasRemove));

// --- single tab stop: Tab from the To field must not land on a chip
await clickId('btnPrefill');
await focusInput('to-input');
await page.keyboard.press('Tab');
const afterTab = await page.evaluate(() => ({ id: document.activeElement?.id, cls: document.activeElement?.className }));
check('Tab leaves the field (chips are not tab stops)', !String(afterTab.cls).includes('uni-tag__body'), JSON.stringify(afterTab));

// --- a11y wiring
check('input is a combobox', (await page.getAttribute('#to-input', 'role')) === 'combobox');
check('live region present', await page.$eval('#toHost [role=status]', (el) => el.getAttribute('aria-live') === 'polite'));
check('describedby hint exists', await page.$eval('#toHost .sr-only', (el) => el.textContent.includes('Backspace')));

// --- screenshots
await clickId('btnPrefill');
await focusInput('to-input');
await page.type('#to-input', 'a');
await page.waitForTimeout(120);
await page.screenshot({ path: '/root/proto/tag-input/shot-light.png', fullPage: false });
await page.keyboard.press('Escape');
await clickId('themeToggle');
await page.waitForTimeout(200);
await page.evaluate(() => window.scrollTo(0, 900));
await page.screenshot({ path: '/root/proto/tag-input/shot-dark.png', fullPage: false });

await browser.close();

const failed = results.filter((r) => !r.pass);
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? '  — ' + r.detail : ''}`);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (errors.length) console.log('\nJS ERRORS:\n' + errors.join('\n'));
