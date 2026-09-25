/**
 * MTMC26 — Batch Events & 4K Drive Gallery
 */

    // ================= BATCH EVENT BACKCOVER BANNER GENERATOR (TITLE & DATE OVERLAY) =================
    let uploadedBannerImage = null;
    let eventDateMode = 'single'; // 'single' or 'range'

    function setEventDateMode(mode) {
      eventDateMode = mode;
      const btnSingle = document.getElementById('btn-date-mode-single');
      const btnRange = document.getElementById('btn-date-mode-range');
      const contSingle = document.getElementById('date-input-container-single');
      const contRange = document.getElementById('date-input-container-range');

      if (mode === 'single') {
        if (btnSingle) btnSingle.className = 'px-2.5 py-1 rounded-md font-bold transition bg-cyan-500 text-white shadow-sm';
        if (btnRange) btnRange.className = 'px-2.5 py-1 rounded-md font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition';
        if (contSingle) contSingle.classList.remove('hidden');
        if (contRange) contRange.classList.add('hidden');
      } else {
        if (btnRange) btnRange.className = 'px-2.5 py-1 rounded-md font-bold transition bg-cyan-500 text-white shadow-sm';
        if (btnSingle) btnSingle.className = 'px-2.5 py-1 rounded-md font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition';
        if (contRange) contRange.classList.remove('hidden');
        if (contSingle) contSingle.classList.add('hidden');
      }
      updateLiveBanner();
    }

    function getEventFormattedDate() {
      if (eventDateMode === 'single') {
        const d = document.getElementById('modal-event-date-single')?.value;
        if (!d) return '';
        try {
          const dt = new Date(d + 'T00:00:00');
          return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
          return d;
        }
      } else {
        const start = document.getElementById('modal-event-date-start')?.value;
        const end = document.getElementById('modal-event-date-end')?.value;
        if (!start && !end) return '';
        if (start && !end) {
          const dt1 = new Date(start + 'T00:00:00');
          return dt1.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        if (start && end) {
          const dt1 = new Date(start + 'T00:00:00');
          const dt2 = new Date(end + 'T00:00:00');
          const sStr = dt1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const eStr = dt2.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          return `${sStr} – ${eStr}`;
        }
        return '';
      }
    }

    function extractDriveFolderId(url) {
      if (!url) return null;
      const clean = url.trim();
      let match = clean.match(/folders\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
      match = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
      match = clean.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
      if (/^[a-zA-Z0-9_-]{20,50}$/.test(clean)) return clean;
      return null;
    }

    function handleDriveUrlInput() {
      const input = document.getElementById('modal-event-drive');
      const status = document.getElementById('modal-event-drive-status');
      if (!input || !status) return;
      const id = extractDriveFolderId(input.value);
      if (id) {
        status.textContent = '✓ Drive Folder Detected';
        status.className = 'text-[10px] font-mono font-bold text-emerald-500';
      } else if (input.value.trim().length > 5) {
        status.textContent = 'Enter a valid Google Drive folder link';
        status.className = 'text-[10px] font-mono font-bold text-amber-500';
      } else {
        status.textContent = '';
      }
    }

    function handleEventBannerSelected(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      if (file.size > 20 * 1024 * 1024) {
        alert('Please select a cover photo under 20MB.');
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
          uploadedBannerImage = img;
          updateLiveBanner();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      let testY = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, testY);
          line = words[n] + ' ';
          testY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, testY);
    }

    function updateLiveBanner() {
      const canvas = document.getElementById('event-banner-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = 1280;
      const H = 720;
      canvas.width = W;
      canvas.height = H;

      // 1. Draw Background: Uploaded Photo or Collegiate Obsidian Gradient
      if (uploadedBannerImage) {
        const img = uploadedBannerImage;
        const hRatio = W / img.width;
        const vRatio = H / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (W - img.width * ratio) / 2;
        const centerShiftY = (H - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
      } else {
        const grad = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W / 1.1);
        grad.addColorStop(0, '#0d1f4d');
        grad.addColorStop(0.5, '#081226');
        grad.addColorStop(1, '#02050e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 2;
        for (let i = -W; i < W * 2; i += 75) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + H, H);
          ctx.stroke();
        }
      }

      // 2. Cinematic Gradient Scrim (Bottom & Top Vignettes)
      const scrim = ctx.createLinearGradient(0, H * 0.25, 0, H);
      scrim.addColorStop(0, 'rgba(3, 7, 18, 0.10)');
      scrim.addColorStop(0.5, 'rgba(3, 7, 18, 0.65)');
      scrim.addColorStop(1, 'rgba(3, 7, 18, 0.96)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, W, H);

      const topScrim = ctx.createLinearGradient(0, 0, 0, H * 0.35);
      topScrim.addColorStop(0, 'rgba(0, 0, 0, 0.70)');
      topScrim.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = topScrim;
      ctx.fillRect(0, 0, W, H * 0.35);

      // 3. Category & 4K Badges (Top)
      const category = document.getElementById('modal-event-category')?.value || 'ceremony';
      const categoryLabels = {
        ceremony: '🩺 MILESTONE CEREMONY',
        fest: '🎉 BATCH FEST & CULTURAL',
        sports: '🏆 SPORTS & ATHLETICS',
        trip: '🏕️ BATCH TRIP & OUTING',
        academic: '🔬 ACADEMIC WORKSHOP',
        campus: '🏛️ CAMPUS & HOSTEL LIFE'
      };
      const catText = categoryLabels[category] || 'BATCH EVENT';

      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      const catMetrics = ctx.measureText(catText);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)';
      ctx.lineWidth = 2;
      roundRect(ctx, 48, 44, catMetrics.width + 36, 42, 12, true, true);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(catText, 66, 73);

      const ultraText = '✨ 4K ULTRA-HD GALLERY';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      const ultraMetrics = ctx.measureText(ultraText);
      const rightX = W - 48 - (ultraMetrics.width + 36);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      roundRect(ctx, rightX, 44, ultraMetrics.width + 36, 42, 12, true, true);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(ultraText, rightX + 18, 72);

      // 4. Date & Title (Bottom Content Area)
      const rawTitle = document.getElementById('modal-event-title')?.value.trim() || 'Event Title (e.g. White Coat Ceremony)';
      const rawDate = getEventFormattedDate() || (eventDateMode === 'single' ? 'Select Event Date' : 'Select Start & End Dates');
      const rawVenue = document.getElementById('modal-event-venue')?.value.trim() || 'MTMC Campus, Baridih';

      // Date Badge
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
      const dateLabel = (eventDateMode === 'single' ? '📅 ' : '🗓️ ') + rawDate;
      const dateMetrics = ctx.measureText(dateLabel);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.lineWidth = 2;
      roundRect(ctx, 48, H - 245, dateMetrics.width + 36, 46, 12, true, true);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(dateLabel, 66, H - 213);

      // Title Typography with Shadow
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;

      let titleFontSize = 54;
      if (rawTitle.length > 35) titleFontSize = 44;
      if (rawTitle.length > 55) titleFontSize = 36;
      ctx.font = `900 ${titleFontSize}px system-ui, -apple-system, sans-serif`;
      wrapCanvasText(ctx, rawTitle, 48, H - 135, W - 96, titleFontSize + 14);

      // Reset Shadow & Draw Venue
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(`📍 ${rawVenue}  ·  MTMC MBBS BATCH 2026`, 48, H - 42);
    }



    let activeEventCategory = 'all';

    async function loadBatchEvents() {
      // 1. Prune fictitious legacy demo events from local state and Firebase RTDB
      const legacyDummyEvents = [
        'event-white-coat-ceremony',
        'event-freshers-welcome',
        'event-pulse-sports',
        'event-dalma-dimna-trip',
        'event-clinical-skills-workshop'
      ];

      try {
        const res = await fetch('events.json');
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list)) {
            batchEvents = list.filter(e => !legacyDummyEvents.includes(e.id));
          }
        }
      } catch (e) {
        console.warn('events.json check:', e);
      }

      if (db) {
        // Clean out legacy fake events from Firebase RTDB if previously stored
        legacyDummyEvents.forEach(fakeId => {
          db.ref('events/' + fakeId).remove().catch(() => {});
        });

        // Real-time listener for events submitted via UI
        db.ref('events').on('value', snap => {
          const val = snap.val();
          if (val) {
            const dynamicList = Object.entries(val)
              .filter(([k]) => !legacyDummyEvents.includes(k))
              .map(([k, v]) => ({ id: k, ...v }));

            const map = new Map();
            batchEvents.forEach(ev => map.set(ev.id, ev));
            dynamicList.forEach(ev => map.set(ev.id, ev));
            batchEvents = Array.from(map.values()).filter(e => !legacyDummyEvents.includes(e.id));

            if (activeBoard === 'events') {
              renderEventsGallery();
            }
          } else {
            batchEvents = batchEvents.filter(e => !legacyDummyEvents.includes(e.id));
            if (activeBoard === 'events') {
              renderEventsGallery();
            }
          }
        });
      }

      if (activeBoard === 'events') {
        renderEventsGallery();
      }
    }

    function filterEventCategory(cat) {
      activeEventCategory = cat;
      renderEventsGallery();
    }

    function openEventModal() {
      if (!currentUserSession) {
        openAuthModal('login');
        return;
      }
      if (currentUserSession.status !== 'verified') {
        alert('Please wait for account verification by a Batch Moderator to publish events.');
        return;
      }

      const modal = document.getElementById('event-modal');
      if (!modal) return;

      // Reset form fields
      const titleInput = document.getElementById('modal-event-title');
      const venueInput = document.getElementById('modal-event-venue');
      const descInput = document.getElementById('modal-event-desc');
      const driveInput = document.getElementById('modal-event-drive');
      const driveStatus = document.getElementById('modal-event-drive-status');
      const singleDate = document.getElementById('modal-event-date-single');
      const startDate = document.getElementById('modal-event-date-start');
      const endDate = document.getElementById('modal-event-date-end');
      const bannerInput = document.getElementById('modal-event-banner-input');

      if (titleInput) titleInput.value = '';
      if (venueInput) venueInput.value = '';
      if (descInput) descInput.value = '';
      if (driveInput) driveInput.value = '';
      if (driveStatus) driveStatus.textContent = '';
      if (bannerInput) bannerInput.value = '';
      if (startDate) startDate.value = '';
      if (endDate) endDate.value = '';

      // Default single date to today
      const todayIso = new Date().toISOString().split('T')[0];
      if (singleDate) singleDate.value = todayIso;

      uploadedBannerImage = null;
      setEventDateMode('single');
      updateLiveBanner();

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    function closeEventModal() {
      const modal = document.getElementById('event-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    async function submitBatchEvent() {
      if (!currentUserSession) {
        openAuthModal('login');
        return;
      }

      const title = document.getElementById('modal-event-title')?.value.trim();
      const category = document.getElementById('modal-event-category')?.value || 'ceremony';
      const venue = document.getElementById('modal-event-venue')?.value.trim();
      const desc = document.getElementById('modal-event-desc')?.value.trim();
      const driveUrl = document.getElementById('modal-event-drive')?.value.trim();
      const dateFormatted = getEventFormattedDate();

      if (!title) {
        alert('Please enter an event name or title.');
        document.getElementById('modal-event-title')?.focus();
        return;
      }
      if (!dateFormatted) {
        alert('Please specify the event date or date range.');
        return;
      }
      if (!driveUrl) {
        alert('Please provide the Google Drive folder link for this event.');
        document.getElementById('modal-event-drive')?.focus();
        return;
      }

      const folderId = extractDriveFolderId(driveUrl);
      if (!folderId) {
        alert('Could not detect a valid Google Drive folder ID in the provided link.\n\nPlease paste a link in this format:\nhttps://drive.google.com/drive/folders/1abcXYZ...');
        return;
      }

      // Generate the Backcover Banner data URL from Canvas
      updateLiveBanner();
      const canvas = document.getElementById('event-banner-canvas');
      let bannerDataUrl = '';
      if (canvas) {
        bannerDataUrl = canvas.toDataURL('image/webp', 0.82);
        if (!bannerDataUrl.startsWith('data:image/webp')) {
          bannerDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        }
      }

      const categoryLabels = {
        ceremony: 'Milestone Ceremony',
        fest: 'Batch Fest & Cultural',
        sports: 'Sports & Athletics',
        trip: 'Batch Trip & Outing',
        academic: 'Academic Workshop',
        campus: 'Campus & Hostel Life'
      };

      const eventId = 'event-' + Date.now();
      const newEvent = {
        id: eventId,
        title: title,
        category: category,
        categoryLabel: categoryLabels[category] || 'Batch Event',
        status: 'completed',
        statusLabel: '4K Gallery',
        date: dateFormatted,
        dateMode: eventDateMode,
        venue: venue || 'MTMC Campus, Baridih',
        description: desc || '',
        driveAlbumUrl: driveUrl,
        driveFolderId: folderId,
        coverImage: bannerDataUrl,
        createdByName: currentUserSession.fullName || currentUserSession.username,
        createdByUid: currentUserSession.uid,
        createdByRole: currentUserSession.role || 'student',
        createdAt: Date.now()
      };

      if (db) {
        try {
          await db.ref('events/' + eventId).set(newEvent);
        } catch (err) {
          console.warn('Events storage fallback:', err);
        }
      }

      batchEvents.unshift(newEvent);
      closeEventModal();
      renderEventsGallery();
      alert('🎉 Batch event created!\n\n4K photos will stream directly from Google Drive without consuming database capacity.');
    }

    // ================= DEDICATED 4K EVENT VIEWER MODAL CONTROLLER =================
    let activeViewingEventId = null;

    function openEventViewer(eventId) {
      const ev = batchEvents.find(e => e.id === eventId);
      if (!ev) return;
      activeViewingEventId = eventId;

      const modal = document.getElementById('event-viewer-modal');
      const titleEl = document.getElementById('viewer-event-title');
      const dateEl = document.getElementById('viewer-event-date');
      const venueEl = document.getElementById('viewer-event-venue');
      const descEl = document.getElementById('viewer-event-desc');
      const badgeEl = document.getElementById('viewer-event-category-badge');
      const authorEl = document.getElementById('viewer-event-author');
      const driveBtn = document.getElementById('viewer-btn-open-drive');
      const iframe = document.getElementById('viewer-drive-iframe');
      const modControls = document.getElementById('viewer-mod-controls');

      if (titleEl) titleEl.textContent = ev.title;
      if (dateEl) dateEl.innerHTML = `<i data-lucide="calendar" class="w-3.5 h-3.5 text-cyan-400"></i><span>${ev.date}</span>`;
      if (venueEl) venueEl.innerHTML = ev.venue ? `<i data-lucide="map-pin" class="w-3.5 h-3.5 text-rose-400"></i><span>${escapeHtml(ev.venue)}</span>` : '';
      if (descEl) descEl.textContent = ev.description || '';

      const categoryColors = {
        ceremony: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        fest: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        sports: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        trip: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        academic: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        campus: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
      };
      if (badgeEl) {
        badgeEl.textContent = ev.categoryLabel || ev.category;
        badgeEl.className = `text-xs font-bold px-2.5 py-0.5 rounded-full border ${categoryColors[ev.category] || 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'}`;
      }

      if (authorEl) {
        authorEl.textContent = `Shared by @${ev.createdByName || 'batchmate'}`;
      }

      // Extract Google Drive Folder ID
      const folderId = ev.driveFolderId || extractDriveFolderId(ev.driveAlbumUrl);

      if (driveBtn) {
        driveBtn.href = ev.driveAlbumUrl || (folderId ? `https://drive.google.com/drive/folders/${folderId}` : '#');
      }

      if (iframe && folderId) {
        iframe.src = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;
      }

      // Moderator and Author Controls (1-tap Delete)
      if (modControls) {
        const isModOrAdmin = currentUserSession && isModOrAbove(currentUserSession.role);
        const isCreator = currentUserSession && currentUserSession.uid === ev.createdByUid;

        if (isModOrAdmin || isCreator) {
          modControls.innerHTML = `
            <button type="button" onclick="deleteBatchEvent('${ev.id}')" class="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Delete Event</span>
            </button>
          `;
        } else {
          modControls.innerHTML = '';
        }
      }

      // Set initial view mode to collage
      setEventViewMode('collage');

      // Fetch folder photos into responsive photo collage
      if (folderId) {
        fetchDriveFolderPhotos(folderId);
      }

      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    function setEventViewMode(mode) {
      const collageContainer = document.getElementById('viewer-collage-container');
      const driveContainer = document.getElementById('viewer-drive-container');
      const collageBtn = document.getElementById('viewer-mode-collage-btn');
      const driveBtn = document.getElementById('viewer-mode-drive-btn');

      if (mode === 'collage') {
        if (collageContainer) collageContainer.classList.remove('hidden');
        if (driveContainer) driveContainer.classList.add('hidden');
        if (collageBtn) {
          collageBtn.className = 'px-3 py-1.5 rounded-lg font-bold bg-cyan-600 text-white transition flex items-center gap-1.5 shadow-sm';
        }
        if (driveBtn) {
          driveBtn.className = 'px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5';
        }
      } else {
        if (collageContainer) collageContainer.classList.add('hidden');
        if (driveContainer) driveContainer.classList.remove('hidden');
        if (driveBtn) {
          driveBtn.className = 'px-3 py-1.5 rounded-lg font-bold bg-cyan-600 text-white transition flex items-center gap-1.5 shadow-sm';
        }
        if (collageBtn) {
          collageBtn.className = 'px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5';
        }
      }
    }

    function closeEventViewer() {
      const modal = document.getElementById('event-viewer-modal');
      const iframe = document.getElementById('viewer-drive-iframe');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      if (iframe) iframe.src = '';
      activeViewingEventId = null;
    }

    function refreshEventViewerIframe() {
      const ev = batchEvents.find(e => e.id === activeViewingEventId);
      if (!ev) return;
      const folderId = ev.driveFolderId || extractDriveFolderId(ev.driveAlbumUrl);
      const iframe = document.getElementById('viewer-drive-iframe');
      if (iframe && folderId) {
        iframe.src = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid&t=${Date.now()}`;
      }
    }

    async function deleteBatchEvent(eventId) {
      if (!currentUserSession) return;
      const ev = batchEvents.find(e => e.id === eventId);
      if (!ev) return;

      const isModOrAdmin = isModOrAbove(currentUserSession.role);
      const isCreator = currentUserSession.uid === ev.createdByUid;

      if (!isModOrAdmin && !isCreator) {
        alert('Only a Batch Moderator or the event publisher can delete this event.');
        return;
      }

      if (!confirm(`Are you sure you want to delete "${ev.title}" from the batch gallery?`)) return;

      if (db) {
        await db.ref('events/' + eventId).remove().catch(console.error);
      }

      batchEvents = batchEvents.filter(e => e.id !== eventId);
      closeEventViewer();
      renderEventsGallery();
      alert('Event removed from the batch gallery.');
    }

    // DIRECT 4K PHOTO COLLAGE FETCHER VIA GOOGLE DRIVE API & CONTENT STREAMING
    async function fetchDriveFolderPhotos(folderId) {
      const grid = document.getElementById('viewer-direct-photos-grid');
      const countEl = document.getElementById('viewer-collage-count');
      const emptyEl = document.getElementById('viewer-collage-empty');
      if (!grid) return;

      if (countEl) countEl.textContent = '...';
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400 text-xs">
          <i data-lucide="loader-2" class="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400"></i>
          Loading photo collage from Google Drive...
        </div>
      `;
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();

      try {
        const apiKey = "AIzaSyBdxdRLRMfXejD5QP5PY2GW_Wmx6lXJpus";
        const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
        const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)&key=${apiKey}`;

        const res = await fetch(url);
        if (!res.ok) {
          grid.innerHTML = '';
          if (countEl) countEl.textContent = '0';
          if (emptyEl) emptyEl.classList.remove('hidden');
          setEventViewMode('drive');
          return;
        }

        const data = await res.json();
        const files = (data.files || []).filter(f => (f.mimeType || '').startsWith('image/'));

        if (files.length === 0) {
          grid.innerHTML = '';
          if (countEl) countEl.textContent = '0';
          if (emptyEl) emptyEl.classList.remove('hidden');
          setEventViewMode('drive');
          return;
        }

        if (countEl) countEl.textContent = files.length;
        if (emptyEl) emptyEl.classList.add('hidden');
        grid.innerHTML = files.map(f => {
          // Direct 4K Ultra-HD URL using Google content delivery
          const direct4kUrl = `https://lh3.googleusercontent.com/d/${f.id}=w3840`;
          const thumbUrl = `https://lh3.googleusercontent.com/d/${f.id}=w600`;

          return `
            <div class="relative group aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 hover:border-cyan-400 cursor-pointer transition shadow hover:shadow-cyan-500/20" onclick="openLightbox('${direct4kUrl}', '${escapeHtml(f.name)}', '📸 4K Ultra-HD · Google Drive')">
              <img src="${thumbUrl}" alt="${escapeHtml(f.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span class="text-[10px] font-bold text-white px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/20 flex items-center gap-1 shadow">
                  <i data-lucide="zoom-in" class="w-3 h-3 text-cyan-400"></i> Zoom 4K
                </span>
              </div>
            </div>
          `;
        }).join('');

        setEventViewMode('collage');
        if (window.lucide && window.lucide.createIcons) lucide.createIcons();
      } catch (err) {
        console.warn('fetchDriveFolderPhotos error:', err);
        grid.innerHTML = '';
        if (countEl) countEl.textContent = '0';
        if (emptyEl) emptyEl.classList.remove('hidden');
        setEventViewMode('drive');
      }
    }

    function renderEventsGallery() {
      const container = document.getElementById('events-gallery-container');
      if (!container) return;

      const filtered = activeEventCategory === 'all' 
        ? batchEvents 
        : batchEvents.filter(e => e.category === activeEventCategory);

      const categoryBadges = [
        { key: 'all', label: 'All Events' },
        { key: 'ceremony', label: '🩺 Ceremonies' },
        { key: 'fest', label: '🎉 Fests & Cultural' },
        { key: 'sports', label: '🏆 Sports' },
        { key: 'trip', label: '🏕️ Trips' },
        { key: 'academic', label: '🔬 Academics' },
        { key: 'campus', label: '🏛️ Campus Life' }
      ];

      let filterPillsHtml = categoryBadges.map(b => {
        const isActive = activeEventCategory === b.key;
        return `
          <button onclick="filterEventCategory('${b.key}')" class="px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${isActive ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}">
            ${b.label}
          </button>
        `;
      }).join('');

      let cardsHtml = '';
      if (filtered.length === 0) {
        cardsHtml = `
          <div class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center space-y-2.5">
            <p class="text-xs text-slate-500 dark:text-slate-400">No batch events published yet. Events will appear here once published.</p>
            <button onclick="openEventModal()" class="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition inline-flex items-center gap-1.5">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Create Event</span>
            </button>
          </div>
        `;
      } else {
        cardsHtml = `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${filtered.map(ev => {
              const categoryColors = {
                ceremony: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
                fest: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
                sports: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                trip: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                academic: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                campus: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
              };
              const catColor = categoryColors[ev.category] || 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';

              return `
                <div class="bg-gradient-to-br from-slate-900/95 via-[#0b101e] to-slate-950 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col group cursor-pointer" onclick="openEventViewer('${ev.id}')">
                  
                  <!-- Backcover Banner (Shows what event happened with Title & Date drawn on it) -->
                  <div class="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    ${ev.coverImage ? `
                      <img src="${ev.coverImage}" alt="${escapeHtml(ev.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform" loading="lazy">
                    ` : `
                      <div class="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600">
                        <i data-lucide="image" class="w-12 h-12"></i>
                      </div>
                    `}
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                    <!-- Top Floating Badge -->
                    <div class="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none">
                      <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${catColor}">
                        ${ev.categoryLabel || ev.category}
                      </span>
                    </div>

                    <!-- Bottom Banner Overlay on Hover -->
                    <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
                      <span class="font-bold flex items-center gap-1 text-[11px] drop-shadow-md text-amber-300">
                        <i data-lucide="calendar" class="w-3.5 h-3.5 text-amber-400"></i> ${ev.date}
                      </span>
                      <span class="text-[10px] px-2 py-0.5 rounded-lg bg-black/60 text-slate-200 border border-white/20 backdrop-blur-sm flex items-center gap-1">
                        <span>Tap to View Album</span>
                        <i data-lucide="arrow-right" class="w-3 h-3 text-cyan-400"></i>
                      </span>
                    </div>
                  </div>

                  <!-- Card Body -->
                  <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 class="text-base font-extrabold text-white group-hover:text-cyan-300 transition line-clamp-2 leading-snug">
                        ${escapeHtml(ev.title)}
                      </h3>
                      ${ev.description ? `
                        <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                          ${escapeHtml(ev.description)}
                        </p>
                      ` : ''}
                    </div>

                    <!-- Card Footer -->
                    <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div class="flex items-center gap-1.5 text-[11px]">
                        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span class="font-mono text-slate-300">@${escapeHtml(ev.createdByName || 'member')}</span>
                      </div>

                      <div class="flex items-center gap-1 text-cyan-400 font-semibold text-[11px]">
                        <i data-lucide="folder-symlink" class="w-3.5 h-3.5"></i>
                        <span>Drive Album</span>
                      </div>
                    </div>

                  </div>

                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      container.innerHTML = `
        <!-- BATCH EVENTS HERO BANNER -->
        <div class="bg-gradient-to-br from-slate-900 via-[#0a0f1d] to-slate-950 border border-slate-800/80 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl text-white">
          <div class="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative z-10 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-3">
              <span class="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Batch Moments & Events</span>
              </span>

              <button onclick="openEventModal()" class="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold transition shadow-md inline-flex items-center gap-1.5">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>Create Batch Event</span>
              </button>
            </div>

            <div>
              <h2 class="text-lg sm:text-xl font-black tracking-tight text-white">
                MTMC 2026 Batch Memories & Milestone Gallery
              </h2>
              <p class="text-xs text-slate-300 max-w-2xl leading-relaxed pt-1">
                Preserve our milestone ceremonies, fests, sports championships, campus celebrations, and road trips.
              </p>
            </div>
          </div>
        </div>

        <!-- CATEGORY FILTER CHIPS -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          ${filterPillsHtml}
        </div>

        <!-- EVENT CARDS CONTAINER -->
        <div>
          ${cardsHtml}
        </div>
      `;

      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    // INITIALIZE REALTIME SYNC
