// Behavioural contract tests for onboarding-request.html.
// Run:  node tests/onboarding-request.mjs        (needs playwright on the module path)
//       NODE_PATH=$(npm root -g) node tests/onboarding-request.mjs
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  const root = execSync('npm root -g').toString().trim();
  ({ chromium } = await import(pathToFileURL(`${root}/playwright/index.mjs`).href));
}

const file = new URL('../onboarding-request.html', import.meta.url).href;
const results = [];
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `  got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`}`);
};

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(file);

const snap = () => page.evaluate(() => ({
  hours: document.getElementById('hours').textContent,
  count: document.getElementById('count').textContent,
  total: document.getElementById('moduleTotal').textContent,
  locked: document.getElementById('lockedCount').textContent,
  added: document.getElementById('addedCount').textContent,
  estimate: document.getElementById('dayEstimate').textContent,
  owner: document.getElementById('deliveryOwner').textContent,
  coins: document.querySelectorAll('.coin').length,
  boxesOn: document.querySelectorAll('.day-box.on').length,
  boxes: document.querySelectorAll('.day-box').length,
  sticky: document.getElementById('stickyText').textContent,
  submitDisabled: document.getElementById('submit').disabled,
  stickyDisabled: document.getElementById('stickySubmit').disabled,
  lockedNames: [...document.querySelectorAll('.module.locked .module-name span:first-child')].map(s => s.textContent),
}));

// Initial state
let s = await snap();
check('19-module catalogue', s.total, '19');
check('module rows rendered', await page.locator('.module').count(), 19);
check('estimate prompts for department and role', s.estimate, 'SELECT A DEPARTMENT AND ROLE TO SEE THE ONBOARDING ESTIMATE.');
check('sticky bar empty state', s.sticky, 'NOTHING SELECTED YET');
check('submit disabled on load', s.submitDisabled, true);
check('role locked until department chosen', await page.locator('#role').isDisabled(), true);

// Spec section 38: Sales + Channel Account Manager
await page.selectOption('#department', 'sales');
check('role enabled after department', await page.locator('#role').isDisabled(), false);
check('roles filtered by department', await page.locator('#role option').allTextContents(),
  ['SELECT ROLE', 'Channel Account Manager', 'Account Executive', 'Sales Manager']);
await page.selectOption('#role', 'cam');
s = await snap();
check('CAM hours', s.hours, '13');
check('CAM selected', s.count, '10');
check('CAM locked', s.locked, '10');
check('CAM added', s.added, '0');
check('CAM estimate before a name is entered', s.estimate, 'YOUR NEW HIRE WOULD NEED 4 ONBOARDING DAYS TO COMPLETE 13 HOURS OF ONBOARDING.');
check('CAM delivery owner in note', s.owner, 'Revenue Enablement');
check('CAM coins', s.coins, 4);
check('CAM day boxes lit', s.boxesOn, 4);
check('CAM day boxes drawn', s.boxes, 5);
check('CAM sticky summary', s.sticky, '13 HRS · 10 MODULES · 4 DAYS');
check('CAM locked modules', s.lockedNames, [
  'Culture Essentials', 'Marketplace', 'Partner Enablement', 'Partner Support', 'Vendor',
  'AI Literacy', 'M365', 'Power BI', 'Salesforce', 'Sales Complete']);
check('LOCKED badges', await page.locator('.module .badge').count(), 10);

// Submit validation gate (spec section 21)
check('submit blocked without player setup', s.submitDisabled, true);
await page.fill('#name', 'TEST USER');
await page.fill('#start', '2026-10-01');
await page.fill('#manager', 'TEST MANAGER');
s = await snap();
check('submit enabled when setup complete', s.submitDisabled, false);
check('estimate picks up the entered name', s.estimate, 'TEST USER WOULD NEED 4 ONBOARDING DAYS TO COMPLETE 13 HOURS OF ONBOARDING.');
check('both submits share state', s.stickyDisabled, false);

// Locked modules cannot be removed (spec section 12)
await page.locator('.module[data-id="culture"]').click({ force: true });
s = await snap();
check('locked module stays selected', s.count, '10');
check('locked module flashes', await page.locator('.module[data-id="culture"]').evaluate(el => el.classList.contains('flash')), true);

// Manager additions
await page.locator('.module[data-id="academy"]').click();
s = await snap();
check('addition counted separately', s.added, '1');
check('fractional hours to 1dp', s.hours, '13.8');
check('addition in total', s.count, '11');

// Additions survive a role change (spec section 11)
await page.selectOption('#role', 'ae');
s = await snap();
check('AE locked recalculated', s.locked, '10');
check('addition survives role change', s.added, '1');
check('AE hours', s.hours, '10.3');
check('AE estimate', s.estimate, 'TEST USER WOULD NEED 3 ONBOARDING DAYS TO COMPLETE 10.3 HOURS OF ONBOARDING.');

// Department change clears locked, keeps additions
await page.selectOption('#department', 'finance');
s = await snap();
check('department change clears locked', s.locked, '0');
check('department change keeps additions', s.added, '1');
check('department change disables submit', s.submitDisabled, true);
await page.selectOption('#role', 'fin');
s = await snap();
check('finance baseline size', s.locked, '2');
check('finance hours', s.hours, '2.8');
check('finance estimate uses singular day', s.estimate, 'TEST USER WOULD NEED 1 ONBOARDING DAY TO COMPLETE 2.8 HOURS OF ONBOARDING.');
check('finance delivery owner in note', s.owner, 'Finance');
check('singular DAY in sticky bar', s.sticky, '2.8 HRS · 3 MODULES · 1 DAY');

// [ALL] toggle skips locked modules (spec section 14)
await page.locator('.all[data-group="Tools"]').click();
s = await snap();
check('[ALL] adds the group', s.added, '5');
await page.locator('.all[data-group="Tools"]').click();
s = await snap();
check('[ALL] clears the group', s.added, '1');

// Known difference 3: a manager may remove their own addition
await page.locator('.module[data-id="academy"]').click();
s = await snap();
check('own addition removable', s.added, '0');

// Whole catalogue
await page.selectOption('#department', 'sales');
await page.selectOption('#role', 'cam');
for (const g of ['Culture', 'Offering', 'Tools', 'Department']) await page.locator(`.all[data-group="${g}"]`).click();
s = await snap();
check('every module selectable', s.count, '19');
check('full catalogue hours', s.hours, '19.5');
check('full catalogue estimate', s.estimate, 'TEST USER WOULD NEED 5 ONBOARDING DAYS TO COMPLETE 19.5 HOURS OF ONBOARDING.');
check('coins track days', s.coins, 5);

// Simulated submit (spec sections 24-25)
await page.fill('#name', 'TEST USER');
await page.fill('#start', '2026-10-01');
await page.fill('#manager', 'TEST MANAGER');
await page.locator('#submit').click();
check('confirmation revealed', await page.locator('#confirmation').isVisible(), true);
const log = await page.locator('#systemLog div').allTextContents();
check('log lines', log.length, 7);
check('log names content owner', log[1], '> CONTENT OWNER IDENTIFIED: Revenue Enablement.');
check('log names distribution list', log[2], '> DISTRIBUTION LIST WILL BE NOTIFIED: Hiring Manager, Revenue Enablement.');
check('log disclaims any real action', log[6], 'Nothing was sent, booked, stored, or tracked by this standalone prototype.');

// No dependencies, no network (spec section 2)
const requests = [];
page.on('request', r => requests.push(r.url()));
await page.reload();
check('no external requests', requests.filter(u => !u.startsWith('file:')), []);
check('no page errors', errors, []);

await browser.close();
const failed = results.filter(ok => !ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
