/**
 * MTMC26 — Forum Post & Comment Actions
 */

    let selectedPostImageBase64 = null;

    function handleImageSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      if (file.size > 12 * 1024 * 1024) {
        alert('Please choose an image under 12MB.');
        event.target.value = '';
        return;
      }

      const statusEl = document.getElementById('modal-image-status');
      if (statusEl) statusEl.textContent = 'Optimizing for HD...';

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          // HD 1800px max dimension: crisp and clear for handwritten notes, textbooks, and histology slides
          const MAX_DIM = 1800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          // Redrawing onto canvas automatically strips EXIF GPS & device metadata for student privacy
          ctx.drawImage(img, 0, 0, width, height);

          // WebP at 0.80 gives ultra-crisp text and slide detail at ~60-110 KB
          let dataUrl = canvas.toDataURL('image/webp', 0.80);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', 0.80);
          }

          selectedPostImageBase64 = dataUrl;
          const approxKb = Math.round((dataUrl.length * 0.75) / 1024);
          if (statusEl) statusEl.textContent = `📷 ${approxKb} KB (HD Crisp)`;

          const previewImg = document.getElementById('modal-image-preview');
          const previewContainer = document.getElementById('modal-image-preview-container');
          if (previewImg) previewImg.src = dataUrl;
          if (previewContainer) previewContainer.classList.remove('hidden');
          if (window.lucide && window.lucide.createIcons) lucide.createIcons();
        };
        img.onerror = function() {
          alert('Could not process image. Please try another file.');
          removeSelectedImage();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function removeSelectedImage() {
      selectedPostImageBase64 = null;
      const input = document.getElementById('modal-post-image-input');
      if (input) input.value = '';
      const previewContainer = document.getElementById('modal-image-preview-container');
      if (previewContainer) previewContainer.classList.add('hidden');
      const previewImg = document.getElementById('modal-image-preview');
      if (previewImg) previewImg.src = '';
      const statusEl = document.getElementById('modal-image-status');
      if (statusEl) statusEl.textContent = '';
    }


    // ================= PEER TAGS & RESOLUTION =================
    let selectedModalTag = '';

    function selectModalTag(tag) {
      selectedModalTag = tag || '';
      const chips = document.querySelectorAll('.modal-tag-chip');
      chips.forEach(btn => {
        btn.className = 'modal-tag-chip px-2.5 py-1 rounded-lg border text-[11px] font-medium transition bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-brand-orange';
      });

      const activeBtnId = !tag ? 'modal-tag-none' :
        tag.includes('SOS') ? 'modal-tag-sos' :
        tag.includes('Cab') ? 'modal-tag-cab' :
        tag.includes('Viva') ? 'modal-tag-viva' :
        tag.includes('Free') ? 'modal-tag-free' : null;

      if (activeBtnId) {
        const el = document.getElementById(activeBtnId);
        if (el) el.className = 'modal-tag-chip px-2.5 py-1 rounded-lg border text-[11px] font-bold transition bg-brand-orange text-white border-brand-orange shadow-sm';
      }
    }

    function getTagBadge(post) {
      if (!post) return '';
      if (post.isResolved) {
        return `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">✅ Resolved</span>`;
      }
      if (!post.tag) return '';
      let colorClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      if (post.tag.includes('SOS')) {
        colorClass = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30';
      } else if (post.tag.includes('Cab')) {
        colorClass = 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30';
      } else if (post.tag.includes('Viva')) {
        colorClass = 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30';
      } else if (post.tag.includes('Free')) {
        colorClass = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      }
      return `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}">${post.tag}</span>`;
    }

    async function toggleResolvePost(postId) {
      if (!currentUserSession) return;
      const post = allPosts.find(p => p.id === postId);
      if (!post) return;

      const isModOrAdmin = isModOrAbove(currentUserSession.role);
      const canResolve = isModOrAdmin || (currentUserSession.uid === post.authorUid);
      if (!canResolve) {
        alert('Only the author or a batch moderator can toggle resolution on this post.');
        return;
      }

      const newResolvedState = !post.isResolved;
      post.isResolved = newResolvedState;

      if (db) {
        await db.ref('posts/' + postId + '/isResolved').set(newResolvedState);
      }

      if (activeThreadId === postId) {
        renderThreadDetail(postId);
      } else {
        renderFeed();
      }
    }

    // ================= PINNED ANNOUNCEMENTS (CR/MODERATOR) =================
    async function togglePinPost(postId) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) {
        alert('Only Batch Moderators and CRs can pin announcements.');
        return;
      }

      const post = allPosts.find(p => p.id === postId);
      if (!post) return;

      const currentPinnedCount = allPosts.filter(p => !p.isDeleted && p.isPinned && p.id !== postId).length;
      if (!post.isPinned && currentPinnedCount >= 2) {
        alert('Maximum 2 announcements can be pinned at a time.\nPlease unpin an older announcement first.');
        return;
      }

      const newPinState = !post.isPinned;
      post.isPinned = newPinState;

      if (db) {
        await db.ref('posts/' + postId + '/isPinned').set(newPinState);
      }

      if (activeThreadId === postId) {
        renderThreadDetail(postId);
      } else {
        renderFeed();
      }
    }

    // POSTING, COMMENTS & MODERATION ACTIONS
    function handleNewPostClick() {
      if (!currentUserSession) {
        openAuthModal('login');
        return;
      }
      if (currentUserSession.status === 'pending') {
        openVerificationModal();
        return;
      }
      openNewPostModal();
    }

    function openNewPostModal() {
      document.getElementById('modal-post-title').value = '';
      document.getElementById('modal-post-content').value = '';
      document.getElementById('modal-market-price').value = '';
      document.getElementById('modal-board-select').value = activeBoard === 'all' ? 'anonymous' : activeBoard;
      selectModalTag('');
      removeSelectedImage();
      toggleBoardExtraFields();
      document.getElementById('post-modal').classList.remove('hidden');
    }

    function closeNewPostModal() {
      removeSelectedImage();
      selectModalTag('');
      document.getElementById('post-modal').classList.add('hidden');
    }

    function toggleBoardExtraFields() {
      const board = document.getElementById('modal-board-select').value;
      const marketField = document.getElementById('field-market-price');
      const anonIndicator = document.getElementById('modal-anon-indicator');

      if (board === 'bazaar') {
        marketField.classList.remove('hidden');
      } else {
        marketField.classList.add('hidden');
      }

      if (board === 'anonymous') {
        if (anonIndicator) anonIndicator.classList.remove('hidden');
      } else {
        if (anonIndicator) anonIndicator.classList.add('hidden');
      }
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }


    async function saveNewPost() {
      if (!currentUserSession || currentUserSession.status !== 'verified') {
        alert('You must be a verified batch member to publish discussions.');
        return;
      }

      const board = document.getElementById('modal-board-select').value;
      const title = document.getElementById('modal-post-title').value.trim();
      const content = document.getElementById('modal-post-content').value.trim();
      const price = document.getElementById('modal-market-price').value.trim();
      const isAnon = (board === 'anonymous');

      if (!title || !content) {
        alert('Please enter both title and details.');
        return;
      }

      // Safety Rail: Anti-Spam Rate Limit
      const now = Date.now();
      if (now - lastPostTimestamp < POST_COOLDOWN_MS) {
        const waitSec = Math.ceil((POST_COOLDOWN_MS - (now - lastPostTimestamp)) / 1000);
        alert(`⏳ Slow down! Anti-Spam cooldown active.\nPlease wait ${waitSec} more seconds before publishing another thread.`);
        return;
      }

      // Safety Rail: Duplicate Topic Prevention
      const postSignature = `${title.toLowerCase()}:::${content.toLowerCase()}`;
      if (postSignature === lastSubmittedPostSignature && (now - lastPostTimestamp < 300000)) {
        alert('⚠️ Duplicate post detected: You recently published this exact topic.');
        return;
      }

      // Safety Rail: 100% Comprehensive Automated Safety Screening
      const safetyCheck = evaluateContentSafety(content, title, board);
      const isQuarantined = !safetyCheck.safe;
      const postStatus = isQuarantined ? 'quarantined' : 'published';

      const postId = 'post-' + Date.now();
      const authorName = isAnon ? `Anonymous #${Math.floor(Math.random() * 899 + 100)}` : currentUserSession.username;
      const newPost = {
        id: postId,
        board: board,
        title: title,
        content: content,
        price: board === 'bazaar' ? price : null,
        tag: selectedModalTag || null,
        isResolved: false,
        imageUrl: selectedPostImageBase64 || null,
        isPinned: false,
        author: authorName,
        authorUid: currentUserSession.uid,
        isAnon: isAnon,
        status: postStatus,
        quarantineCategory: isQuarantined ? safetyCheck.category : null,
        quarantineReason: isQuarantined ? safetyCheck.reason : null,
        quarantinedAt: isQuarantined ? Date.now() : null,
        approvedBy: null,
        approvedAt: null,
        upvotes: 1,
        upvotedBy: { [currentUserSession.uid]: true },
        createdAt: 'Just now',
        timestamp: Date.now(),
        reportsCount: 0,
        comments: {}
      };

      if (db) {
        await db.ref('posts/' + postId).set(newPost);
      } else {
        allPosts.unshift(newPost);
        renderFeed();
      }

      lastPostTimestamp = now;
      lastSubmittedPostSignature = postSignature;

      closeNewPostModal();

      if (isQuarantined) {
        alert(`🛡️ Post Held for Moderator Review:\n\nYour discussion has been held for review under: [${safetyCheck.category}].\n\nReason: ${safetyCheck.reason}\n\nTo safeguard our batch and maintain institutional standards, it will be published to the live feed once a Batch Moderator reviews and approves it.`);
      } else {
        filterBoard(board);
      }
    }

    async function submitReply(postId) {
      if (!currentUserSession) {
        openAuthModal('login');
        return;
      }
      if (currentUserSession.status === 'pending') {
        openVerificationModal();
        return;
      }

      const input = document.getElementById('reply-input');
      const post = allPosts.find(p => p.id === postId);
      if (post && post.isDeleted) {
        alert('This discussion is in Trash. Restore it first to post replies.');
        return;
      }
      const isAnon = post ? (post.board === 'anonymous') : false;
      const text = input.value.trim();

      if (!text) {
        alert('Please write a reply.');
        return;
      }

      // Safety Rail: Comment Rate Limit
      const now = Date.now();
      if (now - lastCommentTimestamp < COMMENT_COOLDOWN_MS) {
        const waitSec = Math.ceil((COMMENT_COOLDOWN_MS - (now - lastCommentTimestamp)) / 1000);
        alert(`⏳ Please wait ${waitSec} more seconds before posting another comment.`);
        return;
      }

      // Safety Rail: 100% Comprehensive Safety Screening on Comments
      const safetyCheck = evaluateContentSafety(text, '', isAnon ? 'anonymous' : (post ? post.board : ''));
      const isCommentQuarantined = !safetyCheck.safe;

      const authorName = isAnon ? `Anonymous #${Math.floor(Math.random() * 899 + 100)}` : currentUserSession.username;
      const newComment = {
        id: 'c_' + Date.now(),
        parentId: null,
        author: authorName,
        authorUid: currentUserSession.uid,
        isAnon: isAnon,
        text: text,
        time: 'Just now',
        timestamp: Date.now(),
        status: isCommentQuarantined ? 'quarantined' : 'published',
        quarantineCategory: isCommentQuarantined ? safetyCheck.category : null,
        quarantineReason: isCommentQuarantined ? safetyCheck.reason : null,
        quarantinedAt: isCommentQuarantined ? Date.now() : null,
        approvedBy: null,
        approvedAt: null,
        upvotes: 0
      };

      if (db) {
        const pushRef = await db.ref('posts/' + postId + '/comments').push(newComment);
        newComment.key = pushRef.key;

        // Dispatch Real-Time Notifications ($0 / Spark Plan) only if not quarantined
        if (!isCommentQuarantined) {
          try {
            // 1. Thread Reply Notification (if replier is not the thread author)
            if (post && post.authorUid && post.authorUid !== currentUserSession.uid) {
              const notifRef = db.ref('notifications/' + post.authorUid).push();
              await notifRef.set({
                id: notifRef.key,
                type: 'reply',
                postId: postId,
                threadTitle: post.title || 'Discussion',
                senderUid: currentUserSession.uid,
                senderName: isAnon ? 'A Classmate (Anonymous)' : (currentUserSession.fullName || currentUserSession.username),
                senderUsername: isAnon ? 'anonymous' : currentUserSession.username,
                snippet: text.substring(0, 80),
                timestamp: Date.now(),
                read: false
              });
            }

            // 2. @Mentions Notification (e.g. "@batchmate check this out")
            const mentionMatches = [...text.matchAll(/@([a-zA-Z0-9_]{3,20})/g)].map(m => m[1].toLowerCase());
            if (mentionMatches.length > 0) {
              const usersList = Object.values(allUsers || {});
              const mentionedUids = new Set();

              mentionMatches.forEach(uname => {
                const target = usersList.find(u => (u.username || '').toLowerCase() === uname && (u.username || '').toLowerCase() !== 'admin');
                if (target && target.uid !== currentUserSession.uid && (!post || target.uid !== post.authorUid)) {
                  mentionedUids.add(target.uid);
                }
              });

              for (const targetUid of mentionedUids) {
                const mentionRef = db.ref('notifications/' + targetUid).push();
                await mentionRef.set({
                  id: mentionRef.key,
                  type: 'mention',
                  postId: postId,
                  threadTitle: post ? post.title : 'Discussion',
                  senderUid: currentUserSession.uid,
                  senderName: isAnon ? 'A Classmate (Anonymous)' : (currentUserSession.fullName || currentUserSession.username),
                  senderUsername: isAnon ? 'anonymous' : currentUserSession.username,
                  snippet: text.substring(0, 80),
                  timestamp: Date.now(),
                  read: false
                });
              }
            }
          } catch (notifErr) {
            console.warn("Notification dispatch:", notifErr);
          }
        }
      }

      lastCommentTimestamp = now;
      input.value = '';

      if (post) {
        if (!post.comments) post.comments = [];
        if (!post.comments.some(c => c.id === newComment.id)) {
          post.comments.push(newComment);
        }
      }

      if (isCommentQuarantined) {
        alert(`🛡️ Reply Held for Moderator Review:\n\nYour comment triggered safety guidelines under: [${safetyCheck.category}].\n\nReason: ${safetyCheck.reason}\n\nTo safeguard the batch, it has been submitted to the Moderator Review Queue and will appear once approved by a moderator.`);
      }
      renderThreadDetail(postId);
    }

    // REDDIT-STYLE INLINE THREADED REPLY HANDLER
    async function submitInlineReply(postId, parentCommentId, parentAuthor) {
      if (!currentUserSession) {
        openAuthModal('login');
        return;
      }
      if (currentUserSession.status === 'pending') {
        openVerificationModal();
        return;
      }

      const input = document.getElementById(`inline-reply-input-${parentCommentId}`);
      if (!input) return;
      const text = input.value.trim();
      if (!text) {
        alert('Please write a reply.');
        return;
      }

      const post = allPosts.find(p => p.id === postId);
      if (post && post.isDeleted) {
        alert('This discussion is in Trash. Restore it first to post replies.');
        return;
      }

      const isAnon = post ? (post.board === 'anonymous') : false;

      // Rate limit check
      const now = Date.now();
      if (now - lastCommentTimestamp < COMMENT_COOLDOWN_MS) {
        const waitSec = Math.ceil((COMMENT_COOLDOWN_MS - (now - lastCommentTimestamp)) / 1000);
        alert(`⏳ Please wait ${waitSec} more seconds before posting another comment.`);
        return;
      }

      // Anti-Doxxing check
      if (isAnon && containsIndianPhoneNumber(text)) {
        alert('🛡️ Anti-Doxxing Protection:\n\nSharing phone numbers or personal contact details anonymously is strictly prohibited.');
        return;
      }

      // Safety Rail: 100% Comprehensive Safety Screening on Inline Comments
      const safetyCheck = evaluateContentSafety(text, '', isAnon ? 'anonymous' : (post ? post.board : ''));
      const isCommentQuarantined = !safetyCheck.safe;

      const authorName = isAnon ? `Anonymous #${Math.floor(Math.random() * 899 + 100)}` : currentUserSession.username;
      const parentComment = (post && post.comments) ? post.comments.find(c => c.id === parentCommentId) : null;

      const newReply = {
        id: 'c_' + Date.now(),
        parentId: parentCommentId,
        replyToUsername: isAnon ? null : (parentAuthor || null),
        author: authorName,
        authorUid: currentUserSession.uid,
        isAnon: isAnon,
        text: text,
        time: 'Just now',
        timestamp: Date.now(),
        status: isCommentQuarantined ? 'quarantined' : 'published',
        quarantineCategory: isCommentQuarantined ? safetyCheck.category : null,
        quarantineReason: isCommentQuarantined ? safetyCheck.reason : null,
        quarantinedAt: isCommentQuarantined ? Date.now() : null,
        approvedBy: null,
        approvedAt: null,
        upvotes: 0
      };

      if (db) {
        const pushRef = await db.ref('posts/' + postId + '/comments').push(newReply);
        newReply.key = pushRef.key;

        // Notifications only if not quarantined
        if (!isCommentQuarantined) {
          try {
            if (parentComment && parentComment.authorUid && parentComment.authorUid !== currentUserSession.uid) {
              const notifRef = db.ref('notifications/' + parentComment.authorUid).push();
              await notifRef.set({
                id: notifRef.key,
                type: 'reply',
                postId: postId,
                threadTitle: post ? post.title : 'Discussion',
                senderUid: currentUserSession.uid,
                senderName: isAnon ? 'A Classmate (Anonymous)' : (currentUserSession.fullName || currentUserSession.username),
                senderUsername: isAnon ? 'anonymous' : currentUserSession.username,
                snippet: text.substring(0, 80),
                timestamp: Date.now(),
                read: false
              });
            } else if (post && post.authorUid && post.authorUid !== currentUserSession.uid) {
              const notifRef = db.ref('notifications/' + post.authorUid).push();
              await notifRef.set({
                id: notifRef.key,
                type: 'reply',
                postId: postId,
                threadTitle: post.title || 'Discussion',
                senderUid: currentUserSession.uid,
                senderName: isAnon ? 'A Classmate (Anonymous)' : (currentUserSession.fullName || currentUserSession.username),
                senderUsername: isAnon ? 'anonymous' : currentUserSession.username,
                snippet: text.substring(0, 80),
                timestamp: Date.now(),
                read: false
              });
            }

            const mentionMatches = [...text.matchAll(/@([a-zA-Z0-9_]{3,20})/g)].map(m => m[1].toLowerCase());
            if (mentionMatches.length > 0) {
              const usersList = Object.values(allUsers || {});
              const mentionedUids = new Set();
              mentionMatches.forEach(uname => {
                const target = usersList.find(u => (u.username || '').toLowerCase() === uname && (u.username || '').toLowerCase() !== 'admin');
                if (target && target.uid !== currentUserSession.uid) {
                  mentionedUids.add(target.uid);
                }
              });
              for (const targetUid of mentionedUids) {
                const mentionRef = db.ref('notifications/' + targetUid).push();
                await mentionRef.set({
                  id: mentionRef.key,
                  type: 'mention',
                  postId: postId,
                  threadTitle: post ? post.title : 'Discussion',
                  senderUid: currentUserSession.uid,
                  senderName: isAnon ? 'A Classmate (Anonymous)' : (currentUserSession.fullName || currentUserSession.username),
                  senderUsername: isAnon ? 'anonymous' : currentUserSession.username,
                  snippet: text.substring(0, 80),
                  timestamp: Date.now(),
                  read: false
                });
              }
            }
          } catch (notifErr) {
            console.warn('Notification dispatch:', notifErr);
          }
        }
      }

      lastCommentTimestamp = now;
      input.value = '';
      closeInlineReply(parentCommentId);

      if (post) {
        if (!post.comments) post.comments = [];
        if (!post.comments.some(c => c.id === newReply.id)) {
          post.comments.push(newReply);
        }
      }

      if (isCommentQuarantined) {
        alert(`🛡️ Reply Held for Moderator Review:\n\nYour comment triggered safety guidelines under: [${safetyCheck.category}].\n\nReason: ${safetyCheck.reason}\n\nTo safeguard the batch, it has been submitted to the Moderator Review Queue and will appear once approved by a moderator.`);
      }
      renderThreadDetail(postId);
    }

    function openInlineReply(commentId) {
      const box = document.getElementById(`inline-reply-box-${commentId}`);
      if (!box) return;
      box.classList.remove('hidden');
      const input = document.getElementById(`inline-reply-input-${commentId}`);
      if (input) setTimeout(() => input.focus(), 60);
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    function closeInlineReply(commentId) {
      const box = document.getElementById(`inline-reply-box-${commentId}`);
      if (box) box.classList.add('hidden');
    }

    // SMART REDDIT-STYLE COMMENT DELETION
    async function deleteComment(postId, commentKey, commentId) {
      if (!currentUserSession) return;
      const post = allPosts.find(p => p.id === postId);
      if (!post || !post.comments) return;

      const comment = post.comments.find(c => (c.key === commentKey || c.id === commentId));
      if (!comment) return;

      const isModOrAdmin = isModOrAbove(currentUserSession.role);
      const isAuthor = currentUserSession.uid === comment.authorUid;

      if (!isModOrAdmin && !isAuthor) {
        alert('You do not have permission to delete this comment.');
        return;
      }

      if (!confirm('Are you sure you want to delete this comment?')) return;

      const hasReplies = post.comments.some(c => c.parentId === comment.id);
      const deletedByRole = isModOrAdmin && !isAuthor ? 'moderator' : 'author';
      const targetKey = comment.key || commentKey;

      if (db && targetKey) {
        if (hasReplies) {
          // Has replies: Reddit tombstone preservation
          await db.ref(`posts/${postId}/comments/${targetKey}`).update({
            isDeleted: true,
            text: `[This comment was deleted by ${deletedByRole}]`,
            deletedBy: deletedByRole,
            deletedAt: Date.now()
          });
        } else {
          // No replies: leaf comment completely removed from Firebase
          await db.ref(`posts/${postId}/comments/${targetKey}`).remove();
        }
      }

      if (hasReplies) {
        comment.isDeleted = true;
        comment.text = `[This comment was deleted by ${deletedByRole}]`;
        comment.deletedBy = deletedByRole;
        comment.deletedAt = Date.now();
      } else {
        post.comments = post.comments.filter(c => (c.key !== commentKey && c.id !== commentId));
      }

      renderThreadDetail(postId);
    }

    // REDDIT-STYLE COMMENT UPVOTING
    async function upvoteComment(postId, commentKey, commentId) {
      if (!currentUserSession) {
        openAuthModal('login');
        return;
      }
      const post = allPosts.find(p => p.id === postId);
      if (!post || !post.comments) return;

      const comment = post.comments.find(c => (c.key === commentKey || c.id === commentId));
      if (!comment || comment.isDeleted) return;

      const targetKey = comment.key || commentKey;
      if (!comment.upvotedBy) comment.upvotedBy = {};
      const hasUpvoted = Boolean(comment.upvotedBy[currentUserSession.uid]);

      if (hasUpvoted) {
        delete comment.upvotedBy[currentUserSession.uid];
        comment.upvotes = Math.max(0, (comment.upvotes || 1) - 1);
        if (db && targetKey) {
          db.ref(`posts/${postId}/comments/${targetKey}/upvotedBy/${currentUserSession.uid}`).remove().catch(console.error);
          db.ref(`posts/${postId}/comments/${targetKey}/upvotes`).transaction(c => Math.max(0, (c || 1) - 1)).catch(console.error);
        }
      } else {
        comment.upvotedBy[currentUserSession.uid] = true;
        comment.upvotes = (comment.upvotes || 0) + 1;
        if (db && targetKey) {
          db.ref(`posts/${postId}/comments/${targetKey}/upvotedBy/${currentUserSession.uid}`).set(true).catch(console.error);
          db.ref(`posts/${postId}/comments/${targetKey}/upvotes`).transaction(c => (c || 0) + 1).catch(console.error);
        }
      }

      renderThreadDetail(postId);
    }

    let commentSort = 'top';
    const collapsedComments = new Set();

    function setCommentSort(sortType) {
      commentSort = sortType;
      if (activeThreadId) {
        renderThreadDetail(activeThreadId);
      }
    }

    // ACCORDION / COLLAPSIBLE COMMENT TREES
    function toggleCollapseComment(commentId) {
      if (collapsedComments.has(commentId)) {
        collapsedComments.delete(commentId);
      } else {
        collapsedComments.add(commentId);
      }
      const body = document.getElementById(`comment-body-${commentId}`);
      const children = document.getElementById(`comment-children-${commentId}`);
      const indicator = document.getElementById(`comment-collapsed-indicator-${commentId}`);
      const toggleIcon = document.getElementById(`comment-toggle-icon-${commentId}`);

      const isCollapsed = collapsedComments.has(commentId);
      if (body) body.classList.toggle('hidden', isCollapsed);
      if (children) children.classList.toggle('hidden', isCollapsed);
      if (indicator) indicator.classList.toggle('hidden', !isCollapsed);
      if (toggleIcon) {
        toggleIcon.setAttribute('data-lucide', isCollapsed ? 'plus-square' : 'minus-square');
      }
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    // SHARE THREAD DEEP LINK (WHATSAPP READY)
    function shareThread(postId) {
      const post = allPosts.find(p => p.id === postId);
      if (!post) return;
      const url = window.location.origin + window.location.pathname + '#thread/' + postId;
      const shareText = `📌 *${post.title}*\nRead & discuss on MTMC MBBS Batch 2026 Community Portal:\n${url}`;

      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: shareText,
          url: url
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          alert('🔗 Direct thread link copied to clipboard!\nYou can paste it into your WhatsApp batch group.');
        }).catch(() => {
          prompt('Copy this link:', url);
        });
      } else {
        prompt('Copy this link:', url);
      }
    }

    function checkUrlHash() {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#thread/')) {
        const threadId = hash.replace('#thread/', '').trim();
        if (threadId && allPosts && allPosts.length > 0) {
          const exists = allPosts.find(p => p.id === threadId);
          if (exists) {
            openThread(threadId);
          }
        }
      } else if (hash === '#events' || hash === '#gallery') {
        filterBoard('events');
      }
    }
    window.addEventListener('hashchange', checkUrlHash);

    async function upvotePost(e, postId) {
      if (e) e.stopPropagation();
      if (!currentUserSession) {
        openAuthModal('login');
        return;
      }

      const post = allPosts.find(p => p.id === postId);
      if (!post) return;

      if (!post.upvotedBy) post.upvotedBy = {};
      const hasUpvoted = Boolean(post.upvotedBy[currentUserSession.uid]);

      if (hasUpvoted) {
        // Revoke upvote
        delete post.upvotedBy[currentUserSession.uid];
        post.upvotes = Math.max(0, (post.upvotes || 1) - 1);

        if (db) {
          db.ref('posts/' + postId + '/upvotedBy/' + currentUserSession.uid).remove().catch(console.error);
          db.ref('posts/' + postId + '/upvotes').transaction(c => Math.max(0, (c || 1) - 1)).catch(console.error);
        }
      } else {
        // Add upvote
        post.upvotedBy[currentUserSession.uid] = true;
        post.upvotes = (post.upvotes || 0) + 1;

        if (db) {
          db.ref('posts/' + postId + '/upvotedBy/' + currentUserSession.uid).set(true).catch(console.error);
          db.ref('posts/' + postId + '/upvotes').transaction(c => (c || 0) + 1).catch(console.error);
        }
      }

      if (activeThreadId === postId) {
        renderThreadDetail(postId);
      } else {
        renderFeed();
      }
    }

    // =============================================================
    // WHATSAPP-STYLE EMOJI REACTIONS (ZERO NAME EXPOSURE)
    // =============================================================
    function renderReactionsHtml(post) {
      const reactions = post.reactions || {};
      const emojiKeys = Object.keys(reactions);
      const uid = currentUserSession?.uid;

      const chipsHtml = emojiKeys.map(emoji => {
        const count = Object.keys(reactions[emoji] || {}).length;
        if (count === 0) return '';
        const hasReacted = Boolean(uid && reactions[emoji]?.[uid]);
        return `
          <button type="button" onclick="event.stopPropagation(); togglePostReaction('${post.id}', '${escapeHtml(emoji)}')" 
            class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs transition select-none ${hasReacted ? 'bg-cyan-500/15 border border-cyan-500/50 text-cyan-700 dark:text-cyan-300 font-bold shadow-xs ring-1 ring-cyan-500/20' : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'}"
            title="${escapeHtml(emoji)} (${count})">
            <span class="text-sm leading-none">${escapeHtml(emoji)}</span>
            <span class="text-[11px] font-mono">${count}</span>
          </button>
        `;
      }).filter(Boolean).join('');

      return `
        <div class="flex items-center gap-1.5 flex-wrap pt-2" onclick="event.stopPropagation()">
          ${chipsHtml}
          <div class="relative inline-block">
            <button type="button" onclick="event.stopPropagation(); toggleReactionPicker('${post.id}')" class="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition" title="React with emoji">
              <i data-lucide="smile-plus" class="w-3.5 h-3.5"></i>
            </button>
            <div id="reaction-picker-${post.id}" class="hidden absolute left-0 bottom-full mb-1.5 z-30 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl items-center gap-1 backdrop-blur-md">
              <button type="button" onclick="event.stopPropagation(); addQuickReaction('${post.id}', '👍')" class="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform" title="Thumbs Up">👍</button>
              <button type="button" onclick="event.stopPropagation(); addQuickReaction('${post.id}', '❤️')" class="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform" title="Heart">❤️</button>
              <button type="button" onclick="event.stopPropagation(); addQuickReaction('${post.id}', '😂')" class="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform" title="Joy">😂</button>
              <button type="button" onclick="event.stopPropagation(); addQuickReaction('${post.id}', '🔥')" class="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform" title="Fire">🔥</button>
              <button type="button" onclick="event.stopPropagation(); addQuickReaction('${post.id}', '🩺')" class="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform" title="Stethoscope">🩺</button>
              <button type="button" onclick="event.stopPropagation(); addQuickReaction('${post.id}', '🙏')" class="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform" title="Namaste / Thanks">🙏</button>
              <div class="relative ml-0.5 border-l border-slate-200 dark:border-slate-700 pl-1 flex items-center">
                <input type="text" id="custom-emoji-input-${post.id}" oninput="handleCustomEmojiInput('${post.id}', this)" placeholder="➕" maxlength="4" class="w-8 h-8 text-center text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange" title="Tap to choose any emoji from your keyboard">
              </div>
            </div>
          </div>
        </div>
      `;
    }

    async function togglePostReaction(postId, emoji, forceAdd = false) {
      if (!currentUserSession || currentUserSession.status !== 'verified') {
        alert('Please sign in with a verified student account to react.');
        return;
      }
      const post = (allPosts || []).find(p => p.id === postId);
      if (!post) return;
      if (!post.reactions) post.reactions = {};
      if (!post.reactions[emoji]) post.reactions[emoji] = {};

      const uid = currentUserSession.uid;
      const alreadyReacted = Boolean(post.reactions[emoji][uid]);

      if (alreadyReacted && !forceAdd) {
        delete post.reactions[emoji][uid];
        if (Object.keys(post.reactions[emoji]).length === 0) {
          delete post.reactions[emoji];
        }
        if (db) {
          db.ref(`posts/${postId}/reactions/${emoji}/${uid}`).remove().catch(err => console.warn(err));
        }
      } else {
        post.reactions[emoji][uid] = true;
        if (db) {
          db.ref(`posts/${postId}/reactions/${emoji}/${uid}`).set(true).catch(err => console.warn(err));
        }
      }

      if (activeThreadId === postId) {
        renderThreadDetail(postId);
      } else {
        renderFeed();
      }
    }

    function addQuickReaction(postId, emoji) {
      togglePostReaction(postId, emoji, true);
      closeAllReactionPickers();
    }

    function toggleReactionPicker(postId) {
      const picker = document.getElementById(`reaction-picker-${postId}`);
      if (!picker) return;
      const wasHidden = picker.classList.contains('hidden');
      closeAllReactionPickers();
      if (wasHidden) {
        picker.classList.remove('hidden');
        picker.classList.add('flex');
        const customInput = document.getElementById(`custom-emoji-input-${postId}`);
        if (customInput) {
          setTimeout(() => customInput.focus(), 60);
        }
      }
    }

    function closeAllReactionPickers() {
      document.querySelectorAll('[id^="reaction-picker-"]').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('flex');
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('[id^="reaction-picker-"]') && !e.target.closest('button[onclick*="toggleReactionPicker"]')) {
        closeAllReactionPickers();
      }
    });

    function handleCustomEmojiInput(postId, inputEl) {
      const val = (inputEl.value || '').trim();
      if (!val) return;
      const match = val.match(/\p{Extended_Pictographic}|\p{Emoji}/u) || [val.charAt(0)];
      const emoji = match[0] || val;
      if (emoji) {
        addQuickReaction(postId, emoji);
      }
      inputEl.value = '';
    }

    async function deletePost(postId) {
      if (!currentUserSession) return;
      const post = allPosts.find(p => p.id === postId);
      if (!post) return;

      const isModOrAdmin = isModOrAbove(currentUserSession.role);
      const canDelete = isModOrAdmin || post.authorUid === currentUserSession.uid;

      if (!canDelete) {
        alert('You do not have permission to delete this post.');
        return;
      }

      if (!confirm('Move this discussion to Trash?\n\nIt will be hidden from the feed, but you can restore it anytime within 7 days from your Profile or Moderator Dashboard.')) return;

      const now = Date.now();
      const restoreDeadline = now + (7 * 24 * 60 * 60 * 1000);

      if (db) {
        await db.ref('posts/' + postId).update({
          isDeleted: true,
          deletedAt: now,
          deletedByUsername: currentUserSession.username,
          deletedByUid: currentUserSession.uid,
          restoreDeadline: restoreDeadline
        });
      }

      post.isDeleted = true;
      post.deletedAt = now;
      post.deletedByUsername = currentUserSession.username;
      post.deletedByUid = currentUserSession.uid;
      post.restoreDeadline = restoreDeadline;

      if (activeThreadId === postId) {
        resetToFeed();
      } else {
        renderFeed();
      }

      updateStats();
      updateProfileTrashBadge();
      updateAdminBadges();
      if (!document.getElementById('profile-modal').classList.contains('hidden') && currentProfileTab === 'trash') {
        renderProfileTrashList();
      }
      if (!document.getElementById('admin-modal').classList.contains('hidden') && currentAdminTab === 'deletions') {
        renderDeletionRequestsList();
      }

      showUndoToast(postId, post.title);
    }

    async function restorePost(postId) {
      if (!currentUserSession) {
        openAuthModal('login');
        return;
      }

      const post = allPosts.find(p => p.id === postId);
      if (!post) return;

      const isModOrAdmin = isModOrAbove(currentUserSession.role);
      const canRestore = isModOrAdmin || (post.authorUid === currentUserSession.uid);

      if (!canRestore) {
        alert('You do not have permission to restore this post.');
        return;
      }

      if (db) {
        await db.ref('posts/' + postId).update({
          isDeleted: null,
          deletedAt: null,
          deletedByUsername: null,
          deletedByUid: null,
          restoreDeadline: null
        });
      }

      post.isDeleted = false;
      delete post.deletedAt;
      delete post.deletedByUsername;
      delete post.deletedByUid;
      delete post.restoreDeadline;

      updateStats();
      updateProfileTrashBadge();
      updateAdminBadges();
      if (!document.getElementById('admin-modal').classList.contains('hidden')) {
        renderDeletionRequestsList();
      }
      if (!document.getElementById('profile-modal').classList.contains('hidden')) {
        renderProfileTrashList();
      }

      if (activeThreadId === postId) {
        renderThreadDetail(postId);
      } else {
        renderFeed();
      }

      alert('🎉 Thread restored successfully! It is now back live on the discussion board.');
    }

    async function permanentlyPurgePost(postId) {
      if (!currentUserSession) return;
      const post = allPosts.find(p => p.id === postId);
      if (!post) return;

      const isModOrAdmin = isModOrAbove(currentUserSession.role);
      const isAuthor = post.authorUid === currentUserSession.uid;

      if (!isModOrAdmin && !isAuthor) {
        alert('Permission denied.');
        return;
      }

      if (!confirm(`⚠️ Permanently purge "${post.title}"?\n\nThis will completely delete the thread and all replies from the database. This action cannot be undone.`)) return;

      if (db) {
        await db.ref('posts/' + postId).remove();
      }

      allPosts = allPosts.filter(p => p.id !== postId);

      if (activeThreadId === postId) {
        resetToFeed();
      } else {
        renderFeed();
      }

      updateStats();
      updateProfileTrashBadge();
      updateAdminBadges();
      if (!document.getElementById('admin-modal').classList.contains('hidden')) {
        renderDeletionRequestsList();
      }
      if (!document.getElementById('profile-modal').classList.contains('hidden')) {
        renderProfileTrashList();
      }
      alert('Thread permanently erased.');
    }

    async function reportPost(e, postId) {
      if (e) e.stopPropagation();
      if (!currentUserSession) {
        openAuthModal('login');
        return;
      }
      if (!confirm('Flag this post for moderator review (violating Community Code of Conduct)?')) return;
      if (db) {
        await db.ref('posts/' + postId + '/reportsCount').transaction(c => (c || 0) + 1);
      }
      const post = allPosts.find(p => p.id === postId);
      if (post) {
        post.reportsCount = (post.reportsCount || 0) + 1;
        if (post.reportsCount >= 3) {
          alert('⚠️ Reporting Threshold Reached:\nThis discussion has received multiple community flags and has been automatically quarantined from the public feed pending moderator review.');
          renderFeed();
          return;
        }
      }
      alert('Thank you. This post has been flagged for batch moderator review.');
    }

    async function dismissPostFlags(postId) {
      if (!currentUserSession || !isModOrAbove(currentUserSession.role)) {
        alert('Access restricted to Batch Moderators.');
        return;
      }
      if (!confirm('Dismiss community flags and restore this discussion to active status?')) return;
      if (db) {
        await db.ref('posts/' + postId + '/reportsCount').set(0);
      }
      const post = allPosts.find(p => p.id === postId);
      if (post) post.reportsCount = 0;
      if (activeThreadId === postId) {
        renderThreadDetail(postId);
      } else {
        renderFeed();
      }
      alert('Community flags dismissed. Discussion has been restored.');
    }

    // RENDER FEED
