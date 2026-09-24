/**
 * MTMC26 — Theme Controller
 * Handles dark/light mode preference, toggle, and system-level change listeners.
 */

function getPreferredTheme() {
  const savedTheme = localStorage.getItem('mtmc_theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }
  // Follow mobile device / system preference, fallback to light
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function updateThemeUI(isDark) {
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isDark ? '#090d16' : '#ffffff');
  }
  const iconContainer = document.getElementById('theme-icon-container');
  const textLabel = document.getElementById('theme-text-label');
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (iconContainer && textLabel) {
    if (isDark) {
      iconContainer.innerHTML = '<i data-lucide="sun" class="w-4 h-4 text-amber-400"></i>';
      textLabel.textContent = 'Light';
      if (toggleBtn) toggleBtn.setAttribute('title', 'Switch to Light Mode');
    } else {
      iconContainer.innerHTML = '<i data-lucide="moon" class="w-4 h-4 text-slate-700"></i>';
      textLabel.textContent = 'Dark';
      if (toggleBtn) toggleBtn.setAttribute('title', 'Switch to Dark Mode');
    }
    if (window.lucide && window.lucide.createIcons) {
      lucide.createIcons();
    }
  }
}

function initTheme() {
  const theme = getPreferredTheme();
  const isDark = theme === 'dark';
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeUI(isDark);
}

function toggleTheme() {
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  const newDark = !isCurrentlyDark;
  if (newDark) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('mtmc_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('mtmc_theme', 'light');
  }
  updateThemeUI(newDark);
}

// Auto-respond if mobile device switches system theme
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('mtmc_theme')) {
      const isDark = e.matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      updateThemeUI(isDark);
    }
  });
}
