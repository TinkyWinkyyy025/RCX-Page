const galleryData = document.getElementById('brand-gallery-data');
const brandDialog = document.querySelector('.brand-lightbox');

if (galleryData && brandDialog) {
  const photos = JSON.parse(galleryData.textContent);
  const image = brandDialog.querySelector('[data-brand-enlarged]');
  const counter = brandDialog.querySelector('[data-brand-counter]');
  let current = 0;
  let trigger;
  let previousOverflow = '';
  let photoVersion = 0;
  let photoAnimation;
  const motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  function showPhoto(index) {
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    const label = `${current + 1} / ${photos.length}`;
    const version = ++photoVersion;
    photoAnimation?.cancel();
    image.setAttribute('aria-busy', 'true');
    counter.textContent = `${label} — Loading…`;
    // Keep the current frame in place until the requested photo is ready.
    const next = new Image();
    next.onload = () => {
      if (version !== photoVersion || !brandDialog.open) return;
      image.src = photo.src;
      image.alt = photo.alt;
      image.setAttribute('aria-busy', 'false');
      counter.textContent = label;
      if (motionPreference && !motionPreference.matches && image.animate) {
        photoAnimation = image.animate([{ opacity: .65 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
      }
    };
    next.onerror = () => {
      if (version !== photoVersion || !brandDialog.open) return;
      image.setAttribute('aria-busy', 'false');
      counter.textContent = `${label} — Photo unavailable. Please try reopening the gallery or choose another photo.`;
    };
    next.src = photo.src;
  }

  motionPreference?.addEventListener('change', () => { if (motionPreference.matches) photoAnimation?.cancel(); });

  document.querySelectorAll('[data-brand-photo]').forEach((button) => {
    button.addEventListener('click', () => {
      trigger = button;
      showPhoto(Number(button.dataset.brandPhoto));
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      brandDialog.showModal();
      brandDialog.querySelector('[data-brand-close]').focus();
    });
  });

  brandDialog.querySelector('[data-brand-close]').addEventListener('click', () => brandDialog.close());
  brandDialog.querySelector('[data-brand-previous]').addEventListener('click', () => showPhoto(current - 1));
  brandDialog.querySelector('[data-brand-next]').addEventListener('click', () => showPhoto(current + 1));
  if (photos.length === 1) brandDialog.querySelector('.brand-lightbox__controls').hidden = true;
  brandDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') event.stopPropagation();
    if (event.key === 'Tab') {
      const buttons = [...brandDialog.querySelectorAll('button')].filter(button => !button.disabled && button.getClientRects().length);
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  brandDialog.addEventListener('click', (event) => {
    const rect = brandDialog.getBoundingClientRect();
    if (event.target === brandDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) brandDialog.close();
  });
  brandDialog.addEventListener('close', () => {
    photoVersion++;
    photoAnimation?.cancel();
    image.setAttribute('aria-busy', 'false');
    document.body.style.overflow = previousOverflow;
    trigger?.focus();
  });
}
