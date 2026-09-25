/**
 * MTMC26 — Main Application Bootstrap & Listeners
 */

    function setupFirebaseListeners() {
      if (!db) {
        allPosts = DEFAULT_POSTS;
        renderFeed();
        updateStats();
        updateProfileTrashBadge();
        return;
      }

      // Listen for Posts in real-time
      db.ref('posts').on('value', snapshot => {
        const val = snapshot.val();
        if (!val) {
          // Empty database: Seed with official MTMC posts
          DEFAULT_POSTS.forEach(p => {
            db.ref('posts/' + p.id).set(p);
          });
          return;
        }

        // Clean out legacy demo placeholder posts and deprecated starter posts if present
        const legacyPosts = ['post-1', 'post-2', 'post-3', 'post-4', 'post-5', 'post-mtmc-attendance', 'post-mtmc-freshers-kit', 'post-mtmc-research-praise', 'post-mtmc-clubs'];
        legacyPosts.forEach(oldId => {
          if (val[oldId]) {
            db.ref('posts/' + oldId).remove();
          }
        });

        // Ensure official starter post is seeded
        DEFAULT_POSTS.forEach(p => {
          if (!val[p.id]) {
            db.ref('posts/' + p.id).set(p);
          }
        });

        const list = Object.entries(val)
          .filter(([k]) => !legacyPosts.includes(k))
          .map(([k, v]) => {
            const commentsArr = v.comments
              ? (Array.isArray(v.comments)
                  ? v.comments.map((c, idx) => ({ ...c, key: c.key || String(idx), id: c.id || `c_${idx}` }))
                  : Object.entries(v.comments).map(([cKey, cVal]) => ({
                      ...cVal,
                      key: cKey,
                      id: cVal.id || cKey
                    })))
              : [];
            return {
              ...v,
              id: k,
              comments: commentsArr
            };
          });

        allPosts = list;
        checkUrlHash();
        renderFeed();
        updateStats();
        updateProfileTrashBadge();
        updateAdminBadges();
        if (!document.getElementById('profile-modal').classList.contains('hidden') && currentProfileTab === 'trash') {
          renderProfileTrashList();
        }
        if (!document.getElementById('admin-modal').classList.contains('hidden')) {
          if (currentAdminTab === 'deletions') renderDeletionRequestsList();
          if (currentAdminTab === 'review-queue') renderReviewQueueList();
        }
      });

      // Listen for Users in real-time
      db.ref('users').on('value', snapshot => {
        allUsers = snapshot.val() || {};

        // Auto-purge phantom/empty test accounts if admin is active
        if (currentUserSession && (currentUserSession.role === 'admin' || (currentUserSession.username || '').toLowerCase() === 'admin')) {
          Object.entries(allUsers).forEach(([uid, u]) => {
            if (u && (u.username || '').toLowerCase() === 'test' && (!u.phone || u.phone === '') && u.status === 'pending') {
              db.ref('users/' + uid).remove().catch(() => {});
              db.ref('userPrivate/' + uid).remove().catch(() => {});
            }
          });
        }

        // If current user session exists, synchronize status, role, and profile update states
        if (currentUserSession) {
          const fresh = allUsers[currentUserSession.uid];
          if (fresh) {
            const oldStatus = currentUserSession.status;
            const hadPendingProfile = Boolean(currentUserSession.pendingProfileUpdate);
            const oldFullName = currentUserSession.fullName || currentUserSession.username;
            const oldUsername = currentUserSession.username;

            const preservedPhone = currentUserSession.phone || (allUserPrivate[currentUserSession.uid]?.phone) || fresh.phone || '';
            const preservedToken = currentUserSession.token || (allUserPrivate[currentUserSession.uid]?.token) || fresh.token || '';

            currentUserSession = {
              ...fresh,
              phone: preservedPhone,
              token: preservedToken
            };
            localStorage.setItem('mtmc_session_v2', JSON.stringify(currentUserSession));

            if (oldStatus === 'pending' && fresh.status === 'verified') {
              alert('🎉 Congratulations! Your account has been verified by the Batch Moderator. Full forum access unlocked!');
            }

            if (hadPendingProfile && !fresh.pendingProfileUpdate && (fresh.fullName !== oldFullName || fresh.username !== oldUsername)) {
              alert(`🎉 Your profile update has been approved by the Batch Moderator!\nYour handle is now @${fresh.username}.`);
              if (!document.getElementById('profile-modal').classList.contains('hidden')) {
                openProfileModal();
              }
            }
          } else {
            // User was removed from Firebase
            if (snapshot.exists() && Object.keys(allUsers).length > 0) {
              currentUserSession = null;
              localStorage.removeItem('mtmc_session_v2');
              updateGateState();
            }
          }
        }

        updateGateState();
        updateAdminBadges();
        if (!document.getElementById('admin-modal').classList.contains('hidden')) {
          if (currentAdminTab === 'pending') renderPendingList();
          else if (currentAdminTab === 'profile-requests') renderProfileRequestsList();
          else if (currentAdminTab === 'deletions') renderDeletionRequestsList();
          else renderRosterList();
        }
      });

      // Listen for Deletion Requests in real-time
      db.ref('deletionRequests').on('value', snapshot => {
        allDeletionRequests = snapshot.val() || {};
        updateAdminBadges();
        if (!document.getElementById('admin-modal').classList.contains('hidden')) {
          if (currentAdminTab === 'deletions') renderDeletionRequestsList();
          else if (currentAdminTab === 'roster') renderRosterList();
        }
      });

      // If user is Admin or Moderator or Super Mod, listen to userPrivate for roster phone numbers
      if (currentUserSession && isModOrAbove(currentUserSession.role)) {
        db.ref('userPrivate').on('value', snapshot => {
          allUserPrivate = snapshot.val() || {};
          if (!document.getElementById('admin-modal').classList.contains('hidden')) {
            if (currentAdminTab === 'pending') renderPendingList();
            else if (currentAdminTab === 'roster') renderRosterList();
          }
        });
      }

      // Listen for today's hostel mess food ratings in real-time
      initMessRatingListener();
    }


    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }

    window.addEventListener('DOMContentLoaded', () => {
      initTheme();
      if (typeof initMessMenu === 'function') initMessMenu();
      else if (typeof initMessSchedule === 'function') initMessSchedule();
      lucide.createIcons();
      initPublicModeratorsListener();
      loadBatchEvents();
      checkUrlHash();

      if (auth) {
        auth.onAuthStateChanged(async (user) => {
          if (user) {
            try {
              let userSnap = await db.ref('users/' + user.uid).once('value');
              let userData = userSnap.val();
              if (!userData) {
                const allSnap = await db.ref('users').once('value');
                const allU = allSnap.val() || {};
                userData = Object.values(allU).find(u => u.authUid === user.uid || u.uid === user.uid);
              }
              if (userData) {
                const privSnap = await db.ref('userPrivate/' + userData.uid).once('value');
                const priv = privSnap.val() || {};
                userData.phone = priv.phone || userData.phone || '';
                userData.token = priv.token || userData.token || '';
                currentUserSession = userData;
                localStorage.setItem('mtmc_session_v2', JSON.stringify(userData));
              }
            } catch (e) {
              console.warn("Session restore:", e);
            }
            setupFirebaseListeners();
            initMessRatingListener();
            initNotificationsListener();
            updateMessRatingUI();
            updateGateState();
          } else {
            currentUserSession = null;
            localStorage.removeItem('mtmc_session_v2');
            updateGateState();
          }
        });
      } else {
        updateGateState();
      }
    });
