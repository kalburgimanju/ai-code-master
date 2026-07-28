// === Typewriter Effect ===
(function () {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const fullText = "Shipping AI Products from Strategy to Production";
  let index = 0;
  const interval = setInterval(() => {
    if (index < fullText.length) {
      el.textContent = fullText.slice(0, index + 1);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 50);
})();

// === Mobile Menu Toggle ===
(function () {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });
})();

function closeMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.add('hidden');
}

// === Contact Form Submission ===
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent!', 'I will get back to you soon.');
    form.reset();
  });
})();

// === Toast Notification ===
function showToast(title, description) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastDesc = document.getElementById('toast-desc');

  if (!toast || !toastTitle || !toastDesc) return;

  toastTitle.textContent = title;
  toastDesc.textContent = description;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// === Smooth Scroll for Anchor Links ===
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
