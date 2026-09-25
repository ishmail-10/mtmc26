/**
 * MTMC26 — Hostel Mess Menu & Food Rating Widget Test
 */

    // ================= LOCAL REPOSITORY & FIREBASE MESS MENU SYNC =================
    const LOCAL_MESS_MENU_URL = './mess_menu.json';
    let activeWidgetDayIndex = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun
    let messTimetableActiveDay = (new Date().getDay() + 6) % 7; // 0=Mon, 6=Sun, or 'all'

    function setMessTimetableDay(dayIdx) {
      messTimetableActiveDay = dayIdx;
      const container = document.getElementById('mess-thread-timetable-container');
      if (container) {
        container.outerHTML = renderMessTimetableThreadHTML();
        lucide.createIcons();
      }
    }

    function renderMessTimetableThreadHTML() {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const realTodayIdx = (new Date().getDay() + 6) % 7;

      let daysChips = `
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          ${daysShort.map((d, i) => `
            <button type="button" onclick="setMessTimetableDay(${i})" class="px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${messTimetableActiveDay === i ? 'bg-brand-orange text-white shadow-sm' : (i === realTodayIdx ? 'bg-orange-500/15 text-brand-orange border border-orange-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700')}">
              ${d} ${i === realTodayIdx ? '•' : ''}
            </button>
          `).join('')}
          <button type="button" onclick="setMessTimetableDay('all')" class="px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${messTimetableActiveDay === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}">
            📅 Full Week
          </button>
        </div>
      `;

      let contentHTML = '';

      if (messTimetableActiveDay === 'all') {
        contentHTML = `
          <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                  <th class="p-3">Day</th>
                  <th class="p-3">🌅 Breakfast</th>
                  <th class="p-3">🍛 Lunch</th>
                  <th class="p-3">☕ Hi-Tea</th>
                  <th class="p-3">🌙 Dinner</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                ${(cachedMessSchedule || []).map((row, idx) => `
                  <tr class="${idx === realTodayIdx ? 'bg-orange-500/5 dark:bg-orange-500/10 font-medium' : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/50'}">
                    <td class="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      ${row.day} ${idx === realTodayIdx ? '<span class="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-brand-orange text-white font-black">TODAY</span>' : ''}
                    </td>
                    <td class="p-3 text-slate-700 dark:text-slate-300 min-w-[160px]">${(row.breakfast || []).join(' · ')}</td>
                    <td class="p-3 text-slate-700 dark:text-slate-300 min-w-[180px]">${(row.lunch || []).join(' · ')}</td>
                    <td class="p-3 text-slate-700 dark:text-slate-300 min-w-[140px]">${(row.hitea || []).join(' · ')}</td>
                    <td class="p-3 text-slate-700 dark:text-slate-300 min-w-[180px]">${(row.dinner || []).join(' · ')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else {
        const dayIdx = typeof messTimetableActiveDay === 'number' ? messTimetableActiveDay : 0;
        const dayData = (cachedMessSchedule && cachedMessSchedule[dayIdx]) ? cachedMessSchedule[dayIdx] : {
          day: days[dayIdx].toUpperCase(), breakfast: [], lunch: [], hitea: [], dinner: []
        };

        const renderMealCard = (icon, title, items, badgeColor, borderColor) => `
          <div class="rounded-2xl p-4 bg-white dark:bg-slate-900 border ${borderColor} shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1.5 text-xs font-extrabold ${badgeColor}">
                <span>${icon}</span>
                <span>${title}</span>
              </span>
              <span class="text-[10px] text-slate-400 font-medium">${items.length} items</span>
            </div>
            <ul class="space-y-1 text-xs text-slate-700 dark:text-slate-300">
              ${items.map(item => `
                <li class="flex items-start gap-1.5">
                  <span class="text-slate-400 select-none">•</span>
                  <span>${escapeHtml(item)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `;

        contentHTML = `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${renderMealCard('🌅', 'Breakfast', dayData.breakfast || [], 'text-amber-600 dark:text-amber-400', 'border-amber-200 dark:border-amber-500/20')}
            ${renderMealCard('🍛', 'Lunch', dayData.lunch || [], 'text-emerald-600 dark:text-emerald-400', 'border-emerald-200 dark:border-emerald-500/20')}
            ${renderMealCard('☕', 'Hi-Tea', dayData.hitea || [], 'text-rose-600 dark:text-rose-400', 'border-rose-200 dark:border-rose-500/20')}
            ${renderMealCard('🌙', 'Dinner', dayData.dinner || [], 'text-indigo-600 dark:text-indigo-400', 'border-indigo-200 dark:border-indigo-500/20')}
          </div>
        `;
      }

      return `
        <div id="mess-thread-timetable-container" class="space-y-3 pt-1">
          <div class="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                <i data-lucide="utensils" class="w-4 h-4"></i>
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white">Hostel Mess Weekly Timetable</h4>
                <p class="text-[10px] text-slate-400">Hostel Mess Timetable · Local & Offline Cached</p>
              </div>
            </div>
            <button type="button" onclick="syncLiveMessMenu(true)" id="btn-sync-mess-data" class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-slate-400"></i>
              <span>Sync</span>
            </button>
          </div>

          ${daysChips}

          ${contentHTML}
        </div>
      `;
    }

    async function syncLiveMessMenu(isManual = false) {
      try {
        const syncBtn = document.getElementById('btn-sync-mess-data');
        if (syncBtn) {
          syncBtn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>Syncing...</span>`;
          lucide.createIcons();
        }

        let schedule = null;
        if (db) {
          try {
            const snap = await db.ref('messMenu').once('value');
            if (snap.exists() && Array.isArray(snap.val())) {
              schedule = snap.val();
              localStorage.setItem('mtmc26_mess_schedule', JSON.stringify(schedule));
            }
          } catch (e) {
            console.warn('Firebase messMenu sync failed:', e);
          }
        }

        if (!schedule) {
          const localRes = await fetch(LOCAL_MESS_MENU_URL);
          if (localRes.ok) {
            schedule = await localRes.json();
            localStorage.setItem('mtmc26_mess_schedule', JSON.stringify(schedule));
          }
        }

        if (schedule && Array.isArray(schedule)) {
          cachedMessSchedule = schedule;
          renderMessWidget();
          const timetableContainer = document.getElementById('mess-thread-timetable-container');
          if (timetableContainer) {
            timetableContainer.outerHTML = renderMessTimetableThreadHTML();
            lucide.createIcons();
          }
        }

        if (syncBtn) {
          syncBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-500"></i><span class="text-emerald-600 dark:text-emerald-400 font-bold">Synced</span>`;
          lucide.createIcons();
          setTimeout(() => {
            syncBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-slate-400"></i><span>Sync</span>`;
            lucide.createIcons();
          }, 2000);
        }
      } catch (err) {
        console.error('Mess menu sync error:', err);
      }
    }

    function initMessMenu() {
      try {
        const stored = localStorage.getItem('mtmc26_mess_schedule');
        if (stored) {
          cachedMessSchedule = JSON.parse(stored);
        }
      } catch (e) {
        cachedMessSchedule = DEFAULT_MESS_SCHEDULE;
      }

      if (!cachedMessSchedule || cachedMessSchedule.length === 0) {
        cachedMessSchedule = DEFAULT_MESS_SCHEDULE;
      }

      renderMessWidget();
      setTimeout(() => syncLiveMessMenu(false), 1500);
    }

    function selectWidgetDay(idx) {
      activeWidgetDayIndex = idx;
      renderMessWidget();
    }

    // ================= DYNAMIC TIMED MEAL RATINGS & PERCENTAGES =================
    let messRatingsByMeal = {
      breakfast: { good: 0, okay: 0, bad: 0, total: 0, userVote: null, goodPct: 0, okayPct: 0, badPct: 0 },
      lunch: { good: 0, okay: 0, bad: 0, total: 0, userVote: null, goodPct: 0, okayPct: 0, badPct: 0 },
      hitea: { good: 0, okay: 0, bad: 0, total: 0, userVote: null, goodPct: 0, okayPct: 0, badPct: 0 },
      dinner: { good: 0, okay: 0, bad: 0, total: 0, userVote: null, goodPct: 0, okayPct: 0, badPct: 0 }
    };

    function getCurrentActiveMeal() {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      // 06:00 to 12:30 (360 to 750) -> Breakfast
      // 12:30 to 17:00 (750 to 1020) -> Lunch
      // 17:00 to 19:30 (1020 to 1170) -> Hi-Tea
      // 19:30 to 06:00 next morning -> Dinner
      if (mins >= 360 && mins < 750) {
        return { key: 'breakfast', name: 'Breakfast', icon: '🍳', start: '06:00 AM', end: '12:30 PM' };
      } else if (mins >= 750 && mins < 1020) {
        return { key: 'lunch', name: 'Lunch', icon: '🍛', start: '12:30 PM', end: '05:00 PM' };
      } else if (mins >= 1020 && mins < 1170) {
        return { key: 'hitea', name: 'Hi-Tea', icon: '☕', start: '05:00 PM', end: '07:30 PM' };
      } else {
        return { key: 'dinner', name: 'Dinner', icon: '🍲', start: '07:30 PM', end: '06:00 AM' };
      }
    }

    function getTodayDateKey() {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function getMealRatingDateKey(mealKey) {
      const now = new Date();
      if (mealKey === 'dinner' && now.getHours() < 6) {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const y = yesterday.getFullYear();
        const m = String(yesterday.getMonth() + 1).padStart(2, '0');
        const d = String(yesterday.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}_dinner`;
      }
      return `${getTodayDateKey()}_${mealKey}`;
    }

    function renderMessWidget() {
      const widgetContent = document.getElementById('mess-widget-content');
      const mobileWidgetContent = document.getElementById('mobile-mess-widget-content');
      if (!widgetContent && !mobileWidgetContent) return;

      const daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const daysFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const realTodayIdx = (new Date().getDay() + 6) % 7;

      let badgeText = '';
      let badgeCls = '';
      if (activeWidgetDayIndex === realTodayIdx) {
        badgeText = `Today (${daysShort[activeWidgetDayIndex]})`;
        badgeCls = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20';
      } else {
        badgeText = daysFull[activeWidgetDayIndex];
        badgeCls = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
      }

      ['mess-widget-day-badge', 'mobile-mess-widget-day-badge'].forEach(id => {
        const badge = document.getElementById(id);
        if (badge) {
          badge.textContent = badgeText;
          badge.className = badgeCls;
        }
      });

      for (let i = 0; i < 7; i++) {
        let chipCls = '';
        if (i === activeWidgetDayIndex) {
          chipCls = 'wday-chip py-1 rounded-lg transition bg-brand-orange text-white shadow-sm font-extrabold';
        } else if (i === realTodayIdx) {
          chipCls = 'wday-chip py-1 rounded-lg transition bg-brand-orange/15 text-brand-orange font-bold border border-brand-orange/30';
        } else {
          chipCls = 'wday-chip py-1 rounded-lg transition bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700';
        }

        ['wday-btn-' + i, 'mobile-wday-btn-' + i].forEach(btnId => {
          const btn = document.getElementById(btnId);
          if (btn) btn.className = chipCls;
        });
      }

      if (!cachedMessSchedule || !cachedMessSchedule[activeWidgetDayIndex]) {
        ['mess-widget-content', 'mobile-mess-widget-content'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.innerHTML = `<p class="text-slate-400 italic text-[10px]">Loading schedule...</p>`;
        });
        return;
      }

      const dayData = cachedMessSchedule[activeWidgetDayIndex];
      const activeMeal = getCurrentActiveMeal();

      const renderMealCard = (mealKey, icon, title, items, colorCls, borderCls) => {
        const rate = messRatingsByMeal[mealKey] || { total: 0, goodPct: 0 };
        let sentimentBadgeHtml = '';

        if (activeWidgetDayIndex === realTodayIdx) {
          if (activeMeal.key === mealKey) {
            sentimentBadgeHtml = `
              <span class="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold border border-emerald-500/20 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>${rate.total > 0 ? `😋 ${rate.goodPct}%` : 'Rating Open'}</span>
              </span>
            `;
          } else {
            const nowMins = new Date().getHours() * 60 + new Date().getMinutes();
            const isPast = (mealKey === 'breakfast' && nowMins >= 750) ||
                           (mealKey === 'lunch' && nowMins >= 1020) ||
                           (mealKey === 'hitea' && nowMins >= 1170);

            if (rate.total > 0) {
              sentimentBadgeHtml = `
                <span class="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold border border-slate-200 dark:border-slate-700">
                  😋 ${rate.goodPct}% (${rate.total})
                </span>
              `;
            } else if (isPast) {
              sentimentBadgeHtml = `<span class="text-[9px] text-slate-400 font-medium">Closed</span>`;
            }
          }
        }

        const previewText = items.slice(0, 2).join(', ') + (items.length > 2 ? '...' : '');

        return `
          <div onclick="openMealDetailModal(${activeWidgetDayIndex}, '${mealKey}')" class="bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60 hover:border-brand-orange/40 hover:shadow-xs transition cursor-pointer space-y-1 group">
            <div class="flex items-center justify-between text-[10px]">
              <span class="font-bold ${colorCls} flex items-center gap-1">
                <span>${icon}</span> <span>${title}</span>
              </span>
              <div class="flex items-center gap-1">
                ${sentimentBadgeHtml}
                <i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-orange transition"></i>
              </div>
            </div>
            <p class="text-slate-800 dark:text-slate-200 font-medium leading-tight text-[11px]">${escapeHtml(previewText)}</p>
            <div class="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
              <span class="italic font-normal group-hover:text-brand-orange transition">Tap for complete menu</span>
              <span class="font-semibold">${items.length} dishes</span>
            </div>
          </div>
        `;
      };

      const html = `
        ${renderMealCard('breakfast', '🍳', 'Breakfast', dayData.breakfast || [], 'text-amber-600 dark:text-amber-400', 'border-amber-200 dark:border-amber-500/20')}
        ${renderMealCard('lunch', '🍛', 'Lunch', dayData.lunch || [], 'text-emerald-600 dark:text-emerald-400', 'border-emerald-200 dark:border-emerald-500/20')}
        ${renderMealCard('hitea', '☕', 'Hi-Tea', dayData.hitea || [], 'text-rose-600 dark:text-rose-400', 'border-rose-200 dark:border-rose-500/20')}
        ${renderMealCard('dinner', '🍲', 'Dinner', dayData.dinner || [], 'text-indigo-600 dark:text-indigo-400', 'border-indigo-200 dark:border-indigo-500/20')}
      `;

      ['mess-widget-content', 'mobile-mess-widget-content'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
      });

      if (window.lucide && typeof window.lucide.createIcons === 'function') lucide.createIcons();
    }

    function initMessRatingListener() {
      if (!db) return;
      const meals = ['breakfast', 'lunch', 'hitea', 'dinner'];
      meals.forEach(mealKey => {
        const dateKey = getMealRatingDateKey(mealKey);
        db.ref('messRatings/' + dateKey).on('value', snap => {
          const data = snap.val() || {};
          const votes = data.votes || {};
          let good = 0, okay = 0, bad = 0;
          let myVote = null;

          Object.entries(votes).forEach(([uid, vote]) => {
            if (vote === 'good') good++;
            else if (vote === 'okay') okay++;
            else if (vote === 'bad') bad++;

            if (currentUserSession && uid === currentUserSession.uid) {
              myVote = vote;
            }
          });

          const total = good + okay + bad;
          messRatingsByMeal[mealKey] = {
            good,
            okay,
            bad,
            total,
            userVote: myVote,
            goodPct: total > 0 ? Math.round((good / total) * 100) : 0,
            okayPct: total > 0 ? Math.round((okay / total) * 100) : 0,
            badPct: total > 0 ? Math.round((bad / total) * 100) : 0
          };

          updateMessRatingUI();
          renderMessWidget();
        });
      });
    }

    async function submitMessRating(rating) {
      if (!currentUserSession) {
        openAuthModal('login');
        return;
      }
      if (currentUserSession.status !== 'verified' || currentUserSession.role === 'admin' || (currentUserSession.username || '').toLowerCase() === 'admin') {
        alert('Please log in with a verified student account to rate today’s mess food.');
        return;
      }

      const activeMeal = getCurrentActiveMeal();
      const dateKey = getMealRatingDateKey(activeMeal.key);

      const curMeal = messRatingsByMeal[activeMeal.key] || { userVote: null };
      const newVote = rating;
      if (messRatingsByMeal[activeMeal.key]) {
        messRatingsByMeal[activeMeal.key].userVote = newVote;
      }

      if (db) {
        await db.ref(`messRatings/${dateKey}/votes/${currentUserSession.uid}`).set(newVote);
      } else {
        updateMessRatingUI();
        renderMessWidget();
      }
    }

    function updateMessRatingUI() {
      const activeMeal = getCurrentActiveMeal();
      const rate = messRatingsByMeal[activeMeal.key] || { good: 0, okay: 0, bad: 0, total: 0, userVote: null, goodPct: 0, okayPct: 0, badPct: 0 };

      const promptText = `Rate Today's ${activeMeal.icon} ${activeMeal.name}:`;
      ['mess-rating-prompt', 'mobile-mess-rating-prompt'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = promptText;
      });

      const voteText = rate.total > 0
        ? `${rate.total} ${rate.total === 1 ? 'vote' : 'votes'} · ${rate.goodPct}% Positive`
        : `0 votes on ${activeMeal.name}`;

      ['mess-rating-total', 'mobile-mess-rating-total'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = voteText;
      });

      const formatBtnCount = (cnt, pct) => rate.total > 0 ? `${cnt} <span class="font-normal text-[9px] opacity-75">(${pct}%)</span>` : cnt;

      ['count-rating-good', 'mobile-count-rating-good'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = formatBtnCount(rate.good, rate.goodPct);
      });
      ['count-rating-okay', 'mobile-count-rating-okay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = formatBtnCount(rate.okay, rate.okayPct);
      });
      ['count-rating-bad', 'mobile-count-rating-bad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = formatBtnCount(rate.bad, rate.badPct);
      });

      const baseClass = 'flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg border transition text-[11px]';
      const isGood = rate.userVote === 'good';
      const isOkay = rate.userVote === 'okay';
      const isBad = rate.userVote === 'bad';

      const goodCls = isGood
        ? `${baseClass} bg-emerald-500 text-white border-emerald-500 font-bold shadow-sm`
        : `${baseClass} border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-300`;
      const goodCountCls = isGood ? 'font-mono text-[10px] text-white/90 font-bold ml-0.5' : 'font-mono text-[10px] text-slate-400 font-bold ml-0.5';

      const okayCls = isOkay
        ? `${baseClass} bg-amber-500 text-white border-amber-500 font-bold shadow-sm`
        : `${baseClass} border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-slate-700 dark:text-slate-300`;
      const okayCountCls = isOkay ? 'font-mono text-[10px] text-white/90 font-bold ml-0.5' : 'font-mono text-[10px] text-slate-400 font-bold ml-0.5';

      const badCls = isBad
        ? `${baseClass} bg-rose-500 text-white border-rose-500 font-bold shadow-sm`
        : `${baseClass} border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-rose-500/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-300`;
      const badCountCls = isBad ? 'font-mono text-[10px] text-white/90 font-bold ml-0.5' : 'font-mono text-[10px] text-slate-400 font-bold ml-0.5';

      ['btn-rating-good', 'mobile-btn-rating-good'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = goodCls;
      });
      ['count-rating-good', 'mobile-count-rating-good'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = goodCountCls;
      });

      ['btn-rating-okay', 'mobile-btn-rating-okay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = okayCls;
      });
      ['count-rating-okay', 'mobile-count-rating-okay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = okayCountCls;
      });

      ['btn-rating-bad', 'mobile-btn-rating-bad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = badCls;
      });
      ['count-rating-bad', 'mobile-count-rating-bad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.className = badCountCls;
      });
    }

    // ================= MEAL DETAIL MODAL (TAP-TO-VIEW FULL MEAL) =================
    function openMealDetailModal(dayIndex, mealKey) {
      const dayIdx = parseInt(dayIndex, 10);
      if (!cachedMessSchedule || !cachedMessSchedule[dayIdx]) return;
      const dayData = cachedMessSchedule[dayIdx];
      const daysFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayName = daysFull[dayIdx] || 'Today';

      const mealMeta = {
        breakfast: { title: 'Breakfast', icon: '🍳', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
        lunch: { title: 'Lunch', icon: '🍛', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
        hitea: { title: 'Hi-Tea', icon: '☕', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' },
        dinner: { title: 'Dinner', icon: '🍲', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' }
      };

      const meta = mealMeta[mealKey] || { title: 'Meal', icon: '🍽️', color: 'text-brand-orange', bg: 'bg-orange-500/10' };
      const items = dayData[mealKey] || [];

      const modal = document.getElementById('meal-detail-modal');
      const modalBox = document.getElementById('meal-detail-modal-box');
      const titleEl = document.getElementById('meal-modal-title');
      const subtitleEl = document.getElementById('meal-modal-subtitle');
      const iconEl = document.getElementById('meal-modal-icon');
      const iconWrap = document.getElementById('meal-modal-icon-wrap');
      const itemsContainer = document.getElementById('meal-modal-items');
      const ratingBadge = document.getElementById('meal-modal-rating-badge');

      if (titleEl) titleEl.textContent = `${dayName} · ${meta.title}`;
      if (subtitleEl) subtitleEl.textContent = `${items.length} dishes on menu`;
      if (iconEl) iconEl.textContent = meta.icon;
      if (iconWrap) iconWrap.className = `w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs ${meta.bg}`;

      if (itemsContainer) {
        itemsContainer.innerHTML = items.map((item, idx) => `
          <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 text-xs">
            <span class="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center text-[10px] shrink-0">${idx + 1}</span>
            <span class="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">${escapeHtml(item)}</span>
          </div>
        `).join('');
      }

      const realTodayIdx = (new Date().getDay() + 6) % 7;
      if (ratingBadge) {
        if (dayIdx === realTodayIdx && messRatingsByMeal[mealKey]) {
          const mRate = messRatingsByMeal[mealKey];
          if (mRate.total > 0) {
            ratingBadge.innerHTML = `<span class="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400"><span>😋 ${mRate.goodPct}% Positive</span> <span class="text-slate-400 font-normal">(${mRate.total} votes)</span></span>`;
          } else {
            ratingBadge.textContent = 'No votes yet today';
          }
        } else {
          ratingBadge.textContent = dayIdx === realTodayIdx ? 'Hostel Mess Menu' : `Schedule for ${dayName}`;
        }
      }

      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
          if (modalBox) {
            modalBox.classList.remove('scale-95', 'opacity-0');
            modalBox.classList.add('scale-100', 'opacity-100');
          }
        }, 20);
        if (window.lucide && typeof window.lucide.createIcons === 'function') lucide.createIcons();
      }
    }

    function closeMealDetailModal() {
      const modal = document.getElementById('meal-detail-modal');
      const modalBox = document.getElementById('meal-detail-modal-box');
      if (modalBox) {
        modalBox.classList.remove('scale-100', 'opacity-100');
        modalBox.classList.add('scale-95', 'opacity-0');
      }
      setTimeout(() => {
        if (modal) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      }, 200);
    }

    function handleMealModalBackdropClick(event) {
      if (event.target.id === 'meal-detail-modal') {
        closeMealDetailModal();
      }
    }

    // Window exposures
    window.openMealDetailModal = openMealDetailModal;
    window.closeMealDetailModal = closeMealDetailModal;
    window.handleMealModalBackdropClick = handleMealModalBackdropClick;
    window.getCurrentActiveMeal = getCurrentActiveMeal;
    window.renderMessWidget = renderMessWidget;
    window.selectWidgetDay = selectWidgetDay;
    window.submitMessRating = submitMessRating;
    window.initMessRatingListener = initMessRatingListener;

