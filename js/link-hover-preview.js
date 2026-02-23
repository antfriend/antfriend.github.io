(() => {
  const HOVER_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";
  if (!window.matchMedia(HOVER_MEDIA_QUERY).matches) return;

  const SHOW_DELAY_MS = 220;
  const HIDE_DELAY_MS = 90;
  const PREVIEW_WIDTH_PX = 360;
  const PREVIEW_HEIGHT_PX = 220;
  const VIEWPORT_MARGIN_PX = 12;
  const PREVIEW_GAP_PX = 14;
  const SANDBOX_PERMISSIONS = "allow-same-origin allow-scripts";

  const currentLocation = new URL(window.location.href);

  const previewEl = document.createElement("aside");
  previewEl.className = "link-hover-preview";
  previewEl.hidden = true;
  previewEl.setAttribute("aria-hidden", "true");
  previewEl.innerHTML = `
    <div class="link-hover-preview__chrome">
      <span class="link-hover-preview__label">Preview</span>
      <span class="link-hover-preview__path"></span>
    </div>
    <iframe
      class="link-hover-preview__frame"
      loading="lazy"
      referrerpolicy="no-referrer"
      sandbox="${SANDBOX_PERMISSIONS}"
      tabindex="-1"
      title="Link preview"
    ></iframe>
  `;

  const pathEl = previewEl.querySelector(".link-hover-preview__path");
  const frameEl = previewEl.querySelector(".link-hover-preview__frame");

  let showTimer = null;
  let hideTimer = null;
  let pendingLink = null;
  let pendingUrl = null;
  let activeLink = null;
  let activeUrl = "";
  let previewWidth = PREVIEW_WIDTH_PX;
  let previewHeight = PREVIEW_HEIGHT_PX;

  function clearShowTimer() {
    if (!showTimer) return;
    window.clearTimeout(showTimer);
    showTimer = null;
  }

  function clearHideTimer() {
    if (!hideTimer) return;
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }

  function getAnchor(target) {
    return target && target.closest ? target.closest("a[href]") : null;
  }

  function getPreviewUrl(link) {
    if (!link) return null;
    if (link.dataset.preview === "off") return null;
    if (link.hasAttribute("data-hover-preview-off")) return null;
    if (link.hasAttribute("download")) return null;

    const href = (link.getAttribute("href") || "").trim();
    if (!href || href.startsWith("#")) return null;

    let url;
    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return null;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.origin !== currentLocation.origin) return null;

    const sameDocument =
      url.origin === currentLocation.origin &&
      url.pathname === currentLocation.pathname &&
      url.search === currentLocation.search;

    if (sameDocument) return null;
    return url;
  }

  function readPath(url) {
    const path = `${url.pathname}${url.search}${url.hash}`;
    return path || url.href;
  }

  function syncPreviewSize() {
    const maxWidth = Math.max(220, window.innerWidth - VIEWPORT_MARGIN_PX * 2);
    const maxHeight = Math.max(140, window.innerHeight - VIEWPORT_MARGIN_PX * 2);
    previewWidth = Math.min(PREVIEW_WIDTH_PX, maxWidth);
    previewHeight = Math.min(PREVIEW_HEIGHT_PX, maxHeight);
    previewEl.style.width = `${previewWidth}px`;
    previewEl.style.height = `${previewHeight}px`;
  }

  function placePreview(link) {
    const rect = link.getBoundingClientRect();

    const rightRoom = window.innerWidth - rect.right - VIEWPORT_MARGIN_PX;
    const leftRoom = rect.left - VIEWPORT_MARGIN_PX;
    const shouldPlaceRight = rightRoom >= leftRoom;

    let left = shouldPlaceRight
      ? rect.right + PREVIEW_GAP_PX
      : rect.left - previewWidth - PREVIEW_GAP_PX;

    const minLeft = VIEWPORT_MARGIN_PX;
    const maxLeft = window.innerWidth - previewWidth - VIEWPORT_MARGIN_PX;
    left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));

    let top = rect.top + rect.height * 0.5 - previewHeight * 0.5;
    const minTop = VIEWPORT_MARGIN_PX;
    const maxTop = window.innerHeight - previewHeight - VIEWPORT_MARGIN_PX;
    top = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop));

    previewEl.style.left = `${Math.round(left)}px`;
    previewEl.style.top = `${Math.round(top)}px`;
  }

  function showPreview(link, url) {
    clearHideTimer();
    pendingLink = null;
    pendingUrl = null;
    activeLink = link;

    syncPreviewSize();
    placePreview(link);

    pathEl.textContent = readPath(url);
    if (activeUrl !== url.href) {
      frameEl.src = url.href;
      activeUrl = url.href;
    }

    previewEl.hidden = false;
    previewEl.setAttribute("aria-hidden", "false");
    window.requestAnimationFrame(() => {
      previewEl.classList.add("is-visible");
    });
  }

  function hidePreviewNow() {
    clearShowTimer();
    clearHideTimer();
    pendingLink = null;
    pendingUrl = null;
    activeLink = null;
    previewEl.classList.remove("is-visible");
    previewEl.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      if (!activeLink && !pendingLink) {
        previewEl.hidden = true;
      }
    }, 150);
  }

  function queueHide() {
    clearHideTimer();
    hideTimer = window.setTimeout(hidePreviewNow, HIDE_DELAY_MS);
  }

  function queueShow(link, immediate = false) {
    const url = getPreviewUrl(link);
    if (!url) {
      hidePreviewNow();
      return;
    }

    clearHideTimer();
    clearShowTimer();
    pendingLink = link;
    pendingUrl = url;

    if (immediate) {
      showPreview(link, url);
      return;
    }

    showTimer = window.setTimeout(() => {
      if (pendingLink !== link || !pendingUrl) return;
      showPreview(link, pendingUrl);
    }, SHOW_DELAY_MS);
  }

  function handlePointerOver(event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    const link = getAnchor(event.target);
    if (!link) return;
    if (event.relatedTarget && link.contains(event.relatedTarget)) return;
    queueShow(link);
  }

  function handlePointerOut(event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    const link = getAnchor(event.target);
    if (!link) return;
    if (event.relatedTarget && link.contains(event.relatedTarget)) return;
    if (pendingLink === link) {
      pendingLink = null;
      pendingUrl = null;
      clearShowTimer();
    }
    if (activeLink === link) {
      queueHide();
    }
  }

  function handleFocusIn(event) {
    const link = getAnchor(event.target);
    if (!link) return;
    queueShow(link, true);
  }

  function handleFocusOut(event) {
    const link = getAnchor(event.target);
    if (!link) return;
    if (activeLink === link) {
      queueHide();
    }
  }

  function handleViewportChange() {
    if (!activeLink) return;
    if (!document.contains(activeLink)) {
      hidePreviewNow();
      return;
    }
    syncPreviewSize();
    placePreview(activeLink);
  }

  function handleEscape(event) {
    if (event.key !== "Escape") return;
    hidePreviewNow();
  }

  document.body.appendChild(previewEl);
  syncPreviewSize();

  document.addEventListener("pointerover", handlePointerOver, true);
  document.addEventListener("pointerout", handlePointerOut, true);
  document.addEventListener("focusin", handleFocusIn, true);
  document.addEventListener("focusout", handleFocusOut, true);
  document.addEventListener("pointerdown", hidePreviewNow, true);
  document.addEventListener("keydown", handleEscape, true);
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("scroll", handleViewportChange, true);
})();
