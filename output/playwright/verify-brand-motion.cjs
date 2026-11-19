const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const brands = JSON.parse(fs.readFileSync('brand-data.json', 'utf8'));
const base = process.env.RCX_QA_URL || 'http://127.0.0.1:8123';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let checked = 0;
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [slug, brand] of Object.entries(brands)) {
      await page.goto(`${base}/portfolio/${slug}/`);
      await page.locator('.brand-story__lead').waitFor();
      assert.deepEqual(await page.locator('.brand-story__copy > p').allTextContents(), brand.story, slug + ' full story');
      assert.equal(await page.locator('.brand-story details, .brand-story summary, .brand-story button').count(), 0);
      assert.deepEqual(await page.locator('.brand-awards dt').allTextContents(), brand.awards.map(a => a.year));
      assert.deepEqual(await page.locator('.brand-awards li').allTextContents(), brand.awards.flatMap(a => a.items));
      const visible = await page.locator('.brand-story__copy > p, .brand-awards li').evaluateAll(els => els.every(el => el.getClientRects().length && getComputedStyle(el).visibility === 'visible' && getComputedStyle(el).opacity === '1'));
      assert.ok(visible, slug + ' all content displayed without interaction');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), slug + ' overflow');
      if (slug === 'dancing-fish') await page.locator('#story').screenshot({ path: `output/playwright/brand-expanded-${width}.png` });
      checked++;
    }
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const path of ['/', '/about-us/', '/portfolio/', '/join-us/', '/contact-us/', '/news/']) {
    await page.goto(base + path);
    await page.locator('.rcx-text-reveal').first().waitFor({ state: 'attached' });
    assert.equal(await page.locator('rcx-word').count(), 0);
    assert.equal(await page.locator('form .rcx-text-reveal, nav .rcx-text-reveal, details .rcx-text-reveal').count(), 0);
    checked++;
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const motion = await page.evaluate(async () => {
    const el = document.querySelector('.what-title');
    const state = () => ({ state: el.dataset.textReveal, opacity: getComputedStyle(el).opacity, mask: getComputedStyle(el).clipPath, transform: getComputedStyle(el).transform });
    const before = state();
    scrollTo({top:scrollY+el.getBoundingClientRect().top-(innerHeight-100),behavior:'instant'});
    await new Promise(resolve => setTimeout(resolve, 120));
    const during = state();
    await new Promise(resolve => setTimeout(resolve, 800));
    const after = state();
    return { before, during, after };
  });
  console.log(JSON.stringify({ motion }));
  assert.equal(motion.before.state, 'pending');
  assert.equal(motion.after.opacity, '1');
  assert.equal(motion.after.transform, 'none');
  assert.equal(motion.during.mask, 'none');
  assert.notEqual(motion.during.transform, motion.after.transform);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !document.querySelector('[data-text-reveal="pending"]'));
  assert.ok(await page.locator('.rcx-text-reveal').evaluateAll(els => els.every(el => getComputedStyle(el).opacity === '1')));
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  const plain = await noJS.newPage();
  await plain.goto(base + '/portfolio/dancing-fish/');
  assert.equal(await plain.locator('.brand-story details').count(), 0);
  assert.equal(await plain.locator('.brand-story__copy > p').count(), brands['dancing-fish'].story.length);
  assert.equal(await plain.locator('.brand-awards li').count(), brands['dancing-fish'].awards.flatMap(a => a.items).length);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ base, checked, errors, motion }));
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
