/**
 * MTMC26 — Auth Gate Controller
 * Handles: login, registration, logout, gate tab switching, forgot-password moderator list,
 * pending moderators drawer, and the master gate/forum state manager.
 */

// ─── Gate Tab Switcher ────────────────────────────────────────────────────────
function switchGateTab(tab) {
  const tabLogin  = document.getElementById('gate-tab-login');
  const tabReg    = document.getElementById('gate-tab-register');
  const tabForgot = document.getElementById('gate-tab-forgot');

  const formLogin  = document.getElementById('gate-form-login');
  const formReg    = document.getElementById('gate-form-register');
  const formForgot = document.getElementById('gate-form-forgot');

  const errBox  = document.getElementById('gate-error-msg');
  const succBox = document.getElementById('gate-success-msg');
  if (errBox)  errBox.classList.add('hidden');
  if (succBox) succBox.classList.add('hidden');

  const activeClass   = 'py-1.5 rounded transition bg-brand-orange text-white font-semibold text-xs';
  const inactiveClass = 'py-1.5 rounded transition text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-xs';

  if (tab === 'register') {
    tabReg.className   = activeClass;
    tabLogin.className = inactiveClass;
    tabForgot.className = inactiveClass;
    formReg.classList.remove('hidden');
    formLogin.classList.add('hidden');
    formForgot.classList.add('hidden');
  } else if (tab === 'forgot') {
    tabForgot.className = activeClass;
    tabLogin.className  = inactiveClass;
    tabReg.className    = inactiveClass;
    formForgot.classList.remove('hidden');
    formLogin.classList.add('hidden');
    formReg.classList.add('hidden');
    renderForgotModeratorsList();
  } else {
    tabLogin.className  = activeClass;
    tabReg.className    = inactiveClass;
    tabForgot.className = inactiveClass;
    formLogin.classList.remove('hidden');
    formReg.classList.add('hidden');
    formForgot.classList.add('hidden');
  }

  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

// ─── Login Handler ────────────────────────────────────────────────────────────
async function handleGateLogin(e) {
  e.preventDefault();
  const errBox  = document.getElementById('gate-error-msg');
  const succBox = document.getElementById('gate-success-msg');
  errBox.classList.add('hidden');
  succBox.classList.add('hidden');

  const uname = document.getElementById('gate-login-username').value.trim();
  const pass  = document.getElementById('gate-login-password').value;

  if (!uname || !pass) {
    errBox.textContent = 'Please enter both username and password.';
    errBox.classList.remove('hidden');
    return;
  }

  const authEmail = getAuthEmail(uname);
  let authUser = null;

  if (auth) {
    try {
      const cred = await auth.signInWithEmailAndPassword(authEmail, pass);
      authUser = cred.user;
    } catch (authErr) {

      if (!authUser) {
        const msg = (authErr.message || '').toLowerCase();
        if (msg.includes('disabled') || authErr.code === 'auth/provider-disabled') {
          errBox.textContent = 'Email Provider is disabled in Supabase! Please enable "Enable Email provider" under Authentication -> Providers -> Email in your Supabase dashboard.';
        } else if (msg.includes('email not confirmed')) {
          errBox.textContent = 'Email confirmation pending in Supabase. Please disable "Confirm email" under Authentication -> Providers -> Email in your Supabase dashboard.';
        } else if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
          errBox.textContent = 'Supabase email rate limit reached. Please disable "Confirm email" in Supabase Authentication -> Providers -> Email.';
        } else if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/invalid-login-credentials') {
          errBox.textContent = 'Incorrect username or password. Please verify or use "Help / Reset" if forgotten.';
        } else {
          errBox.textContent = authErr.message || 'Authentication error. Please check your credentials.';
        }
        errBox.classList.remove('hidden');
        return;
      }
    }
  }

  if (!authUser) {
    errBox.textContent = 'Authentication service unavailable. Please refresh and try again.';
    errBox.classList.remove('hidden');
    return;
  }

  // User is authenticated in Supabase Auth — auth != null is now TRUE.
  try {
    let userSnap = await db.ref('users/' + authUser.uid).once('value');
    let userData = userSnap.val();

    if (!userData) {
      const allSnap = await db.ref('users').once('value');
      const allU = allSnap.val() || {};
      const legacy = Object.values(allU).find(u => (u.username || '').toLowerCase() === uname.toLowerCase());
      if (legacy) {
        userData = legacy;
        userData.uid = authUser.uid;
        userData.authUid = authUser.uid;
        userData.authEmail = authEmail;
        await db.ref('users/' + authUser.uid).set(userData);
      }
    }

    const isAdmin = (uname.toLowerCase() === 'admin');

    if (!userData) {
      if (isAdmin) {
        userData = {
          uid: authUser.uid,
          authUid: authUser.uid,
          authEmail: authEmail,
          fullName: 'ADMIN',
          username: 'admin',
          role: 'admin',
          status: 'verified',
          registeredAt: Date.now(),
          termsAccepted: true,
          termsVersion: '2.0',
          termsAcceptedAt: Date.now(),
          phone: '',
          token: '#SYS-ROOT'
        };
        await db.ref('users/' + authUser.uid).set(userData);
      } else {
        // LOGIN MUST NEVER AUTO-CREATE ACCOUNTS FOR NON-ADMIN USERS
        if (auth) await auth.signOut().catch(() => {});
        errBox.textContent = 'Account not found. Please click "Create Account" above to register with your full name and mobile number.';
        errBox.classList.remove('hidden');
        return;
      }
    }

    // Fetch private phone & token from userPrivate vault
    const privSnap = await db.ref('userPrivate/' + authUser.uid).once('value');
    const priv = privSnap.val() || {};
    if (isAdmin || userData.role === 'admin' || (userData.username || '').toLowerCase() === 'admin') {
      userData.phone    = '';
      userData.fullName = 'ADMIN';
      userData.token    = '#SYS-ROOT';
      userData.role     = 'admin';
      userData.status   = 'verified';
    } else {
      userData.phone = priv.phone || userData.phone || '';
      userData.token = priv.token || userData.token || ('#MTMC-' + Math.floor(1000 + Math.random() * 9000));
    }

    delete userData.passwordHash;

    currentUserSession = userData;
    localStorage.setItem('mtmc_session_v2', JSON.stringify(userData));

    setupFirebaseListeners();
    initMessRatingListener();
    initNotificationsListener();
    updateGateState();
  } catch (dbErr) {
    console.error("Profile sync error:", dbErr);
    errBox.textContent = 'Could not load your student profile. Please contact a Batch Moderator.';
    errBox.classList.remove('hidden');
  }
}

// ─── Registration Handler ─────────────────────────────────────────────────────
async function handleGateRegister(e) {
  e.preventDefault();
  const errBox  = document.getElementById('gate-error-msg');
  const succBox = document.getElementById('gate-success-msg');
  errBox.classList.add('hidden');
  succBox.classList.add('hidden');

  const fullname   = (document.getElementById('gate-reg-fullname')?.value || '').trim();
  const uname      = document.getElementById('gate-reg-username').value.trim();
  const pass       = document.getElementById('gate-reg-password').value;
  const phoneInput = document.getElementById('gate-reg-phone').value.trim();
  const cleanPhone = phoneInput.replace(/[^0-9]/g, '');

  if (!fullname || fullname.length < 2) {
    errBox.textContent = 'Please enter your full name as per college records.';
    errBox.classList.remove('hidden');
    return;
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(uname)) {
    errBox.textContent = 'Username must be 3-20 characters (letters, numbers, underscore only).';
    errBox.classList.remove('hidden');
    return;
  }
  if (pass.length < 6) {
    errBox.textContent = 'Password must be at least 6 characters.';
    errBox.classList.remove('hidden');
    return;
  }
  if (cleanPhone.length !== 10) {
    errBox.textContent = 'Please enter a valid 10-digit mobile number.';
    errBox.classList.remove('hidden');
    return;
  }

  const reservedUsernames = ['admin', 'administrator', 'root', 'moderator', 'sysadmin'];
  if (reservedUsernames.includes(uname.toLowerCase())) {
    errBox.textContent = 'This username is reserved. Please choose another username.';
    errBox.classList.remove('hidden');
    return;
  }

  const authEmail = getAuthEmail(uname);
  let authUser = null;

  if (auth) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(authEmail, pass);
      if (userCredential && userCredential.user) authUser = userCredential.user;
    } catch (authErr) {
      const msg = (authErr.message || '').toLowerCase();
      if (msg.includes('disabled') || authErr.code === 'auth/provider-disabled') {
        errBox.textContent = 'Email Provider is disabled in Supabase! Please enable "Enable Email provider" in Supabase Authentication -> Providers -> Email.';
      } else if (authErr.code === 'auth/email-already-in-use') {
        errBox.textContent = 'This username is already taken. Please choose another.';
      } else if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
        errBox.textContent = 'Registration rate limit reached. Please disable "Confirm email" in Supabase Authentication -> Providers -> Email.';
      } else {
        errBox.textContent = authErr.message || 'Registration failed. Please try again.';
      }
      errBox.classList.remove('hidden');
      return;
    }
  }

  if (!authUser) {
    errBox.textContent = 'Authentication service unavailable. Please refresh and try again.';
    errBox.classList.remove('hidden');
    return;
  }

  const uid    = authUser.uid;
  const role   = 'student';
  const status = 'pending';
  const token  = '#MTMC-' + Math.floor(1000 + Math.random() * 9000);

  // Public profile (NO unmasked phone number in public users node)
  const newUser = {
    uid, authUid: uid, authEmail,
    fullName: fullname, username: uname,
    role, status,
    registeredAt: Date.now(),
    termsAccepted: true, termsVersion: '2.0', termsAcceptedAt: Date.now()
  };

  // Private vault (phone & token strictly locked to owner and moderators)
  const privateData = {
    phone: cleanPhone, token,
    fullName: fullname, username: uname,
    registeredAt: Date.now()
  };

  if (db) {
    try {
      await db.ref('users/' + uid).set(newUser);
      await db.ref('userPrivate/' + uid).set(privateData);
    } catch (dbErr) {
      console.error("Registration database error:", dbErr);
      if (auth) await auth.signOut().catch(() => {});
      const msg = (dbErr.message || '').toLowerCase();
      if (msg.includes('profile_private_phone_unique') || msg.includes('unique') || msg.includes('phone') || msg.includes('23505')) {
        errBox.textContent = 'This mobile number is already registered with another account. Please use your own mobile number or contact a Batch Moderator.';
      } else {
        errBox.textContent = dbErr.message || 'Registration database setup failed. Please try again.';
      }
      errBox.classList.remove('hidden');
      return;
    }
  }

  newUser.phone = cleanPhone;
  newUser.token = token;
  currentUserSession = newUser;
  localStorage.setItem('mtmc_session_v2', JSON.stringify(newUser));

  setupFirebaseListeners();
  initMessRatingListener();
  initNotificationsListener();
  updateGateState();
}

// ─── Logout Handler ───────────────────────────────────────────────────────────
function handleLogout() {
  if (auth) auth.signOut().catch(() => {});
  if (db) {
    db.ref('posts').off();
    db.ref('users').off();
    db.ref('userPrivate').off();
    db.ref('deletionRequests').off();
    db.ref('feedback').off();
    if (currentUserSession) {
      db.ref('notifications/' + currentUserSession.uid).off();
    }
  }
  currentUserSession = null;
  allCommunityFeedback = {};
  localStorage.removeItem('mtmc_session_v2');
  closeProfileModal();
  updateGateState();
  switchGateTab('login');
}

// ─── Forgot Password: Dynamic Moderator List (Reads publicModerators node) ───
function renderForgotModeratorsList() {
  const container = document.getElementById('forgot-moderators-list');
  if (!container) return;

  const mods = Object.values(allPublicModerators || {}).filter(m =>
    (m.username || '').toLowerCase() !== 'admin' && m.phone
  );

  if (mods.length === 0) {
    container.innerHTML = `
      <div class="p-3 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p class="font-semibold text-slate-700 dark:text-slate-300">No batch moderators currently on duty.</p>
        <p class="text-[11px]">Please reach out to your Class Representative (CR) on WhatsApp for account recovery.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = mods.map(m => {
    const displayName   = m.name || m.fullName || m.username;
    const phone         = (m.phone || '').replace(/[^0-9]/g, '');
    const formattedPhone = phone.length === 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : `+91 ${phone}`;
    const escapedName   = displayName.replace(/'/g, "\\'");
    const isSuperMod    = m.role && (m.role.toLowerCase().includes('super') || m.role.toLowerCase().includes('head'));
    return `
      <div class="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-semibold text-slate-900 dark:text-white text-xs truncate">${displayName}</span>
            ${isSuperMod
              ? `<span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">🛡️ Super Mod</span>`
              : `<span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400">Mod</span>`
            }
          </div>
          <div class="text-[11px] font-mono text-slate-500 dark:text-slate-400">${formattedPhone}</div>
        </div>
        <button type="button" onclick="contactSpecificModerator('${escapedName}', '${phone}')" class="shrink-0 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1 text-xs">
          <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          <span>Message</span>
        </button>
      </div>
    `;
  }).join('');
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

function togglePendingModeratorsList() {
  const container = document.getElementById('pending-moderators-container');
  const chevron   = document.getElementById('pending-mods-chevron');
  if (!container) return;
  const isHidden = container.classList.contains('hidden');
  if (isHidden) {
    container.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
    renderPendingModeratorsList();
  } else {
    container.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  }
}

function renderPendingModeratorsList() {
  const container = document.getElementById('pending-moderators-list');
  if (!container) return;

  const mods = Object.values(allPublicModerators || {}).filter(m =>
    (m.username || '').toLowerCase() !== 'admin' && m.phone
  );

  if (mods.length === 0) {
    container.innerHTML = `
      <div class="p-3 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p class="font-semibold text-slate-700 dark:text-slate-300">No batch moderators currently listed.</p>
        <p class="text-[11px]">Please reach out to your Class Representative (CR) on WhatsApp to verify your account.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = mods.map(m => {
    const displayName    = m.name || m.fullName || m.username;
    const phone          = (m.phone || '').replace(/[^0-9]/g, '');
    const formattedPhone = phone.length === 10 ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : `+91 ${phone}`;
    const isSuperMod     = m.role && (m.role.toLowerCase().includes('super') || m.role.toLowerCase().includes('head'));
    return `
      <div class="p-2.5 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="font-semibold text-slate-900 dark:text-white text-xs truncate">${escapeHtml(displayName)}</span>
            ${isSuperMod
              ? `<span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">🛡️ Super Mod</span>`
              : `<span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400">Mod</span>`
            }
          </div>
          <div class="text-[10px] font-mono text-slate-500 dark:text-slate-400">${formattedPhone}</div>
        </div>
        <a href="https://wa.me/91${phone}" target="_blank" class="shrink-0 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1 text-xs">
          <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
          <span>Message</span>
        </a>
      </div>
    `;
  }).join('');
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

function initPublicModeratorsListener() {
  if (!db) return;
  db.ref('publicModerators').on('value', snap => {
    allPublicModerators = snap.val() || {};
    renderForgotModeratorsList();
    renderPendingModeratorsList();
  });
}

function contactSpecificModerator(modName, modPhone) {
  const uname = document.getElementById('forgot-wa-username').value.trim();
  const phone = document.getElementById('forgot-wa-phone').value.trim();

  if (!uname) {
    alert('Please enter your registered username first so the moderator can locate your account.');
    const unameInput = document.getElementById('forgot-wa-username');
    if (unameInput) unameInput.focus();
    return;
  }

  const cleanPhone   = (modPhone || '').replace(/[^0-9]/g, '');
  const targetNumber = cleanPhone.startsWith('91') ? cleanPhone : ('91' + cleanPhone);
  const msg = encodeURIComponent(
    `Hi ${modName}, I forgot my password for the MTMC MBBS Batch 2026 Student Forum.\n• Registered Username: ${uname}\n• Registered Mobile: +91 ${phone || 'on file'}\nPlease verify my identity and send me a temporary password reset.`
  );
  window.open(`https://wa.me/${targetNumber}?text=${msg}`, '_blank');
}

// ─── Compatibility Helpers (legacy onclick references) ────────────────────────
function openAuthModal(tab)       { updateGateState(); switchGateTab(tab || 'login'); }
function closeAuthModal()         {}
function openVerificationModal()  { updateGateState(); }
function closeVerificationModal() {}
function openRulesModal()  { document.getElementById('rules-modal').classList.remove('hidden'); }
function closeRulesModal() { document.getElementById('rules-modal').classList.add('hidden'); }

// ─── Master Gate & Forum State Manager ───────────────────────────────────────
function updateGateState() {
  const authGate        = document.getElementById('auth-gate-view');
  const forumView       = document.getElementById('forum-view');
  const gateAuthCard    = document.getElementById('gate-auth-card');
  const gatePendingCard = document.getElementById('gate-pending-card');
  const gateRejectedCard = document.getElementById('gate-rejected-card');
  const searchWrapper   = document.getElementById('header-search-wrapper');
  const newPostBtn      = document.getElementById('header-new-post-btn');
  const userBtn         = document.getElementById('user-profile-btn');
  const adminShieldBtn  = document.getElementById('admin-shield-btn');
  const feedbackBtn     = document.getElementById('header-feedback-btn');

  /** Helper: hide a set of nav elements uniformly */
  function hideNavElements() {
    if (searchWrapper)  { searchWrapper.classList.add('hidden'); searchWrapper.classList.remove('md:block'); }
    const mobileSearchBtn = document.getElementById('mobile-search-toggle-btn');
    if (mobileSearchBtn) { mobileSearchBtn.classList.add('hidden'); mobileSearchBtn.classList.remove('flex'); }
    const mobileSearchBar = document.getElementById('mobile-search-bar');
    if (mobileSearchBar) mobileSearchBar.classList.add('hidden');
    if (newPostBtn)  { newPostBtn.classList.add('hidden');  newPostBtn.classList.remove('flex'); }
    if (userBtn)     { userBtn.classList.add('hidden');     userBtn.classList.remove('flex'); }
    if (adminShieldBtn) { adminShieldBtn.classList.add('hidden'); adminShieldBtn.classList.remove('flex'); }
    if (feedbackBtn) { feedbackBtn.classList.add('hidden'); feedbackBtn.classList.remove('flex'); }
    const notifBtn = document.getElementById('notif-bell-btn');
    if (notifBtn)    { notifBtn.classList.add('hidden');    notifBtn.classList.remove('flex'); }
  }

  if (!currentUserSession) {
    // Visitor is not logged in: Lock the forum, show Auth Gate
    if (authGate) authGate.classList.remove('hidden');
    if (forumView) forumView.classList.add('hidden');
    if (gateAuthCard)    gateAuthCard.classList.remove('hidden');
    if (gatePendingCard) gatePendingCard.classList.add('hidden');
    if (gateRejectedCard) gateRejectedCard.classList.add('hidden');
    hideNavElements();

  } else if (currentUserSession.status === 'pending') {
    // Account registered but pending verification: Show Pending Handshake Gate
    if (authGate) authGate.classList.remove('hidden');
    if (forumView) forumView.classList.add('hidden');
    if (gateAuthCard)    gateAuthCard.classList.add('hidden');
    if (gatePendingCard) gatePendingCard.classList.remove('hidden');
    if (gateRejectedCard) gateRejectedCard.classList.add('hidden');

    const els = {
      'gate-pending-fullname':   currentUserSession.fullName || currentUserSession.username,
      'gate-pending-user':       '@' + currentUserSession.username,
      'gate-pending-card-name':  currentUserSession.fullName || '—',
      'gate-pending-card-uname': '@' + currentUserSession.username,
      'gate-pending-phone':      currentUserSession.phone ? '+91 ' + currentUserSession.phone : '—',
      'gate-pending-token':      currentUserSession.token || '—'
    };
    Object.entries(els).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
    renderPendingModeratorsList();
    hideNavElements();

  } else if (['rejected', 'suspended', 'deleted'].includes(currentUserSession.status)) {
    if (authGate) authGate.classList.remove('hidden');
    if (forumView) forumView.classList.add('hidden');
    if (gateAuthCard)    gateAuthCard.classList.add('hidden');
    if (gatePendingCard) gatePendingCard.classList.add('hidden');
    if (gateRejectedCard) gateRejectedCard.classList.remove('hidden');

    const rejTitle = document.getElementById('gate-rejected-title');
    const rejDesc  = document.getElementById('gate-rejected-desc');
    if (currentUserSession.status === 'suspended') {
      if (rejTitle) rejTitle.textContent = 'Account Under Review';
      if (rejDesc)  rejDesc.textContent  = 'Your account has been temporarily paused while batch moderators review your account. Please reach out to a Batch Moderator on WhatsApp if you have questions.';
    } else if (currentUserSession.status === 'deleted') {
      if (rejTitle) rejTitle.textContent = 'Account Deactivated';
      if (rejDesc)  rejDesc.textContent  = 'This account was deactivated. A 7-day recovery grace period is currently active. If this was a mistake, please message a Batch Moderator on WhatsApp to restore your access.';
    } else {
      if (rejTitle) rejTitle.textContent = 'Verification Declined';
      if (rejDesc)  rejDesc.textContent  = 'This registration could not be verified by the batch moderators. If this is a mistake, please reach out to a Batch Moderator on WhatsApp.';
    }
    hideNavElements();

  } else {
    // Verified Member / Moderator: UNLOCK FORUM!
    if (authGate)  authGate.classList.add('hidden');
    if (forumView) forumView.classList.remove('hidden');

    if (searchWrapper) { searchWrapper.classList.add('hidden'); searchWrapper.classList.add('md:block'); }
    const mobileSearchBtn = document.getElementById('mobile-search-toggle-btn');
    if (mobileSearchBtn) { mobileSearchBtn.classList.remove('hidden'); mobileSearchBtn.classList.add('flex'); }
    if (newPostBtn)  { newPostBtn.classList.remove('hidden');  newPostBtn.classList.add('flex'); }
    if (userBtn)     { userBtn.classList.remove('hidden');     userBtn.classList.add('flex'); }
    if (feedbackBtn) { feedbackBtn.classList.remove('hidden'); feedbackBtn.classList.add('flex'); }
    const notifBtn = document.getElementById('notif-bell-btn');
    if (notifBtn)    { notifBtn.classList.remove('hidden');    notifBtn.classList.add('flex'); }
    initNotificationsListener();

    if (currentUserSession.role === 'admin') {
      initFeedbackListener();
    }

    const displayName = document.getElementById('user-display-name');
    const avatar      = document.getElementById('user-avatar');
    if (displayName) displayName.textContent = currentUserSession.fullName || currentUserSession.username;
    if (avatar)      avatar.textContent = (currentUserSession.fullName || currentUserSession.username).substring(0, 2).toUpperCase();

    if (isModOrAbove(currentUserSession.role)) {
      if (adminShieldBtn) {
        adminShieldBtn.classList.remove('hidden');
        adminShieldBtn.classList.add('flex');
        const icon = adminShieldBtn.querySelector('i');
        if (currentUserSession.role === 'supermod') {
          adminShieldBtn.className = 'items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition shadow-sm flex';
          if (icon) icon.className = 'w-4 h-4 text-amber-500';
        } else {
          adminShieldBtn.className = 'items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition shadow-sm flex';
          if (icon) icon.className = 'w-4 h-4 text-purple-500';
        }
      }
      const shieldLabel = document.getElementById('admin-shield-label');
      if (shieldLabel) {
        shieldLabel.textContent = currentUserSession.role === 'supermod' ? 'Super Mod'
          : (currentUserSession.role === 'admin' ? 'Admin' : 'Moderator');
      }
      updateAdminBadges();
    } else {
      if (adminShieldBtn) { adminShieldBtn.classList.add('hidden'); adminShieldBtn.classList.remove('flex'); }
    }

    renderFeed();
    updateStats();
    updateProfileTrashBadge();
  }

  if (window.lucide && window.lucide.createIcons) lucide.createIcons();
}

function updateUserUI() { updateGateState(); }
