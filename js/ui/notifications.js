/**
 * MTMC26 — Notification Center Controller (Reddit-Style)
 */

    // NOTIFICATION CENTER CONTROLLER (REDDIT STYLE)
    // ==========================================

    function toggleNotificationsModal() {
      const modal = document.getElementById('notif-modal');
      if (modal.classList.contains('hidden')) {
        renderNotificationsList();
        modal.classList.remove('hidden');
      } else {
        modal.classList.add('hidden');
      }
      lucide.createIcons();
    }

    function closeNotificationsModal() {
      document.getElementById('notif-modal').classList.add('hidden');
    }

    function handleNotifBackdropClick(e) {
      if (e.target.id === 'notif-modal') {
        closeNotificationsModal();
      }
    }

    function renderNotificationsList() {
      const container = document.getElementById('notif-list');
      if (!container) return;

      const list = Object.values(allNotifications || {}).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      if (list.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center text-slate-400 space-y-2">
            <i data-lucide="bell-off" class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600"></i>
            <p class="font-semibold text-slate-600 dark:text-slate-400 text-xs">No notifications yet.</p>
            <p class="text-[11px] text-slate-400">When batchmates reply to your discussions or mention @${currentUserSession?.username || 'you'}, alerts appear here!</p>
          </div>
        `;
        if (window.lucide && window.lucide.createIcons) lucide.createIcons();
        return;
      }

      container.innerHTML = list.map(n => {
        const isUnread = !n.read;
        const timeAgo = formatTimeAgo(n.timestamp);
        const iconName = n.type === 'mention' ? 'at-sign' : 'message-circle';
        const iconColor = n.type === 'mention' ? 'text-blue-500 bg-blue-500/10' : 'text-brand-orange bg-orange-500/10';

        return `
          <div onclick="handleNotificationClick('${n.id}', '${n.postId}')" class="p-3 rounded-md border transition cursor-pointer flex items-start gap-2.5 ${isUnread ? 'bg-orange-50/70 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-900/50' : 'bg-white dark:bg-slate-900/80 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}">
            <div class="w-7 h-7 rounded ${iconColor} flex items-center justify-center shrink-0 mt-0.5">
              <i data-lucide="${iconName}" class="w-3.5 h-3.5"></i>
            </div>
            <div class="flex-1 min-w-0 space-y-0.5">
              <p class="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                <span class="font-bold text-slate-900 dark:text-white">${escapeHtml(n.senderName || n.senderUsername || 'A classmate')}</span>
                ${n.type === 'mention' ? 'mentioned you in' : 'replied to'}
                <span class="font-semibold text-brand-orange">"${escapeHtml(n.threadTitle || 'Discussion')}"</span>
              </p>
              ${n.snippet ? `<p class="text-[11px] text-slate-500 line-clamp-1 italic">"${escapeHtml(n.snippet)}"</p>` : ''}
              <span class="text-[10px] text-slate-400 block">${timeAgo}</span>
            </div>
            ${isUnread ? '<span class="w-2 h-2 rounded-full bg-brand-orange shrink-0 mt-1.5" title="Unread"></span>' : ''}
          </div>
        `;
      }).join('');

      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    let currentNotifListenerUid = null;

    function resetNotificationListenerUid() {
      currentNotifListenerUid = null;
    }

    async function handleNotificationClick(notifId, postId) {
      if (db && currentUserSession && notifId) {
        db.ref(`notifications/${currentUserSession.uid}/${notifId}/read`).set(true).catch(() => {});
      }
      if (allNotifications[notifId]) {
        allNotifications[notifId].read = true;
      }
      updateNotificationBadge();
      closeNotificationsModal();

      const cleanPostId = (postId || '').replace(/^#?thread\//, '').replace(/^#?post\//, '').split('?')[0].trim();
      if (cleanPostId) {
        openThread(cleanPostId);
      }
    }

    async function markAllNotificationsAsRead() {
      if (!currentUserSession || !db) return;
      const unreadKeys = Object.keys(allNotifications || {}).filter(k => !allNotifications[k].read);
      if (unreadKeys.length === 0) return;

      unreadKeys.forEach(k => {
        allNotifications[k].read = true;
      });
      updateNotificationBadge();
      renderNotificationsList();

      try {
        if (typeof sb !== 'undefined' && sb) {
          await sb.from('notifications').update({ is_read: true }).eq('user_id', currentUserSession.uid).eq('is_read', false);
          triggerTableChange('notifications');
        } else {
          const updates = {};
          unreadKeys.forEach(k => {
            updates[`notifications/${currentUserSession.uid}/${k}/read`] = true;
          });
          await db.ref().update(updates).catch(() => {});
        }
      } catch (err) {
        console.warn('markAllNotificationsAsRead error:', err);
      }
    }

    function updateNotificationBadge() {
      const badge = document.getElementById('notif-badge');
      if (!badge) return;
      const unreadCount = Object.values(allNotifications || {}).filter(n => !n.read).length;
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        badge.classList.remove('hidden');
        badge.classList.add('flex');
      } else {
        badge.classList.add('hidden');
        badge.classList.remove('flex');
      }
    }

    function initNotificationsListener() {
      if (!db || !currentUserSession) return;
      if (currentNotifListenerUid === currentUserSession.uid) return;

      if (currentNotifListenerUid) {
        db.ref('notifications/' + currentNotifListenerUid).off();
      }
      currentNotifListenerUid = currentUserSession.uid;

      db.ref('notifications/' + currentUserSession.uid).on('value', snapshot => {
        allNotifications = snapshot.val() || {};
        updateNotificationBadge();
        if (!document.getElementById('notif-modal').classList.contains('hidden')) {
          renderNotificationsList();
        }
      });
    }

    // ==========================================
