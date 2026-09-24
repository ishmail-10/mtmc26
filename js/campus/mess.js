/**
 * MTMC26 — Hostel Mess Menu & Food Rating Widget
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
            }
          } catch (e) {
            console.warn('Firebase messMenu sync:', e);
          }
        }

        if (!schedule) {
          const res = await fetch(`${LOCAL_MESS_MENU_URL}?t=${Date.now()}`);
          if (res.ok) {
            schedule = await res.json();
          }
        }

        if (schedule && Array.isArray(schedule) && schedule.length >= 7) {
          cachedMessSchedule = schedule;
          localStorage.setItem('mtmc_cached_mess_schedule', JSON.stringify(schedule));
          renderMessWidget();
          const threadContainer = document.getElementById('mess-thread-timetable-container');
          if (threadContainer) {
            threadContainer.outerHTML = renderMessTimetableThreadHTML();
            lucide.createIcons();
          }

          if (isManual) {
            alert('✅ Mess menu synchronized successfully from batch repository!');
          }
        }
      } catch (err) {
        console.warn('Could not sync mess menu:', err);
        if (isManual) {
          alert('Showing cached mess menu.');
        }
      } finally {
        const syncBtn = document.getElementById('btn-sync-mess-data');
        if (syncBtn) {
          syncBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-slate-400"></i><span>Refresh</span>`;
          lucide.createIcons();
        }
      }
    }

    function initMessSchedule() {
      try {
        const stored = localStorage.getItem('mtmc_cached_mess_schedule');
        if (stored) cachedMessSchedule = JSON.parse(stored);
      } catch (e) {}

      if (!cachedMessSchedule) {
        cachedMessSchedule = [
          { day: 'MONDAY', breakfast: ['Suji chilla (onion+chilli+carrots)', 'Orange chutney', 'Bread Butter/Jam', 'Tea/Coffee', 'Banana', 'Boiled egg/Paneer Bhurji'], lunch: ['jeera rice/plain rice', 'Roti', 'Masoor Dal', 'Dhokar dalna', 'aloo pyaz bhujiya', 'boondi raita', 'Salad/Papad/Pickle'], hitea: ['Tea/Coffee', 'Vada pao + green fried chilli', 'green chutney'], dinner: ['plain Rice, roti', 'Moong dal', 'Kala chana masala', 'crispy alu bhaja with kadhi patta', 'Curd', 'Salad/Papad/Pickle'] },
          { day: 'TUESDAY', breakfast: ['Sattu kachori', 'Aloo sabzi', 'Bread Butter/Jam', 'Tea/Coffee', 'Guava'], lunch: ['plain rice', 'Roti', 'Chana dal tadka', 'punjabi chhole', 'fried crispy aloo', 'onion raita', 'Salad/Papad/Pickle'], hitea: ['Tea/Coffee', 'Masala black chana ghugni'], dinner: ['plain rice, roti', 'Yellow Dal', 'rajma masala', 'Veg jalfrezi', 'Curd', 'Salad/Papad/Pickle', 'Mihi Dana'] },
          { day: 'WEDNESDAY', breakfast: ['Idli/Uttapam', 'coconut chutney + sumber', 'Bread Butter/Jam', 'Tea/Coffee', 'papaya'], lunch: ['Veg rice/Plain rice', 'Roti', 'yellow masoor Dal', 'Aloo parwal masala', 'Mix veg bhujiya', 'boondi raita', 'Salad/Papad/Pickle'], hitea: ['Tea/Coffee', 'Chilli potato'], dinner: ['plain rice, roti', 'Lasooni Dal', 'Dhaba egg curry', 'Paneer handi', 'Curd', 'Salad/Papad/Pickle'] },
          { day: 'THURSDAY', breakfast: ['Aloo paratha', 'Green chutney + curd', 'Bread Butter/Jam', 'Tea/Coffee', 'Banana'], lunch: ['plain rice/ fried rice', 'Roti', 'Dal fry', 'Veg Manchurian gravy', 'Kundru Bhujiya', 'cucumber raita', 'Salad/Papad/Pickle'], hitea: ['Tea/Coffee', 'Fried idli + green chutney'], dinner: ['Rice, Ajwain puri (less oily)', 'moong dal fry', 'chhole masala', 'aloo bhindi masala', 'Curd', 'Salad/Papad/Pickle', 'Gud(jaggery) kheer'] },
          { day: 'FRIDAY', breakfast: ['poha', 'Orange chutney', 'Bread Butter/Jam', 'Tea/Coffee', 'Banana', 'Masala omlette /Paneer Bhurji'], lunch: ['Tomato rice/plain rice', 'Roti', 'Dal fry', 'Kadhi badi', 'Black chana masala dry', 'Masala raita', 'Salad/Papad/Pickle'], hitea: ['Tea/Coffee', 'pani puri(6+2)', 'aloo+ chutney + imli water'], dinner: ['Roti', 'Toor dal fry', 'chicken biriyani with salan', 'paneer hyderabadi biriyani', 'onion raita', 'Salad/Papad/Pickle'] },
          { day: 'SATURDAY', breakfast: ['Dal paratha', 'Aloo mirch sabji', 'Bread Butter/Jam', 'Tea/Coffee', 'papaya'], lunch: ['veg Khichdi/plain Rice', 'Roti', 'dal fry', 'Rajma masala', 'Aloo chokha', 'raita + Lijjat papad', 'Salad/Pickle'], hitea: ['Tea/Coffee', 'papdi chaat'], dinner: ['plain rice', 'Dal panchmel', 'lauki chana dal', 'aloo kasuri methi', 'Curd', 'Salad/Papad/Pickle'] },
          { day: 'SUNDAY', breakfast: ['chole Bhature', 'onions + lemon', 'Bread Butter/Jam', 'Tea/Coffee', 'Guava'], lunch: ['plain rice', 'Roti', 'Lasoni Dal', 'masala chole', 'dry sarso aloo bhindi', 'Salad/Papad/Pickle, curd', 'Gulab Jamun(1)'], hitea: ['Tea/Coffee', 'chura badam fry', 'chopped onions and chilli'], dinner: ['Veg pulao /plain rice', 'Arhar dal', 'Kadhai paneer or Malai kofta', 'Kadhai chicken', 'Curd', 'Salad/Papad/Pickle'] }
        ];
      }

      renderMessWidget();
      setTimeout(() => syncLiveMessMenu(false), 1500);
    }

    function selectWidgetDay(idx) {
      activeWidgetDayIndex = idx;
      renderMessWidget();
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
      const getFirstTwo = (arr) => arr.slice(0, 2).join(', ') + (arr.length > 2 ? '...' : '');

      const html = `
        <div class="bg-slate-50 dark:bg-slate-950/70 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60 space-y-1">
          <div class="flex items-center justify-between text-slate-500 text-[10px]">
            <span class="font-bold text-amber-600 dark:text-amber-400">🍳 Breakfast</span>
          </div>
          <p class="text-slate-800 dark:text-slate-200 font-medium leading-tight">${getFirstTwo(dayData.breakfast)}</p>
        </div>

        <div class="bg-slate-50 dark:bg-slate-950/70 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60 space-y-1">
          <div class="flex items-center justify-between text-slate-500 text-[10px]">
            <span class="font-bold text-emerald-600 dark:text-emerald-400">🍛 Lunch</span>
          </div>
          <p class="text-slate-800 dark:text-slate-200 font-medium leading-tight">${getFirstTwo(dayData.lunch)}</p>
        </div>

        <div class="bg-slate-50 dark:bg-slate-950/70 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60 space-y-1">
          <div class="flex items-center justify-between text-slate-500 text-[10px]">
            <span class="font-bold text-rose-600 dark:text-rose-400">☕ Hi-Tea</span>
          </div>
          <p class="text-slate-800 dark:text-slate-200 font-medium leading-tight">${dayData.hitea.join(', ')}</p>
        </div>

        <div class="bg-slate-50 dark:bg-slate-950/70 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60 space-y-1">
          <div class="flex items-center justify-between text-slate-500 text-[10px]">
            <span class="font-bold text-indigo-600 dark:text-indigo-400">🍲 Dinner</span>
          </div>
          <p class="text-slate-800 dark:text-slate-200 font-medium leading-tight">${getFirstTwo(dayData.dinner)}</p>
        </div>
      `;

      ['mess-widget-content', 'mobile-mess-widget-content'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
      });

      if (window.lucide && typeof window.lucide.createIcons === 'function') lucide.createIcons();
    }

    // ================= DAILY HOSTEL MESS FOOD RATING =================
    let todayMessRatings = { good: 0, okay: 0, bad: 0, total: 0, userVote: null };

    function getTodayDateKey() {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function initMessRatingListener() {
      if (!db) return;
      const dateKey = getTodayDateKey();
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

        todayMessRatings = {
          good,
          okay,
          bad,
          total: good + okay + bad,
          userVote: myVote
        };
        updateMessRatingUI();
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

      const dateKey = getTodayDateKey();
      todayMessRatings.userVote = rating;

      if (db) {
        await db.ref(`messRatings/${dateKey}/votes/${currentUserSession.uid}`).set(rating);
      } else {
        updateMessRatingUI();
      }
    }

    function updateMessRatingUI() {
      const voteText = `${todayMessRatings.total} ${todayMessRatings.total === 1 ? 'vote' : 'votes'}`;
      ['mess-rating-total', 'mobile-mess-rating-total'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = voteText;
      });
      ['count-rating-good', 'mobile-count-rating-good'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = todayMessRatings.good;
      });
      ['count-rating-okay', 'mobile-count-rating-okay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = todayMessRatings.okay;
      });
      ['count-rating-bad', 'mobile-count-rating-bad'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = todayMessRatings.bad;
      });

      const baseClass = 'flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg border transition text-[11px]';
      const isGood = todayMessRatings.userVote === 'good';
      const isOkay = todayMessRatings.userVote === 'okay';
      const isBad = todayMessRatings.userVote === 'bad';

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

    // ================= MOBILE CAMPUS HUB DRAWER HANDLERS (MOBILE-ONLY) =================
    let isMobileCampusDrawerOpen = false;
    let activeMobileDrawerTab = 'mess';

