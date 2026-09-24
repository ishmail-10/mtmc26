/**
 * MTMC26 — User Profile, Settings & Trash Modal
 */

    function handleUserBtnClick() {
      if (!currentUserSession) {
        updateGateState();
        switchGateTab('login');
      } else {
        openProfileModal();
      }
    }

    function switchProfileTab(tab) {
      currentProfileTab = tab;
      const btnIdentity = document.getElementById('profile-tab-btn-identity');
      const btnSecurity = document.getElementById('profile-tab-btn-security');
      const btnTrash = document.getElementById('profile-tab-btn-trash');
      const secIdentity = document.getElementById('profile-section-identity');
      const secSecurity = document.getElementById('profile-section-security');
      const secTrash = document.getElementById('profile-section-trash');

      const activeClass = 'flex-1 py-1.5 rounded-lg font-bold transition bg-brand-orange text-white text-center flex items-center justify-center';
      const inactiveClass = 'flex-1 py-1.5 rounded-lg font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition text-center flex items-center justify-center';

      if (tab === 'security') {
        if (btnSecurity) btnSecurity.className = activeClass;
        if (btnIdentity) btnIdentity.className = inactiveClass;
        if (btnTrash) btnTrash.className = inactiveClass;
        if (secSecurity) secSecurity.classList.remove('hidden');
        if (secIdentity) secIdentity.classList.add('hidden');
        if (secTrash) secTrash.classList.add('hidden');
      } else if (tab === 'trash') {
        if (btnTrash) btnTrash.className = activeClass;
        if (btnIdentity) btnIdentity.className = inactiveClass;
        if (btnSecurity) btnSecurity.className = inactiveClass;
        if (secTrash) secTrash.classList.remove('hidden');
        if (secIdentity) secIdentity.classList.add('hidden');
        if (secSecurity) secSecurity.classList.add('hidden');
        renderProfileTrashList();
      } else {
        if (btnIdentity) btnIdentity.className = activeClass;
        if (btnSecurity) btnSecurity.className = inactiveClass;
        if (btnTrash) btnTrash.className = inactiveClass;
        if (secIdentity) secIdentity.classList.remove('hidden');
        if (secSecurity) secSecurity.classList.add('hidden');
        if (secTrash) secTrash.classList.add('hidden');
      }
      lucide.createIcons();
    }

    function openProfileModal() {
      if (!currentUserSession) return;
      const fullName = currentUserSession.fullName || currentUserSession.username;
      const username = currentUserSession.username;

      const fullNameEl = document.getElementById('profile-modal-fullname');
      if (fullNameEl) fullNameEl.textContent = fullName;
      
      const userEl = document.getElementById('profile-modal-username');
      if (userEl) userEl.textContent = '@' + username;
      
      const avatarEl = document.getElementById('profile-modal-avatar');
      if (avatarEl) avatarEl.textContent = fullName.substring(0, 2).toUpperCase();
      
      const roleEl = document.getElementById('profile-modal-role');
      if (roleEl) {
        if (currentUserSession.role === 'supermod') {
          roleEl.textContent = '🛡️ Super Mod';
          roleEl.className = 'px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30';
        } else if (currentUserSession.role === 'admin' || currentUserSession.role === 'moderator') {
          roleEl.textContent = 'Batch Moderator';
          roleEl.className = 'px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
        } else {
          roleEl.textContent = 'Verified Student';
          roleEl.className = 'px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-brand-orange/10 text-brand-orange border border-brand-orange/20';
        }
      }

      const statusEl = document.getElementById('profile-modal-status');
      if (statusEl) {
        if (currentUserSession.status === 'verified') {
          statusEl.innerHTML = '<span class="text-emerald-500 font-bold">Verified Batchmate ✅</span>';
        } else {
          statusEl.innerHTML = '<span class="text-amber-500 font-bold">Pending Identity Verification ⏳</span>';
        }
      }

      const phoneEl = document.getElementById('profile-modal-phone');
      const curPhone = currentUserSession.phone || (allUserPrivate[currentUserSession.uid]?.phone);
      if (phoneEl) phoneEl.textContent = curPhone ? ('+91 ' + curPhone) : '—';

      const tokenEl = document.getElementById('profile-modal-token');
      const curToken = currentUserSession.token || (allUserPrivate[currentUserSession.uid]?.token);
      if (tokenEl) tokenEl.textContent = curToken || '—';

      // Eagerly restore private vault credentials if missing
      if ((!curPhone || !curToken) && db && currentUserSession.uid) {
        db.ref('userPrivate/' + currentUserSession.uid).once('value').then(snap => {
          const priv = snap.val() || {};
          if (priv.phone) {
            currentUserSession.phone = priv.phone;
            if (phoneEl) phoneEl.textContent = '+91 ' + priv.phone;
            localStorage.setItem('mtmc_session_v2', JSON.stringify(currentUserSession));
          }
          if (priv.token) {
            currentUserSession.token = priv.token;
            if (tokenEl) tokenEl.textContent = priv.token;
            localStorage.setItem('mtmc_session_v2', JSON.stringify(currentUserSession));
          }
        }).catch(() => {});
      }

      // Pre-fill Identity Form inputs
      const nameInput = document.getElementById('profile-edit-fullname');
      if (nameInput) nameInput.value = currentUserSession.fullName || currentUserSession.username;
      
      const userInput = document.getElementById('profile-edit-username');
      if (userInput) userInput.value = currentUserSession.username;
      
      const reasonInput = document.getElementById('profile-edit-reason');
      if (reasonInput) reasonInput.value = '';

      // Check if user has pending request
      const pendingNotice = document.getElementById('profile-pending-request-notice');
      const identityForm = document.getElementById('profile-identity-form');
      if (currentUserSession.pendingProfileUpdate) {
        const req = currentUserSession.pendingProfileUpdate;
        document.getElementById('pending-req-display-name').textContent = req.requestedFullName;
        document.getElementById('pending-req-display-username').textContent = '@' + req.requestedUsername;
        document.getElementById('pending-req-display-reason').textContent = req.reason || 'None provided';
        pendingNotice.classList.remove('hidden');
        identityForm.classList.add('hidden');
      } else {
        pendingNotice.classList.add('hidden');
        identityForm.classList.remove('hidden');
      }

      // Reset password change form errors and inputs
      document.getElementById('pass-current-input').value = '';
      document.getElementById('pass-new-input').value = '';
      document.getElementById('pass-confirm-input').value = '';
      document.getElementById('pass-change-error').classList.add('hidden');
      document.getElementById('pass-change-success').classList.add('hidden');
      document.getElementById('profile-edit-error').classList.add('hidden');

      // Switch to identity tab by default
      switchProfileTab('identity');

      document.getElementById('profile-modal').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeProfileModal() {
      document.getElementById('profile-modal').classList.add('hidden');
    }

    function updateProfileTrashBadge() {
      const badge = document.getElementById('profile-trash-badge');
      if (!badge) return;
      if (!currentUserSession) {
        badge.classList.add('hidden');
        return;
      }
      const myTrashCount = allPosts.filter(p => p.isDeleted && p.authorUid === currentUserSession.uid).length;
      if (myTrashCount > 0) {
        badge.textContent = myTrashCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    function renderProfileTrashList() {
      const container = document.getElementById('profile-trash-list');
      if (!container || !currentUserSession) return;

      updateProfileTrashBadge();
      const myTrashPosts = allPosts.filter(p => p.isDeleted && p.authorUid === currentUserSession.uid);

      if (myTrashPosts.length === 0) {
        container.innerHTML = `
          <div class="p-6 text-center text-slate-400 space-y-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <i data-lucide="trash" class="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto"></i>
            <p class="font-semibold text-slate-700 dark:text-slate-300 text-xs">Trash is Empty</p>
            <p class="text-[10px]">No deleted discussions in the 7-day recovery grace period.</p>
          </div>
        `;
        if (window.lucide && window.lucide.createIcons) lucide.createIcons();
        return;
      }

      const now = Date.now();
      container.innerHTML = myTrashPosts.map(p => {
        const deadline = p.restoreDeadline || ((p.deletedAt || now) + (7 * 24 * 60 * 60 * 1000));
        const diffMs = deadline - now;
        const daysLeft = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
        const isExpired = diffMs <= 0;
        const meta = BOARD_META[p.board] || { name: p.board, color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };

        return `
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="space-y-1 flex-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${meta.color}">${meta.name}</span>
                  <span class="text-[10px] font-bold px-1.5 py-0.2 rounded ${isExpired ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'}">
                    ${isExpired ? 'Expired' : `${daysLeft}d left to recover`}
                  </span>
                </div>
                <h4 class="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">${escapeHtml(p.title)}</h4>
                <p class="text-[10px] text-slate-400">
                  Deleted ${formatTimeAgo(p.deletedAt)} · ${p.comments ? p.comments.length : 0} replies · ${p.upvotes || 0} upvotes
                </p>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button onclick="restorePost('${p.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow flex items-center gap-1" title="Restore Thread">
                  <i data-lucide="rotate-ccw" class="w-3 h-3"></i> Restore
                </button>
                <button onclick="permanentlyPurgePost('${p.id}')" class="p-1 text-slate-400 hover:text-rose-500 transition" title="Purge Permanently">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    // TOAST NOTIFICATION CONTROLLER
    let undoToastTimer = null;
    function showUndoToast(postId, postTitle) {
      const toast = document.getElementById('undo-toast');
      const textEl = document.getElementById('undo-toast-text');
      const btn = document.getElementById('undo-toast-btn');
      if (!toast || !btn) return;

      if (undoToastTimer) clearTimeout(undoToastTimer);

      const titleShort = (postTitle || 'Thread').length > 25 ? (postTitle.slice(0, 22) + '...') : (postTitle || 'Thread');
      if (textEl) textEl.textContent = `Moved to Trash: "${titleShort}"`;
      
      btn.onclick = () => {
        dismissUndoToast();
        restorePost(postId);
      };

      toast.classList.remove('hidden');
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();

      undoToastTimer = setTimeout(() => {
        dismissUndoToast();
      }, 9000);
    }

    function dismissUndoToast() {
      const toast = document.getElementById('undo-toast');
      if (toast) toast.classList.add('hidden');
      if (undoToastTimer) {
        clearTimeout(undoToastTimer);
        undoToastTimer = null;
      }
    }

    async function cancelProfileUpdateRequest() {
      if (!currentUserSession || !currentUserSession.pendingProfileUpdate) return;
      if (!confirm('Are you sure you want to cancel your pending profile update request?')) return;

      if (db) {
        await db.ref('users/' + currentUserSession.uid + '/pendingProfileUpdate').remove();
      }
      delete currentUserSession.pendingProfileUpdate;
      localStorage.setItem('mtmc_session_v2', JSON.stringify(currentUserSession));
      openProfileModal();
      alert('Your profile update request has been cancelled.');
    }

    async function submitProfileChangeRequest() {
      if (!currentUserSession) return;

      const nameInput = document.getElementById('profile-edit-fullname');
      const userInput = document.getElementById('profile-edit-username');
      const reasonInput = document.getElementById('profile-edit-reason');
      const errBox = document.getElementById('profile-edit-error');

      errBox.classList.add('hidden');
      errBox.textContent = '';

      const reqName = (nameInput.value || '').trim();
      const reqUsername = (userInput.value || '').trim().toLowerCase().replace(/^@/, '');
      const reqReason = (reasonInput.value || '').trim();

      if (!reqName || reqName.length < 3) {
        errBox.textContent = 'Please enter your full name (minimum 3 characters).';
        errBox.classList.remove('hidden');
        return;
      }

      if (!reqUsername || !/^[a-z0-9_]{3,20}$/.test(reqUsername)) {
        errBox.textContent = 'Username must be 3-20 characters and contain only lowercase letters, numbers, and underscores.';
        errBox.classList.remove('hidden');
        return;
      }

      const reservedHandles = ['admin', 'administrator', 'root', 'moderator', 'sysadmin'];
      if (reservedHandles.includes(reqUsername)) {
        errBox.textContent = 'This handle is reserved. Please choose another username.';
        errBox.classList.remove('hidden');
        return;
      }

      // Check collision with existing users
      const collision = Object.values(allUsers || {}).some(u => 
        u.uid !== currentUserSession.uid && 
        (u.username || '').toLowerCase() === reqUsername
      );
      if (collision) {
        errBox.textContent = `The handle @${reqUsername} is already taken by another batchmate. Please choose another.`;
        errBox.classList.remove('hidden');
        return;
      }

      // Check collision with other pending requests
      const pendingCollision = Object.values(allUsers || {}).some(u => 
        u.uid !== currentUserSession.uid && 
        u.pendingProfileUpdate && 
        (u.pendingProfileUpdate.requestedUsername || '').toLowerCase() === reqUsername
      );
      if (pendingCollision) {
        errBox.textContent = `The handle @${reqUsername} has already been requested by another student.`;
        errBox.classList.remove('hidden');
        return;
      }

      const curName = currentUserSession.fullName || currentUserSession.username;
      if (reqName === curName && reqUsername === currentUserSession.username) {
        errBox.textContent = 'Requested name and handle are identical to your current profile.';
        errBox.classList.remove('hidden');
        return;
      }

      const updatePayload = {
        requestedFullName: reqName,
        requestedUsername: reqUsername,
        currentFullName: curName,
        currentUsername: currentUserSession.username,
        reason: reqReason || 'Profile update',
        requestedAt: Date.now()
      };

      if (db) {
        await db.ref('users/' + currentUserSession.uid + '/pendingProfileUpdate').set(updatePayload);
      }

      currentUserSession.pendingProfileUpdate = updatePayload;
      localStorage.setItem('mtmc_session_v2', JSON.stringify(currentUserSession));
      openProfileModal();
      alert('✅ Profile change request submitted! It will take effect once reviewed by a Batch Moderator.');
    }

    async function submitPasswordChange() {
      if (!currentUserSession) return;

      const curInput = document.getElementById('pass-current-input');
      const newInput = document.getElementById('pass-new-input');
      const confInput = document.getElementById('pass-confirm-input');
      const errBox = document.getElementById('pass-change-error');
      const succBox = document.getElementById('pass-change-success');

      errBox.classList.add('hidden');
      succBox.classList.add('hidden');
      errBox.textContent = '';
      succBox.textContent = '';

      const curPass = curInput.value;
      const newPass = newInput.value;
      const confPass = confInput.value;

      if (!curPass) {
        errBox.textContent = 'Please enter your current password.';
        errBox.classList.remove('hidden');
        return;
      }

      if (!newPass || newPass.length < 6) {
        errBox.textContent = 'New password must be at least 6 characters.';
        errBox.classList.remove('hidden');
        return;
      }

      if (newPass !== confPass) {
        errBox.textContent = 'New passwords do not match.';
        errBox.classList.remove('hidden');
        return;
      }

      if (curPass === newPass) {
        errBox.textContent = 'New password cannot be the same as your current password.';
        errBox.classList.remove('hidden');
        return;
      }

      const authEmail = (auth && auth.currentUser && auth.currentUser.email)
        ? auth.currentUser.email
        : getAuthEmail(currentUserSession.username);

      // Verify current password with Supabase Auth directly
      if (sb) {
        const { error: verifyErr } = await sb.auth.signInWithPassword({
          email: authEmail,
          password: curPass
        });
        if (verifyErr) {
          errBox.textContent = 'Incorrect current password. Please try again.';
          errBox.classList.remove('hidden');
          return;
        }

        const { error: updateErr } = await sb.auth.updateUser({
          password: newPass
        });
        if (updateErr) {
          console.error("Supabase password update error:", updateErr);
          errBox.textContent = updateErr.message || 'Failed to update password in Supabase.';
          errBox.classList.remove('hidden');
          return;
        }
      }

      const newHash = await hashPassword(newPass);
      if (db && currentUserSession.uid) {
        await db.ref('userPrivate/' + currentUserSession.uid + '/passwordHash').set(newHash).catch(() => {});
      }

      currentUserSession.passwordHash = newHash;
      localStorage.setItem('mtmc_session_v2', JSON.stringify(currentUserSession));

      curInput.value = '';
      newInput.value = '';
      confInput.value = '';

      succBox.textContent = '✅ Password updated successfully! Your account is secured.';
      succBox.classList.remove('hidden');
    }

