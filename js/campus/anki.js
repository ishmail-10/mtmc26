/**
 * MTMC26 — Anki Spaced Repetition Flashcard Engine
 * In-built active recall flashcard deck for 1st MBBS
 * (Anatomy, Physiology, Biochemistry & custom cards)
 * Strictly adheres to Rectangular Campus BBS Design System.
 */

(function () {
  'use strict';

  // ─── LocalStorage Keys ───────────────────────────────────────────────────────
  const STORAGE_RATINGS_KEY = 'mtmc26_anki_ratings_v1';
  const STORAGE_CUSTOM_KEY  = 'mtmc26_anki_custom_cards_v1';

  // ─── Module State ───────────────────────────────────────────────────────────
  let activeSubjectFilter = 'all'; // 'all' | 'Anatomy' | 'Physiology' | 'Biochemistry' | 'custom'
  let currentCardIndex = 0;
  let isCardFlipped = false;
  let isShuffled = false;
  let activeDeck = [];
  let keyboardListenerAttached = false;

  // ─── Data Access & Merging ──────────────────────────────────────────────────
  function getCustomCards() {
    try {
      const data = localStorage.getItem(STORAGE_CUSTOM_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomCards(cards) {
    try {
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(cards));
    } catch (e) {}
  }

  function getAllCards() {
    const builtIn = (window.VIVA_QUESTIONS || []).map(q => ({
      ...q,
      isCustom: false,
      cardId: 'builtin_' + q.id
    }));
    const custom = getCustomCards().map(c => ({
      ...c,
      isCustom: true,
      cardId: 'custom_' + c.id
    }));
    return [...builtIn, ...custom];
  }

  function getRatings() {
    try {
      const data = localStorage.getItem(STORAGE_RATINGS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveRatings(ratings) {
    try {
      localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(ratings));
    } catch (e) {}
  }

  // ─── Deck Filtering & Building ──────────────────────────────────────────────
  function buildActiveDeck() {
    const all = getAllCards();
    let filtered = all;

    if (activeSubjectFilter === 'custom') {
      filtered = all.filter(c => c.isCustom);
    } else if (activeSubjectFilter !== 'all') {
      filtered = all.filter(c => (c.subject || '').toLowerCase() === activeSubjectFilter.toLowerCase());
    }

    if (isShuffled) {
      // Deterministic Fisher-Yates shallow copy
      filtered = [...filtered];
      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }
    }

    activeDeck = filtered;
    if (currentCardIndex >= activeDeck.length) {
      currentCardIndex = 0;
    }
    isCardFlipped = false;
  }

  // ─── Card Actions (Flip, Rate, Next, Prev) ──────────────────────────────────
  function flipAnkiCard() {
    isCardFlipped = !isCardFlipped;
    renderAnkiCard();
  }

  function rateAnkiCard(rating) {
    // rating: 'again' | 'hard' | 'good' | 'easy'
    if (!activeDeck || activeDeck.length === 0) return;
    const card = activeDeck[currentCardIndex];
    if (!card) return;

    const ratings = getRatings();
    const prev = ratings[card.cardId] || { reviewCount: 0 };

    let intervalDays = 1;
    if (rating === 'again') intervalDays = 0;
    else if (rating === 'hard') intervalDays = 1;
    else if (rating === 'good') intervalDays = Math.max(2, (prev.intervalDays || 1) * 2);
    else if (rating === 'easy') intervalDays = Math.max(4, (prev.intervalDays || 1) * 3);

    ratings[card.cardId] = {
      rating,
      reviewedAt: Date.now(),
      reviewCount: (prev.reviewCount || 0) + 1,
      intervalDays
    };

    saveRatings(ratings);
    updateDeckStatsDisplay();
    updateSidebarAnkiBadge();

    // Advance to next card smoothly
    advanceToNextCard();
  }

  function advanceToNextCard() {
    if (!activeDeck || activeDeck.length === 0) return;
    isCardFlipped = false;
    currentCardIndex = (currentCardIndex + 1) % activeDeck.length;
    renderAnkiCard();
  }

  function goToPreviousCard() {
    if (!activeDeck || activeDeck.length === 0) return;
    isCardFlipped = false;
    currentCardIndex = (currentCardIndex - 1 + activeDeck.length) % activeDeck.length;
    renderAnkiCard();
  }

  function toggleShuffleDeck() {
    isShuffled = !isShuffled;
    buildActiveDeck();
    renderAnkiCard();
  }

  function resetDeckProgress() {
    if (!confirm('Reset study progress for all flashcards? Your review history will be cleared.')) return;
    saveRatings({});
    buildActiveDeck();
    renderAnkiCard();
    updateDeckStatsDisplay();
    updateSidebarAnkiBadge();
  }

  // ─── Modal Open / Close ─────────────────────────────────────────────────────
  function openAnkiModal(subject) {
    if (subject) activeSubjectFilter = subject;
    buildActiveDeck();

    const modal = document.getElementById('anki-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (!keyboardListenerAttached) {
      window.addEventListener('keydown', handleAnkiKeyboardShortcuts);
      keyboardListenerAttached = true;
    }

    renderAnkiCard();
    updateDeckStatsDisplay();
  }

  function closeAnkiModal() {
    const modal = document.getElementById('anki-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    isCardFlipped = false;

    if (keyboardListenerAttached) {
      window.removeEventListener('keydown', handleAnkiKeyboardShortcuts);
      keyboardListenerAttached = false;
    }
  }

  function handleAnkiModalBackdropClick(event) {
    if (event.target && event.target.id === 'anki-modal') {
      closeAnkiModal();
    }
  }

  // ─── Keyboard Shortcuts ─────────────────────────────────────────────────────
  function handleAnkiKeyboardShortcuts(e) {
    const modal = document.getElementById('anki-modal');
    if (!modal || modal.classList.contains('hidden')) return;

    // Don't intercept if user is typing in an input
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

    if (e.key === 'Escape') {
      closeAnkiModal();
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flipAnkiCard();
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      advanceToNextCard();
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPreviousCard();
      return;
    }

    // Rating shortcuts active when card is flipped
    if (isCardFlipped) {
      if (e.key === '1') { e.preventDefault(); rateAnkiCard('again'); }
      else if (e.key === '2') { e.preventDefault(); rateAnkiCard('hard'); }
      else if (e.key === '3') { e.preventDefault(); rateAnkiCard('good'); }
      else if (e.key === '4') { e.preventDefault(); rateAnkiCard('easy'); }
    }
  }

  // ─── Filter Tabs & Deck Stats ───────────────────────────────────────────────
  function setAnkiSubjectFilter(subject) {
    activeSubjectFilter = subject;
    currentCardIndex = 0;
    isCardFlipped = false;
    buildActiveDeck();
    renderAnkiCard();
    updateDeckStatsDisplay();
  }

  function updateDeckStatsDisplay() {
    const all = getAllCards();
    const ratings = getRatings();

    let masteredCount = 0;
    let learningCount = 0;
    let unseenCount = 0;

    all.forEach(c => {
      const r = ratings[c.cardId];
      if (!r) unseenCount++;
      else if (r.rating === 'easy' || r.rating === 'good') masteredCount++;
      else learningCount++;
    });

    // Update modal counters
    const masteredEl = document.getElementById('anki-stat-mastered');
    const learningEl = document.getElementById('anki-stat-learning');
    const unseenEl   = document.getElementById('anki-stat-unseen');
    if (masteredEl) masteredEl.textContent = masteredCount;
    if (learningEl) learningEl.textContent = learningCount;
    if (unseenEl)   unseenEl.textContent   = unseenCount;

    // Update active filter badge counts
    const tabAll     = document.getElementById('anki-tab-all-count');
    const tabAnat    = document.getElementById('anki-tab-anat-count');
    const tabPhys    = document.getElementById('anki-tab-phys-count');
    const tabBio     = document.getElementById('anki-tab-bio-count');
    if (tabAll)  tabAll.textContent  = all.length;
    if (tabAnat) tabAnat.textContent = all.filter(c => c.subject === 'Anatomy').length;
    if (tabPhys) tabPhys.textContent = all.filter(c => c.subject === 'Physiology').length;
    if (tabBio)  tabBio.textContent  = all.filter(c => c.subject === 'Biochemistry').length;

    // Update progress bar
    const progressEl = document.getElementById('anki-progress-bar');
    if (progressEl) {
      const pct = all.length > 0 ? Math.round(((masteredCount + learningCount) / all.length) * 100) : 0;
      progressEl.style.width = pct + '%';
    }

    // Active tab styling
    ['all', 'Anatomy', 'Physiology', 'Biochemistry', 'custom'].forEach(tab => {
      const btn = document.getElementById('anki-tab-' + tab.toLowerCase());
      if (btn) {
        if (activeSubjectFilter.toLowerCase() === tab.toLowerCase()) {
          btn.className = 'px-2.5 py-1 rounded text-xs font-bold transition bg-indigo-600 text-white shadow-xs';
        } else {
          btn.className = 'px-2.5 py-1 rounded text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition';
        }
      }
    });
  }

  function updateSidebarAnkiBadge() {
    const chip = document.getElementById('anki-sidebar-mastered-chip');
    if (!chip) return;
    const all = getAllCards();
    const ratings = getRatings();
    const mastered = all.filter(c => {
      const r = ratings[c.cardId];
      return r && (r.rating === 'easy' || r.rating === 'good');
    }).length;
    chip.textContent = `${mastered}/${all.length} Mastered`;
  }

  // ─── Render Active Card ─────────────────────────────────────────────────────
  function renderAnkiCard() {
    const cardWrap = document.getElementById('anki-card-viewport');
    if (!cardWrap) return;

    if (!activeDeck || activeDeck.length === 0) {
      cardWrap.innerHTML = `
        <div class="text-center py-12 px-4 space-y-3">
          <div class="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center text-xl">
            📭
          </div>
          <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200">No flashcards found in this deck</h4>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">Try selecting another subject tab or add your own custom flashcards.</p>
          <button type="button" onclick="setAnkiSubjectFilter('all')" class="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition">
            View All Cards (30)
          </button>
        </div>
      `;
      return;
    }

    const card = activeDeck[currentCardIndex];
    const total = activeDeck.length;
    const ratings = getRatings();
    const prevReview = ratings[card.cardId];

    // Subject badge color styling
    let subjectBadgeClass = 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30';
    if (card.subject === 'Physiology') {
      subjectBadgeClass = 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30';
    } else if (card.subject === 'Biochemistry') {
      subjectBadgeClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
    } else if (card.isCustom) {
      subjectBadgeClass = 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30';
    }

    // Previous rating tag
    let lastRatingBadge = '';
    if (prevReview) {
      const colorMap = {
        again: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
        hard:  'bg-amber-500/15 text-amber-600 border-amber-500/30',
        good:  'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
        easy:  'bg-blue-500/15 text-blue-600 border-blue-500/30'
      };
      const labelMap = { again: '🔴 Again', hard: '🟠 Hard', good: '🟢 Good', easy: '🔵 Easy' };
      const cls = colorMap[prevReview.rating] || 'bg-slate-100 text-slate-600';
      lastRatingBadge = `
        <span class="text-[10px] font-bold px-1.5 py-0.2 rounded border ${cls}">
          Last: ${labelMap[prevReview.rating] || prevReview.rating}
        </span>
      `;
    }

    // Front vs Back content
    let cardContentHtml = '';

    if (!isCardFlipped) {
      // ── FRONT OF CARD ──
      cardContentHtml = `
        <div class="flex-1 flex flex-col justify-between py-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                ${window.escapeHtml ? window.escapeHtml(card.topic || '') : card.topic}
              </span>
              ${lastRatingBadge}
            </div>
            <h3 class="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">
              "${window.escapeHtml ? window.escapeHtml(card.question || '') : card.question}"
            </h3>
          </div>

          <div class="pt-8 text-center space-y-2">
            <button type="button" onclick="flipAnkiCard()" class="w-full sm:w-auto px-6 py-2.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition shadow-sm inline-flex items-center justify-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>Show Answer</span>
              <kbd class="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-indigo-700/80 rounded border border-indigo-400/40">Space</kbd>
            </button>
            <p class="text-[11px] text-slate-400">Click button or press Spacebar to reveal</p>
          </div>
        </div>
      `;
    } else {
      // ── BACK OF CARD ──
      cardContentHtml = `
        <div class="flex-1 flex flex-col justify-between space-y-4 py-2">
          <!-- Question recap header -->
          <div class="pb-2.5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2">
            <div>
              <span class="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                ${window.escapeHtml ? window.escapeHtml(card.topic || '') : card.topic}
              </span>
              <h4 class="font-bold text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                "${window.escapeHtml ? window.escapeHtml(card.question || '') : card.question}"
              </h4>
            </div>
            ${lastRatingBadge}
          </div>

          <!-- Answer & Pearl content -->
          <div class="space-y-3 overflow-y-auto max-h-[38vh] sm:max-h-[42vh] pr-1">
            <div class="p-3.5 rounded-md bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              <div class="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1.5">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                <span>Key Viva Points & Model Answer:</span>
              </div>
              <div>
                ${card.pearl || ''}
              </div>
            </div>

            ${card.vivaTip ? `
              <div class="p-2.5 rounded-md bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed flex items-start gap-1.5">
                <span class="font-bold not-italic shrink-0">⚡ Viva Trap:</span>
                <span>${window.escapeHtml ? window.escapeHtml(card.vivaTip) : card.vivaTip}</span>
              </div>
            ` : ''}
          </div>

          <!-- Anki 4 Rating Buttons -->
          <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span class="font-semibold">How well did you recall this?</span>
              <span class="hidden sm:inline text-[10px] font-mono">Shortcuts: 1 · 2 · 3 · 4</span>
            </div>
            <div class="grid grid-cols-4 gap-1.5 sm:gap-2">
              <button type="button" onclick="rateAnkiCard('again')" class="py-2 px-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-center transition flex flex-col items-center shadow-2xs">
                <span class="font-extrabold text-xs">🔴 Again</span>
                <span class="text-[9px] font-mono opacity-80">&lt; 1 min [1]</span>
              </button>

              <button type="button" onclick="rateAnkiCard('hard')" class="py-2 px-1 rounded bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-center transition flex flex-col items-center shadow-2xs">
                <span class="font-extrabold text-xs">🟠 Hard</span>
                <span class="text-[9px] font-mono opacity-80">10 min [2]</span>
              </button>

              <button type="button" onclick="rateAnkiCard('good')" class="py-2 px-1 rounded bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-center transition flex flex-col items-center shadow-2xs">
                <span class="font-extrabold text-xs">🟢 Good</span>
                <span class="text-[9px] font-mono opacity-80">1 day [3]</span>
              </button>

              <button type="button" onclick="rateAnkiCard('easy')" class="py-2 px-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-center transition flex flex-col items-center shadow-2xs">
                <span class="font-extrabold text-xs">🔵 Easy</span>
                <span class="text-[9px] font-mono opacity-80">4 days [4]</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    cardWrap.innerHTML = `
      <div class="bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-md p-4 sm:p-5 min-h-[320px] sm:min-h-[360px] flex flex-col justify-between transition-colors shadow-xs">
        <!-- Top card bar -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${subjectBadgeClass}">
              ${card.subject || '1st MBBS'}
            </span>
            <span class="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
              Card ${currentCardIndex + 1} of ${total}
            </span>
          </div>

          <div class="flex items-center gap-1">
            <button type="button" onclick="goToPreviousCard()" class="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition" title="Previous Card (←)">
              <i data-lucide="chevron-left" class="w-4 h-4"></i>
            </button>
            <button type="button" onclick="advanceToNextCard()" class="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition" title="Next Card (→)">
              <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Body content -->
        ${cardContentHtml}
      </div>
    `;

    if (window.lucide && window.lucide.createIcons) lucide.createIcons();
  }

  // ─── Add Custom Card Modal/Form ─────────────────────────────────────────────
  function openAddCustomCardPrompt() {
    const subject = prompt('Enter subject (Anatomy, Physiology, or Biochemistry):', 'Anatomy');
    if (!subject) return;

    const topic = prompt('Enter topic name (e.g. Femoral Triangle):');
    if (!topic) return;

    const question = prompt('Enter Flashcard Prompt / Question:');
    if (!question) return;

    const pearl = prompt('Enter Model Answer / Key Points:');
    if (!pearl) return;

    const vivaTip = prompt('Enter optional Viva Trap or mnemonic (or leave blank):') || '';

    const newCard = {
      id: Date.now(),
      subject: subject.trim(),
      topic: topic.trim(),
      question: question.trim(),
      pearl: `<p class="leading-relaxed">${window.escapeHtml ? window.escapeHtml(pearl) : pearl}</p>`,
      vivaTip: vivaTip.trim()
    };

    const customs = getCustomCards();
    customs.push(newCard);
    saveCustomCards(customs);

    alert('✅ Custom Flashcard added to your deck!');
    activeSubjectFilter = 'custom';
    buildActiveDeck();
    renderAnkiCard();
    updateDeckStatsDisplay();
    updateSidebarAnkiBadge();
  }

  // ─── Public API Exports ─────────────────────────────────────────────────────
  window.openAnkiModal = openAnkiModal;
  window.closeAnkiModal = closeAnkiModal;
  window.handleAnkiModalBackdropClick = handleAnkiModalBackdropClick;
  window.flipAnkiCard = flipAnkiCard;
  window.rateAnkiCard = rateAnkiCard;
  window.advanceToNextCard = advanceToNextCard;
  window.goToPreviousCard = goToPreviousCard;
  window.toggleShuffleDeck = toggleShuffleDeck;
  window.resetDeckProgress = resetDeckProgress;
  window.setAnkiSubjectFilter = setAnkiSubjectFilter;
  window.openAddCustomCardPrompt = openAddCustomCardPrompt;
  window.updateSidebarAnkiBadge = updateSidebarAnkiBadge;

  // Initialize sidebar badge on load
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateSidebarAnkiBadge, 600);
  });

})();
