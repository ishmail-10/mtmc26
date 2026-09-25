/**
 * MTMC26 — Forum Feed & Thread Viewer
 */

    function renderFeed() {
      const container = document.getElementById('posts-list');
      const detailContainer = document.getElementById('thread-detail-container');
      const eventsContainer = document.getElementById('events-gallery-container');
      const feedHeader = document.getElementById('feed-header');
      
      if (activeThreadId) {
        if (eventsContainer) eventsContainer.classList.add('hidden');
        const vivaContainer = document.getElementById('daily-viva-container');
        if (vivaContainer) vivaContainer.classList.add('hidden');
        renderThreadDetail(activeThreadId);
        return;
      }

      if (activeBoard === 'events') {
        container.classList.add('hidden');
        detailContainer.classList.add('hidden');
        if (feedHeader) feedHeader.classList.add('hidden');
        const vivaContainer = document.getElementById('daily-viva-container');
        if (vivaContainer) vivaContainer.classList.add('hidden');
        if (eventsContainer) {
          eventsContainer.classList.remove('hidden');
          renderEventsGallery();
        }
        return;
      } else {
        if (feedHeader) feedHeader.classList.remove('hidden');
        if (eventsContainer) eventsContainer.classList.add('hidden');
      }

      container.classList.remove('hidden');
      detailContainer.classList.add('hidden');
      if (typeof renderDailyVivaWidget === 'function') {
        renderDailyVivaWidget();
      }

      let filtered = (activeBoard === 'all' ? allPosts : allPosts.filter(p => p.board === activeBoard)).filter(p => !p.isDeleted && p.status !== 'quarantined');

      const desktopSearch = document.getElementById('search-input')?.value || '';
      const mobileSearch = document.getElementById('mobile-search-input')?.value || '';
      const searchVal = (desktopSearch || mobileSearch).toLowerCase().trim();
      if (searchVal) {
        filtered = filtered.filter(p => {
          const matchTitle = (p.title || '').toLowerCase().includes(searchVal);
          const matchContent = (p.content || '').toLowerCase().includes(searchVal);
          const matchAuthor = (p.author || '').toLowerCase().includes(searchVal);
          let matchUser = false;
          if (p.authorUid && allUsers[p.authorUid]) {
            const u = allUsers[p.authorUid];
            if ((u.fullName || '').toLowerCase().includes(searchVal) || (u.username || '').toLowerCase().includes(searchVal)) {
              matchUser = true;
            }
          }
          return matchTitle || matchContent || matchAuthor || matchUser;
        });
      }

      if (currentSort === 'hot') {
        filtered.sort((a, b) => (b.upvotes + (b.comments ? b.comments.length : 0)) - (a.upvotes + (a.comments ? a.comments.length : 0)));
      } else {
        filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }
      // Pinned posts always stay at the top of the feed
      filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

      document.getElementById('posts-counter-badge').textContent = filtered.length;

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-8 text-center space-y-3 shadow-sm">
            <i data-lucide="inbox" class="w-8 h-8 text-slate-400 mx-auto"></i>
            <p class="font-bold text-slate-900 dark:text-white text-sm">No discussions in this board yet</p>
            <p class="text-xs text-slate-500 dark:text-slate-400">Be the first to post a query, note, or item!</p>
            <button onclick="handleNewPostClick()" class="px-3.5 py-1.5 rounded-md bg-brand-orange text-white text-xs font-bold inline-flex items-center gap-1.5 shadow">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> Start Thread
            </button>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      container.innerHTML = filtered.map(post => {
        const meta = BOARD_META[post.board] || { name: post.board, color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
        const commentsCount = post.comments ? post.comments.length : 0;
        const isModOrAdmin = currentUserSession && isModOrAbove(currentUserSession.role);
        const canDelete = currentUserSession && (isModOrAdmin || currentUserSession.uid === post.authorUid);
        const isQuarantined = (post.reportsCount || 0) >= 3;

        // If quarantined and user is not admin/moderator, show quarantine placeholder
        if (isQuarantined && !isModOrAdmin) {
          return `
            <article class="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 rounded-md p-4 transition shadow-sm">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <i data-lucide="shield-alert" class="w-4 h-4"></i>
                </div>
                <div>
                  <h4 class="font-bold text-xs text-amber-900 dark:text-amber-300">Discussion Quarantined</h4>
                  <p class="text-[11px] text-amber-800/80 dark:text-amber-400/80">This thread received multiple community flags and is hidden pending batch moderator review.</p>
                </div>
              </div>
            </article>
          `;
        }

        const cardBorderClass = post.isPinned
          ? 'border-amber-400/90 dark:border-amber-500/70 border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10'
          : (isQuarantined ? 'border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/30' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700');

        return `
          <article onclick="openThread('${post.id}')" class="bg-white dark:bg-slate-900 border ${cardBorderClass} rounded-md p-4 sm:p-5 transition cursor-pointer shadow-sm hover:shadow-md group">
            ${isQuarantined ? `
              <div class="mb-3 p-2.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-between text-xs">
                <div class="flex items-center gap-1.5 font-bold">
                  <i data-lucide="shield-alert" class="w-4 h-4 text-amber-500"></i>
                  <span>QUARANTINED (${post.reportsCount} flags) — Visible to Moderators</span>
                </div>
                <div class="flex items-center gap-1">
                  <button onclick="event.stopPropagation(); dismissPostFlags('${post.id}')" class="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition">
                    Dismiss Flags
                  </button>
                  <button onclick="event.stopPropagation(); deletePost('${post.id}')" class="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition">
                    Delete
                  </button>
                </div>
              </div>
            ` : ''}

            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1.5 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  ${post.isPinned ? '<span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">📌 Pinned</span>' : ''}
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${meta.color}">
                    ${meta.name}
                  </span>
                  ${getTagBadge(post)}
                  ${post.price ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">${escapeHtml(post.price)}</span>` : ''}
                  ${post.approvedBy ? `<span class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-2 py-0.5 rounded inline-flex items-center gap-1"><i data-lucide="shield-check" class="w-3 h-3 text-emerald-500"></i> Approved by @${escapeHtml(post.approvedBy)}</span>` : ''}
                  <div class="inline-flex items-center gap-1.5 text-xs">
                    ${getPostAuthorDisplay(post)}
                    <span class="text-slate-400 dark:text-slate-600 font-normal">·</span>
                    <span class="text-[11px] text-slate-400 dark:text-slate-500 font-normal">${post.createdAt}</span>
                  </div>
                </div>
                <h3 class="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-brand-orange transition line-clamp-2">
                  ${escapeHtml(post.title)}
                </h3>
                <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  ${escapeHtml(post.content)}
                </p>

                ${renderPollHtml(post)}

                ${post.imageUrl ? `
                  <div class="mt-2.5 max-w-sm rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <img src="${post.imageUrl}" alt="Attachment" class="max-h-48 w-full object-cover cursor-zoom-in hover:opacity-95 transition" onclick="event.stopPropagation(); openLightbox('${post.imageUrl}')" loading="lazy">
                  </div>
                ` : ''}
              </div>

              <div class="flex items-center gap-1 shrink-0">
                ${isModOrAdmin ? `
                  <button onclick="event.stopPropagation(); togglePinPost('${post.id}')" class="p-1 text-slate-400 hover:text-amber-500 transition" title="${post.isPinned ? 'Unpin Announcement' : 'Pin Announcement to Top'}">
                    <i data-lucide="pin" class="w-3.5 h-3.5 ${post.isPinned ? 'fill-amber-500 text-amber-500' : ''}"></i>
                  </button>
                ` : ''}
                ${post.tag && currentUserSession && (isModOrAdmin || currentUserSession.uid === post.authorUid) ? `
                  <button onclick="event.stopPropagation(); toggleResolvePost('${post.id}')" class="px-2 py-0.5 rounded border text-[10px] font-bold transition ${post.isResolved ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'}" title="${post.isResolved ? 'Reopen Request' : 'Mark as Resolved'}">
                    ${post.isResolved ? 'Reopen' : 'Mark Resolved ✅'}
                  </button>
                ` : ''}
                ${canDelete ? `
                  <button onclick="event.stopPropagation(); deletePost('${post.id}')" class="p-1 text-slate-400 hover:text-rose-500 transition" title="Delete Post">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                ` : `
                  <button onclick="event.stopPropagation(); reportPost(event, '${post.id}')" class="p-1 text-slate-400 hover:text-amber-500 transition" title="Report Post">
                    <i data-lucide="flag" class="w-3.5 h-3.5"></i>
                  </button>
                `}
              </div>
            </div>

            <!-- Emoji Reactions Row (WhatsApp-Style) -->
            ${renderReactionsHtml(post)}

            <!-- Footer -->
            <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div class="flex items-center gap-4">
                <button onclick="upvotePost(event, '${post.id}')" class="flex items-center gap-1.5 transition ${post.upvotedBy && currentUserSession && post.upvotedBy[currentUserSession.uid] ? 'text-brand-orange font-bold' : 'text-slate-500 hover:text-brand-orange'}" title="${post.upvotedBy && currentUserSession && post.upvotedBy[currentUserSession.uid] ? 'Revoke upvote' : 'Upvote'}">
                  <i data-lucide="arrow-big-up" class="w-4 h-4 ${post.upvotedBy && currentUserSession && post.upvotedBy[currentUserSession.uid] ? 'fill-orange-500 text-orange-500' : 'text-slate-400 group-hover:text-brand-orange'}"></i>
                  <span class="font-mono font-bold">${post.upvotes || 0}</span>
                </button>
                <div class="flex items-center gap-1.5">
                  <i data-lucide="message-square" class="w-3.5 h-3.5 text-slate-400"></i>
                  <span class="font-mono">${commentsCount}</span>
                </div>
                <div class="flex items-center gap-1.5 text-slate-400" title="${post.viewsCount || 1} unique views">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  <span class="font-mono text-[11px]">${post.viewsCount || 1}</span>
                </div>
              </div>
              <span class="text-[11px] text-slate-400 group-hover:text-brand-orange transition flex items-center gap-1">
                View Thread <i data-lucide="chevron-right" class="w-3 h-3"></i>
              </span>
            </div>
          </article>
        `;
      }).join('');

      lucide.createIcons();
    }

    function recordPostView(postId) {
      // GHOST ADMIN SHIELD: Admin account must be completely invisible and never leave view footprints or increment counts
      if (!currentUserSession || currentUserSession.role === 'admin' || (currentUserSession.username || '').toLowerCase() === 'admin') {
        return;
      }

      const post = allPosts.find(p => p.id === postId);
      if (!post) return;
      if (!post.viewedBy) post.viewedBy = {};

      const viewerId = currentUserSession.uid;
      if (!viewerId) return;

      // Unique View Guard: Do not register duplicate views if already counted for this student
      if (post.viewedBy[viewerId]) return;

      post.viewedBy[viewerId] = true;
      post.viewsCount = (post.viewsCount || 0) + 1;

      if (db) {
        db.ref(`posts/${postId}/viewedBy/${viewerId}`).set(true).catch(() => {});
        db.ref(`posts/${postId}/viewsCount`).transaction(v => (v || 0) + 1).catch(() => {});
      }
    }

    function openThread(postId) {
      activeThreadId = postId;
      if (window.location.hash !== '#thread/' + postId) {
        history.replaceState(null, null, '#thread/' + postId);
      }
      recordPostView(postId);
      renderThreadDetail(postId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // REDDIT THREAD TREE BUILDER
    function buildCommentTree(rawComments) {
      const commentMap = {};
      const rootComments = [];
      const isModOrAdmin = currentUserSession && isModOrAbove(currentUserSession.role);
      const visibleRaw = (rawComments || []).filter(c => c.status !== 'quarantined' || isModOrAdmin || (currentUserSession && c.authorUid === currentUserSession.uid));

      visibleRaw.forEach(c => {
        commentMap[c.id] = { ...c, replies: [] };
      });

      visibleRaw.forEach(c => {
        if (c.parentId && commentMap[c.parentId]) {
          commentMap[c.parentId].replies.push(commentMap[c.id]);
        } else {
          rootComments.push(commentMap[c.id]);
        }
      });

      // Sort root comments
      if (commentSort === 'top') {
        rootComments.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
      } else {
        rootComments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }

      // Sort children chronologically (earliest first so conversation flows naturally)
      function sortReplies(list) {
        list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        list.forEach(item => {
          if (item.replies && item.replies.length > 0) {
            sortReplies(item.replies);
          }
        });
      }
      sortReplies(rootComments);

      return rootComments;
    }

    function countSubtreeReplies(node) {
      let count = (node.replies || []).length;
      (node.replies || []).forEach(r => {
        count += countSubtreeReplies(r);
      });
      return count;
    }

    // REDDIT COMMENT NODE RENDERER (RECURSIVE WITH MOBILE SAFE INDENTATION)
    function renderCommentNode(c, post, depth = 0) {
      const isCollapsed = collapsedComments.has(c.id);
      const isUpvoted = Boolean(c.upvotedBy && currentUserSession && c.upvotedBy[currentUserSession.uid]);
      const isModOrAdmin = currentUserSession && isModOrAbove(currentUserSession.role);
      const canDelete = currentUserSession && !c.isDeleted && (isModOrAdmin || currentUserSession.uid === c.authorUid);
      const totalChildren = countSubtreeReplies(c);

      // Mobile-safe indentation classes based on nesting depth:
      let indentClass = '';
      if (depth === 1) {
        indentClass = 'ml-2.5 sm:ml-4 border-l-2 border-brand-orange/30 pl-2.5 sm:pl-3.5';
      } else if (depth >= 2) {
        indentClass = 'ml-2 sm:ml-3 border-l-2 border-slate-300 dark:border-slate-700 pl-2 sm:pl-3';
      }

      return `
        <div id="comment-node-${c.id}" class="space-y-1.5 ${indentClass} transition-colors">
          <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 rounded-md p-3 space-y-1.5 shadow-xs">
            
            <!-- Header: Collapse, Author, OP Badge, Time, Upvote -->
            <div class="flex items-center justify-between text-xs gap-2">
              <div class="inline-flex items-center gap-1.5 flex-wrap">
                <button type="button" onclick="toggleCollapseComment('${c.id}')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-0.5 rounded" title="${isCollapsed ? 'Expand thread' : 'Collapse thread'}">
                  <i data-lucide="${isCollapsed ? 'plus-square' : 'minus-square'}" id="comment-toggle-icon-${c.id}" class="w-3.5 h-3.5"></i>
                </button>
                ${getCommentAuthorDisplay(c, post.authorUid)}
                ${c.replyToUsername ? `<span class="text-[10px] text-slate-400 dark:text-slate-500 font-normal">↳ @${escapeHtml(c.replyToUsername)}</span>` : ''}
                ${c.status === 'quarantined' ? `<span class="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-1.5 py-0.2 rounded">🛡️ Under Mod Review</span>` : ''}
                ${c.approvedBy ? `<span class="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5"><i data-lucide="shield-check" class="w-2.5 h-2.5"></i> Approved by @${escapeHtml(c.approvedBy)}</span>` : ''}
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-[10px] text-slate-400 dark:text-slate-500">${c.time || 'Just now'}</span>
              </div>
            </div>

            <!-- Collapsed bar indicator -->
            <div id="comment-collapsed-indicator-${c.id}" onclick="toggleCollapseComment('${c.id}')" class="${isCollapsed ? '' : 'hidden'} text-[11px] text-slate-400 dark:text-slate-500 italic py-0.5 cursor-pointer hover:underline flex items-center gap-1.5">
              <i data-lucide="message-square" class="w-3 h-3 text-slate-400"></i>
              <span>${totalChildren} ${totalChildren === 1 ? 'reply' : 'replies'} hidden (tap to expand)</span>
            </div>

            <!-- Body: Text + Action Bar -->
            <div id="comment-body-${c.id}" class="${isCollapsed ? 'hidden' : ''} space-y-2">
              ${c.isDeleted ? `
                <p class="text-xs text-slate-400 dark:text-slate-500 italic py-1 px-2.5 rounded bg-slate-50/60 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800">
                  [This comment was deleted by ${c.deletedBy === 'moderator' ? 'moderator' : 'author'}]
                </p>
              ` : `
                <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">${escapeHtml(c.text)}</p>
              `}

              <!-- Comment Action Bar -->
              <div class="flex items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60">
                ${!c.isDeleted ? `
                  <button type="button" onclick="upvoteComment('${post.id}', '${c.key || c.id}', '${c.id}')" class="inline-flex items-center gap-1 font-bold hover:text-brand-orange transition ${isUpvoted ? 'text-brand-orange' : ''}" title="${isUpvoted ? 'Revoke upvote' : 'Upvote comment'}">
                    <i data-lucide="arrow-big-up" class="w-3.5 h-3.5 ${isUpvoted ? 'fill-orange-500 text-orange-500' : ''}"></i>
                    <span>${c.upvotes || 0}</span>
                  </button>
                ` : ''}

                ${!post.isDeleted && currentUserSession ? `
                  <button type="button" onclick="openInlineReply('${c.id}')" class="inline-flex items-center gap-1 font-semibold hover:text-brand-orange transition">
                    <i data-lucide="corner-down-right" class="w-3.5 h-3.5"></i>
                    <span>Reply</span>
                  </button>
                ` : ''}

                ${canDelete ? `
                  <button type="button" onclick="deleteComment('${post.id}', '${c.key || c.id}', '${c.id}')" class="inline-flex items-center gap-1 text-slate-400 hover:text-rose-500 transition ml-auto font-medium" title="Delete comment">
                    <i data-lucide="trash-2" class="w-3 h-3"></i>
                    <span class="text-[10px]">Delete</span>
                  </button>
                ` : ''}
              </div>

              <!-- Inline micro-reply box -->
              <div id="inline-reply-box-${c.id}" class="hidden mt-2 p-2.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Replying to <strong class="text-slate-700 dark:text-slate-300">@${escapeHtml(c.isAnon ? 'Anonymous' : (c.author || 'member'))}</strong>:</span>
                  <button type="button" onclick="closeInlineReply('${c.id}')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                </div>
                <textarea id="inline-reply-input-${c.id}" rows="2" placeholder="Write your reply..." class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange"></textarea>
                <div class="flex justify-end gap-1.5">
                  <button type="button" onclick="closeInlineReply('${c.id}')" class="px-2.5 py-1 rounded text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition">Cancel</button>
                  <button type="button" onclick="submitInlineReply('${post.id}', '${c.id}', '${c.isAnon ? 'Anonymous' : (c.author || '')}')" class="px-3 py-1 rounded bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold transition shadow-xs">Reply</button>
                </div>
              </div>

            </div>
          </div>

          <!-- Child nested replies -->
          <div id="comment-children-${c.id}" class="${isCollapsed ? 'hidden' : ''} space-y-2">
            ${(c.replies || []).map(child => renderCommentNode(child, post, depth + 1)).join('')}
          </div>
        </div>
      `;
    }

    function renderThreadDetail(postId) {
      const post = allPosts.find(p => p.id === postId);
      if (!post) {
        resetToFeed();
        return;
      }

      const existingReplyVal = document.getElementById('reply-input')?.value || '';

      document.getElementById('posts-list').classList.add('hidden');
      const mobileDrawer = document.getElementById('mobile-campus-drawer');
      if (mobileDrawer) mobileDrawer.classList.add('hidden');
      const detailContainer = document.getElementById('thread-detail-container');
      detailContainer.classList.remove('hidden');

      const isModOrAdmin = currentUserSession && isModOrAbove(currentUserSession.role);
      const canDelete = currentUserSession && (isModOrAdmin || currentUserSession.uid === post.authorUid);
      const isQuarantined = (post.reportsCount || 0) >= 3;

      if (post.isDeleted && !canDelete) {
        detailContainer.innerHTML = `
          <div class="flex items-center justify-between py-1">
            <button onclick="resetToFeed()" class="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Discussions
            </button>
          </div>
          <div class="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-md p-8 text-center space-y-3">
            <i data-lucide="trash-2" class="w-10 h-10 text-slate-400 mx-auto"></i>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">This Discussion Has Been Deleted</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">This discussion thread was removed by its author or a batch moderator.</p>
            <button onclick="resetToFeed()" class="mt-2 px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700">Return to Discussions</button>
          </div>
        `;
        if (window.lucide && window.lucide.createIcons) lucide.createIcons();
        return;
      }

      if (post.status === 'quarantined' && (!currentUserSession || (!isModOrAdmin && currentUserSession.uid !== post.authorUid))) {
        detailContainer.innerHTML = `
          <div class="flex items-center justify-between py-1">
            <button onclick="resetToFeed()" class="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Discussions
            </button>
          </div>
          <div class="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-md p-8 text-center space-y-3">
            <i data-lucide="shield-alert" class="w-10 h-10 text-rose-500 mx-auto"></i>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">Discussion Under Safety Review</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">This discussion triggered automated campus safety guidelines and is temporarily private pending batch moderator review.</p>
            <button onclick="resetToFeed()" class="mt-2 px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700">Return to Feed</button>
          </div>
        `;
        if (window.lucide && window.lucide.createIcons) lucide.createIcons();
        return;
      }

      if (isQuarantined && !isModOrAdmin) {
        detailContainer.innerHTML = `
          <div class="flex items-center justify-between py-1">
            <button onclick="resetToFeed()" class="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Discussions
            </button>
          </div>
          <div class="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-md p-8 text-center space-y-3">
            <i data-lucide="shield-alert" class="w-10 h-10 text-amber-500 mx-auto"></i>
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">This Thread is Quarantined</h3>
            <p class="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">This discussion received multiple community flags and is hidden from public view pending batch moderator review.</p>
            <button onclick="resetToFeed()" class="mt-2 px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700">Return to Feed</button>
          </div>
        `;
        if (window.lucide && window.lucide.createIcons) lucide.createIcons();
        return;
      }

      const meta = BOARD_META[post.board] || { name: post.board, color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
      const comments = post.comments || [];
      const isUpvoted = Boolean(post.upvotedBy && currentUserSession && post.upvotedBy[currentUserSession.uid]);

      const now = Date.now();
      const deadline = post.restoreDeadline || ((post.deletedAt || now) + (7 * 24 * 60 * 60 * 1000));
      const diffMs = deadline - now;
      const daysLeft = Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));

      detailContainer.innerHTML = `
        <div class="flex items-center justify-between py-1">
          <div class="flex items-center gap-2">
            <button onclick="resetToFeed()" class="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold transition">
              <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Discussions
            </button>
            <button onclick="shareThread('${post.id}')" class="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-brand-orange font-semibold px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-orange transition" title="Share discussion">
              <i data-lucide="share-2" class="w-3 h-3 text-brand-orange"></i> Share
            </button>
          </div>
          <div class="flex items-center gap-2">
            ${isQuarantined && isModOrAdmin ? `
              <button onclick="dismissPostFlags('${post.id}')" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition">
                Dismiss Flags
              </button>
            ` : ''}
            ${isModOrAdmin && !post.isDeleted ? `
              <button onclick="togglePinPost('${post.id}')" class="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold">
                <i data-lucide="pin" class="w-3.5 h-3.5 ${post.isPinned ? 'fill-amber-500 text-amber-500' : ''}"></i> ${post.isPinned ? 'Unpin' : 'Pin'}
              </button>
            ` : ''}
            ${post.tag && currentUserSession && (isModOrAdmin || currentUserSession.uid === post.authorUid) && !post.isDeleted ? `
              <button onclick="toggleResolvePost('${post.id}')" class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${post.isResolved ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'}">
                ${post.isResolved ? 'Reopen' : 'Mark Resolved ✅'}
              </button>
            ` : ''}
            ${canDelete ? (post.isDeleted ? `
              <button onclick="restorePost('${post.id}')" class="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Restore Thread ↺
              </button>
            ` : `
              <button onclick="deletePost('${post.id}')" class="inline-flex items-center gap-1 text-xs text-rose-500 hover:underline font-semibold">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Move to Trash
              </button>
            `) : `
              <button onclick="reportPost(event, '${post.id}')" class="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-amber-500 font-semibold">
                <i data-lucide="flag" class="w-3.5 h-3.5"></i> Report
              </button>
            `}
          </div>
        </div>

        ${post.status === 'quarantined' ? `
          <div class="p-3.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-900 dark:text-rose-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2.5">
              <i data-lucide="shield-alert" class="w-5 h-5 text-rose-500 shrink-0"></i>
              <div>
                <span class="font-bold block">🛡️ Under Moderator Safety Review</span>
                <span class="text-[11px] text-rose-700 dark:text-rose-400">Triggered: ${escapeHtml(post.quarantineCategory || 'Safety Filter')} — ${escapeHtml(post.quarantineReason || 'Pending review')}</span>
              </div>
            </div>
            ${isModOrAdmin ? `
              <div class="flex items-center gap-2">
                <button onclick="approveQuarantinedPost('${post.id}')" class="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow flex items-center gap-1.5">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Approve & Publish
                </button>
                <button onclick="rejectQuarantinedPost('${post.id}')" class="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow flex items-center gap-1.5">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Reject
                </button>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${post.isDeleted ? `
          <div class="p-3.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2.5">
              <i data-lucide="archive-restore" class="w-5 h-5 text-amber-500 shrink-0"></i>
              <div>
                <span class="font-bold block">This thread is currently in the 7-Day Recovery Trash</span>
                <span class="text-[11px] text-amber-700 dark:text-amber-400">Deleted by @${post.deletedByUsername || 'author'} · ${daysLeft} days left to restore before permanent purge</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="restorePost('${post.id}')" class="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow flex items-center gap-1.5">
                <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Restore Thread ↺
              </button>
              <button onclick="permanentlyPurgePost('${post.id}')" class="px-2.5 py-1.5 rounded-md bg-rose-600/10 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20 transition">
                Purge
              </button>
            </div>
          </div>
        ` : ''}

        ${isQuarantined && isModOrAdmin && !post.isDeleted ? `
          <div class="p-3 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2 font-bold">
              <i data-lucide="shield-alert" class="w-4 h-4 text-amber-500"></i>
              <span>QUARANTINED (${post.reportsCount} Community Flags) — Hidden from Regular Students</span>
            </div>
            <button onclick="dismissPostFlags('${post.id}')" class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition">
              Restore Thread
            </button>
          </div>
        ` : ''}

        <div class="bg-white dark:bg-slate-900 border ${post.isPinned ? 'border-amber-400/90 dark:border-amber-500/70 border-l-4 border-l-amber-500' : (isQuarantined ? 'border-amber-400 dark:border-amber-600' : 'border-slate-200 dark:border-slate-800')} rounded-md p-5 sm:p-6 shadow-sm space-y-4">
          <div class="flex items-center gap-2 flex-wrap">
            ${post.isPinned ? '<span class="text-xs font-extrabold px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">📌 Pinned</span>' : ''}
            <span class="text-xs font-bold px-2.5 py-0.5 rounded border ${meta.color}">${meta.name}</span>
            ${getTagBadge(post)}
            ${post.price ? `<span class="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">${escapeHtml(post.price)}</span>` : ''}
            ${post.approvedBy ? `<span class="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded inline-flex items-center gap-1"><i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-500"></i> Approved by @${escapeHtml(post.approvedBy)}</span>` : ''}
            <div class="inline-flex items-center gap-1.5 text-xs">
              ${getPostAuthorDisplay(post)}
              <span class="text-slate-400 dark:text-slate-600 font-normal">·</span>
              <span class="text-xs text-slate-400 dark:text-slate-500 font-normal">${post.createdAt}</span>
              <span class="text-slate-400 dark:text-slate-600 font-normal">·</span>
              <span class="text-xs text-slate-400 dark:text-slate-500 font-normal flex items-center gap-1" title="Unique batch views"><i data-lucide="eye" class="w-3.5 h-3.5 inline"></i> ${post.viewsCount || 1} views</span>
            </div>
          </div>

          <h2 class="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">${escapeHtml(post.title)}</h2>
          
          ${post.id === 'post-mtmc-mess' ? renderMessTimetableThreadHTML() : post.id === 'post-mtmc-foundation-course' ? renderFoundationCourseThreadHTML() : post.id === 'post-mtmc-hostel-rules' ? renderHostelRulesThreadHTML() : `
            <div id="thread-content-body" class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line border-b border-slate-100 dark:border-slate-800/80 pb-4">
              ${escapeHtml(post.content)}
            </div>

            ${renderPollHtml(post)}

            ${post.imageUrl ? `
              <div class="mt-3 max-w-lg rounded-md overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-950">
                <img src="${post.imageUrl}" alt="Attachment" class="w-full max-h-96 object-contain cursor-zoom-in hover:opacity-95 transition" onclick="openLightbox('${post.imageUrl}')" loading="lazy">
                <div class="p-2 bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span class="flex items-center gap-1"><i data-lucide="zoom-in" class="w-3.5 h-3.5 text-brand-orange"></i> Tap to enlarge photo</span>
                </div>
              </div>
            ` : ''}
          `}

          <!-- Emoji Reactions Row (WhatsApp-Style) -->
          ${renderReactionsHtml(post)}

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button onclick="upvotePost(event, '${post.id}')" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border text-xs font-bold transition shadow-sm ${isUpvoted ? 'bg-orange-500/10 border-orange-500/30 text-brand-orange hover:bg-orange-500/15' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}" title="${isUpvoted ? 'Click to revoke upvote' : 'Click to upvote'}">
              <i data-lucide="arrow-big-up" class="w-4 h-4 ${isUpvoted ? 'fill-orange-500 text-orange-500' : 'text-slate-400 dark:text-slate-500'}"></i>
              <span>${isUpvoted ? 'Upvoted' : 'Upvote'} (${post.upvotes || 0})</span>
            </button>
            <span class="text-xs text-slate-500 dark:text-slate-400">${comments.filter(c => !c.isDeleted).length} Comments · 👁️ ${post.viewsCount || 1} Views</span>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <i data-lucide="messages-square" class="w-4 h-4 text-brand-orange"></i>
              <span>Discussion (${comments.filter(c => !c.isDeleted).length})</span>
            </h3>
            ${comments.length > 1 ? `
              <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded text-[11px]">
                <button type="button" onclick="setCommentSort('top')" class="px-2 py-0.5 rounded font-semibold transition ${commentSort === 'top' ? 'bg-white dark:bg-slate-700 text-brand-orange shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}">Top</button>
                <button type="button" onclick="setCommentSort('newest')" class="px-2 py-0.5 rounded font-semibold transition ${commentSort === 'newest' ? 'bg-white dark:bg-slate-700 text-brand-orange shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}">Newest</button>
              </div>
            ` : ''}
          </div>

          <div class="space-y-2.5">
            ${comments.length === 0 ? `
              <div class="p-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
                No comments yet. Be the first batchmate to start the discussion!
              </div>
            ` : `
              ${buildCommentTree(comments).map(rootComment => renderCommentNode(rootComment, post, 0)).join('')}
            `}
          </div>

          ${post.isDeleted ? `
            <div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 mt-4">
              <p class="font-bold text-slate-700 dark:text-slate-300">This discussion is currently in Trash</p>
              <p class="text-[11px]">Replies are disabled while in trash. Click "Restore Thread ↺" to reactivate the discussion.</p>
            </div>
          ` : `
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 space-y-3 mt-4 shadow-sm">
              <label class="block text-xs font-bold text-slate-900 dark:text-white">Add your reply:</label>
              <textarea id="reply-input" rows="2" placeholder="${currentUserSession ? 'Write your reply or viva answer...' : 'Please log in to join the discussion...'}" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-orange"></textarea>
              
              <div class="flex items-center justify-between">
                ${post.board === 'anonymous' ? `
                  <div class="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <i data-lucide="eye-off" class="w-3.5 h-3.5"></i>
                    <span>Replying Anonymously</span>
                  </div>
                ` : `
                  <div class="text-[11px] text-slate-500 font-mono">
                    Replying as <span class="font-bold text-slate-700 dark:text-slate-300">@${currentUserSession?.username || 'member'}</span>
                  </div>
                `}
                <button onclick="submitReply('${post.id}')" class="px-4 py-1.5 rounded-md bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold transition shadow">
                  Reply
                </button>
              </div>
            </div>
          `}
        </div>
      `;

      if (existingReplyVal) {
        const replyInput = document.getElementById('reply-input');
        if (replyInput) replyInput.value = existingReplyVal;
      }

      lucide.createIcons();
    }

    function resetToFeed() {
      activeThreadId = null;
      if (window.location.hash.startsWith('#thread/')) {
        history.replaceState(null, null, window.location.pathname + window.location.search);
      }
      document.getElementById('thread-detail-container').classList.add('hidden');
      document.getElementById('posts-list').classList.remove('hidden');
      const mobileDrawer = document.getElementById('mobile-campus-drawer');
      if (mobileDrawer && activeBoard !== 'events') mobileDrawer.classList.remove('hidden');
      renderFeed();
    }

    function filterBoard(boardKey) {
      activeBoard = boardKey;
      activeThreadId = null;
      if (boardKey === 'events') {
        if (window.location.hash !== '#events') {
          history.replaceState(null, null, '#events');
        }
      } else if (window.location.hash.startsWith('#thread/') || window.location.hash === '#events' || window.location.hash === '#gallery') {
        history.replaceState(null, null, window.location.pathname + window.location.search);
      }
      
      const mobileDrawer = document.getElementById('mobile-campus-drawer');
      if (mobileDrawer) {
        if (boardKey === 'events') {
          mobileDrawer.classList.add('hidden');
        } else {
          mobileDrawer.classList.remove('hidden');
        }
      }

      document.querySelectorAll('.board-chip').forEach(btn => {
        btn.classList.remove('bg-brand-orange', 'text-white');
        btn.classList.add('text-slate-500', 'dark:text-slate-400');
      });

      const activeBtn = document.getElementById('board-btn-' + boardKey);
      if (activeBtn) {
        activeBtn.classList.add('bg-brand-orange', 'text-white');
        activeBtn.classList.remove('text-slate-500', 'dark:text-slate-400');
      }

      const boardTitles = {
        all: 'All Discussions',
        resources: '📌 Batch Resources (Guides, Mess Menu, Timetables)',
        anonymous: 'Anonymous Wall',
        academics: 'Studies & Viva Prep',
        bazaar: 'Batch Marketplace (Buy & Sell)',
        lostfound: 'Lost & Found',
        notices: 'CR & Batch Notices',
        events: '🎉 Batch Events & HD Gallery'
      };
      document.getElementById('current-board-name').textContent = boardTitles[boardKey] || boardKey;
      renderFeed();
    }

    function setSort(type) {
      currentSort = type;
      const btnLatest = document.getElementById('sort-latest');
      const btnHot = document.getElementById('sort-hot');

      if (type === 'latest') {
        btnLatest.className = 'px-2.5 py-1 rounded text-xs font-bold transition bg-brand-orange text-white';
        btnHot.className = 'px-2.5 py-1 rounded text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition';
      } else {
        btnHot.className = 'px-2.5 py-1 rounded text-xs font-bold transition bg-brand-orange text-white';
        btnLatest.className = 'px-2.5 py-1 rounded text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition';
      }
      renderFeed();
    }

    function handleSearch(val) {
      if (val !== undefined) {
        const dInput = document.getElementById('search-input');
        const mInput = document.getElementById('mobile-search-input');
        if (dInput && dInput.value !== val) dInput.value = val;
        if (mInput && mInput.value !== val) mInput.value = val;
      }
      renderFeed();
    }

    function toggleMobileSearch() {
      const bar = document.getElementById('mobile-search-bar');
      if (!bar) return;
      const isHidden = bar.classList.contains('hidden');
      if (isHidden) {
        bar.classList.remove('hidden');
        const mInput = document.getElementById('mobile-search-input');
        if (mInput) setTimeout(() => mInput.focus(), 60);
      } else {
        bar.classList.add('hidden');
      }
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    function clearOrCloseMobileSearch() {
      const mInput = document.getElementById('mobile-search-input');
      if (mInput && mInput.value) {
        mInput.value = '';
        handleSearch('');
      } else {
        toggleMobileSearch();
      }
    }

    function updateStats() {
      const activeCount = allPosts.filter(p => !p.isDeleted).length;
      const elDesktop = document.getElementById('stat-post-count');
      const elMobile = document.getElementById('mobile-stat-post-count');
      if (elDesktop) elDesktop.textContent = activeCount;
      if (elMobile) elMobile.textContent = activeCount;
    }

