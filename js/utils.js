/**
 * MTMC26 — Shared Utilities
 * Pure helper functions with no side-effects. Safe to call from any module.
 */

// ─── Auth / Role Helpers ──────────────────────────────────────────────────────

/** Map a student username to its internal Supabase auth email (@mtmc26.in) */
function getAuthEmail(username) {
  if (!username) return '';
  const clean = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
  return `${clean}@mtmc26.in`;
}

/** Role hierarchy: Admin (Root) > Supermod (Head CR) > Moderator (Section CR) > Student */
function isModOrAbove(role) {
  return role === 'admin' || role === 'supermod' || role === 'moderator';
}

/** Count how many active Super Moderators exist in the current batch roster */
function countActiveSuperMods() {
  return Object.values(allUsers || {}).filter(u => u.role === 'supermod').length;
}

// ─── Cryptography ─────────────────────────────────────────────────────────────

/** SHA-256 salted password hash using the Web Crypto API (SubtleCrypto) */
async function hashPassword(password) {
  const salt = "mtmc26_salt_mbbs_";
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── String / HTML Utilities ──────────────────────────────────────────────────

/** Escape a string for safe HTML injection (XSS prevention) */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format a Unix timestamp (ms) as a human-readable relative time string.
 * e.g. "just now", "5m ago", "2h ago", "3d ago"
 */
function formatTimeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Password Toggle Helper (unified — replaces the two separate versions) ────

/**
 * Toggle an <input> between password and text type, updating the button icon.
 * Works for both gate forms and profile modal (was previously two functions).
 * @param {string} inputId  - ID of the password input element
 * @param {Element|string} btnOrIconId - The button element (or legacy icon ID string)
 */
function togglePasswordVisibility(inputId, btnOrIconId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';

  // Support both calling conventions: element reference or icon-ID string
  if (typeof btnOrIconId === 'string') {
    // Legacy: called as togglePasswordVisibility('inputId', 'iconId')
    const icon = document.getElementById(btnOrIconId);
    if (icon) icon.setAttribute('data-lucide', isHidden ? 'eye-off' : 'eye');
  } else if (btnOrIconId && typeof btnOrIconId === 'object') {
    // Gate form style: called as togglePassVisibility('inputId', btnElement)
    btnOrIconId.innerHTML = isHidden
      ? '<i data-lucide="eye-off" class="w-4 h-4"></i>'
      : '<i data-lucide="eye" class="w-4 h-4"></i>';
  }
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

// Keep the old alias so existing onclick="togglePassVisibility(...)" HTML still works
function togglePassVisibility(inputId, btnEl) {
  return togglePasswordVisibility(inputId, btnEl);
}
