/**
 * MTMC MBBS Batch 2026 - Academic & Course Schedule System
 * Standalone module: Loads external course_schedule.json and renders
 * both the sidebar widget and the interactive discussion thread timetable.
 * 
 * Edit course_schedule.json directly to modify sessions, dates, or faculty
 * without ever having to touch index.html!
 */

(function () {
  'use strict';

  const COURSE_SCHEDULE_URL = './course_schedule.json';
  let courseScheduleState = {
    data: null,
    activeDayIndex: 0, // 0 to 11, or 'all'
    widgetWeek: 1,     // 1 or 2
    widgetDayIndex: 0  // 0 to 11
  };

  // Helper: Escape HTML
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Determine current day index based on system date
  function getAutoSelectedDayIndex(days) {
    if (!days || !days.length) return 0;
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth(); // 0-indexed
    const curDate = now.getDate();

    // Schedule spans 28-Sep-2026 to 10-Oct-2026
    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      // e.g. "28-Sep-26"
      const parts = d.date.split('-');
      if (parts.length === 3) {
        const dayNum = parseInt(parts[0], 10);
        const monthStr = parts[1].toLowerCase();
        const monthNum = monthStr.startsWith('sep') ? 8 : (monthStr.startsWith('oct') ? 9 : -1);
        if (curYear === 2026 && curMonth === monthNum && curDate === dayNum) {
          return i;
        }
      }
    }
    // Default to day 0 (Sep 28)
    return 0;
  }

  // Get Category Badge Style
  function getCategoryBadge(category, badgeColor) {
    const colorMap = {
      blue: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
      indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      purple: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
      emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      rose: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
      amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    };
    const cls = colorMap[badgeColor] || colorMap.indigo;
    return `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}">${esc(category)}</span>`;
  }

  // ================= SIDEBAR WIDGET LOGIC =================
  window.setFcWidgetWeek = function (weekNum) {
    courseScheduleState.widgetWeek = weekNum;
    if (weekNum === 1 && courseScheduleState.widgetDayIndex >= 6) {
      courseScheduleState.widgetDayIndex = 0;
    } else if (weekNum === 2 && courseScheduleState.widgetDayIndex < 6) {
      courseScheduleState.widgetDayIndex = 6;
    }
    renderFoundationCourseWidget();
  };

  window.selectFcWidgetDay = function (dayIdx) {
    courseScheduleState.widgetDayIndex = dayIdx;
    courseScheduleState.widgetWeek = dayIdx < 6 ? 1 : 2;
    renderFoundationCourseWidget();
  };

  function renderFoundationCourseWidget() {
    const card = document.getElementById('fc-widget-card');
    if (!card) return;

    const data = courseScheduleState.data;
    if (!data || !data.days) {
      const content = document.getElementById('fc-widget-content');
      if (content) content.innerHTML = '<p class="text-slate-400 italic text-[10px]">Loading schedule...</p>';
      return;
    }

    const days = data.days;
    const curWeek = courseScheduleState.widgetWeek;
    const curDayIdx = courseScheduleState.widgetDayIndex;

    // Update Week toggle buttons
    const btnW1 = document.getElementById('fc-w1-btn');
    const btnW2 = document.getElementById('fc-w2-btn');
    const weekLabel = document.getElementById('fc-widget-week-label');

    if (btnW1) {
      btnW1.className = curWeek === 1
        ? 'px-2 py-0.5 rounded-md font-bold bg-indigo-600 text-white transition text-[9px]'
        : 'px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-[9px]';
    }
    if (btnW2) {
      btnW2.className = curWeek === 2
        ? 'px-2 py-0.5 rounded-md font-bold bg-indigo-600 text-white transition text-[9px]'
        : 'px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-[9px]';
    }
    if (weekLabel) {
      weekLabel.textContent = curWeek === 1 ? 'Week 1 (28 Sep – 3 Oct)' : 'Week 2 (5 Oct – 10 Oct)';
    }

    // Render chips for active week
    const chipsContainer = document.getElementById('fc-widget-day-chips');
    if (chipsContainer) {
      const startIndex = curWeek === 1 ? 0 : 6;
      const endIndex = curWeek === 1 ? 6 : 12;
      let chipsHtml = '';

      for (let i = startIndex; i < endIndex && i < days.length; i++) {
        const d = days[i];
        const dateParts = d.date.split('-');
        const dayNum = dateParts[0];
        const shortLetter = d.day.charAt(0);
        const isActive = (i === curDayIdx);
        const isHol = d.holiday;

        let chipClass = '';
        if (isActive) {
          chipClass = 'bg-indigo-600 text-white shadow-sm font-extrabold';
        } else if (isHol) {
          chipClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30';
        } else {
          chipClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700';
        }

        chipsHtml += `
          <button type="button" onclick="selectFcWidgetDay(${i})" class="py-1 rounded-lg transition text-[10px] ${chipClass}" title="${d.day} ${d.date}">
            <div class="leading-none text-[9px] font-bold">${dayNum}</div>
            <div class="leading-none text-[9px] opacity-80">${shortLetter}</div>
          </button>
        `;
      }
      chipsContainer.innerHTML = chipsHtml;
    }

    // Render Sessions preview
    const contentContainer = document.getElementById('fc-widget-content');
    const badge = document.getElementById('fc-widget-day-badge');

    if (days[curDayIdx]) {
      const currentDay = days[curDayIdx];
      if (badge) {
        badge.textContent = `${currentDay.dayShort}, ${currentDay.date}`;
      }

      if (contentContainer) {
        if (currentDay.holiday) {
          contentContainer.innerHTML = `
            <div class="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-1 text-center">
              <span class="text-base">🇮🇳</span>
              <p class="font-bold text-amber-700 dark:text-amber-400 text-xs">${esc(currentDay.holidayTitle || 'Holiday')}</p>
              <p class="text-[10px] text-amber-600/80 dark:text-amber-400/80">National Holiday · No academic sessions</p>
            </div>
          `;
        } else {
          const nonBreakSessions = currentDay.sessions.filter(s => s.slot !== 'Break');
          const previewSessions = nonBreakSessions.slice(0, 3);
          const remainingCount = nonBreakSessions.length - previewSessions.length;

          let sessionsHtml = previewSessions.map(s => `
            <div class="bg-slate-50 dark:bg-slate-950/70 p-2 rounded-xl border border-slate-200 dark:border-slate-800/60 space-y-0.5">
              <div class="flex items-center justify-between text-[10px]">
                <span class="font-bold text-indigo-600 dark:text-indigo-400">${esc(s.time.split('-')[0].trim())}</span>
                <span class="text-slate-400 text-[9px] truncate max-w-[110px]">${esc(s.slot)}</span>
              </div>
              <p class="text-slate-900 dark:text-slate-100 font-semibold text-[11px] leading-snug line-clamp-1">${esc(s.topic)}</p>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${esc(s.faculty)}</p>
            </div>
          `).join('');

          if (remainingCount > 0) {
            sessionsHtml += `
              <div class="text-center pt-0.5">
                <span class="text-[10px] font-semibold text-slate-400">+ ${remainingCount} more sessions today</span>
              </div>
            `;
          }

          contentContainer.innerHTML = sessionsHtml;
        }
      }
    }
  }

  // ================= THREAD TIMETABLE VIEW LOGIC =================
  window.setFoundationScheduleDay = function (dayIdx) {
    courseScheduleState.activeDayIndex = dayIdx;
    const container = document.getElementById('fc-thread-timetable-container');
    if (container) {
      container.outerHTML = renderFoundationCourseThreadHTML();
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
  };

  window.renderFoundationCourseThreadHTML = function () {
    const data = courseScheduleState.data;
    if (!data || !data.days) {
      return `
        <div id="fc-thread-timetable-container" class="p-6 text-center text-slate-500">
          <i data-lucide="loader" class="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500"></i>
          <p class="text-xs">Loading course schedule...</p>
        </div>
      `;
    }

    const days = data.days;
    const activeIdx = courseScheduleState.activeDayIndex;
    const autoIdx = getAutoSelectedDayIndex(days);

    // Build day chips row
    let chipsHtml = `
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        ${days.map((d, i) => {
          const isActive = (activeIdx === i);
          const isToday = (i === autoIdx);
          const label = `${d.date.split('-')[0]} ${d.dayShort}${d.holiday ? ' 🇮🇳' : ''}`;
          let btnCls = '';

          if (isActive) {
            btnCls = 'bg-indigo-600 text-white shadow-sm font-bold';
          } else if (isToday) {
            btnCls = 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold';
          } else {
            btnCls = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700';
          }

          return `
            <button type="button" onclick="setFoundationScheduleDay(${i})" class="px-3 py-1.5 rounded-xl transition shrink-0 text-xs ${btnCls}">
              ${label} ${isToday ? '•' : ''}
            </button>
          `;
        }).join('')}
        <button type="button" onclick="setFoundationScheduleDay('all')" class="px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${activeIdx === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}">
          📅 Full 2-Week Matrix
        </button>
      </div>
    `;

    let mainContentHtml = '';

    if (activeIdx === 'all') {
      // 2-WEEK COMPREHENSIVE TIMETABLE MATRIX
      mainContentHtml = `
        <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                <th class="p-3 whitespace-nowrap">Week & Date</th>
                <th class="p-3 min-w-[170px]">09:30 - 10:15 AM</th>
                <th class="p-3 min-w-[170px]">10:30 - 11:15 AM</th>
                <th class="p-3 min-w-[170px]">11:30 - 12:15 PM</th>
                <th class="p-3 min-w-[160px]">02:00 - 02:45 PM</th>
                <th class="p-3 min-w-[170px]">03:00 - 03:45 PM</th>
                <th class="p-3 min-w-[170px]">04:00 - 04:45 PM</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
              ${days.map((row, idx) => {
                if (row.holiday) {
                  return `
                    <tr class="bg-amber-50/50 dark:bg-amber-950/20">
                      <td class="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        <span class="text-indigo-600 dark:text-indigo-400 font-extrabold">W${row.week}</span> · ${row.date} (${row.dayShort})
                      </td>
                      <td colspan="6" class="p-3 text-center font-bold text-amber-700 dark:text-amber-400 text-xs">
                        🇮🇳 ${esc(row.holidayTitle || 'Holiday')} - Campus Closed (No sessions scheduled)
                      </td>
                    </tr>
                  `;
                }

                const s1 = row.sessions.find(s => s.time.startsWith('09:30')) || {};
                const s2 = row.sessions.find(s => s.time.startsWith('10:30') || s.time.includes('10:30 - 12:15')) || {};
                const s3 = row.sessions.find(s => s.time.startsWith('11:30')) || (s2.time && s2.time.includes('12:15') ? s2 : {});
                const s4 = row.sessions.find(s => s.time.startsWith('02:00')) || {};
                const s5 = row.sessions.find(s => s.time.startsWith('03:00')) || (s4.time && s4.time.includes('04:45') ? s4 : {});
                const s6 = row.sessions.find(s => s.time.startsWith('04:00')) || (s5.time && (s5.time.includes('04:45') || s4.time && s4.time.includes('04:45')) ? (s5.topic ? s5 : s4) : {});

                const cell = (s) => {
                  if (!s || !s.topic) return '<span class="text-slate-400 italic">—</span>';
                  return `
                    <div class="space-y-0.5">
                      <div class="font-bold text-slate-900 dark:text-white leading-tight">${esc(s.topic)}</div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400">${esc(s.faculty || '')}</div>
                    </div>
                  `;
                };

                const isToday = (idx === autoIdx);

                return `
                  <tr class="${isToday ? 'bg-indigo-500/5 dark:bg-indigo-500/10 font-medium' : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/50'}">
                    <td class="p-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <span class="text-indigo-600 dark:text-indigo-400 font-extrabold">W${row.week}</span> · ${row.date} (${row.dayShort})
                      ${isToday ? '<span class="ml-1 text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white font-black">TODAY</span>' : ''}
                    </td>
                    <td class="p-3">${cell(s1)}</td>
                    <td class="p-3">${cell(s2)}</td>
                    <td class="p-3">${cell(s3)}</td>
                    <td class="p-3">${cell(s4)}</td>
                    <td class="p-3">${cell(s5)}</td>
                    <td class="p-3">${cell(s6)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      // SINGLE DAY DETAILED VIEW
      const dayIdx = typeof activeIdx === 'number' ? activeIdx : 0;
      const dayData = days[dayIdx] || days[0];

      if (dayData.holiday) {
        mainContentHtml = `
          <div class="rounded-2xl p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/60 text-center space-y-3 shadow-sm">
            <span class="text-4xl">🇮🇳</span>
            <h3 class="text-lg font-extrabold text-amber-800 dark:text-amber-300">${esc(dayData.holidayTitle || 'Gandhi Jayanti')}</h3>
            <p class="text-xs text-amber-700/80 dark:text-amber-400/80 max-w-md mx-auto">
              National holiday in commemoration of Mahatma Gandhi's birthday. College departments and academic sessions remain closed.
            </p>
          </div>
        `;
      } else {
        const morningSessions = dayData.sessions.filter(s => s.slot.startsWith('Morning'));
        const lunchSession = dayData.sessions.find(s => s.slot === 'Break');
        const afternoonSessions = dayData.sessions.filter(s => s.slot.startsWith('Afternoon'));

        const renderSessionCard = (s) => `
          <div class="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 hover:border-indigo-500/40 transition">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                <i data-lucide="clock" class="w-3.5 h-3.5"></i>
                <span>${esc(s.time)}</span>
              </span>
              ${getCategoryBadge(s.category, s.badgeColor)}
            </div>
            <div>
              <h4 class="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">${esc(s.topic)}</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                <i data-lucide="user" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                <span>${esc(s.faculty)}</span>
              </p>
            </div>
          </div>
        `;

        mainContentHtml = `
          <div class="space-y-4">
            <!-- Day Header Banner -->
            <div class="flex items-center justify-between bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl px-4 py-3">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  W${dayData.week}
                </span>
                <div>
                  <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">${dayData.day}, ${dayData.date}</h4>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400">Orientation, Core Modules & Departmental Sessions</p>
                </div>
              </div>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400">
                ${dayData.sessions.filter(s => s.slot !== 'Break').length} Sessions
              </span>
            </div>

            <!-- Morning Sessions -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>🌅 Morning Sessions (09:30 AM – 12:15 PM)</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${morningSessions.map(renderSessionCard).join('')}
              </div>
            </div>

            <!-- Lunch Break Banner -->
            ${lunchSession ? `
              <div class="flex items-center justify-between rounded-xl px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                <span class="font-bold flex items-center gap-2">
                  <i data-lucide="utensils" class="w-4 h-4 text-amber-600 dark:text-amber-400"></i>
                  <span>12:30 PM – 02:00 PM: LUNCH BREAK & HOSTEL DINING</span>
                </span>
                <button type="button" onclick="openThread('post-mtmc-mess')" class="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline">
                  Mess Menu ↗
                </button>
              </div>
            ` : ''}

            <!-- Afternoon Sessions -->
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>☀️ Afternoon Sessions (02:00 PM – 04:45 PM)</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                ${afternoonSessions.map(renderSessionCard).join('')}
              </div>
            </div>
          </div>
        `;
      }
    }

    return `
      <div id="fc-thread-timetable-container" class="space-y-3 pt-1">
        <!-- Top Action Bar -->
        <div class="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 flex-wrap">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              <i data-lucide="calendar" class="w-4 h-4"></i>
            </div>
            <div>
              <h4 class="text-xs font-bold text-slate-900 dark:text-white">${esc(data.title)}</h4>
              <p class="text-[10px] text-slate-400">${esc(data.subtitle)} · ${esc(data.dateRange)}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <a href="${esc(data.pdfUrl)}" target="_blank" download="${esc(data.pdfName)}" class="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm">
              <i data-lucide="file-down" class="w-3.5 h-3.5"></i>
              <span>Download PDF</span>
            </a>
            <button type="button" onclick="syncLiveCourseSchedule(true)" id="btn-sync-fc-data" class="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-slate-400"></i>
              <span>Sync</span>
            </button>
          </div>
        </div>

        ${chipsHtml}

        ${mainContentHtml}
      </div>
    `;
  };

  // ================= LIVE DATA SYNC & INITIALIZATION =================
  window.syncLiveCourseSchedule = async function (isManual = false) {
    try {
      const syncBtn = document.getElementById('btn-sync-fc-data');
      if (syncBtn) {
        syncBtn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>Syncing...</span>`;
        if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
      }

      const res = await fetch(`${COURSE_SCHEDULE_URL}?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.days && json.days.length) {
          courseScheduleState.data = json;
          localStorage.setItem('mtmc_cached_course_schedule', JSON.stringify(json));
          renderFoundationCourseWidget();

          const threadContainer = document.getElementById('fc-thread-timetable-container');
          if (threadContainer) {
            threadContainer.outerHTML = renderFoundationCourseThreadHTML();
            if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
          }

          if (isManual) {
            alert('✅ Course schedule synchronized successfully from course_schedule.json!');
          }
        }
      }
    } catch (err) {
      console.warn('Course schedule sync warning:', err);
      if (isManual) {
        alert('Showing offline cached schedule.');
      }
    } finally {
      const syncBtn = document.getElementById('btn-sync-fc-data');
      if (syncBtn) {
        syncBtn.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-slate-400"></i><span>Refresh</span>`;
        if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
      }
    }
  };

  window.initCourseScheduleSystem = function () {
    try {
      const cached = localStorage.getItem('mtmc_cached_course_schedule');
      if (cached) {
        courseScheduleState.data = JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Course schedule cache parse error:', e);
    }

    if (courseScheduleState.data && courseScheduleState.data.days) {
      const autoIdx = getAutoSelectedDayIndex(courseScheduleState.data.days);
      courseScheduleState.activeDayIndex = autoIdx;
      courseScheduleState.widgetDayIndex = autoIdx;
      courseScheduleState.widgetWeek = autoIdx < 6 ? 1 : 2;
      renderFoundationCourseWidget();
    }

    // Always fetch fresh schedule in background
    syncLiveCourseSchedule(false);
  };

  // Run on startup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initCourseScheduleSystem);
  } else {
    window.initCourseScheduleSystem();
  }
})();
