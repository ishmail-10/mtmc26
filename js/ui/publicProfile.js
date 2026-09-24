/**
 * MTMC26 — Public Student Profile Modal
 */

    let currentPubProfileUid = null;
    let currentPubProfileTab = 'posts';

    function openPublicProfile(uid) {
      const user = allUsers[uid];
      if (!user) return;
      if (user.role === 'admin' || (user.username || '').toLowerCase() === 'admin') return;
      currentPubProfileUid = uid;
      currentPubProfileTab = 'posts';

      // 1. Set user info & Initials
      const nameForInitials = user.fullName || user.username || 'ST';
      const initials = nameForInitials
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      document.getElementById('pub-avatar').textContent = initials;
      document.getElementById('pub-fullname').textContent = user.fullName || user.username;
      document.getElementById('pub-handle').textContent = '@' + user.username;

      // Role badge
      const roleBadge = document.getElementById('pub-role-badge');
      if (user.role === 'supermod') {
        roleBadge.textContent = '🛡️ Super Mod';
        roleBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30';
      } else if (user.role === 'admin' || user.role === 'moderator') {
        roleBadge.textContent = 'Batch Moderator';
        roleBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      } else {
        roleBadge.textContent = 'Verified Student';
        roleBadge.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      }

      // Joined date & Authorized Mobile Phone
      const joinedEl = document.getElementById('pub-joined');
      let joinedText = '';
      if (user.registeredAt) {
        const d = new Date(user.registeredAt);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        joinedText = `Joined ${monthNames[d.getMonth()]} ${d.getFullYear()} · MTMC Batch 2026`;
      } else {
        joinedText = `MTMC MBBS Batch 2026`;
      }

      // Check if viewer has authority to view phone (Admin, Super Mod, Mod, or Owner)
      const isViewerAuthorized = currentUserSession && (isModOrAbove(currentUserSession.role) || currentUserSession.uid === uid);
      const priv = allUserPrivate[uid] || {};
      const targetPhone = priv.phone || (currentUserSession?.uid === uid ? currentUserSession.phone : '') || '';

      if (isViewerAuthorized && targetPhone) {
        joinedEl.innerHTML = `
          <div class="flex items-center gap-2 flex-wrap text-slate-500">
            <span><i data-lucide="calendar" class="w-3 h-3 inline"></i> ${joinedText}</span>
            <span>•</span>
            <span class="inline-flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px]">
              <i data-lucide="phone" class="w-3 h-3 text-cyan-500"></i> +91 ${targetPhone}
            </span>
          </div>
        `;
      } else {
        joinedEl.innerHTML = `<i data-lucide="calendar" class="w-3 h-3 inline"></i> ${joinedText}`;
      }

      // 2. Query Non-Anonymous Posts authored by this student (Strict Anonymous Wall Exception)
      const userPosts = allPosts.filter(p => !p.isDeleted && !p.isAnon && p.board !== 'anonymous' && p.authorUid === uid);

      // 3. Query Non-Anonymous Comments authored by this student across all posts
      const userComments = [];
      allPosts.forEach(p => {
        if (!p.isDeleted && p.board !== 'anonymous' && p.comments) {
          const cList = Array.isArray(p.comments) ? p.comments : Object.values(p.comments || {});
          cList.forEach(c => {
            if (!c.isAnon && c.authorUid === uid) {
              userComments.push({
                ...c,
                postTitle: p.title,
                postId: p.id,
                board: p.board
              });
            }
          });
        }
      });

      // 4. Calculate Batch Karma (total upvotes from posts & comments) & Post Reach (unique views)
      const postUpvotes = userPosts.reduce((acc, p) => acc + (p.upvotes || 0), 0);
      const commentUpvotes = userComments.reduce((acc, c) => acc + (c.upvotes || 0), 0);
      const totalViews = userPosts.reduce((acc, p) => acc + (p.viewsCount || 1), 0);
      const karmaScore = postUpvotes + commentUpvotes;

      document.getElementById('pub-stat-karma').textContent = `⭐ ${karmaScore}`;
      document.getElementById('pub-stat-views').textContent = `👁️ ${totalViews >= 1000 ? (totalViews/1000).toFixed(1) + 'k' : totalViews}`;
      document.getElementById('pub-stat-posts').textContent = userPosts.length;
      document.getElementById('pub-stat-comments').textContent = userComments.length;
      document.getElementById('pub-posts-count-tab').textContent = userPosts.length;
      document.getElementById('pub-comments-count-tab').textContent = userComments.length;

      // 5. Render active tab
      renderPublicProfileTabContent(userPosts, userComments);

      document.getElementById('public-profile-modal').classList.remove('hidden');
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    function switchPublicProfileTab(tab) {
      currentPubProfileTab = tab;
      const btnPosts = document.getElementById('pub-tab-posts-btn');
      const btnComments = document.getElementById('pub-tab-comments-btn');

      if (tab === 'posts') {
        btnPosts.className = 'px-3.5 py-1.5 border-b-2 border-brand-orange font-bold text-xs text-brand-orange transition';
        btnComments.className = 'px-3.5 py-1.5 border-b-2 border-transparent font-medium text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition';
      } else {
        btnComments.className = 'px-3.5 py-1.5 border-b-2 border-brand-orange font-bold text-xs text-brand-orange transition';
        btnPosts.className = 'px-3.5 py-1.5 border-b-2 border-transparent font-medium text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition';
      }

      if (currentPubProfileUid) {
        const uid = currentPubProfileUid;
        const userPosts = allPosts.filter(p => !p.isDeleted && !p.isAnon && p.board !== 'anonymous' && p.authorUid === uid);
        const userComments = [];
        allPosts.forEach(p => {
          if (!p.isDeleted && p.board !== 'anonymous' && p.comments) {
            const cList = Array.isArray(p.comments) ? p.comments : Object.values(p.comments || {});
            cList.forEach(c => {
              if (!c.isAnon && c.authorUid === uid) {
                userComments.push({ ...c, postTitle: p.title, postId: p.id, board: p.board });
              }
            });
          }
        });
        renderPublicProfileTabContent(userPosts, userComments);
      }
    }

    function renderPublicProfileTabContent(userPosts, userComments) {
      const container = document.getElementById('pub-tab-content');
      if (!container) return;

      if (currentPubProfileTab === 'posts') {
        if (userPosts.length === 0) {
          container.innerHTML = `
            <div class="p-8 text-center text-slate-400 space-y-2">
              <i data-lucide="file-text" class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600"></i>
              <p class="font-semibold text-slate-600 dark:text-slate-400 text-xs">No public discussions posted yet.</p>
            </div>
          `;
          if (window.lucide && window.lucide.createIcons) lucide.createIcons();
          return;
        }

        container.innerHTML = userPosts.map(p => `
          <div onclick="closePublicProfileModal(); openThread('${p.id}')" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-brand-orange transition cursor-pointer space-y-1.5 shadow-sm group">
            <div class="flex items-center justify-between text-[11px] text-slate-500">
              <span class="font-bold text-brand-orange uppercase tracking-wider text-[10px]">${p.board}</span>
              <span>${p.createdAt || 'Recent'}</span>
            </div>
            <h4 class="font-bold text-slate-900 dark:text-white text-xs group-hover:text-brand-orange transition line-clamp-1">${escapeHtml(p.title)}</h4>
            <p class="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">${escapeHtml(p.content)}</p>
            <div class="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
              <span>⭐ ${p.upvotes || 0} upvotes</span>
              <span>💬 ${(p.comments ? (Array.isArray(p.comments) ? p.comments.length : Object.keys(p.comments).length) : 0)} replies</span>
              <span>👁️ ${p.viewsCount || 1} views</span>
            </div>
          </div>
        `).join('');
      } else {
        if (userComments.length === 0) {
          container.innerHTML = `
            <div class="p-8 text-center text-slate-400 space-y-2">
              <i data-lucide="message-square" class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600"></i>
              <p class="font-semibold text-slate-600 dark:text-slate-400 text-xs">No public replies shared yet.</p>
            </div>
          `;
          if (window.lucide && window.lucide.createIcons) lucide.createIcons();
          return;
        }

        container.innerHTML = userComments.map(c => `
          <div onclick="closePublicProfileModal(); openThread('${c.postId}')" class="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-brand-orange transition cursor-pointer space-y-1.5 shadow-sm group">
            <div class="text-[10px] text-slate-400">
              Replied in <span class="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-brand-orange">${escapeHtml(c.postTitle)}</span> · ${c.time || 'Recent'}
            </div>
            <p class="text-xs text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed">${escapeHtml(c.text)}</p>
          </div>
        `).join('');
      }

      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    function closePublicProfileModal() {
      document.getElementById('public-profile-modal').classList.add('hidden');
    }

    function handlePublicProfileBackdropClick(e) {
      if (e.target.id === 'public-profile-modal') {
        closePublicProfileModal();
      }
    }

