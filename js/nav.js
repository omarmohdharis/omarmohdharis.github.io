/* Shared page script: theme persistence + nav highlight */

(function () {
  // Apply saved theme instantly to prevent flash
  const saved = localStorage.getItem('theme') || 'day';
  document.documentElement.setAttribute('data-theme', saved);

  document.addEventListener('DOMContentLoaded', () => {
    // Highlight current nav link
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav ul a').forEach(a => {
      if (a.getAttribute('href') === path) a.classList.add('active');
    });

    // Theme toggle button
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      const updateIcon = () => {
        const t = document.documentElement.getAttribute('data-theme');
        btn.textContent = t === 'night' ? '☾' : '☀';
      };
      updateIcon();
      btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme');
        const next = cur === 'day' ? 'night' : 'day';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateIcon();
      });
    }

    // Fade-in on nav
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.5s ease';
      document.body.style.opacity = '1';
    });
  });
})();
