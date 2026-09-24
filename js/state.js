/**
 * MTMC26 — Global State & App Constants
 * Central store for all mutable application state and immutable config constants.
 * All modules read/write these shared variables directly (no framework needed).
 */

// ─── UI Navigation State ─────────────────────────────────────────────────────
let activeBoard = 'all';
let currentSort = 'latest';
let activeThreadId = null;
let currentAdminTab = 'pending';
let currentProfileTab = 'identity';

// ─── Data Cache (populated by Firebase/Supabase listeners) ───────────────────
let allPosts = [];
let allUsers = {};
let allUserPrivate = {};
let allPublicModerators = {};
let allDeletionRequests = {};
let allNotifications = {};
let allCommunityFeedback = {};
let batchEvents = [];
let cachedMessSchedule = null;
let selectedMessDayIndex = null;

// ─── Current Authenticated Session ───────────────────────────────────────────
// Shape: { uid, username, fullName, role, status, phone, token }
let currentUserSession = null;
try {
  const stored = localStorage.getItem('mtmc_session_v2');
  if (stored) currentUserSession = JSON.parse(stored);
} catch (e) {}

// ─── Default / Starter Batch Resource Posts ──────────────────────────────────
const DEFAULT_POSTS = [
  {
    id: 'post-mtmc-mess',
    board: 'resources',
    title: '🍲 Weekly Hostel Mess Menu (Breakfast, Lunch, Hi-Tea, Dinner)',
    content: `Weekly hostel mess schedule for Batch 2026 residents. View the complete timetable for Breakfast, Lunch, Hi-Tea, and Dinner in the interactive schedule below.`,
    author: 'Batch Resource',
    isAnon: false,
    upvotes: 0,
    createdAt: 'Batch Guide',
    timestamp: 1727000000000,
    comments: []
  },
  {
    id: 'post-mtmc-foundation-course',
    board: 'resources',
    title: '🗓️ Foundation Course Schedule (28 Sep – 10 Oct 2026)',
    content: `Foundation Course timetable for Batch 2026. Daily session timings, subject orientations (Anatomy, Physiology, Biochemistry, Community Medicine), AETCOM modules, campus guidelines, and documentation schedule. View by day or see the full 2-week timetable below.`,
    author: 'Batch Resource',
    isAnon: false,
    upvotes: 0,
    createdAt: 'Batch Guide',
    timestamp: 1727100000000,
    comments: []
  }
];

// ─── Board Metadata (display names + Tailwind colour classes) ─────────────────
const BOARD_META = {
  resources: { name: 'Batch Resources',          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  anonymous: { name: 'Anonymous Wall',           color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  academics: { name: 'Studies & Viva Prep',      color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20' },
  bazaar:    { name: 'Batch Marketplace',        color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' },
  lostfound: { name: 'Lost & Found',             color: 'text-purple-600 dark:text-purple-400 bg-purple-500/20 border-purple-500/20' },
  notices:   { name: 'CR Notice',                color: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20' },
  events:    { name: 'Batch Events & HD Gallery', color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20' }
};
