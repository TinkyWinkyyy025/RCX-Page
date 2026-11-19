const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const portfolioButton = document.querySelector('.portfolio-toggle');
const portfolioMenu = document.querySelector('#nav-brand-list');

function setPortfolioOpen(open) {
  if (!portfolioButton || !portfolioMenu) return;
  portfolioButton.setAttribute('aria-expanded', String(open));
  portfolioMenu.hidden = !open;
  portfolioButton.closest('.nav-drop').classList.toggle('is-open', open);
}

function closeSiteMenu() {
  siteNav?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open menu');
  setPortfolioOpen(false);
}

portfolioButton?.addEventListener('click', () => {
  setPortfolioOpen(portfolioButton.getAttribute('aria-expanded') !== 'true');
});
portfolioButton?.closest('.nav-drop').addEventListener('focusout', (event) => {
  if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setPortfolioOpen(false);
});

menuButton?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  if (!isOpen) setPortfolioOpen(false);
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav-drop')) {
    setPortfolioOpen(false);
  }
  if (!event.target.closest('.site-header')) closeSiteMenu();
  // Close overlays before the browser captures a native page-transition frame.
  if (event.target.closest('.site-nav a[href]')) closeSiteMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const portfolioWasOpen = portfolioButton?.getAttribute('aria-expanded') === 'true';
    setPortfolioOpen(false);
    if (siteNav?.classList.contains('is-open')) {
      closeSiteMenu();
      menuButton?.focus();
    } else if (portfolioWasOpen) portfolioButton.focus();
  }
});

document.querySelectorAll('.job-card-header').forEach((button) => {
  button.addEventListener('click', () => {
    button.setAttribute('aria-expanded', String(button.closest('.job-card').classList.contains('open')));
  });
});

document.querySelectorAll('.rcx-form').forEach((form) => {
  const fields = [...form.querySelectorAll('.rcx-field input, .rcx-field select, .rcx-field textarea')];
  const status = form.querySelector('.rcx-form__status');
  const recovery = form.querySelector('.rcx-form__recovery');
  const button = form.querySelector('.rcx-form__submit');
  const buttonLabel = button.querySelector('span');
  const originalLabel = buttonLabel.textContent;
  form.noValidate = true;

  function validate(field) {
    const error = document.getElementById(`${field.id}-error`);
    const valid = field.checkValidity();
    field.setAttribute('aria-invalid', String(!valid));
    error.textContent = valid ? '' : field.validationMessage;
    error.hidden = valid;
    return valid;
  }

  function showStatus(message, state) {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = false;
    recovery.hidden = state !== 'error';
  }

  fields.forEach((field) => {
    field.addEventListener('blur', () => validate(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') validate(field);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.getAttribute('aria-busy') === 'true') return;
    const invalid = fields.filter((field) => !validate(field));
    if (invalid.length) {
      showStatus('Please check the highlighted fields.', 'validation');
      invalid[0].focus();
      return;
    }

    const payload = Object.fromEntries(new FormData(form));
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    form.setAttribute('aria-busy', 'true');
    button.disabled = true;
    buttonLabel.textContent = 'Sending…';
    showStatus('Sending your details. Please wait.', 'pending');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error('Submission failed');
      form.reset();
      fields.forEach((field) => {
        field.removeAttribute('aria-invalid');
        document.getElementById(`${field.id}-error`).hidden = true;
      });
      showStatus(form.dataset.success, 'success');
    } catch {
      showStatus('We couldn’t send this right now. Your details are still here. Please try again.', 'error');
    } finally {
      clearTimeout(timeout);
      form.removeAttribute('aria-busy');
      button.disabled = false;
      buttonLabel.textContent = originalLabel;
    }
  });
});

