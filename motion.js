(() => {
  if (!('IntersectionObserver' in window) || !window.matchMedia) return;

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const excluded = 'a, button, form, nav, dialog, details, .rcx-form-panel, .info-block, .job-card-body, .benefit-card, .value-card, .what-card, .brand-card, .news-card, [data-no-word-reveal], [data-no-text-reveal]';
  const labels = '.section-label, .brand-label, .brand-hero__category, .brand-hero__region, .connect-phone-label, .connect-phone-num, .job-req-label, .rcx-form-intro__label, .brand-visit__count';
  let observer;
  let initialized = false;
  let scrollFrame = false;

  function reveal(element, immediate = false) {
    element.dataset.motionPlay = String(!immediate);
    if (immediate) {
      element.classList.add('rcx-text-reveal--instant');
      // Restore the component's own hover transitions after its visible frame.
      requestAnimationFrame(() => requestAnimationFrame(() => element.classList.remove('rcx-text-reveal--instant')));
    }
    element.dataset.textReveal = 'visible';
    observer?.unobserve(element);
  }

  function showImmediately() {
    observer?.disconnect();
    document.querySelectorAll('.rcx-text-reveal').forEach((element) => reveal(element, true));
  }

  function catchUp(limit = window.innerHeight) {
    document.querySelectorAll('[data-text-reveal="pending"]').forEach((element) => {
      if (element.getBoundingClientRect().top < limit) reveal(element, true);
    });
  }

  function initialize() {
    if (initialized || preference.matches) return;
    initialized = true;
    observer = new IntersectionObserver((entries) => {
      const rows = new Map();
      entries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      entries.forEach((entry) => {
        if (entry.target.dataset.textReveal === 'visible') return;
        // Fast scrolls and anchor jumps should leave no unreadable blocks behind.
        if (entry.boundingClientRect.bottom < 0) return reveal(entry.target, true);
        if (!entry.isIntersecting) return;
        if (entry.boundingClientRect.top < window.innerHeight * .7) return reveal(entry.target, true);
        const row = Math.round(entry.boundingClientRect.top / 40);
        const index = rows.get(row) || 0;
        entry.target.style.setProperty('--rcx-motion-delay', `${Math.min(index, 2) * 40}ms`);
        rows.set(row, index + 1);
        reveal(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px 64px 0px' });

    const headings = new Set();
    const descriptions = new Set();
    document.querySelectorAll('main h1, main h2, main p, main .brand-card, main .news-card').forEach((element) => {
      const card = element.matches('.brand-card, .news-card');
      if (card) {
        if (element.closest('nav, form, dialog, details, [data-no-text-reveal], [data-no-word-reveal]')) return;
      } else {
        if (element.closest(excluded) || element.matches(labels) || element.querySelector('a, button, img, svg, input, select, textarea')) return;
        // Heroes have a separate load entrance, never a second scroll reveal.
        if (element.closest('.hero, .page-hero, .brand-hero')) return;
        const words = element.textContent.match(/\S+/gu) || [];
        if (!words.length || (element.tagName === 'P' && words.length < 3)) return;
        const section = element.closest('section') || element.closest('article') || element.closest('main');
        const seen = element.tagName === 'P' ? descriptions : headings;
        if (seen.has(section)) return;
        seen.add(section);
      }

      // Keep original markup and animate only the section's introduction.
      element.classList.add('rcx-text-reveal');
      element.dataset.motionKind = card ? 'card' : element.tagName === 'P' ? 'copy' : 'heading';
      const bounds = element.getBoundingClientRect();
      if (bounds.top < window.innerHeight) {
        reveal(element, true);
      } else {
        element.dataset.textReveal = 'pending';
        try { observer.observe(element); }
        catch { reveal(element, true); }
      }
    });
  }

  preference.addEventListener('change', () => {
    if (preference.matches) showImmediately();
    else initialize();
  });
  document.addEventListener('focusin', (event) => {
    const element = event.target.closest('.rcx-text-reveal');
    if (element) reveal(element, true);
  });
  document.addEventListener('pointerdown', (event) => {
    const element = event.target.closest('.rcx-text-reveal');
    if (element) reveal(element, true);
  });
  document.addEventListener('animationend', (event) => {
    if (event.animationName === 'rcx-text-enter') event.target.dataset.motionPlay = 'false';
  });
  window.addEventListener('beforeprint', showImmediately);
  window.addEventListener('hashchange', () => catchUp());
  window.addEventListener('pageshow', (event) => { if (event.persisted) catchUp(); });
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = true;
    requestAnimationFrame(() => {
      scrollFrame = false;
      catchUp(window.innerHeight * .7);
    });
  }, { passive: true });
  // Font metrics settle first; content stays readable while the font loads.
  if (document.fonts) document.fonts.ready.then(initialize);
  else initialize();
})();

// Autoplay remains optional and runs only while the logo strip is on screen.
(() => {
  const track = document.querySelector('.brands-carousel-track');
  const button = document.querySelector('[data-carousel-toggle]');
  if (!track || !button || !window.matchMedia) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  let inView = !('IntersectionObserver' in window);
  function update() {
    track.classList.toggle('is-running', inView && !paused && !preference.matches && !document.hidden);
    button.hidden = preference.matches;
    button.textContent = paused ? 'Play' : 'Pause';
    button.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} brand carousel`);
  }
  button.addEventListener('click', () => { paused = !paused; update(); });
  preference.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); }).observe(track.closest('.brands-carousel-wrapper'));
  }
  update();
})();
