/**
 * MTMC26 — Moderator & Admin Panel
 */

    function openAdminModal() {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) {
        alert('Access restricted to Batch Moderators.');
        return;
      }
      const roleTitle = currentUserSession.role === 'supermod' ? 'Super Moderator (CR)' : (currentUserSession.role === 'admin' ? 'Admin' : 'Batch Moderator');
      const namePart = currentUserSession.fullName ? `${currentUserSession.fullName} (@${currentUserSession.username})` : `@${currentUserSession.username}`;
      document.getElementById('admin-panel-role-subtitle').textContent = `Signed in as ${roleTitle}: ${namePart}`;

      // GHOST ADMIN EXCLUSIVE: Show Frozen Handles tab only to Admin
      const frozenTabBtn = document.getElementById('tab-admin-frozen');
      if (frozenTabBtn) {
        if (currentUserSession.role === 'admin') {
          frozenTabBtn.classList.remove('hidden');
          frozenTabBtn.classList.add('flex');
        } else {
          frozenTabBtn.classList.add('hidden');
          frozenTabBtn.classList.remove('flex');
          if (currentAdminTab === 'frozen') currentAdminTab = 'pending';
        }
      }

      // GHOST ADMIN EXCLUSIVE: Show Feedback & Suggestions tab only to Admin
      const feedbackTabBtn = document.getElementById('tab-admin-feedback');
      if (feedbackTabBtn) {
        if (currentUserSession.role === 'admin') {
          feedbackTabBtn.classList.remove('hidden');
          feedbackTabBtn.classList.add('flex');
        } else {
          feedbackTabBtn.classList.add('hidden');
          feedbackTabBtn.classList.remove('flex');
          if (currentAdminTab === 'feedback') currentAdminTab = 'pending';
        }
      }

      switchAdminTab(currentAdminTab);
      document.getElementById('admin-modal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeAdminModal() {
      document.getElementById('admin-modal').classList.add('hidden');
    }

    function switchAdminTab(tab) {
      currentAdminTab = tab;
      const tabPending = document.getElementById('tab-admin-pending');
      const tabReview = document.getElementById('tab-admin-review-queue');
      const tabProfile = document.getElementById('tab-admin-profile-requests');
      const tabDeletions = document.getElementById('tab-admin-deletions');
      const tabRoster = document.getElementById('tab-admin-roster');
      const tabFrozen = document.getElementById('tab-admin-frozen');
      const tabFeedback = document.getElementById('tab-admin-feedback');
      const secPending = document.getElementById('admin-section-pending');
      const secReview = document.getElementById('admin-section-review-queue');
      const secProfile = document.getElementById('admin-section-profile-requests');
      const secDeletions = document.getElementById('admin-section-deletions');
      const secRoster = document.getElementById('admin-section-roster');
      const secFrozen = document.getElementById('admin-section-frozen');
      const secFeedback = document.getElementById('admin-section-feedback');

      const inactiveClass = 'flex-1 py-1.5 px-2 rounded font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center gap-1 shrink-0';
      const activeClass = 'flex-1 py-1.5 px-2 rounded font-bold transition bg-brand-orange text-white flex items-center justify-center gap-1 shrink-0';
      const activeCyanClass = 'flex-1 py-1.5 px-2 rounded font-bold transition bg-cyan-600 text-white flex items-center justify-center gap-1 shrink-0';
      const activeAmberClass = 'flex-1 py-1.5 px-2 rounded font-bold transition bg-amber-600 text-white flex items-center justify-center gap-1 shrink-0';

      if (tabPending) tabPending.className = inactiveClass;
      if (tabReview) tabReview.className = inactiveClass;
      if (tabProfile) tabProfile.className = inactiveClass;
      if (tabDeletions) tabDeletions.className = inactiveClass;
      if (tabRoster) tabRoster.className = 'flex-1 py-1.5 px-2 rounded font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-center shrink-0';
      if (tabFrozen) tabFrozen.className = inactiveClass;
      if (tabFeedback) tabFeedback.className = inactiveClass;

      if (secPending) secPending.classList.add('hidden');
      if (secReview) secReview.classList.add('hidden');
      if (secProfile) secProfile.classList.add('hidden');
      if (secDeletions) secDeletions.classList.add('hidden');
      if (secRoster) secRoster.classList.add('hidden');
      if (secFrozen) secFrozen.classList.add('hidden');
      if (secFeedback) secFeedback.classList.add('hidden');

      if (tab === 'roster') {
        if (tabRoster) tabRoster.className = 'flex-1 py-1.5 px-2 rounded font-bold transition bg-brand-orange text-white text-center shrink-0';
        if (secRoster) secRoster.classList.remove('hidden');
        renderRosterList();
      } else if (tab === 'review-queue') {
        if (tabReview) tabReview.className = activeClass;
        if (secReview) secReview.classList.remove('hidden');
        renderReviewQueueList();
      } else if (tab === 'profile-requests') {
        if (tabProfile) tabProfile.className = activeClass;
        if (secProfile) secProfile.classList.remove('hidden');
        renderProfileRequestsList();
      } else if (tab === 'deletions') {
        if (tabDeletions) tabDeletions.className = activeClass;
        if (secDeletions) secDeletions.classList.remove('hidden');
        renderDeletionRequestsList();
      } else if (tab === 'frozen') {
        if (tabFrozen) tabFrozen.className = activeCyanClass;
        if (secFrozen) secFrozen.classList.remove('hidden');
        loadFrozenUsernamesList();
      } else if (tab === 'feedback') {
        if (tabFeedback) tabFeedback.className = activeAmberClass;
        if (secFeedback) secFeedback.classList.remove('hidden');
        renderFeedbackList();
      } else {
        if (tabPending) tabPending.className = activeClass;
        if (secPending) secPending.classList.remove('hidden');
        renderPendingList();
      }
      lucide.createIcons();
    }

    // ================= GHOST ADMIN: FROZEN HANDLES MANAGER =================
    let allFrozenHandles = [];
    async function loadFrozenUsernamesList() {
      const container = document.getElementById('admin-frozen-list');
      const badge = document.getElementById('admin-tab-frozen-badge');
      if (!container) return;

      container.innerHTML = `
        <div class="py-8 text-center text-slate-400 text-xs">
          <i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-500"></i>
          Scanning database for frozen handles...
        </div>
      `;
      lucide.createIcons();

      try {
        if (typeof getFrozenUsernames === 'function') {
          allFrozenHandles = await getFrozenUsernames();
        } else {
          allFrozenHandles = [];
        }

        if (badge) {
          if (allFrozenHandles.length > 0) {
            badge.textContent = allFrozenHandles.length;
            badge.classList.remove('hidden');
          } else {
            badge.classList.add('hidden');
          }
        }

        renderFrozenHandlesList(allFrozenHandles);
      } catch (err) {
        console.error('Failed to load frozen usernames:', err);
        container.innerHTML = `
          <div class="p-4 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-center space-y-1">
            <p class="font-bold">Unable to load frozen handles</p>
            <p class="text-[11px] text-slate-400">${escapeHtml(err.message || 'Error executing RPC')}</p>
          </div>
        `;
      }
    }

    function filterFrozenList() {
      const q = (document.getElementById('frozen-search-input')?.value || '').toLowerCase().trim();
      const filtered = q
        ? allFrozenHandles.filter(u => (u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
        : allFrozenHandles;
      renderFrozenHandlesList(filtered);
    }

    function renderFrozenHandlesList(list) {
      const container = document.getElementById('admin-frozen-list');
      if (!container) return;

      if (!list || list.length === 0) {
        container.innerHTML = `
          <div class="py-10 text-center text-slate-400 space-y-2">
            <div class="w-10 h-10 rounded-md bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto text-lg font-bold">
              ✓
            </div>
            <p class="font-bold text-slate-700 dark:text-slate-300 text-xs">No Frozen Handles Found</p>
            <p class="text-[11px] text-slate-400 max-w-xs mx-auto">All usernames and authentication credentials in the database are active, clean, and in sync!</p>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      container.innerHTML = list.map(item => `
        <div class="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-slate-900 dark:text-white font-mono">@${escapeHtml(item.username)}</span>
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                ${escapeHtml(item.lock_status || 'Frozen')}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 font-mono">
              <span class="text-slate-400">Auth Email:</span> ${escapeHtml(item.email)}
              · <span class="text-slate-400">Created:</span> ${new Date(item.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
          <div class="shrink-0">
            <button onclick="handleUnfreezeHandle('${item.user_id}', '${escapeHtml(item.username)}')" class="px-2.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold transition shadow-sm flex items-center gap-1">
              <i data-lucide="unlock" class="w-3.5 h-3.5"></i>
              <span>Unfreeze</span>
            </button>
          </div>
        </div>
      `).join('');
      lucide.createIcons();
    }

    async function handleUnfreezeHandle(userId, username) {
      if (!confirm(`Unfreeze and release handle @${username}?\n\nThis will completely wipe the lock from auth.users and allow @${username} to be freshly registered by anyone.`)) {
        return;
      }

      try {
        if (typeof adminUnfreezeUser === 'function') {
          await adminUnfreezeUser(userId);
        }
        allFrozenHandles = allFrozenHandles.filter(h => h.user_id !== userId);
        const badge = document.getElementById('admin-tab-frozen-badge');
        if (badge) {
          if (allFrozenHandles.length > 0) {
            badge.textContent = allFrozenHandles.length;
            badge.classList.remove('hidden');
          } else {
            badge.classList.add('hidden');
          }
        }
        renderFrozenHandlesList(allFrozenHandles);
        alert(`Handle @${username} has been unfrozen and is now 100% available for registration! 🔓`);
      } catch (err) {
        console.error('Unfreeze error:', err);
        alert('Failed to unfreeze handle: ' + (err.message || err));
      }
    }

    // =============================================================
    // COMMUNITY FEEDBACK & FEATURE SUGGESTIONS (GHOST ADMIN EXCLUSIVE)
    // =============================================================

    function initFeedbackListener() {
      if (!db || !currentUserSession || currentUserSession.role !== 'admin') return;
      db.ref('feedback').on('value', snapshot => {
        allCommunityFeedback = snapshot.val() || {};
        updateAdminBadges();
        if (currentAdminTab === 'feedback') {
          renderFeedbackList();
        }
      });
    }

    function openFeedbackModal() {
      if (!currentUserSession) {
        alert('Please sign in to send feedback.');
        return;
      }
      document.getElementById('feedback-title-input').value = '';
      document.getElementById('feedback-desc-input').value = '';
      document.getElementById('feedback-category-input').value = 'Feature Idea';
      document.getElementById('feedback-anon-checkbox').checked = false;
      document.getElementById('feedback-modal').classList.remove('hidden');
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    function closeFeedbackModal() {
      document.getElementById('feedback-modal').classList.add('hidden');
    }

    function handleFeedbackBackdropClick(e) {
      if (e.target.id === 'feedback-modal') {
        closeFeedbackModal();
      }
    }

    async function submitCommunityFeedback() {
      if (!currentUserSession) return;
      const title = document.getElementById('feedback-title-input').value.trim();
      const desc = document.getElementById('feedback-desc-input').value.trim();
      const category = document.getElementById('feedback-category-input').value;
      const isAnon = document.getElementById('feedback-anon-checkbox').checked;

      if (!title) {
        alert('Please provide a short summary or title for your feedback.');
        return;
      }
      if (!desc) {
        alert('Please describe your feature idea or feedback in the details box.');
        return;
      }

      const submitBtn = document.getElementById('feedback-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i> Submitting...';
        if (window.lucide && window.lucide.createIcons) lucide.createIcons();
      }

      try {
        const feedbackPayload = {
          category: category,
          title: title,
          description: desc,
          authorName: isAnon ? 'Anonymous Student' : (currentUserSession.fullName || currentUserSession.username),
          authorHandle: isAnon ? null : currentUserSession.username,
          authorUid: isAnon ? null : currentUserSession.uid,
          isAnon: isAnon,
          status: 'pending'
        };

        if (db) {
          await db.ref('feedback').push(feedbackPayload);
        }

        alert('🎉 Thank you! Your feedback has been sent directly to the developer (Ghost Admin).');
        closeFeedbackModal();
      } catch (err) {
        console.error('submitCommunityFeedback error:', err);
        alert('Failed to submit feedback: ' + (err.message || 'Please check your connection and try again.'));
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i data-lucide="send" class="w-3.5 h-3.5"></i> <span>Send to Developer</span>';
          if (window.lucide && window.lucide.createIcons) lucide.createIcons();
        }
      }
    }

    function renderFeedbackList() {
      const container = document.getElementById('admin-feedback-list');
      const countText = document.getElementById('admin-feedback-count-text');
      if (!container) return;

      if (!currentUserSession || currentUserSession.role !== 'admin') {
        container.innerHTML = '<p class="text-xs text-slate-400 p-4">Admin exclusive section.</p>';
        return;
      }

      const searchVal = (document.getElementById('feedback-search-input')?.value || '').toLowerCase().trim();
      let list = Object.values(allCommunityFeedback || {}).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      if (searchVal) {
        list = list.filter(f => 
          (f.title || '').toLowerCase().includes(searchVal) ||
          (f.description || '').toLowerCase().includes(searchVal) ||
          (f.category || '').toLowerCase().includes(searchVal) ||
          (f.authorName || '').toLowerCase().includes(searchVal) ||
          (f.authorHandle || '').toLowerCase().includes(searchVal)
        );
      }

      if (countText) countText.textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;

      if (list.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center text-slate-400 space-y-2">
            <i data-lucide="inbox" class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600"></i>
            <p class="font-semibold text-slate-600 dark:text-slate-400 text-xs">No feedback or suggestions in queue.</p>
            <p class="text-[11px] text-slate-400">When batchmates suggest features or report bugs, they appear exclusively here for you!</p>
          </div>
        `;
        if (window.lucide && window.lucide.createIcons) lucide.createIcons();
        return;
      }

      container.innerHTML = list.map(item => {
        const isDone = item.status === 'completed';
        const timeAgo = formatTimeAgo(item.timestamp);
        const authorText = item.isAnon 
          ? '<span class="font-bold text-slate-500">🎭 Anonymous Batchmate</span>' 
          : `<span class="font-bold text-slate-900 dark:text-white">${escapeHtml(item.authorName)}</span> <span class="font-mono text-slate-400">(@${escapeHtml(item.authorHandle || 'user')})</span>`;

        const categoryColors = {
          'Feature Idea': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          'Bug Report': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
          'Design / UI Tweak': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
          'Mess / Campus Utility': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          'Academic Tool': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
          'Other': 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
        };
        const catBadgeClass = categoryColors[item.category] || categoryColors['Other'];

        return `
          <div class="p-3.5 rounded-md border ${isDone ? 'bg-slate-50/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 opacity-70' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'} space-y-2.5 transition">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${catBadgeClass}">
                  ${escapeHtml(item.category)}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">${timeAgo}</span>
                ${isDone ? '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">✅ Completed</span>' : '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">🟡 Pending</span>'}
              </div>
              <div class="flex items-center gap-1 shrink-0">
                ${!isDone ? `
                  <button type="button" onclick="markFeedbackDone('${item.id}')" class="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition flex items-center gap-1 shadow-xs" title="Mark this suggestion as completed">
                    <i data-lucide="check" class="w-3 h-3"></i> Mark Done
                  </button>
                ` : ''}
                <button type="button" onclick="clearFeedbackItem('${item.id}')" class="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition" title="Clear / Delete Feedback">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>

            <div>
              <h4 class="font-bold text-xs text-slate-900 dark:text-white">${escapeHtml(item.title)}</h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-line">${escapeHtml(item.description)}</p>
            </div>

            <div class="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <div>${authorText}</div>
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    async function markFeedbackDone(id) {
      if (!currentUserSession || currentUserSession.role !== 'admin') return;
      try {
        if (db) {
          await db.ref(`feedback/${id}`).update({ status: 'completed' });
        }
        if (allCommunityFeedback[id]) {
          allCommunityFeedback[id].status = 'completed';
        }
        renderFeedbackList();
        updateAdminBadges();
      } catch (err) {
        console.error('markFeedbackDone error:', err);
        alert('Failed to update status: ' + err.message);
      }
    }

    async function clearFeedbackItem(id) {
      if (!currentUserSession || currentUserSession.role !== 'admin') return;
      if (!confirm('Clear and remove this feedback item permanently?')) return;
      try {
        if (db) {
          await db.ref(`feedback/${id}`).remove();
        }
        delete allCommunityFeedback[id];
        renderFeedbackList();
        updateAdminBadges();
      } catch (err) {
        console.error('clearFeedbackItem error:', err);
        alert('Failed to clear feedback: ' + err.message);
      }
    }

    function renderReviewQueueList() {
      const container = document.getElementById('review-queue-list');
      if (!container) return;

      const quarantinedItems = Object.values(allQuarantinedContent || {});
      const quarantinedPosts = [
        ...quarantinedItems.filter(q => q.type !== 'comment'),
        ...(allPosts || []).filter(p => p.status === 'quarantined' && !quarantinedItems.some(q => q.id === p.id))
      ];

      const quarantinedComments = [
        ...quarantinedItems.filter(q => q.type === 'comment').map(c => ({
          comment: c,
          post: (allPosts || []).find(p => p.id === c.postId) || { id: c.postId, title: c.threadTitle || 'Discussion' }
        }))
      ];
      (allPosts || []).forEach(p => {
        if (p.comments) {
          p.comments.forEach(c => {
            if (c.status === 'quarantined' && !quarantinedItems.some(q => q.id === (c.id || c.key))) {
              quarantinedComments.push({ comment: c, post: p });
            }
          });
        }
      });

      const totalItems = quarantinedPosts.length + quarantinedComments.length;
      const badge = document.getElementById('admin-tab-review-badge');
      if (badge) {
        if (totalItems > 0) {
          badge.textContent = totalItems;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }

      if (totalItems === 0) {
        container.innerHTML = `
          <div class="p-6 text-center text-slate-500 space-y-1">
            <i data-lucide="shield-check" class="w-8 h-8 text-emerald-500 mx-auto"></i>
            <p class="font-bold text-slate-900 dark:text-white text-xs">Review Queue is Clear</p>
            <p class="text-[11px]">All student discussions and replies are approved or compliant.</p>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      let html = '';

      quarantinedPosts.forEach(p => {
        const authorDisplay = p.isAnon ? `${p.author || 'Anonymous'} (Anon UID: ${p.authorUid ? p.authorUid.substring(0, 8) : 'N/A'})` : getPostAuthorDisplay(p);
        html += `
          <div class="p-3.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    🚨 ${escapeHtml(p.quarantineCategory || 'Flagged Discussion')}
                  </span>
                  <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/10 text-brand-orange border border-orange-500/20">
                    ${escapeHtml(p.board || 'all')}
                  </span>
                </div>
                <h4 class="font-bold text-sm text-slate-900 dark:text-white mt-1">${escapeHtml(p.title || 'Untitled')}</h4>
                <p class="text-[11px] text-slate-500">By ${authorDisplay} · ${p.createdAt ? (typeof p.createdAt === 'string' ? p.createdAt : formatTimeAgo(p.createdAt)) : formatTimeAgo(p.timestamp || p.quarantinedAt)}</p>
              </div>
            </div>

            <div class="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300">
              <span class="font-bold block text-[11px]">Safety Trigger:</span>
              <p class="text-[11px] mt-0.5">${escapeHtml(p.quarantineReason || 'Triggered automated safety filter.')}</p>
            </div>

            <div class="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
${escapeHtml(p.content || p.text || '')}
            </div>

            <div class="flex items-center justify-end gap-2 pt-1">
              <button onclick="rejectQuarantinedPost('${p.id}')" class="px-3 py-1.5 rounded border border-rose-300 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition flex items-center gap-1">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Reject & Purge
              </button>
              <button onclick="approveQuarantinedPost('${p.id}')" class="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center gap-1">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Approve & Publish
              </button>
            </div>
          </div>
        `;
      });

      quarantinedComments.forEach(({ comment: c, post: p }) => {
        const commentId = c.id || c.key;
        const targetPostId = c.postId || p.id;
        html += `
          <div class="p-3.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div class="flex items-start justify-between gap-2 flex-wrap">
              <div class="space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    🚨 ${escapeHtml(c.quarantineCategory || 'Flagged Reply')}
                  </span>
                  <span class="text-[11px] text-slate-500">Reply on: <strong>${escapeHtml(p.title || c.threadTitle || 'Discussion')}</strong></span>
                </div>
                <p class="text-[11px] text-slate-500">By @${escapeHtml(c.author || 'User')} · ${c.time || formatTimeAgo(c.timestamp || c.quarantinedAt)}</p>
              </div>
            </div>

            <div class="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300">
              <span class="font-bold block text-[11px]">Safety Trigger:</span>
              <p class="text-[11px] mt-0.5">${escapeHtml(c.quarantineReason || 'Triggered automated safety filter.')}</p>
            </div>

            <div class="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
${escapeHtml(c.text || c.content || '')}
            </div>

            <div class="flex items-center justify-end gap-2 pt-1">
              <button onclick="rejectQuarantinedComment('${targetPostId}', '${commentId}')" class="px-3 py-1.5 rounded border border-rose-300 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition flex items-center gap-1">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Reject Reply
              </button>
              <button onclick="approveQuarantinedComment('${targetPostId}', '${commentId}')" class="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition flex items-center gap-1">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Approve Reply
              </button>
            </div>
          </div>
        `;
      });

      container.innerHTML = html;
      lucide.createIcons();
    }

    async function approveQuarantinedPost(postId) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) {
        alert('Unauthorized: Only batch moderators can approve quarantined content.');
        return;
      }
      const item = allQuarantinedContent[postId] || (allPosts || []).find(p => p.id === postId);
      if (!item) return;

      const modUsername = currentUserSession.username;
      const approvedPost = {
        id: item.id || postId,
        board: item.board || 'resources',
        title: item.title,
        content: item.content || item.text || '',
        price: item.price || null,
        tag: item.tag || null,
        imageUrl: item.imageUrl || null,
        author: item.author,
        authorUid: item.authorUid,
        authorUsername: item.authorUsername,
        isAnon: Boolean(item.isAnon),
        createdAt: 'Just now',
        timestamp: Date.now(),
        upvotes: 0,
        upvotedBy: {},
        views: 0,
        viewedBy: {},
        comments: [],
        status: 'published',
        approvedBy: modUsername,
        approvedAt: Date.now()
      };

      if (db) {
        await db.ref('posts/' + postId).set(approvedPost);
        await db.ref('quarantinedContent/' + postId).remove().catch(() => {});
        if (item.authorUid && item.authorUid !== currentUserSession.uid) {
          try {
            const notifRef = db.ref('notifications/' + item.authorUid).push();
            await notifRef.set({
              id: notifRef.key,
              type: 'system',
              postId: postId,
              threadTitle: item.title || 'Discussion',
              senderUid: currentUserSession.uid,
              senderName: `@${modUsername} (Moderator)`,
              senderUsername: modUsername,
              snippet: `Your post was reviewed and approved by @${modUsername}. It is now live!`,
              timestamp: Date.now(),
              read: false
            });
          } catch (e) {
            console.warn('Notification failed:', e);
          }
        }
      }

      delete allQuarantinedContent[postId];
      const existingIdx = (allPosts || []).findIndex(p => p.id === postId);
      if (existingIdx >= 0) {
        allPosts[existingIdx] = approvedPost;
      } else {
        allPosts.unshift(approvedPost);
      }
      renderFeed();

      renderReviewQueueList();
      updateAdminBadges();
      alert(`✅ Discussion approved and published to the feed!\nAttributed: Approved by @${modUsername}`);
    }

    async function rejectQuarantinedPost(postId) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) {
        alert('Unauthorized.');
        return;
      }
      const item = allQuarantinedContent[postId] || (allPosts || []).find(p => p.id === postId);
      if (!item) return;

      const reason = prompt('Optional rejection note for student author:', item.quarantineReason || 'Violates community safety guidelines');
      if (reason === null) return;

      const modUsername = currentUserSession.username;

      if (db) {
        await db.ref('quarantinedContent/' + postId).remove().catch(() => {});
        await db.ref('posts/' + postId).remove().catch(() => {});
        if (item.authorUid && item.authorUid !== currentUserSession.uid) {
          try {
            const notifRef = db.ref('notifications/' + item.authorUid).push();
            await notifRef.set({
              id: notifRef.key,
              type: 'system',
              postId: postId,
              threadTitle: item.title || 'Discussion',
              senderUid: currentUserSession.uid,
              senderName: `@${modUsername} (Moderator)`,
              senderUsername: modUsername,
              snippet: `Your post was declined by moderators: ${reason}`,
              timestamp: Date.now(),
              read: false
            });
          } catch (e) {}
        }
      }

      delete allQuarantinedContent[postId];
      allPosts = allPosts.filter(p => p.id !== postId);

      renderReviewQueueList();
      updateAdminBadges();
    }

    async function approveQuarantinedComment(postId, commentKey) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) {
        alert('Unauthorized.');
        return;
      }
      const modUsername = currentUserSession.username;
      const item = allQuarantinedContent[commentKey] || allQuarantinedContent[postId];
      const actualPostId = item?.postId || postId;
      const post = (allPosts || []).find(p => p.id === actualPostId);

      const approvedComment = {
        id: item?.id || commentKey,
        postId: actualPostId,
        parentId: item?.parentId || null,
        author: item?.author || 'Student',
        authorUid: item?.authorUid,
        authorUsername: item?.authorUsername,
        isAnon: Boolean(item?.isAnon),
        text: item?.text || item?.content || '',
        time: 'Just now',
        timestamp: Date.now(),
        status: 'published',
        approvedBy: modUsername,
        approvedAt: Date.now(),
        upvotes: 0,
        upvotedBy: {}
      };

      if (db) {
        await db.ref(`posts/${actualPostId}/comments`).push(approvedComment);
        await db.ref(`quarantinedContent/${commentKey}`).remove().catch(() => {});
        if (item?.authorUid && item.authorUid !== currentUserSession.uid) {
          try {
            const notifRef = db.ref('notifications/' + item.authorUid).push();
            await notifRef.set({
              id: notifRef.key,
              type: 'system',
              postId: actualPostId,
              threadTitle: post?.title || 'Discussion',
              senderUid: currentUserSession.uid,
              senderName: `@${modUsername} (Moderator)`,
              senderUsername: modUsername,
              snippet: `Your reply was approved by @${modUsername} and is now live!`,
              timestamp: Date.now(),
              read: false
            });
          } catch (e) {}
        }
      }

      delete allQuarantinedContent[commentKey];
      if (post) {
        if (!post.comments) post.comments = [];
        post.comments.push(approvedComment);
        if (activeThreadId === actualPostId) {
          renderThreadDetail(actualPostId);
        }
      }

      renderReviewQueueList();
      updateAdminBadges();
      alert(`✅ Reply approved and published!\nAttributed: Approved by @${modUsername}`);
    }

    async function rejectQuarantinedComment(postId, commentKey) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) {
        alert('Unauthorized.');
        return;
      }
      if (!confirm('Permanently remove this flagged reply?')) return;

      const item = allQuarantinedContent[commentKey];
      if (db) {
        await db.ref(`quarantinedContent/${commentKey}`).remove().catch(() => {});
        await db.ref(`posts/${postId}/comments/${commentKey}`).remove().catch(() => {});
        if (item?.authorUid && item.authorUid !== currentUserSession.uid) {
          try {
            const notifRef = db.ref('notifications/' + item.authorUid).push();
            await notifRef.set({
              id: notifRef.key,
              type: 'system',
              postId: postId,
              threadTitle: 'Discussion',
              senderUid: currentUserSession.uid,
              senderName: `@${currentUserSession.username} (Moderator)`,
              senderUsername: currentUserSession.username,
              snippet: `Your reply was removed by moderators after safety review.`,
              timestamp: Date.now(),
              read: false
            });
          } catch (e) {}
        }
      }
      delete allQuarantinedContent[commentKey];

      renderReviewQueueList();
      updateAdminBadges();
    }

    function renderProfileRequestsList() {
      const container = document.getElementById('profile-requests-list');
      if (!container) return;

      const requestingUsers = Object.values(allUsers || {}).filter(u => u.pendingProfileUpdate);

      const badge = document.getElementById('admin-tab-profile-badge');
      if (badge) {
        if (requestingUsers.length > 0) {
          badge.textContent = requestingUsers.length;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }

      if (requestingUsers.length === 0) {
        container.innerHTML = `
          <div class="p-6 text-center text-slate-500 space-y-1">
            <i data-lucide="check-circle-2" class="w-8 h-8 text-emerald-500 mx-auto"></i>
            <p class="font-bold text-slate-900 dark:text-white text-xs">No Pending Profile Requests</p>
            <p class="text-[11px]">All student name & handle change requests have been processed.</p>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      container.innerHTML = requestingUsers.map(u => {
        const req = u.pendingProfileUpdate;
        const nameChanged = req.requestedFullName && req.requestedFullName !== (u.fullName || u.username);
        const userChanged = req.requestedUsername && req.requestedUsername !== u.username;

        return `
          <div class="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <span class="font-bold text-slate-900 dark:text-white">${u.fullName || u.username}</span>
                  <span class="text-slate-400 font-mono">(@${u.username})</span>
                  <span class="text-[10px] text-brand-orange font-bold font-mono px-1.5 py-0.2 rounded bg-orange-500/10 border border-orange-500/20">${u.token || ''}</span>
                </div>
                
                <div class="text-[11px] space-y-0.5">
                  ${nameChanged ? `
                    <p class="text-slate-700 dark:text-slate-300">
                      <span class="text-slate-400">Name Change:</span> 
                      <span class="line-through text-slate-400">${u.fullName || u.username}</span> 
                      <span class="text-emerald-600 dark:text-emerald-400 font-bold">➔ ${req.requestedFullName}</span>
                    </p>
                  ` : ''}
                  ${userChanged ? `
                    <p class="text-slate-700 dark:text-slate-300">
                      <span class="text-slate-400">Handle Change:</span> 
                      <span class="line-through text-slate-400">@${u.username}</span> 
                      <span class="text-emerald-600 dark:text-emerald-400 font-bold font-mono">➔ @${req.requestedUsername}</span>
                    </p>
                  ` : ''}
                  <p class="text-[11px] text-slate-500"><span class="text-slate-400">Reason:</span> "${req.reason || 'None provided'}"</p>
                  <p class="text-[10px] text-slate-400">Phone: +91 ${u.phone} • Requested: ${new Date(req.requestedAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <button onclick="approveProfileChange('${u.uid}')" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow flex items-center gap-1">
                  <i data-lucide="check" class="w-3.5 h-3.5"></i> Approve
                </button>
                <button onclick="rejectProfileChange('${u.uid}')" class="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 text-xs font-medium transition" title="Reject Request">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      lucide.createIcons();
    }

    async function approveProfileChange(uid) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) return;
      const targetUser = allUsers[uid];
      if (!targetUser || !targetUser.pendingProfileUpdate) return;

      const req = targetUser.pendingProfileUpdate;
      
      // Double check username collision
      if (req.requestedUsername && req.requestedUsername !== targetUser.username) {
        const collision = Object.values(allUsers).some(u => u.uid !== uid && (u.username || '').toLowerCase() === req.requestedUsername.toLowerCase());
        if (collision) {
          alert(`Error: Cannot approve. The handle @${req.requestedUsername} has already been registered by another student.`);
          return;
        }
      }

      if (!confirm(`Approve profile change for ${targetUser.fullName || targetUser.username}?\n\nNew Name: ${req.requestedFullName}\nNew Handle: @${req.requestedUsername}`)) return;

      if (db) {
        await db.ref('users/' + uid).update({
          fullName: req.requestedFullName,
          username: req.requestedUsername,
          pendingProfileUpdate: null
        });
      }

      renderProfileRequestsList();
      renderRosterList();
      alert(`✅ Profile change approved for ${req.requestedFullName} (@${req.requestedUsername}).`);
    }

    async function rejectProfileChange(uid) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) return;
      const targetUser = allUsers[uid];
      if (!targetUser || !targetUser.pendingProfileUpdate) return;

      if (!confirm(`Decline profile change request for ${targetUser.fullName || targetUser.username}?`)) return;

      if (db) {
        await db.ref('users/' + uid + '/pendingProfileUpdate').remove();
      }

      renderProfileRequestsList();
    }

    function getPostAuthorDisplay(post) {
      if (post.isAnon) {
        return `<span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"><i data-lucide="eye-off" class="w-3.5 h-3.5 inline"></i> ${escapeHtml(post.author || 'Anonymous')}</span>`;
      }
      if (post.id === 'post-mtmc-mess' || post.id === 'post-mtmc-foundation-course' || post.id === 'post-mtmc-hostel-rules' || post.author === 'Batch Resource') {
        return `<span class="font-bold text-slate-800 dark:text-slate-100">Batch Resource</span>`;
      }
      if (post.authorUid && allUsers[post.authorUid]) {
        const u = allUsers[post.authorUid];
        if (u.fullName && u.username) {
          return `<button type="button" onclick="event.stopPropagation(); openPublicProfile('${post.authorUid}')" class="group/author text-left hover:underline inline-flex items-center gap-1 focus:outline-none"><span class="font-bold text-slate-800 dark:text-slate-100 group-hover/author:text-brand-orange transition">${escapeHtml(u.fullName)}</span> <span class="text-slate-500 dark:text-slate-400 font-normal text-[11px]">(@${escapeHtml(u.username)})</span></button>`;
        }
        if (u.fullName) return `<button type="button" onclick="event.stopPropagation(); openPublicProfile('${post.authorUid}')" class="font-bold text-slate-800 dark:text-slate-100 hover:text-brand-orange hover:underline transition">${escapeHtml(u.fullName)}</button>`;
        if (u.username) return `<button type="button" onclick="event.stopPropagation(); openPublicProfile('${post.authorUid}')" class="font-bold text-slate-800 dark:text-slate-100 hover:text-brand-orange hover:underline transition">@${escapeHtml(u.username)}</button>`;
      }
      if (post.author) {
        if (post.author === '[Former Member]') {
          return `<span class="text-slate-400 dark:text-slate-500 italic">[Former Member]</span>`;
        }
        return `<span class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(post.author)}</span>`;
      }
      return `<span class="font-bold text-slate-800 dark:text-slate-100">Batchmate</span>`;
    }

    function getCommentAuthorDisplay(c, postAuthorUid) {
      if (c.isDeleted) {
        return `<span class="text-slate-400 dark:text-slate-500 italic text-[11px] font-mono">[deleted]</span>`;
      }
      let authorHtml = '';
      if (c.isAnon) {
        authorHtml = `<span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"><i data-lucide="eye-off" class="w-3.5 h-3.5 inline"></i> ${escapeHtml(c.author || 'Anonymous')}</span>`;
      } else if (c.authorUid && allUsers[c.authorUid]) {
        const u = allUsers[c.authorUid];
        if (u.fullName && u.username) {
          authorHtml = `<button type="button" onclick="event.stopPropagation(); openPublicProfile('${c.authorUid}')" class="group/author text-left hover:underline inline-flex items-center gap-1 focus:outline-none"><span class="font-bold text-slate-800 dark:text-slate-100 group-hover/author:text-brand-orange transition">${escapeHtml(u.fullName)}</span> <span class="text-slate-500 dark:text-slate-400 font-normal text-[11px]">(@${escapeHtml(u.username)})</span></button>`;
        } else if (u.fullName) {
          authorHtml = `<button type="button" onclick="event.stopPropagation(); openPublicProfile('${c.authorUid}')" class="font-bold text-slate-800 dark:text-slate-100 hover:text-brand-orange hover:underline transition">${escapeHtml(u.fullName)}</button>`;
        } else if (u.username) {
          authorHtml = `<button type="button" onclick="event.stopPropagation(); openPublicProfile('${c.authorUid}')" class="font-bold text-slate-800 dark:text-slate-100 hover:text-brand-orange hover:underline transition">@${escapeHtml(u.username)}</button>`;
        }
      } else if (c.author) {
        if (c.author === '[Former Member]') {
          authorHtml = `<span class="text-slate-400 dark:text-slate-500 italic">[Former Member]</span>`;
        } else {
          authorHtml = `<span class="font-bold text-slate-800 dark:text-slate-100">${escapeHtml(c.author)}</span>`;
        }
      } else {
        authorHtml = `<span class="font-bold text-slate-800 dark:text-slate-100">Batchmate</span>`;
      }

      // Append OP badge if comment author is original post creator
      if (postAuthorUid && c.authorUid === postAuthorUid && !c.isAnon && !c.isDeleted) {
        authorHtml += ` <span class="ml-1 px-1.5 py-0.2 rounded bg-brand-orange/15 text-brand-orange border border-brand-orange/30 font-black text-[9px] uppercase tracking-wide inline-flex items-center gap-0.5" title="Original Poster / Thread Author"><i data-lucide="sparkles" class="w-2.5 h-2.5"></i> OP</span>`;
      }

      return authorHtml;
    }

    function renderPendingList() {
      const container = document.getElementById('pending-verifications-list');
      const pendingUsers = Object.values(allUsers || {}).filter(u => u.status === 'pending');

      const badge = document.getElementById('admin-tab-pending-badge');
      if (badge) {
        if (pendingUsers.length > 0) {
          badge.textContent = pendingUsers.length;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }

      if (pendingUsers.length === 0) {
        container.innerHTML = `
          <div class="p-6 text-center text-slate-500 space-y-1">
            <i data-lucide="check-circle-2" class="w-8 h-8 text-emerald-500 mx-auto"></i>
            <p class="font-bold text-slate-900 dark:text-white text-xs">All Caught Up!</p>
            <p class="text-[11px]">No students awaiting verification right now.</p>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      container.innerHTML = pendingUsers.map(u => {
        const priv = allUserPrivate[u.uid] || {};
        const phone = priv.phone || u.phone || '—';
        const token = priv.token || u.token || '—';
        return `
        <div class="p-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-slate-900 dark:text-white text-xs">${u.fullName || u.username}</span>
              <span class="text-[11px] text-slate-500 font-mono">@${u.username}</span>
              <span class="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">${token}</span>
            </div>
            <div class="text-[11px] text-slate-500">
              <span class="font-mono text-slate-700 dark:text-slate-300 font-semibold">+91 ${phone}</span> • <span class="text-[10px]">${new Date(u.registeredAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button onclick="approveStudent('${u.uid}')" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow flex items-center gap-1">
              <i data-lucide="check" class="w-3.5 h-3.5"></i> Verify
            </button>
            <button onclick="rejectStudent('${u.uid}')" class="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 text-xs font-medium transition" title="Reject">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      `;
      }).join('');

      lucide.createIcons();
    }

    function renderRosterList() {
      const container = document.getElementById('batch-roster-list');
      const search = (document.getElementById('roster-search-input')?.value || '').toLowerCase().trim();
      let users = Object.values(allUsers || {}).filter(u => (u.username || '').toLowerCase() !== 'admin');

      if (search) {
        users = users.filter(u => {
          const priv = allUserPrivate[u.uid] || {};
          const phone = priv.phone || u.phone || '';
          return (u.fullName || '').toLowerCase().includes(search) || 
            (u.username || '').toLowerCase().includes(search) || 
            phone.includes(search);
        });
      }

      container.innerHTML = users.map(u => {
        const priv = allUserPrivate[u.uid] || {};
        const phone = priv.phone || u.phone || '—';
        const token = priv.token || u.token || '';
        return `
        <div class="p-2.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-slate-900 dark:text-white">${u.fullName || u.username}</span>
              <span class="text-[11px] text-slate-400 font-mono">@${u.username}</span>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                u.role === 'admin' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                u.role === 'supermod' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                u.role === 'moderator' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }">${u.username === 'admin' ? 'admin' : (u.role === 'supermod' ? '🛡️ super mod' : u.role)}</span>
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded ${u.status === 'verified' ? 'text-emerald-500' : (u.status === 'rejected' ? 'text-rose-500' : 'text-amber-500')}">• ${u.status}</span>
            </div>
            <p class="text-[11px] text-slate-500 font-mono mt-0.5"><span class="text-slate-400">Mobile:</span> +91 ${phone} ${token ? `· <span class="text-slate-400">Token:</span> ${token}` : ''}</p>
          </div>
          ${isModOrAbove(currentUserSession?.role) && (currentUserSession?.username === 'admin' || u.role !== 'admin') && u.username !== currentUserSession?.username ? `
            <div class="flex items-center gap-1 shrink-0 flex-wrap justify-end">
              <!-- Admin Controls: Make/Demote Mod, Make/Demote Super Mod -->
              ${currentUserSession?.role === 'admin' ? `
                ${u.role === 'admin' ? `
                  <button onclick="handleAdminDemoteMod('${u.uid}', '${u.username}')" class="px-2 py-1 rounded text-[10px] font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10">
                    Demote to Student
                  </button>
                ` : (u.role === 'supermod' ? `
                  <button onclick="handleAdminDemoteSuperMod('${u.uid}', '${u.username}')" class="px-2 py-1 rounded text-[10px] font-bold border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                    Demote Super Mod
                  </button>
                ` : `
                  ${u.role === 'moderator' ? `
                    <button onclick="handleAdminDemoteMod('${u.uid}', '${u.username}')" class="px-2 py-1 rounded text-[10px] font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10">
                      Demote Mod
                    </button>
                    ${countActiveSuperMods() < 2 ? `
                      <button onclick="handleAdminMakeSuperMod('${u.uid}', '${u.username}')" class="px-2 py-1 rounded text-[10px] font-bold border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                        Make Super Mod
                      </button>
                    ` : ''}
                  ` : `
                    <button onclick="handleMakeMod('${u.uid}')" class="px-2 py-1 rounded text-[10px] font-bold border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10">
                      Make Mod
                    </button>
                    ${countActiveSuperMods() < 2 ? `
                      <button onclick="handleAdminMakeSuperMod('${u.uid}', '${u.username}')" class="px-2 py-1 rounded text-[10px] font-bold border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                        Make Super Mod
                      </button>
                    ` : ''}
                  `}
                `)}
              ` : (currentUserSession?.role === 'supermod' ? `
                ${u.role === 'student' ? `
                  <button onclick="handleMakeMod('${u.uid}')" class="px-2 py-1 rounded text-[10px] font-bold border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10">
                    Make Mod
                  </button>
                ` : (u.role === 'moderator' ? `
                  ${renderSuperModDemoteButton(u)}
                ` : '')}
              ` : '')}

              <!-- Reset Password -->
              <button onclick="adminResetUserPassword('${u.uid}', '${u.username}')" class="px-2 py-1 rounded text-[10px] font-bold border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                Reset Pass
              </button>
              
              <!-- Direct Deletion (Admin) / Request Deletion (Mod/Supermod) -->
              ${currentUserSession?.role === 'admin' ? `
                <button onclick="handleAdminDirectDelete('${u.uid}', '${u.username}')" class="px-2 py-1 rounded text-[10px] font-bold border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition" title="Direct Instant Deletion (Admin)">
                  Delete
                </button>
              ` : (allDeletionRequests[u.uid] ? `
                <button onclick="switchAdminTab('deletions')" class="px-2 py-1 rounded text-[10px] font-bold border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" title="Review Deletion Voting">
                  Voting...
                </button>
              ` : (u.role !== 'moderator' && u.role !== 'supermod' ? `
                <button onclick="handleModRequestDelete('${u.uid}', '${u.username}')" class="px-2 py-1 rounded text-[10px] font-bold border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10" title="Request Deletion (Requires All Moderators)">
                  Req Delete
                </button>
              ` : ''))}
            </div>
          ` : ''}
        </div>
      `;
      }).join('');
    }

    function renderSuperModDemoteButton(u) {
      const req = u.pendingProfileUpdate;
      if (req && req.type === 'demote_mod') {
        const hasVoted = Boolean(req.approvals && req.approvals[currentUserSession.uid]);
        if (hasVoted) {
          return `
            <span class="inline-flex items-center gap-1">
              <span class="px-2 py-1 rounded text-[10px] font-bold border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400" title="1 of 2 Super Mod approvals recorded. Waiting for other Super Mod to confirm.">
                Demote (1/2 Voted)
              </span>
              <button onclick="handleCancelSuperModDemote('${u.uid}')" class="px-1.5 py-1 rounded text-[10px] font-bold border border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800" title="Cancel demotion request">
                ✕
              </button>
            </span>
          `;
        } else {
          return `
            <button onclick="handleSuperModVoteDemote('${u.uid}')" class="px-2 py-1 rounded text-[10px] font-bold border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition animate-pulse" title="Other Super Mod requested demotion. Click to confirm (2/2).">
              Confirm Demote (1/2)
            </button>
          `;
        }
      }
      return `
        <button onclick="handleSuperModInitiateDemote('${u.uid}', '${u.username}')" class="px-2 py-1 rounded text-[10px] font-bold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10" title="Demote Moderator (Requires both Super Mods to approve)">
          Demote Mod
        </button>
      `;
    }

    async function approveStudent(uid) {
      if (!db || !currentUserSession || !isModOrAbove(currentUserSession.role)) return;
      await db.ref('users/' + uid).update({
        status: 'verified',
        approvedBy: currentUserSession.username,
        approvedAt: Date.now()
      });
      renderPendingList();
      updateUserUI();
    }

    async function rejectStudent(uid) {
      if (!db || !currentUserSession || !isModOrAbove(currentUserSession.role)) return;
      if (!confirm('Are you sure you want to reject this registration?')) return;
      await db.ref('users/' + uid).remove();
      await db.ref('userPrivate/' + uid).remove().catch(() => {});
      renderPendingList();
      updateUserUI();
    }

    async function handleMakeMod(uid) {
      if (!db || !currentUserSession) return;
      if (currentUserSession.role !== 'admin' && currentUserSession.role !== 'supermod') return;
      const u = allUsers[uid] || {};
      if (!confirm(`Promote @${u.username || 'student'} to Batch Moderator?`)) return;

      const prevRole = u.role;
      try {
        if (allUsers[uid]) allUsers[uid].role = 'moderator';
        renderRosterList();
        await db.ref('users/' + uid).update({ role: 'moderator', pendingProfileUpdate: null });
        const priv = allUserPrivate[uid] || {};
        const phone = priv.phone || u.phone || '';
        await db.ref('publicModerators/' + uid).set({
          name: u.fullName || u.username,
          username: u.username,
          phone: phone,
          role: 'Batch Moderator'
        }).catch(() => {});
        renderRosterList();
      } catch (err) {
        if (allUsers[uid]) allUsers[uid].role = prevRole;
        renderRosterList();
        console.error('Promotion error:', err);
        alert('Failed to promote to Batch Moderator: ' + (err.message || err));
      }
    }

    async function handleAdminMakeSuperMod(uid, username) {
      if (!db || currentUserSession?.role !== 'admin') return;
      const numSuperMods = countActiveSuperMods();
      if (numSuperMods >= 2) {
        alert('Maximum of 2 Super Moderators allowed (1 Boy CR & 1 Girl CR). Please demote an existing Super Moderator first.');
        return;
      }
      if (!confirm(`Promote @${username} to Super Moderator (CR)? They will have the authority to appoint moderators and co-approve demotions.`)) return;

      const prevRole = allUsers[uid]?.role || 'moderator';
      try {
        if (allUsers[uid]) allUsers[uid].role = 'supermod';
        renderRosterList();
        await db.ref('users/' + uid).update({ role: 'supermod', pendingProfileUpdate: null });
        const u = allUsers[uid] || {};
        const priv = allUserPrivate[uid] || {};
        const phone = priv.phone || u.phone || '';
        await db.ref('publicModerators/' + uid).set({
          name: u.fullName || u.username,
          username: u.username,
          phone: phone,
          role: 'Head Moderator (CR)'
        }).catch(() => {});
        renderRosterList();
      } catch (err) {
        if (allUsers[uid]) allUsers[uid].role = prevRole;
        renderRosterList();
        console.error('Promotion to Super Mod error:', err);
        alert('Failed to promote to Super Moderator: ' + (err.message || err));
      }
    }

    async function handleAdminDemoteSuperMod(uid, username) {
      if (!db || currentUserSession?.role !== 'admin') return;
      const choice = prompt(`Demote Super Moderator @${username} to:\nType 'mod' for Moderator, or 'student' for Student:`, 'mod');
      if (!choice) return;
      const newRole = choice.trim().toLowerCase() === 'student' ? 'student' : 'moderator';

      const prevRole = allUsers[uid]?.role || 'supermod';
      try {
        if (allUsers[uid]) allUsers[uid].role = newRole;
        renderRosterList();
        await db.ref('users/' + uid).update({ role: newRole, pendingProfileUpdate: null });
        const u = allUsers[uid] || {};
        const priv = allUserPrivate[uid] || {};
        const phone = priv.phone || u.phone || '';
        if (newRole === 'moderator') {
          await db.ref('publicModerators/' + uid).set({
            name: u.fullName || u.username,
            username: u.username,
            phone: phone,
            role: 'Batch Moderator'
          }).catch(() => {});
        } else {
          await db.ref('publicModerators/' + uid).remove().catch(() => {});
        }
        renderRosterList();
      } catch (err) {
        if (allUsers[uid]) allUsers[uid].role = prevRole;
        renderRosterList();
        console.error('Demote Super Mod error:', err);
        alert('Failed to demote Super Moderator: ' + (err.message || err));
      }
    }

    async function handleAdminDemoteMod(uid, username) {
      if (!db || currentUserSession?.role !== 'admin') return;
      if (!confirm(`Demote moderator @${username} back to regular student?`)) return;
      const prevRole = allUsers[uid]?.role || 'moderator';
      try {
        if (allUsers[uid]) allUsers[uid].role = 'student';
        renderRosterList();
        await db.ref('users/' + uid).update({ role: 'student', pendingProfileUpdate: null });
        await db.ref('publicModerators/' + uid).remove().catch(() => {});
        renderRosterList();
      } catch (err) {
        if (allUsers[uid]) allUsers[uid].role = prevRole;
        renderRosterList();
        console.error('Demote Mod error:', err);
        alert('Failed to demote Moderator: ' + (err.message || err));
      }
    }

    async function handleSuperModInitiateDemote(uid, username) {
      if (!db || currentUserSession?.role !== 'supermod') return;
      const numSuperMods = countActiveSuperMods();
      if (numSuperMods <= 1) {
        if (!confirm(`As the only active Super Moderator, demote moderator @${username} to student?`)) return;
        await db.ref('users/' + uid).update({ role: 'student', pendingProfileUpdate: null });
        await db.ref('publicModerators/' + uid).remove().catch(() => {});
        alert(`@${username} has been demoted to student.`);
        renderRosterList();
        return;
      }
      const reason = prompt(`Reason for proposing demotion of moderator @${username} (Requires approval from both Super Mods):`);
      if (!reason || !reason.trim()) return;

      const req = {
        type: 'demote_mod',
        targetUid: uid,
        targetUsername: username,
        reason: reason.trim(),
        proposedByUid: currentUserSession.uid,
        proposedByName: currentUserSession.fullName || currentUserSession.username,
        approvals: {
          [currentUserSession.uid]: {
            name: currentUserSession.fullName || currentUserSession.username,
            timestamp: Date.now()
          }
        },
        createdAt: Date.now()
      };

      await db.ref('users/' + uid + '/pendingProfileUpdate').set(req);
      alert(`Demotion proposal submitted (1/2 approvals). The other Super Moderator must confirm to finalize the demotion.`);
      renderRosterList();
    }

    async function handleSuperModVoteDemote(uid) {
      if (!db || currentUserSession?.role !== 'supermod') return;
      const u = allUsers[uid];
      if (!u || !u.pendingProfileUpdate || u.pendingProfileUpdate.type !== 'demote_mod') return;

      const req = u.pendingProfileUpdate;
      const proposer = req.proposedByName || 'Other Super Moderator';
      const reason = req.reason || 'None provided';

      if (!confirm(`Super Moderator ${proposer} requested demotion of moderator @${u.username}.\n\nReason: "${reason}"\n\nDo you approve and finalize demoting @${u.username} to student?`)) {
        return;
      }

      await db.ref('users/' + uid).update({
        role: 'student',
        pendingProfileUpdate: null
      });
      await db.ref('publicModerators/' + uid).remove().catch(() => {});
      alert(`Moderator @${u.username} has been demoted to student with consensus of both Super Moderators.`);
      renderRosterList();
    }

    async function handleCancelSuperModDemote(uid) {
      if (!db || (currentUserSession?.role !== 'supermod' && currentUserSession?.role !== 'admin')) return;
      if (!confirm('Cancel this pending moderator demotion request?')) return;
      await db.ref('users/' + uid + '/pendingProfileUpdate').remove();
      renderRosterList();
    }

    async function adminResetUserPassword(uid, username) {
      if (!db || !currentUserSession) return;
      if (!isModOrAbove(currentUserSession.role)) {
        alert('Access restricted to Batch Moderators.');
        return;
      }
      const tempPass = prompt(`Set temporary password for "${username}" (min 6 characters):`, 'mtmc2026');
      if (!tempPass) return;
      if (tempPass.trim().length < 6) {
        alert('Temporary password must be at least 6 characters.');
        return;
      }

      await db.ref('users/' + uid).update({
        tempPasswordActive: true,
        passwordResetBy: currentUserSession.username,
        passwordResetAt: Date.now()
      });

      const copyMsg = `Hi ${username}, your temporary password for the MTMC Batch 2026 portal has been set to: ${tempPass.trim()}\nYou can now sign in directly at the portal using this password, and change it anytime in your Profile Settings.`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(copyMsg).catch(() => {});
      }

      alert(`Temporary password set to "${tempPass.trim()}". A message has been copied to your clipboard so you can paste it to ${username} on WhatsApp!`);
      renderRosterList();
    }

    // ================= ACCOUNT DELETION & GOVERNANCE =================
    function updateAdminBadges() {
      const pendingCount = Object.values(allUsers || {}).filter(u => u.status === 'pending').length;
      const profileReqCount = Object.values(allUsers || {}).filter(u => u.pendingProfileUpdate).length;
      const deletionReqCount = Object.keys(allDeletionRequests || {}).length;

      const quarantinedItems = Object.values(allQuarantinedContent || {});
      const reviewPostsCount = quarantinedItems.filter(q => q.type !== 'comment').length + (allPosts || []).filter(p => p.status === 'quarantined' && !quarantinedItems.some(q => q.id === p.id)).length;
      let reviewCommentsCount = quarantinedItems.filter(q => q.type === 'comment').length;
      (allPosts || []).forEach(p => {
        if (p.comments) {
          p.comments.forEach(c => {
            if (c.status === 'quarantined' && !quarantinedItems.some(q => q.id === (c.id || c.key))) reviewCommentsCount++;
          });
        }
      });
      const reviewCount = reviewPostsCount + reviewCommentsCount;

      const totalAlerts = pendingCount + profileReqCount + deletionReqCount + reviewCount;

      const headerBadge = document.getElementById('pending-badge');
      if (headerBadge) {
        if (totalAlerts > 0) {
          headerBadge.textContent = totalAlerts;
          headerBadge.classList.remove('hidden');
        } else {
          headerBadge.classList.add('hidden');
        }
      }

      const pendingBadge = document.getElementById('admin-tab-pending-badge');
      if (pendingBadge) {
        if (pendingCount > 0) {
          pendingBadge.textContent = pendingCount;
          pendingBadge.classList.remove('hidden');
        } else {
          pendingBadge.classList.add('hidden');
        }
      }

      const reviewBadge = document.getElementById('admin-tab-review-badge');
      if (reviewBadge) {
        if (reviewCount > 0) {
          reviewBadge.textContent = reviewCount;
          reviewBadge.classList.remove('hidden');
        } else {
          reviewBadge.classList.add('hidden');
        }
      }

      const profileBadge = document.getElementById('admin-tab-profile-badge');
      if (profileBadge) {
        if (profileReqCount > 0) {
          profileBadge.textContent = profileReqCount;
          profileBadge.classList.remove('hidden');
        } else {
          profileBadge.classList.add('hidden');
        }
      }

      const deletionsBadge = document.getElementById('admin-tab-deletions-badge');
      if (deletionsBadge) {
        if (deletionReqCount > 0) {
          deletionReqCount > 0 ? deletionsBadge.textContent = deletionReqCount : null;
          deletionsBadge.classList.remove('hidden');
        } else {
          deletionsBadge.classList.add('hidden');
        }
      }

      if (currentUserSession && currentUserSession.role === 'admin') {
        const pendingFeedbackCount = Object.values(allCommunityFeedback || {}).filter(f => f.status !== 'completed').length;
        const feedbackBadge = document.getElementById('admin-tab-feedback-badge');
        if (feedbackBadge) {
          if (pendingFeedbackCount > 0) {
            feedbackBadge.textContent = pendingFeedbackCount;
            feedbackBadge.classList.remove('hidden');
          } else {
            feedbackBadge.classList.add('hidden');
          }
        }
      }
    }

    async function handleAdminDirectDelete(uid, username) {
      if (!currentUserSession || currentUserSession.role !== 'admin') {
        alert('Direct deactivation is restricted to the Administrator.');
        return;
      }

      const confirmText = prompt(`⚠️ DEACTIVATE ACCOUNT (7-DAY RECOVERY WINDOW)\n\nYou are about to deactivate student @${username}.\nA 7-day grace period will be active during which the account can be restored.\n\nType DEACTIVATE to confirm:`);
      if (confirmText !== 'DEACTIVATE') {
        if (confirmText !== null) alert('Deactivation cancelled: confirmation did not match "DEACTIVATE".');
        return;
      }

      await executeAccountDeletion(uid, 'Direct Admin Deactivation', currentUserSession.username);
      alert(`Account @${username} is now deactivated (7-day recovery grace period active).`);
    }

    async function handleModRequestDelete(uid, username) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) {
        alert('Access restricted to Batch Moderators.');
        return;
      }

      const target = allUsers[uid];
      if (!target) return;

      if (target.role === 'admin') {
        alert('The administrator account cannot be deleted.');
        return;
      }

      const reason = prompt(`Propose Account Deletion for "${target.fullName || username}" (@${username}):\n\nPlease state the reason for unanimous moderator review:\n(The account will be suspended immediately while all moderators vote.)`, 'Code of Conduct violation');
      if (!reason || !reason.trim()) return;

      const reqPayload = {
        targetUid: uid,
        targetUsername: target.username,
        targetFullName: target.fullName || target.username,
        targetPhone: target.phone || '',
        reason: reason.trim(),
        requestedByUid: currentUserSession.uid,
        requestedByUsername: currentUserSession.username,
        requestedAt: Date.now(),
        approvals: {
          [currentUserSession.uid]: {
            username: currentUserSession.username,
            timestamp: Date.now()
          }
        }
      };

      if (db) {
        await db.ref('users/' + uid).update({ status: 'suspended' });
        await db.ref('deletionRequests/' + uid).set(reqPayload);
      }

      if (allUsers[uid]) allUsers[uid].status = 'suspended';
      allDeletionRequests[uid] = reqPayload;

      updateAdminBadges();
      alert(`Account for @${username} is now suspended and queued for deletion.\nAll active moderators must approve before permanent deletion occurs.`);
      switchAdminTab('deletions');
    }

    function renderDeletionRequestsList() {
      const container = document.getElementById('deletion-requests-list');
      if (!container) return;

      const requests = Object.values(allDeletionRequests || {});
      const activeMods = Object.values(allUsers || {}).filter(u => u.role === 'moderator' || u.role === 'supermod');
      const totalModsRequired = activeMods.length > 0 ? activeMods.length : 1;

      // Soft-deleted accounts in 7-day recovery grace period
      const deactivatedUsers = Object.values(allUsers || {}).filter(u => u.status === 'deleted');

      updateAdminBadges();

      let html = '';

      // Section 1: Active Consensus Deletion Proposals
      html += `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <i data-lucide="scale" class="w-3.5 h-3.5 text-brand-orange"></i>
              <span>Active Deletion Proposals (${requests.length})</span>
            </h4>
            <span class="text-[10px] text-slate-400">Requires Unanimous Mod Consensus</span>
          </div>
      `;

      if (requests.length === 0) {
        html += `
          <div class="p-4 text-center text-slate-500 space-y-1 bg-slate-50 dark:bg-slate-950/50 rounded-md border border-dashed border-slate-200 dark:border-slate-800">
            <i data-lucide="shield-check" class="w-5 h-5 text-emerald-500 mx-auto"></i>
            <p class="font-bold text-slate-900 dark:text-white text-xs">No Pending Deletion Proposals</p>
            <p class="text-[10px]">No student accounts are currently queued for consensus deletion.</p>
          </div>
        `;
      } else {
        html += requests.map(req => {
          const approvals = req.approvals || {};
          const approvalKeys = Object.keys(approvals);
          const approvalCount = approvalKeys.length;
          const pct = Math.min(100, Math.round((approvalCount / totalModsRequired) * 100));
          const myUid = currentUserSession?.uid;
          const iHaveApproved = Boolean(approvals[myUid]);
          const approverUsernames = Object.values(approvals).map(a => `@${a.username}`).join(', ');

          return `
          <div class="p-3.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2 flex-wrap text-xs">
                  <span class="font-bold text-slate-900 dark:text-white">${req.targetFullName || req.targetUsername}</span>
                  <span class="text-slate-400 font-mono">(@${req.targetUsername})</span>
                  <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    Suspended
                  </span>
                </div>
                <div class="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                  <p><span class="text-slate-400">Reason:</span> <span class="font-semibold text-rose-600 dark:text-rose-400">"${req.reason || 'Code of Conduct violation'}"</span></p>
                  <p class="text-[10px] text-slate-400">
                    Proposed by <span class="font-mono text-slate-600 dark:text-slate-300">@${req.requestedByUsername}</span> · ${formatTimeAgo(req.requestedAt)}
                    ${req.targetPhone ? `· Phone: +91 ${req.targetPhone}` : ''}
                  </p>
                </div>
              </div>

              ${currentUserSession?.role === 'admin' ? `
                <div class="flex items-center gap-1 shrink-0">
                  <button onclick="handleAdminDirectDelete('${req.targetUid}', '${req.targetUsername}')" class="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow flex items-center gap-1" title="Direct Deactivate">
                    <i data-lucide="trash-2" class="w-3 h-3"></i> Deactivate
                  </button>
                  <button onclick="dismissDeletionRequest('${req.targetUid}')" class="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition" title="Dismiss Request & Restore Account">
                    Restore
                  </button>
                </div>
              ` : `
                <div class="flex items-center gap-1 shrink-0">
                  ${iHaveApproved ? `
                    <button onclick="cancelMyDeletionVote('${req.targetUid}')" class="px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition" title="Revoke My Approval">
                      Revoke Vote
                    </button>
                  ` : `
                    <button onclick="voteApproveDeletion('${req.targetUid}')" class="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow flex items-center gap-1">
                      <i data-lucide="check" class="w-3 h-3"></i> Approve
                    </button>
                  `}
                  <button onclick="voteRejectDeletion('${req.targetUid}')" class="px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition" title="Reject Deletion Proposal">
                    Reject
                  </button>
                </div>
              `}
            </div>

            <!-- Consensus Progress Bar -->
            <div class="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-slate-500 font-medium">Moderator Consensus: <strong class="text-slate-900 dark:text-white">${approvalCount} / ${totalModsRequired}</strong> approved</span>
                <span class="font-mono font-bold ${approvalCount >= totalModsRequired ? 'text-emerald-500' : 'text-amber-500'}">${pct}%</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded overflow-hidden">
                <div class="bg-rose-500 h-full transition-all duration-300 rounded" style="width: ${pct}%"></div>
              </div>
              <p class="text-[10px] text-slate-400">
                Approvals: ${approverUsernames ? approverUsernames : 'None yet'}
              </p>
            </div>
          </div>
        `;
        }).join('');
      }

      html += `</div>`; // Close Section 1

      // Section 2: 7-Day Soft-Delete Recovery Queue
      html += `
        <div class="space-y-2.5 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between pb-1">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5 text-emerald-500"></i>
              <span>7-Day Recovery Window (${deactivatedUsers.length})</span>
            </h4>
            <span class="text-[10px] text-slate-400">Can be restored before purge</span>
          </div>
      `;

      if (deactivatedUsers.length === 0) {
        html += `
          <div class="p-3 text-center text-slate-400 space-y-0.5 bg-slate-50 dark:bg-slate-950/50 rounded-md border border-dashed border-slate-200 dark:border-slate-800">
            <p class="text-[11px]">No accounts currently in the 7-day recovery queue.</p>
          </div>
        `;
      } else {
        const now = Date.now();
        html += deactivatedUsers.map(u => {
          const deadline = u.restoreDeadline || ((u.deletedAt || now) + (7 * 24 * 60 * 60 * 1000));
          const diffMs = deadline - now;
          const daysLeft = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
          const isExpired = diffMs <= 0;

          return `
            <div class="p-3.5 rounded-md bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap text-xs">
                    <span class="font-bold text-slate-900 dark:text-white">${u.fullName || u.username}</span>
                    <span class="text-slate-400 font-mono">(@${u.username})</span>
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${isExpired ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}">
                      ${isExpired ? 'Grace Period Expired' : `${daysLeft} days to recover`}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <p><span class="text-slate-400">Reason:</span> <span>"${u.deletionReason || 'Account deactivated'}"</span></p>
                    <p class="text-[10px] text-slate-400">
                      Deactivated by ${u.deletedBy || 'Moderator'} · ${formatTimeAgo(u.deletedAt)}
                      ${u.phone ? `· Phone: +91 ${u.phone}` : ''}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button onclick="restoreDeletedAccount('${u.uid}')" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow flex items-center gap-1" title="Restore Account">
                    <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Restore
                  </button>
                  ${currentUserSession?.role === 'admin' ? `
                    <button onclick="permanentlyPurgeAccount('${u.uid}')" class="px-2 py-1 rounded border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition" title="Hard Purge Record">
                      Purge
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      html += `</div>`; // Close Section 2

      // Section 3: 7-Day Thread Recovery Queue (Deleted Discussions Batch-Wide)
      const deletedThreads = allPosts.filter(p => p.isDeleted);
      html += `
        <div class="space-y-2.5 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between pb-1">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <i data-lucide="archive-restore" class="w-3.5 h-3.5 text-brand-orange"></i>
              <span>7-Day Thread Recovery Queue (${deletedThreads.length})</span>
            </h4>
            <span class="text-[10px] text-slate-400">Can be restored by Author or Moderator</span>
          </div>
      `;

      if (deletedThreads.length === 0) {
        html += `
          <div class="p-3 text-center text-slate-400 space-y-0.5 bg-slate-50 dark:bg-slate-950/50 rounded-md border border-dashed border-slate-200 dark:border-slate-800">
            <p class="text-[11px]">No discussions currently in the 7-day recovery queue.</p>
          </div>
        `;
      } else {
        const now = Date.now();
        html += deletedThreads.map(p => {
          const deadline = p.restoreDeadline || ((p.deletedAt || now) + (7 * 24 * 60 * 60 * 1000));
          const diffMs = deadline - now;
          const daysLeft = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
          const isExpired = diffMs <= 0;
          const meta = BOARD_META[p.board] || { name: p.board, color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };

          return `
            <div class="p-3.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap text-xs">
                    <span class="text-[9px] font-bold px-1.5 py-0.2 rounded border ${meta.color}">${meta.name}</span>
                    <span class="font-bold text-slate-900 dark:text-white line-clamp-1">${escapeHtml(p.title)}</span>
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${isExpired ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}">
                      ${isExpired ? 'Expired' : `${daysLeft} days to recover`}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                    <p class="text-[10px] text-slate-400">
                      Author: <span class="font-semibold text-slate-700 dark:text-slate-300">${escapeHtml(p.author || 'Anonymous')}</span> · 
                      Deleted by: <span class="font-mono text-slate-600 dark:text-slate-300">@${p.deletedByUsername || 'author'}</span> · ${formatTimeAgo(p.deletedAt)}
                      ${p.comments ? `· ${p.comments.length} comments` : ''}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button onclick="restorePost('${p.id}')" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow flex items-center gap-1" title="Restore Thread">
                    <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Restore
                  </button>
                  <button onclick="permanentlyPurgePost('${p.id}')" class="px-2 py-1 rounded border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition" title="Hard Purge Record">
                    Purge
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      html += `</div>`; // Close Section 3

      container.innerHTML = html;
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    async function voteApproveDeletion(targetUid) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) return;
      const req = allDeletionRequests[targetUid];
      if (!req) return;

      const myUid = currentUserSession.uid;
      if (!req.approvals) req.approvals = {};
      req.approvals[myUid] = {
        username: currentUserSession.username,
        timestamp: Date.now()
      };

      if (db) {
        await db.ref(`deletionRequests/${targetUid}/approvals/${myUid}`).set(req.approvals[myUid]);
      }

      const activeMods = Object.values(allUsers || {}).filter(u => u.role === 'moderator' || u.role === 'supermod');
      const totalModsRequired = activeMods.length > 0 ? activeMods.length : 1;
      const approvalCount = Object.keys(req.approvals).length;

      if (approvalCount >= totalModsRequired) {
        alert(`Unanimous Moderator Consensus Reached (${approvalCount}/${totalModsRequired})!\nAccount @${req.targetUsername} is now deactivated (7-day recovery grace period active).`);
        await executeAccountDeletion(targetUid, req.reason, 'Unanimous Moderator Consensus');
      } else {
        alert(`Your approval vote has been cast (${approvalCount}/${totalModsRequired} moderators approved).\nDeactivation requires all active moderators.`);
        renderDeletionRequestsList();
      }
    }

    async function voteRejectDeletion(targetUid) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) return;
      const req = allDeletionRequests[targetUid];
      if (!req) return;

      if (!confirm(`Reject deletion proposal for @${req.targetUsername}?\n\nThis will restore student access to verified status and dismiss the deletion review.`)) return;

      await dismissDeletionRequest(targetUid);
      alert(`Deletion proposal rejected. Account @${req.targetUsername} has been restored to verified status.`);
    }

    async function cancelMyDeletionVote(targetUid) {
      if (!currentUserSession) return;
      const myUid = currentUserSession.uid;

      if (db) {
        await db.ref(`deletionRequests/${targetUid}/approvals/${myUid}`).remove();
      }
      if (allDeletionRequests[targetUid]?.approvals) {
        delete allDeletionRequests[targetUid].approvals[myUid];
      }
      renderDeletionRequestsList();
    }

    async function dismissDeletionRequest(targetUid) {
      if (!db || !currentUserSession) return;
      if (!isModOrAbove(currentUserSession.role)) return;

      if (allUsers[targetUid] && allUsers[targetUid].status === 'suspended') {
        await db.ref('users/' + targetUid).update({ status: 'verified' });
        allUsers[targetUid].status = 'verified';
      }

      await db.ref('deletionRequests/' + targetUid).remove();
      delete allDeletionRequests[targetUid];

      updateAdminBadges();
      renderDeletionRequestsList();
      renderRosterList();
    }

    async function executeAccountDeletion(uid, reason, approvedBy) {
      if (!db) return;

      const now = Date.now();
      const restoreDeadline = now + (7 * 24 * 60 * 60 * 1000); // 7-day recovery grace period

      // 1. Soft-delete: Mark user status as 'deleted' with 7-day recovery deadline
      await db.ref('users/' + uid).update({
        status: 'deleted',
        deletedAt: now,
        restoreDeadline: restoreDeadline,
        deletionReason: reason || 'Moderation decision',
        deletedBy: approvedBy || 'Batch Moderator'
      });

      // Remove from active pending deletion consensus
      await db.ref('deletionRequests/' + uid).remove();
      delete allDeletionRequests[uid];

      if (allUsers[uid]) {
        allUsers[uid].status = 'deleted';
        allUsers[uid].deletedAt = now;
        allUsers[uid].restoreDeadline = restoreDeadline;
        allUsers[uid].deletionReason = reason || 'Moderation decision';
        allUsers[uid].deletedBy = approvedBy || 'Batch Moderator';
      }

      // If active user is the deleted user, clear session
      if (currentUserSession && currentUserSession.uid === uid) {
        currentUserSession = null;
        localStorage.removeItem('mtmc_session_v2');
      }

      updateGateState();
      updateAdminBadges();
      if (!document.getElementById('admin-modal').classList.contains('hidden')) {
        if (currentAdminTab === 'deletions') renderDeletionRequestsList();
        else if (currentAdminTab === 'roster') renderRosterList();
      }
      renderFeed();
    }

    async function restoreDeletedAccount(uid) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) {
        alert('Access restricted to Batch Moderators.');
        return;
      }

      const user = allUsers[uid];
      if (!user) return;

      if (!confirm(`Restore access for "${user.fullName || user.username}" (@${user.username})?\nTheir verified status and access will be reactivated immediately.`)) return;

      if (db) {
        await db.ref('users/' + uid).update({
          status: 'verified',
          deletedAt: null,
          restoreDeadline: null,
          deletionReason: null,
          deletedBy: null
        });
      }

      if (allUsers[uid]) {
        allUsers[uid].status = 'verified';
        delete allUsers[uid].deletedAt;
        delete allUsers[uid].restoreDeadline;
        delete allUsers[uid].deletionReason;
        delete allUsers[uid].deletedBy;
      }

      updateAdminBadges();
      renderDeletionRequestsList();
      renderRosterList();
      alert(`Account @${user.username} has been restored successfully!`);
    }

    async function permanentlyPurgeAccount(uid) {
      if (!currentUserSession || currentUserSession.role !== 'admin') {
        alert('Permanent account purge is restricted to the Administrator.');
        return;
      }

      const user = allUsers[uid];
      const username = user?.username || uid;

      const confirmText = prompt(`⚠️ PERMANENT PURGE (NO RECOVERY)\n\nThis will permanently purge @${username} and remove all profile data.\nPast posts will be preserved and attributed to [Former Member].\n\nType PURGE to confirm:`);
      if (confirmText !== 'PURGE') {
        if (confirmText !== null) alert('Purge cancelled.');
        return;
      }

      if (!db) return;

      // 1. Remove user account completely
      await db.ref('users/' + uid).remove();
      await db.ref('userPrivate/' + uid).remove().catch(() => {});
      await db.ref('publicModerators/' + uid).remove().catch(() => {});
      await db.ref('deletionRequests/' + uid).remove();
      delete allUsers[uid];
      delete allUserPrivate[uid];
      delete allPublicModerators[uid];
      delete allDeletionRequests[uid];

      // 2. Reattribute user's posts and comments to [Former Member]
      try {
        const postsSnap = await db.ref('posts').once('value');
        const postsData = postsSnap.val() || {};
        const updates = {};

        Object.entries(postsData).forEach(([pid, p]) => {
          if (p.authorUid === uid) {
            updates[`posts/${pid}/author`] = '[Former Member]';
            updates[`posts/${pid}/authorUid`] = null;
          }
          if (p.comments) {
            Object.entries(p.comments).forEach(([cid, c]) => {
              if (c.authorUid === uid) {
                updates[`posts/${pid}/comments/${cid}/author`] = '[Former Member]';
                updates[`posts/${pid}/comments/${cid}/authorUid`] = null;
              }
            });
          }
        });

        if (Object.keys(updates).length > 0) {
          await db.ref().update(updates);
        }
      } catch (err) {
        console.warn('Reattribution warning:', err);
      }

      updateGateState();
      updateAdminBadges();
      renderDeletionRequestsList();
      renderRosterList();
      renderFeed();
      alert(`Account @${username} has been permanently purged.`);
    }

    // ================= PHOTO ATTACHMENT & LIGHTBOX VIEWER =================
