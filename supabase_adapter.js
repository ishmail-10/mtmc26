/**
 * MTMC26 SUPABASE BACKEND ADAPTER
 * High-performance, Row-Level-Security (RLS) PostgreSQL engine for MTMC Batch 2026.
 * Replaces Firebase RTDB & Firebase Auth with zero frontend breakage.
 */

const SUPABASE_URL = "https://bkdlqltpvfliktmimusl.supabase.co";
const SUPABASE_KEY = "sb_publishable_k-ZwDSW47atqSjiSyWawyg_2jYV_w6w";

let sb = null;
let currentSupabaseUser = null;

try {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
  }
} catch (e) {
  console.warn("Supabase init error:", e);
}

// -------------------------------------------------------------
// AUTHENTICATION ADAPTER (Replaces firebase.auth())
// -------------------------------------------------------------
const auth = {
  get currentUser() {
    return currentSupabaseUser;
  },

  async signInWithEmailAndPassword(email, pass) {
    if (!sb) throw new Error("Supabase client not initialized");
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) {
      const err = new Error(error.message);
      if (error.message.includes('Invalid login credentials')) {
        err.code = 'auth/invalid-credential';
      } else if (error.message.includes('Email logins are disabled')) {
        err.code = 'auth/provider-disabled';
      } else {
        err.code = 'auth/error';
      }
      throw err;
    }
    currentSupabaseUser = data.user ? { uid: data.user.id, email: data.user.email } : null;
    return { user: currentSupabaseUser };
  },

  async createUserWithEmailAndPassword(email, pass) {
    if (!sb) throw new Error("Supabase client not initialized");
    const { data, error } = await sb.auth.signUp({ email, password: pass });
    if (error) {
      const err = new Error(error.message);
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        err.code = 'auth/email-already-in-use';
      } else if (error.message.includes('Email signups are disabled')) {
        err.code = 'auth/provider-disabled';
      } else {
        err.code = 'auth/error';
      }
      throw err;
    }
    currentSupabaseUser = data.user ? { uid: data.user.id, email: data.user.email } : null;
    return { user: currentSupabaseUser };
  },

  async signOut() {
    if (sb) await sb.auth.signOut().catch(() => {});
    currentSupabaseUser = null;
  },

  onAuthStateChanged(callback) {
    if (!sb) {
      callback(null);
      return;
    }
    sb.auth.getSession().then(({ data: { session } }) => {
      currentSupabaseUser = session?.user ? { uid: session.user.id, email: session.user.email } : null;
      callback(currentSupabaseUser);
    }).catch(() => callback(null));

    sb.auth.onAuthStateChange((_event, session) => {
      currentSupabaseUser = session?.user ? { uid: session.user.id, email: session.user.email } : null;
      callback(currentSupabaseUser);
    });
  }
};

// -------------------------------------------------------------
// REALTIME DATABASE ADAPTER (Replaces firebase.database())
// -------------------------------------------------------------
const db = {
  ref(path = '') {
    const cleanPath = String(path).replace(/^\/+|\/+$/g, '');
    const parts = cleanPath.split('/').filter(Boolean);
    const root = parts[0] || '';

    return {
      // -------------------------------------------------------
      // READ ONCE (.once('value'))
      // -------------------------------------------------------
      async once(eventType = 'value') {
        if (!sb) return { val: () => null, exists: () => false };

        try {
          if (root === 'posts') {
            if (parts.length === 1) {
              const { data, error } = await sb
                .from('posts')
                .select(`
                  *,
                  comments (*),
                  post_upvotes (*),
                  post_views (*)
                `)
                .order('created_at', { ascending: false });
              if (error || !data) return { val: () => null, exists: () => false };

              const postsMap = {};
              data.forEach(p => {
                postsMap[p.id] = transformPostRow(p);
              });
              return { val: () => postsMap, exists: () => Object.keys(postsMap).length > 0 };
            } else if (parts.length === 2) {
              const postId = parts[1];
              const { data, error } = await sb
                .from('posts')
                .select(`
                  *,
                  comments (*),
                  post_upvotes (*),
                  post_views (*)
                `)
                .eq('id', postId)
                .maybeSingle();
              if (error || !data) return { val: () => null, exists: () => false };
              return { val: () => transformPostRow(data), exists: () => true };
            }
          }

          if (root === 'users') {
            if (parts.length === 1) {
              const { data: profiles, error } = await sb.from('profiles').select('*');
              if (error || !profiles) return { val: () => ({}), exists: () => false };
              const usersMap = {};
              profiles.forEach(p => {
                usersMap[p.id] = transformProfileRow(p);
              });
              return { val: () => usersMap, exists: () => Object.keys(usersMap).length > 0 };
            } else if (parts.length === 2) {
              const uid = parts[1];
              const { data, error } = await sb.from('profiles').select('*').eq('id', uid).maybeSingle();
              if (error || !data) return { val: () => null, exists: () => false };
              return { val: () => transformProfileRow(data), exists: () => true };
            }
          }

          if (root === 'userPrivate') {
            if (parts.length === 2) {
              const uid = parts[1];
              const { data, error } = await sb.from('profile_private').select('*').eq('id', uid).maybeSingle();
              if (error || !data) return { val: () => ({}), exists: () => false };
              return {
                val: () => ({
                  phone: data.phone || '',
                  token: data.token || '',
                  passwordHash: data.password_hash || '',
                  password_hash: data.password_hash || ''
                }),
                exists: () => true
              };
            }
          }

          if (root === 'publicModerators') {
            const { data, error } = await sb.from('public_moderators').select('*');
            if (error || !data) return { val: () => ({}), exists: () => false };
            const modsMap = {};
            data.forEach(m => {
              modsMap[m.id] = { id: m.id, username: m.username, name: m.full_name, fullName: m.full_name, phone: m.phone, role: m.role };
            });
            return { val: () => modsMap, exists: () => Object.keys(modsMap).length > 0 };
          }

          if (root === 'messMenu') {
            return { val: () => null, exists: () => false };
          }
        } catch (err) {
          console.warn(`db.ref('${cleanPath}').once error:`, err);
        }

        return { val: () => null, exists: () => false };
      },

      // -------------------------------------------------------
      // REALTIME LISTEN (.on('value', cb))
      // -------------------------------------------------------
      on(eventType, callback) {
        if (typeof callback !== 'function' || !sb) return;

        if (root === 'posts' && parts.length === 1) {
          registerRealtimeListener('posts', async () => {
            const snap = await db.ref('posts').once('value');
            callback(snap);
          });
          db.ref('posts').once('value').then(callback);
        } else if (root === 'users' && parts.length === 1) {
          registerRealtimeListener('profiles', async () => {
            const snap = await db.ref('users').once('value');
            callback(snap);
          });
          db.ref('users').once('value').then(callback);
        } else if (root === 'userPrivate') {
          registerRealtimeListener('profile_private', async () => {
            const { data } = await sb.from('profile_private').select('*');
            const privMap = {};
            (data || []).forEach(p => {
              privMap[p.id] = { phone: p.phone, token: p.token, passwordHash: p.password_hash };
            });
            callback({ val: () => privMap, exists: () => Object.keys(privMap).length > 0 });
          });
        } else if (root === 'publicModerators') {
          registerRealtimeListener('public_moderators', async () => {
            const snap = await db.ref('publicModerators').once('value');
            callback(snap);
          });
          db.ref('publicModerators').once('value').then(callback);
        } else if (root === 'deletionRequests' && parts.length === 1) {
          registerRealtimeListener('deletion_requests', async () => {
            const { data } = await sb.from('deletion_requests').select('*');
            const delMap = {};
            (data || []).forEach(d => {
              delMap[d.target_id] = {
                targetUid: d.target_id,
                proposedByUid: d.proposed_by_id,
                proposedByUsername: d.proposed_by_name,
                reason: d.reason,
                approvals: d.approvals || {},
                timestamp: new Date(d.created_at).getTime()
              };
            });
            callback({ val: () => delMap, exists: () => Object.keys(delMap).length > 0 });
          });
          sb.from('deletion_requests').select('*').then(({ data }) => {
            const delMap = {};
            (data || []).forEach(d => {
              delMap[d.target_id] = {
                targetUid: d.target_id,
                proposedByUid: d.proposed_by_id,
                proposedByUsername: d.proposed_by_name,
                reason: d.reason,
                approvals: d.approvals || {},
                timestamp: new Date(d.created_at).getTime()
              };
            });
            callback({ val: () => delMap, exists: () => Object.keys(delMap).length > 0 });
          });
        } else if (root === 'notifications' && parts.length === 2) {
          const uid = parts[1];
          registerRealtimeListener('notifications', async () => {
            const { data } = await sb.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false });
            const notifsMap = {};
            (data || []).forEach(n => {
              notifsMap[n.id] = {
                id: n.id,
                title: n.title,
                body: n.body,
                senderName: n.sender_name,
                link: n.link,
                read: n.is_read,
                timestamp: new Date(n.created_at).getTime()
              };
            });
            callback({ val: () => notifsMap, exists: () => Object.keys(notifsMap).length > 0 });
          });
          sb.from('notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false }).then(({ data }) => {
            const notifsMap = {};
            (data || []).forEach(n => {
              notifsMap[n.id] = {
                id: n.id,
                title: n.title,
                body: n.body,
                senderName: n.sender_name,
                link: n.link,
                read: n.is_read,
                timestamp: new Date(n.created_at).getTime()
              };
            });
            callback({ val: () => notifsMap, exists: () => Object.keys(notifsMap).length > 0 });
          });
        } else if (root === 'messRatings' && parts.length === 2) {
          const dateKey = parts[1];
          registerRealtimeListener('mess_ratings', async () => {
            const { data } = await sb.from('mess_ratings').select('*').eq('date_key', dateKey);
            const votesMap = {};
            (data || []).forEach(r => { votesMap[r.user_id] = r.vote; });
            callback({ val: () => ({ votes: votesMap }), exists: () => (data || []).length > 0 });
          });
          sb.from('mess_ratings').select('*').eq('date_key', dateKey).then(({ data }) => {
            const votesMap = {};
            (data || []).forEach(r => { votesMap[r.user_id] = r.vote; });
            callback({ val: () => ({ votes: votesMap }), exists: () => (data || []).length > 0 });
          });
        }
      },

      // -------------------------------------------------------
      // UNSUBSCRIBE (.off())
      // -------------------------------------------------------
      off() {},

      // -------------------------------------------------------
      // WRITE / REPLACE (.set(val))
      // -------------------------------------------------------
      async set(val) {
        if (!sb) return;

        try {
          // 1. Post writes
          if (root === 'posts') {
            if (parts.length === 2) {
              const postId = parts[1];
              await sb.from('posts').upsert({
                id: postId,
                board: val.board || 'resources',
                title: val.title,
                content: val.content,
                author_id: val.authorUid || currentSupabaseUser?.uid,
                author_name: val.author || 'Student',
                author_username: val.authorUsername || null,
                is_anon: Boolean(val.isAnon),
                tag: val.tag || null,
                is_pinned: Boolean(val.isPinned),
                is_resolved: Boolean(val.isResolved),
                is_deleted: Boolean(val.isDeleted),
                image_url: val.imageUrl || null,
                price: val.price || null
              });
              triggerTableChange('posts');
              return;
            }
            if (parts.length === 3 && parts[2] === 'isPinned') {
              await sb.from('posts').update({ is_pinned: Boolean(val) }).eq('id', parts[1]);
              triggerTableChange('posts');
              return;
            }
            if (parts.length === 3 && parts[2] === 'isResolved') {
              await sb.from('posts').update({ is_resolved: Boolean(val) }).eq('id', parts[1]);
              triggerTableChange('posts');
              return;
            }
            if (parts.length === 3 && parts[2] === 'reportsCount') {
              await sb.from('posts').update({ reports_count: Number(val) || 0 }).eq('id', parts[1]);
              triggerTableChange('posts');
              return;
            }
            if (parts.length === 4 && parts[2] === 'upvotedBy') {
              const postId = parts[1];
              const userId = parts[3];
              await sb.from('post_upvotes').upsert({ post_id: postId, user_id: userId });
              triggerTableChange('posts');
              return;
            }
            if (parts.length === 4 && parts[2] === 'viewedBy') {
              const postId = parts[1];
              const userId = parts[3];
              await sb.from('post_views').upsert({ post_id: postId, user_id: userId });
              return;
            }
            if (parts.length === 5 && parts[2] === 'comments' && parts[4] === 'upvotedBy') {
              const commentId = parts[3];
              const userId = parts[5];
              await sb.from('comment_upvotes').upsert({ comment_id: commentId, user_id: userId });
              triggerTableChange('posts');
              return;
            }
          }

          // 2. User & Profile writes
          if (root === 'users') {
            if (parts.length === 2) {
              const uid = parts[1];
              await sb.from('profiles').upsert({
                id: uid,
                username: val.username,
                full_name: val.fullName || val.username,
                role: val.role || 'student',
                status: val.status || 'pending',
                terms_accepted: Boolean(val.termsAccepted),
                terms_version: val.termsVersion || '2.0'
              });
              triggerTableChange('profiles');
              return;
            }
            if (parts.length === 3 && parts[2] === 'pendingProfileUpdate') {
              await sb.from('profiles').update({ pending_profile_update: val }).eq('id', parts[1]);
              triggerTableChange('profiles');
              return;
            }
          }

          // 3. Private Vault writes
          if (root === 'userPrivate') {
            if (parts.length === 2) {
              const uid = parts[1];
              await sb.from('profile_private').upsert({
                id: uid,
                phone: val.phone || '',
                token: val.token || '',
                password_hash: val.password_hash || val.passwordHash || null
              });
              triggerTableChange('profile_private');
              return;
            }
            if (parts.length === 3 && (parts[2] === 'passwordHash' || parts[2] === 'password_hash')) {
              await sb.from('profile_private').update({ password_hash: val }).eq('id', parts[1]);
              triggerTableChange('profile_private');
              return;
            }
          }

          // 4. Deletion requests
          if (root === 'deletionRequests') {
            if (parts.length === 2) {
              const targetUid = parts[1];
              await sb.from('deletion_requests').upsert({
                target_id: targetUid,
                proposed_by_id: val.proposedByUid || currentSupabaseUser?.uid,
                proposed_by_name: val.proposedByUsername || 'Moderator',
                reason: val.reason || '',
                approvals: val.approvals || {}
              });
              triggerTableChange('deletion_requests');
              return;
            }
            if (parts.length === 4 && parts[2] === 'approvals') {
              const targetUid = parts[1];
              const modUid = parts[3];
              const { data } = await sb.from('deletion_requests').select('approvals').eq('target_id', targetUid).maybeSingle();
              const currApprovals = data?.approvals || {};
              currApprovals[modUid] = val;
              await sb.from('deletion_requests').update({ approvals: currApprovals }).eq('target_id', targetUid);
              triggerTableChange('deletion_requests');
              return;
            }
          }

          // 5. Notifications
          if (root === 'notifications' && parts.length === 4 && parts[3] === 'read') {
            const notifId = parts[2];
            await sb.from('notifications').update({ is_read: Boolean(val) }).eq('id', notifId);
            triggerTableChange('notifications');
            return;
          }

          // 6. Mess ratings
          if (root === 'messRatings' && parts.length === 4 && parts[2] === 'votes') {
            const dateKey = parts[1];
            const uid = parts[3];
            await sb.from('mess_ratings').upsert({ date_key: dateKey, user_id: uid, vote: val });
            triggerTableChange('mess_ratings');
            return;
          }
        } catch (err) {
          console.warn(`db.ref('${cleanPath}').set error:`, err);
        }
      },

      // -------------------------------------------------------
      // PARTIAL UPDATE (.update(obj))
      // -------------------------------------------------------
      async update(obj) {
        if (!sb || !obj) return;

        try {
          if (root === 'posts' && parts.length === 2) {
            const postId = parts[1];
            const sqlUpdate = {};
            if ('isPinned' in obj) sqlUpdate.is_pinned = Boolean(obj.isPinned);
            if ('isResolved' in obj) sqlUpdate.is_resolved = Boolean(obj.isResolved);
            if ('isDeleted' in obj) sqlUpdate.is_deleted = Boolean(obj.isDeleted);
            if ('deletedAt' in obj) sqlUpdate.deleted_at = obj.deletedAt ? new Date(obj.deletedAt).toISOString() : null;
            if ('deletedByUsername' in obj) sqlUpdate.deleted_by = obj.deletedByUsername;
            if ('restoreDeadline' in obj) sqlUpdate.restore_deadline = obj.restoreDeadline ? new Date(obj.restoreDeadline).toISOString() : null;
            if ('reportsCount' in obj) sqlUpdate.reports_count = Number(obj.reportsCount) || 0;
            if ('isQuarantined' in obj) sqlUpdate.is_quarantined = Boolean(obj.isQuarantined);
            if ('title' in obj) sqlUpdate.title = obj.title;
            if ('content' in obj) sqlUpdate.content = obj.content;

            await sb.from('posts').update(sqlUpdate).eq('id', postId);
            triggerTableChange('posts');
            return;
          }

          if (root === 'posts' && parts.length === 4 && parts[2] === 'comments') {
            const commentId = parts[3];
            const sqlUpdate = {};
            if ('text' in obj) sqlUpdate.text = obj.text;
            if ('isDeleted' in obj) sqlUpdate.is_deleted = Boolean(obj.isDeleted);
            await sb.from('comments').update(sqlUpdate).eq('id', commentId);
            triggerTableChange('posts');
            return;
          }

          if (root === 'users' && parts.length === 2) {
            const uid = parts[1];
            const sqlUpdate = {};
            if ('fullName' in obj) sqlUpdate.full_name = obj.fullName;
            if ('username' in obj) sqlUpdate.username = obj.username;
            if ('role' in obj) sqlUpdate.role = obj.role;
            if ('status' in obj) sqlUpdate.status = obj.status;
            if ('approvedBy' in obj) sqlUpdate.approved_by = obj.approvedBy;
            if ('approvedAt' in obj) sqlUpdate.approved_at = obj.approvedAt ? new Date(obj.approvedAt).toISOString() : null;
            if ('restoreDeadline' in obj) sqlUpdate.restore_deadline = obj.restoreDeadline ? new Date(obj.restoreDeadline).toISOString() : null;
            if ('pendingProfileUpdate' in obj) sqlUpdate.pending_profile_update = obj.pendingProfileUpdate;

            await sb.from('profiles').update(sqlUpdate).eq('id', uid);
            triggerTableChange('profiles');
            return;
          }
        } catch (err) {
          console.warn(`db.ref('${cleanPath}').update error:`, err);
        }
      },

      // -------------------------------------------------------
      // DELETE (.remove())
      // -------------------------------------------------------
      async remove() {
        if (!sb) return;

        try {
          if (root === 'posts') {
            if (parts.length === 2) {
              await sb.from('posts').delete().eq('id', parts[1]);
              triggerTableChange('posts');
              return;
            }
            if (parts.length === 4 && parts[2] === 'upvotedBy') {
              await sb.from('post_upvotes').delete().match({ post_id: parts[1], user_id: parts[3] });
              triggerTableChange('posts');
              return;
            }
            if (parts.length === 4 && parts[2] === 'comments') {
              await sb.from('comments').delete().eq('id', parts[3]);
              triggerTableChange('posts');
              return;
            }
            if (parts.length === 5 && parts[2] === 'comments' && parts[4] === 'upvotedBy') {
              await sb.from('comment_upvotes').delete().match({ comment_id: parts[3], user_id: parts[5] });
              triggerTableChange('posts');
              return;
            }
          }

          if (root === 'users') {
            if (parts.length === 2) {
              await sb.from('profiles').delete().eq('id', parts[1]);
              triggerTableChange('profiles');
              return;
            }
            if (parts.length === 3 && parts[2] === 'pendingProfileUpdate') {
              await sb.from('profiles').update({ pending_profile_update: null }).eq('id', parts[1]);
              triggerTableChange('profiles');
              return;
            }
          }

          if (root === 'userPrivate' && parts.length === 2) {
            await sb.from('profile_private').delete().eq('id', parts[1]);
            triggerTableChange('profile_private');
            return;
          }

          if (root === 'deletionRequests') {
            if (parts.length === 2) {
              await sb.from('deletion_requests').delete().eq('target_id', parts[1]);
              triggerTableChange('deletion_requests');
              return;
            }
            if (parts.length === 4 && parts[2] === 'approvals') {
              const targetUid = parts[1];
              const modUid = parts[3];
              const { data } = await sb.from('deletion_requests').select('approvals').eq('target_id', targetUid).maybeSingle();
              const currApprovals = data?.approvals || {};
              delete currApprovals[modUid];
              await sb.from('deletion_requests').update({ approvals: currApprovals }).eq('target_id', targetUid);
              triggerTableChange('deletion_requests');
              return;
            }
          }
        } catch (err) {
          console.warn(`db.ref('${cleanPath}').remove error:`, err);
        }
      },

      // -------------------------------------------------------
      // PUSH NEW ITEM (.push(item))
      // -------------------------------------------------------
      async push(val) {
        if (!sb) return { key: 'local_' + Date.now() };

        try {
          if (root === 'posts' && parts.length === 3 && parts[2] === 'comments') {
            const postId = parts[1];
            const cid = 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
            await sb.from('comments').insert({
              id: cid,
              post_id: postId,
              parent_id: val.parentId || null,
              author_id: val.authorUid || currentSupabaseUser?.uid,
              author_name: val.author || 'Batchmate',
              author_username: val.authorUsername || null,
              is_anon: Boolean(val.isAnon),
              text: val.text,
              is_deleted: false
            });
            triggerTableChange('posts');
            return { key: cid };
          }

          if (root === 'notifications' && parts.length === 2) {
            const targetUid = parts[1];
            const nid = 'n_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
            await sb.from('notifications').insert({
              id: nid,
              user_id: targetUid,
              sender_name: val.senderName || 'Batchmate',
              title: val.title,
              body: val.body,
              link: val.link || null,
              is_read: false
            });
            triggerTableChange('notifications');
            return { key: nid };
          }
        } catch (err) {
          console.warn(`db.ref('${cleanPath}').push error:`, err);
        }

        return { key: 'k_' + Date.now() };
      },

      // -------------------------------------------------------
      // ATOMIC TRANSACTION (.transaction(updateFn))
      // -------------------------------------------------------
      async transaction(updateFn) {
        // Simple client-side transaction simulation
        if (root === 'posts' && parts.length === 3 && parts[2] === 'reportsCount') {
          const postId = parts[1];
          const { data } = await sb.from('posts').select('reports_count').eq('id', postId).maybeSingle();
          const curr = data?.reports_count || 0;
          const next = updateFn(curr);
          await sb.from('posts').update({ reports_count: next }).eq('id', postId);
          triggerTableChange('posts');
        }
      }
    };
  }
};

// -------------------------------------------------------------
// INTERNAL HELPERS & REALTIME BROADCAST ENGINE
// -------------------------------------------------------------
const realtimeListeners = {};

function registerRealtimeListener(table, callback) {
  if (!realtimeListeners[table]) realtimeListeners[table] = [];
  realtimeListeners[table].push(callback);

  if (sb && !realtimeListeners[table + '_subscribed']) {
    realtimeListeners[table + '_subscribed'] = true;
    sb.channel(`sub_${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        (realtimeListeners[table] || []).forEach(cb => cb());
      })
      .subscribe();
  }
}

function triggerTableChange(table) {
  setTimeout(() => {
    (realtimeListeners[table] || []).forEach(cb => cb());
  }, 100);
}

function transformPostRow(row) {
  const upvotedByMap = {};
  (row.post_upvotes || []).forEach(u => { upvotedByMap[u.user_id] = true; });

  const viewedByMap = {};
  (row.post_views || []).forEach(v => { viewedByMap[v.user_id] = true; });

  const commentsArr = (row.comments || []).map(c => ({
    id: c.id,
    key: c.id,
    postId: c.post_id,
    parentId: c.parent_id,
    author: c.is_anon ? 'Anonymous' : c.author_name,
    authorUid: c.author_id,
    authorUsername: c.author_username,
    isAnon: Boolean(c.is_anon),
    text: c.text,
    time: formatTimeAgo(new Date(c.created_at).getTime()),
    timestamp: new Date(c.created_at).getTime(),
    isDeleted: Boolean(c.is_deleted)
  }));

  return {
    id: row.id,
    board: row.board,
    title: row.title,
    content: row.content,
    author: row.is_anon ? 'Anonymous' : row.author_name,
    authorUid: row.author_id,
    authorUsername: row.author_username,
    isAnon: Boolean(row.is_anon),
    tag: row.tag,
    isPinned: Boolean(row.is_pinned),
    isResolved: Boolean(row.is_resolved),
    isDeleted: Boolean(row.is_deleted),
    deletedAt: row.deleted_at ? new Date(row.deleted_at).getTime() : null,
    deletedByUsername: row.deleted_by,
    restoreDeadline: row.restore_deadline ? new Date(row.restore_deadline).getTime() : null,
    reportsCount: row.reports_count || 0,
    isQuarantined: Boolean(row.is_quarantined),
    price: row.price,
    imageUrl: row.image_url,
    createdAt: row.is_pinned ? 'Pinned Guide' : formatTimeAgo(new Date(row.created_at).getTime()),
    timestamp: new Date(row.created_at).getTime(),
    upvotes: Object.keys(upvotedByMap).length,
    upvotedBy: upvotedByMap,
    viewedBy: viewedByMap,
    viewsCount: Object.keys(viewedByMap).length,
    comments: commentsArr
  };
}

function transformProfileRow(p) {
  return {
    uid: p.id,
    authUid: p.id,
    username: p.username,
    fullName: p.full_name,
    role: p.role,
    status: p.status,
    registeredAt: new Date(p.registered_at).getTime(),
    approvedBy: p.approved_by,
    approvedAt: p.approved_at ? new Date(p.approved_at).getTime() : null,
    pendingProfileUpdate: p.pending_profile_update,
    restoreDeadline: p.restore_deadline ? new Date(p.restore_deadline).getTime() : null,
    termsAccepted: p.terms_accepted,
    phone: '',
    token: ''
  };
}

function formatTimeAgo(ts) {
  if (!ts) return 'Just now';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
