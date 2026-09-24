/**
 * MTMC26 — Image Lightbox Viewer with Zoom & Pan
 */

    // ================= INTERACTIVE LIGHTBOX ZOOM & PAN ENGINE =================
    let lightboxScale = 1;
    let lightboxTranslateX = 0;
    let lightboxTranslateY = 0;
    let isLightboxDragging = false;
    let lightboxDragStartX = 0;
    let lightboxDragStartY = 0;
    let lightboxTouchStartDist = 0;
    let lightboxTouchStartScale = 1;
    let lightboxEventsInitialized = false;

    function openLightbox(src, caption = '', credit = '') {
      if (!src) return;
      const modal = document.getElementById('lightbox-modal');
      const img = document.getElementById('lightbox-img');
      const capEl = document.getElementById('lightbox-caption');
      const credEl = document.getElementById('lightbox-credit');
      const dlBtn = document.getElementById('lightbox-download-btn');

      if (img) img.src = src;
      if (capEl) capEl.textContent = caption || '';
      if (credEl) credEl.textContent = credit || '';
      if (dlBtn) {
        dlBtn.href = src;
        const cleanName = caption ? caption.slice(0, 32).replace(/[^a-zA-Z0-9]/g, '_') : 'mtmc26_photo';
        dlBtn.download = `${cleanName}.jpg`;
      }

      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
      resetLightboxZoom();
      initLightboxInteractions();
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
    }

    function closeLightbox() {
      const modal = document.getElementById('lightbox-modal');
      const img = document.getElementById('lightbox-img');
      const capEl = document.getElementById('lightbox-caption');
      const credEl = document.getElementById('lightbox-credit');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      if (img) img.src = '';
      if (capEl) capEl.textContent = '';
      if (credEl) credEl.textContent = '';
      resetLightboxZoom();
    }

    function handleLightboxBackdropClick(e) {
      if (e.target.id === 'lightbox-viewport' || e.target.id === 'lightbox-modal') {
        if (lightboxScale > 1.05) {
          resetLightboxZoom();
        } else {
          closeLightbox();
        }
      }
    }

    function updateLightboxTransform(animate = true) {
      const img = document.getElementById('lightbox-img');
      const badge = document.getElementById('lightbox-zoom-badge');
      const viewport = document.getElementById('lightbox-viewport');
      if (!img) return;

      if (animate) {
        img.style.transition = 'transform 0.18s cubic-bezier(0.2, 0, 0, 1)';
      } else {
        img.style.transition = 'none';
      }

      img.style.transform = `translate(${lightboxTranslateX}px, ${lightboxTranslateY}px) scale(${lightboxScale})`;
      if (badge) badge.textContent = `${Math.round(lightboxScale * 100)}%`;

      if (viewport) {
        if (lightboxScale > 1.05) {
          viewport.style.cursor = isLightboxDragging ? 'grabbing' : 'grab';
        } else {
          viewport.style.cursor = 'zoom-in';
        }
      }
    }

    function zoomLightbox(delta) {
      const newScale = Math.min(5, Math.max(1, lightboxScale + delta));
      if (newScale === 1) {
        lightboxTranslateX = 0;
        lightboxTranslateY = 0;
      }
      lightboxScale = Math.round(newScale * 100) / 100;
      updateLightboxTransform(true);
    }

    function resetLightboxZoom() {
      lightboxScale = 1;
      lightboxTranslateX = 0;
      lightboxTranslateY = 0;
      updateLightboxTransform(true);
    }

    function openLightboxFullImage() {
      const img = document.getElementById('lightbox-img');
      if (img && img.src) {
        const win = window.open();
        if (win) {
          win.document.write(`<title>MTMC26 Study Photo</title><body style="margin:0;background:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="${img.src}" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);"></body>`);
        }
      }
    }

    function initLightboxInteractions() {
      if (lightboxEventsInitialized) return;
      lightboxEventsInitialized = true;

      const viewport = document.getElementById('lightbox-viewport');
      const img = document.getElementById('lightbox-img');
      if (!viewport || !img) return;

      // Click or tap image to cycle zoom levels (1x -> 2.2x -> 3.5x -> 1x)
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isLightboxDragging) return;
        if (lightboxScale < 1.8) {
          lightboxScale = 2.2;
        } else if (lightboxScale < 3.2) {
          lightboxScale = 3.5;
        } else {
          lightboxScale = 1;
          lightboxTranslateX = 0;
          lightboxTranslateY = 0;
        }
        updateLightboxTransform(true);
      });

      // Mouse Wheel Zoom
      viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.35 : -0.35;
        zoomLightbox(delta);
      }, { passive: false });

      // Mouse drag panning
      viewport.addEventListener('mousedown', (e) => {
        if (lightboxScale <= 1) return;
        isLightboxDragging = true;
        lightboxDragStartX = e.clientX - lightboxTranslateX;
        lightboxDragStartY = e.clientY - lightboxTranslateY;
        viewport.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!isLightboxDragging || lightboxScale <= 1) return;
        lightboxTranslateX = e.clientX - lightboxDragStartX;
        lightboxTranslateY = e.clientY - lightboxDragStartY;
        updateLightboxTransform(false);
      });

      window.addEventListener('mouseup', () => {
        if (isLightboxDragging) {
          isLightboxDragging = false;
          updateLightboxTransform(false);
        }
      });

      // Mobile Touch Handling (Pinch-to-zoom & single-finger drag pan)
      viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          if (lightboxScale > 1) {
            isLightboxDragging = true;
            lightboxDragStartX = e.touches[0].clientX - lightboxTranslateX;
            lightboxDragStartY = e.touches[0].clientY - lightboxTranslateY;
          }
        } else if (e.touches.length === 2) {
          isLightboxDragging = false;
          lightboxTouchStartDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          lightboxTouchStartScale = lightboxScale;
        }
      }, { passive: true });

      viewport.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1 && isLightboxDragging && lightboxScale > 1) {
          lightboxTranslateX = e.touches[0].clientX - lightboxDragStartX;
          lightboxTranslateY = e.touches[0].clientY - lightboxDragStartY;
          updateLightboxTransform(false);
        } else if (e.touches.length === 2) {
          const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (lightboxTouchStartDist > 0) {
            const factor = dist / lightboxTouchStartDist;
            const newScale = Math.min(5, Math.max(1, lightboxTouchStartScale * factor));
            lightboxScale = Math.round(newScale * 100) / 100;
            updateLightboxTransform(false);
          }
        }
      }, { passive: true });

      viewport.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
          isLightboxDragging = false;
          if (lightboxScale <= 1) {
            lightboxTranslateX = 0;
            lightboxTranslateY = 0;
          }
          updateLightboxTransform(true);
        }
      });

      // Escape key closes modal
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const modal = document.getElementById('lightbox-modal');
          if (modal && !modal.classList.contains('hidden')) {
            closeLightbox();
          }
        }
      });
    }
