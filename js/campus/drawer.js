/**
 * MTMC26 — Mobile Campus Hub Drawer
 */

    function toggleMobileCampusDrawer() {
      const drawerBody = document.getElementById('mobile-campus-drawer-body');
      const chevron = document.getElementById('mobile-drawer-chevron');
      const btnLabel = document.getElementById('mobile-drawer-btn-label');
      if (!drawerBody) return;

      isMobileCampusDrawerOpen = !isMobileCampusDrawerOpen;
      if (isMobileCampusDrawerOpen) {
        drawerBody.classList.remove('hidden');
        if (chevron) chevron.classList.add('rotate-180');
        if (btnLabel) btnLabel.textContent = 'Hide';
        renderMessWidget();
        if (typeof window.renderFoundationCourseWidget === 'function') {
          window.renderFoundationCourseWidget();
        }
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      } else {
        drawerBody.classList.add('hidden');
        if (chevron) chevron.classList.remove('rotate-180');
        if (btnLabel) btnLabel.textContent = 'View Hub';
      }
    }

    function switchMobileDrawerTab(tab) {
      activeMobileDrawerTab = tab;
      const tabMess = document.getElementById('mobile-tab-mess-btn');
      const tabSchedule = document.getElementById('mobile-tab-schedule-btn');
      const tabInfo = document.getElementById('mobile-tab-info-btn');

      const secMess = document.getElementById('mobile-drawer-section-mess');
      const secSchedule = document.getElementById('mobile-drawer-section-schedule');
      const secInfo = document.getElementById('mobile-drawer-section-info');

      // Reset all buttons
      [tabMess, tabSchedule, tabInfo].forEach(btn => {
        if (btn) {
          btn.className = 'py-1.5 rounded-lg transition text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1';
        }
      });

      // Hide all sections
      if (secMess) secMess.classList.add('hidden');
      if (secSchedule) secSchedule.classList.add('hidden');
      if (secInfo) secInfo.classList.add('hidden');

      if (tab === 'mess') {
        if (tabMess) tabMess.className = 'py-1.5 rounded-lg transition bg-brand-orange text-white shadow-sm flex items-center justify-center gap-1 font-bold';
        if (secMess) secMess.classList.remove('hidden');
        renderMessWidget();
      } else if (tab === 'schedule') {
        if (tabSchedule) tabSchedule.className = 'py-1.5 rounded-lg transition bg-indigo-600 text-white shadow-sm flex items-center justify-center gap-1 font-bold';
        if (secSchedule) secSchedule.classList.remove('hidden');
        if (typeof window.renderFoundationCourseWidget === 'function') {
          window.renderFoundationCourseWidget();
        }
      } else if (tab === 'info') {
        if (tabInfo) tabInfo.className = 'py-1.5 rounded-lg transition bg-slate-800 dark:bg-slate-700 text-white shadow-sm flex items-center justify-center gap-1 font-bold';
        if (secInfo) secInfo.classList.remove('hidden');
        updateStats();
      }

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }
