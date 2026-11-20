/**
 * AnythingToQR — Core Application Engine
 * Timeless, anti-slop, client-side QR generator, scanner, and clipboard/drag-drop handler.
 * Created By T3crypt
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    currentMode: 'url',
    rawPayload: '',
    dotsStyle: 'square',
    cornersSquareStyle: 'square',
    fgColor: '#000000',
    bgColor: '#ffffff',
    size: 512,
    ecl: 'Q',
    currentLogo: 'none',
    customLogoUrl: null,
    isSmsMode: true,
    scannerRunning: false,
    html5QrCodeInstance: null,
    history: []
  };

  // --- SVG EMBLEMS (Clean vector icons) ---
  const LOGO_PRESETS = {
    none: null,
    link: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="%23000" stroke="%23fff" stroke-width="2"><rect width="24" height="24" rx="4" fill="%23000"/><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    wifi: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="%23000" stroke="%23fff" stroke-width="2"><rect width="24" height="24" rx="4" fill="%23000"/><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
    contact: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="%23000" stroke="%23fff" stroke-width="2"><rect width="24" height="24" rx="4" fill="%23000"/><path d="M18 20v-2a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    wa: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="%23000" stroke="%23fff" stroke-width="2"><rect width="24" height="24" rx="4" fill="%23000"/><path d="M19 11.5a7 7 0 0 1-.8 3.3 7 7 0 0 1-6.2 3.8 7 7 0 0 1-3.2-.8L5 19l1.4-3.7a7 7 0 0 1-.8-3.2 7 7 0 0 1 3.8-6.2 7 7 0 0 1 3.2-.8h.4a7 7 0 0 1 6 7v.5z"/></svg>',
    github: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="%23000" stroke="%23fff" stroke-width="2"><rect width="24" height="24" rx="4" fill="%23000"/><path d="M12 3C7.03 3 3 7.03 3 12c0 3.98 2.58 7.35 6.16 8.54.45.08.61-.2.61-.43v-1.53c-2.5.54-3.03-1.21-3.03-1.21-.41-1.04-1-1.32-1-1.32-.82-.56.06-.55.06-.55.9.06 1.38.93 1.38.93.8 1.38 2.11.98 2.62.75.08-.58.31-.98.57-1.2-2-.23-4.1-1-4.1-4.45 0-.98.35-1.79.93-2.42-.09-.23-.4-1.14.09-2.38 0 0 .76-.24 2.47.92.72-.2 1.49-.3 2.25-.3.76 0 1.53.1 2.25.3 1.71-1.16 2.47-.92 2.47-.92.49 1.24.18 2.15.09 2.38.58.63.93 1.44.93 2.42 0 3.46-2.1 4.22-4.11 4.44.32.28.61.83.61 1.67v2.47c0 .24.16.52.62.43A9.01 9.01 0 0 0 21 12c0-4.97-4.03-9-9-9z"/></svg>',
    btc: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="%23000" stroke="%23fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9 8h4a2 2 0 0 1 0 4H9m0 0h4.5a2 2 0 0 1 0 4H9m0-8v8"/></svg>'
  };

  // --- DOM NODES ---
  const nodes = {
    tabs: document.querySelectorAll('.tab-btn'),
    panes: document.querySelectorAll('.tab-pane'),
    qrContainer: document.getElementById('qr-container'),
    payloadSnippet: document.getElementById('payload-display-snippet'),
    byteLength: document.getElementById('qr-byte-length'),
    toast: document.getElementById('neo-toast'),
    historyContainer: document.getElementById('history-items-container'),
    sizeRange: document.getElementById('qr-size-range'),
    sizeValDisplay: document.getElementById('size-val-display'),
    fgColorInput: document.getElementById('qr-color-fg'),
    bgColorInput: document.getElementById('qr-color-bg'),
    customLogoInput: document.getElementById('logo-file-input'),
    customLogoName: document.getElementById('custom-logo-name'),
    btnRemoveLogo: document.getElementById('btn-remove-logo'),
    dropOverlay: document.getElementById('drop-overlay'),
    btnThemeToggle: document.getElementById('btn-theme-toggle'),
    // Inputs
    inputUrl: document.getElementById('input-url'),
    inputText: document.getElementById('input-text'),
    textCounter: document.getElementById('text-counter'),
    wifiSsid: document.getElementById('wifi-ssid'),
    wifiEnc: document.getElementById('wifi-enc'),
    wifiPass: document.getElementById('wifi-pass'),
    wifiHidden: document.getElementById('wifi-hidden'),
    btnToggleWifiPass: document.getElementById('btn-toggle-wifi-pass'),
    vcardFn: document.getElementById('vcard-fn'),
    vcardLn: document.getElementById('vcard-ln'),
    vcardPhone: document.getElementById('vcard-phone'),
    vcardEmail: document.getElementById('vcard-email'),
    vcardOrg: document.getElementById('vcard-org'),
    vcardTitle: document.getElementById('vcard-title'),
    vcardUrl: document.getElementById('vcard-url'),
    emailTo: document.getElementById('email-to'),
    emailSubject: document.getElementById('email-subject'),
    emailBody: document.getElementById('email-body'),
    smsPhone: document.getElementById('sms-phone'),
    smsMsg: document.getElementById('sms-msg'),
    btnModeSms: document.getElementById('btn-mode-sms'),
    btnModeWa: document.getElementById('btn-mode-wa'),
    inputTel: document.getElementById('input-tel'),
    cryptoCoin: document.getElementById('crypto-coin'),
    cryptoAmount: document.getElementById('crypto-amount'),
    cryptoAddress: document.getElementById('crypto-address'),
    // Actions
    btnDownloadPng: document.getElementById('btn-download-png'),
    btnDownloadSvg: document.getElementById('btn-download-svg'),
    btnCopyImage: document.getElementById('btn-copy-image'),
    btnPrintQr: document.getElementById('btn-print-qr'),
    btnCopyPayload: document.getElementById('btn-copy-payload'),
    btnClearHistory: document.getElementById('btn-clear-history'),
    // Scanner
    btnToggleCam: document.getElementById('btn-toggle-cam'),
    scannerFileInput: document.getElementById('scanner-file-input'),
    readerContainer: document.getElementById('reader-container'),
    scannerResultBox: document.getElementById('scanner-result-box'),
    scannedPayloadText: document.getElementById('scanned-payload-text'),
    btnCopyScanned: document.getElementById('btn-copy-scanned'),
    btnSendToGen: document.getElementById('btn-send-to-generator'),
    linkOpenScanned: document.getElementById('link-open-scanned')
  };

  // --- INITIALIZE QR CODE INSTANCE ---
  let qrCode = null;

  function initQrCode() {
    if (typeof QRCodeStyling === 'undefined') {
      setTimeout(initQrCode, 80);
      return;
    }

    qrCode = new QRCodeStyling({
      width: 250,
      height: 250,
      type: 'canvas',
      data: 'https://t3crypt.github.io/AnythingToQR/',
      margin: 4,
      qrOptions: {
        errorCorrectionLevel: state.ecl
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.28,
        margin: 4
      },
      dotsOptions: {
        color: state.fgColor,
        type: state.dotsStyle
      },
      backgroundOptions: {
        color: state.bgColor
      },
      cornersSquareOptions: {
        color: state.fgColor,
        type: state.cornersSquareStyle
      },
      cornersDotOptions: {
        color: state.fgColor,
        type: 'square'
      }
    });

    nodes.qrContainer.innerHTML = '';
    qrCode.append(nodes.qrContainer);
    renderQR();
  }

  // --- PAYLOAD COMPUTATION ---
  function computePayload() {
    let payload = '';

    switch (state.currentMode) {
      case 'url': {
        let val = (nodes.inputUrl.value || '').trim();
        if (val && !/^https?:\/\//i.test(val)) {
          val = 'https://' + val;
        }
        payload = val || 'https://t3crypt.github.io/AnythingToQR/';
        break;
      }

      case 'text': {
        const text = nodes.inputText.value || '';
        payload = text || 'AnythingToQR — Fast, private QR generator & scanner';
        if (nodes.textCounter) {
          nodes.textCounter.textContent = `${text.length} characters`;
        }
        break;
      }

      case 'wifi': {
        const ssid = (nodes.wifiSsid.value || '').trim();
        const enc = nodes.wifiEnc.value || 'WPA';
        const pass = (nodes.wifiPass.value || '').trim();
        const hidden = nodes.wifiHidden.checked;
        payload = `WIFI:S:${escapeWifi(ssid)};T:${enc};P:${escapeWifi(pass)};H:${hidden};;`;
        break;
      }

      case 'vcard': {
        const fn = (nodes.vcardFn.value || '').trim();
        const ln = (nodes.vcardLn.value || '').trim();
        const phone = (nodes.vcardPhone.value || '').trim();
        const email = (nodes.vcardEmail.value || '').trim();
        const org = (nodes.vcardOrg.value || '').trim();
        const title = (nodes.vcardTitle.value || '').trim();
        const url = (nodes.vcardUrl.value || '').trim();

        const vcardParts = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${ln};${fn};;;`,
          `FN:${(fn + ' ' + ln).trim() || 'Contact'}`
        ];
        if (org) vcardParts.push(`ORG:${org}`);
        if (title) vcardParts.push(`TITLE:${title}`);
        if (phone) vcardParts.push(`TEL;TYPE=CELL:${phone}`);
        if (email) vcardParts.push(`EMAIL:${email}`);
        if (url) vcardParts.push(`URL:${url}`);
        vcardParts.push('END:VCARD');

        payload = vcardParts.join('\n');
        break;
      }

      case 'email': {
        const to = (nodes.emailTo.value || '').trim();
        const subject = encodeURIComponent((nodes.emailSubject.value || '').trim());
        const body = encodeURIComponent(nodes.emailBody.value || '');
        payload = `mailto:${to}?subject=${subject}&body=${body}`;
        break;
      }

      case 'sms': {
        const rawPhone = (nodes.smsPhone.value || '').trim();
        const msg = (nodes.smsMsg.value || '').trim();
        if (state.isSmsMode) {
          payload = `SMSTO:${rawPhone}:${msg}`;
        } else {
          const cleanPhone = rawPhone.replace(/[^\d]/g, '');
          payload = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        }
        break;
      }

      case 'phone': {
        const tel = (nodes.inputTel.value || '').trim();
        payload = `tel:${tel}`;
        break;
      }

      case 'crypto': {
        const coin = nodes.cryptoCoin.value;
        const addr = (nodes.cryptoAddress.value || '').trim();
        const amount = (nodes.cryptoAmount.value || '').trim();

        if (coin === 'bitcoin') {
          payload = `bitcoin:${addr}${amount ? '?amount=' + encodeURIComponent(amount) : ''}`;
        } else if (coin === 'ethereum') {
          payload = `ethereum:${addr}${amount ? '?value=' + encodeURIComponent(amount) : ''}`;
        } else if (coin === 'solana') {
          payload = `solana:${addr}${amount ? '?amount=' + encodeURIComponent(amount) : ''}`;
        } else {
          payload = addr || '0x0000000000000000000000000000000000000000';
        }
        break;
      }

      case 'scanner':
        payload = state.rawPayload || 'https://t3crypt.github.io/AnythingToQR/';
        break;

      default:
        payload = 'https://t3crypt.github.io/AnythingToQR/';
    }

    state.rawPayload = payload;
    return payload;
  }

  function escapeWifi(str) {
    return str.replace(/\\/g, '\\\\')
              .replace(/;/g, '\\;')
              .replace(/:/g, '\\:')
              .replace(/,/g, '\\,')
              .replace(/"/g, '\\"');
  }

  // --- RENDER ---
  let renderTimer = null;
  function triggerRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderQR, 60);
  }

  function renderQR() {
    if (!qrCode) return;

    const payload = computePayload();
    if (nodes.payloadSnippet) {
      nodes.payloadSnippet.textContent = payload;
    }
    if (nodes.byteLength) {
      const bytes = new TextEncoder().encode(payload).length;
      nodes.byteLength.textContent = `${bytes} bytes`;
    }

    let logoImage = null;
    if (state.customLogoUrl) {
      logoImage = state.customLogoUrl;
    } else if (state.currentLogo !== 'none' && LOGO_PRESETS[state.currentLogo]) {
      logoImage = LOGO_PRESETS[state.currentLogo];
    }

    qrCode.update({
      data: payload,
      image: logoImage,
      qrOptions: {
        errorCorrectionLevel: state.ecl
      },
      dotsOptions: {
        color: state.fgColor,
        type: state.dotsStyle
      },
      cornersSquareOptions: {
        color: state.fgColor,
        type: state.cornersSquareStyle
      },
      cornersDotOptions: {
        color: state.fgColor,
        type: state.cornersSquareStyle === 'square' ? 'square' : 'dot'
      },
      backgroundOptions: {
        color: state.bgColor
      }
    });

    saveToHistory(state.currentMode, payload);
  }

  // --- TOAST NOTIFICATIONS ---
  let toastTimer = null;
  function showToast(message, type = 'normal') {
    if (!nodes.toast) return;
    clearTimeout(toastTimer);
    nodes.toast.textContent = message;
    nodes.toast.className = 'toast-pill show';

    if (type === 'error') nodes.toast.classList.add('toast-error');

    toastTimer = setTimeout(() => {
      nodes.toast.classList.remove('show');
    }, 2200);
  }

  // --- HISTORY ---
  function loadHistory() {
    try {
      const raw = localStorage.getItem('anything_to_qr_history');
      if (raw) state.history = JSON.parse(raw);
    } catch (e) {
      state.history = [];
    }
    renderHistoryUI();
  }

  function saveToHistory(type, data) {
    if (!data || data.length < 3) return;
    if (state.history.length > 0 && state.history[0].data === data) return;

    const item = {
      id: Date.now(),
      type: type.toUpperCase(),
      data: data,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.history.unshift(item);
    if (state.history.length > 8) state.history.pop();

    try {
      localStorage.setItem('anything_to_qr_history', JSON.stringify(state.history));
    } catch (e) {}

    renderHistoryUI();
  }

  function renderHistoryUI() {
    if (!nodes.historyContainer) return;

    if (!state.history || state.history.length === 0) {
      nodes.historyContainer.innerHTML = '<p class="empty-history-note">No recent items.</p>';
      return;
    }

    nodes.historyContainer.innerHTML = state.history.map(item => `
      <div class="history-item" data-id="${item.id}" title="Click to reload this QR">
        <span class="history-item-text font-mono">[${item.type}] ${escapeHtml(item.data)}</span>
        <span class="font-mono">${item.time}</span>
      </div>
    `).join('');

    nodes.historyContainer.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = Number(el.dataset.id);
        const found = state.history.find(h => h.id === id);
        if (found) {
          applyPayloadToApp(found.type.toLowerCase(), found.data);
          showToast(`Loaded: ${found.type}`);
        }
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function applyPayloadToApp(mode, payload) {
    const validModes = ['url', 'text', 'wifi', 'vcard', 'email', 'sms', 'phone', 'crypto'];
    const targetMode = validModes.includes(mode) ? mode : 'url';
    switchTab(targetMode);

    if (targetMode === 'url') {
      nodes.inputUrl.value = payload;
    } else if (targetMode === 'text') {
      nodes.inputText.value = payload;
    } else {
      nodes.inputText.value = payload;
      switchTab('text');
    }
    triggerRender();
  }

  // --- TAB SWITCHING ---
  function switchTab(mode) {
    state.currentMode = mode;

    nodes.tabs.forEach(tab => {
      const match = tab.dataset.mode === mode;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    nodes.panes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `pane-${mode}`);
    });

    if (mode !== 'scanner') {
      triggerRender();
    }
  }

  // --- AUTO PASTE & DRAG-AND-DROP ---
  function initAutoPasteAndDrop() {
    // 1. Global Clipboard Paste
    window.addEventListener('paste', (e) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              e.preventDefault();
              showToast('Scanning pasted image...');
              scanQrFile(blob, 'Clipboard');
              return;
            }
          }
        }
      }

      // Pasted text outside input/textarea
      const targetTag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (targetTag !== 'input' && targetTag !== 'textarea') {
        const text = clipboardData.getData('text');
        if (text && text.trim()) {
          e.preventDefault();
          const cleanText = text.trim();
          if (/^https?:\/\//i.test(cleanText)) {
            nodes.inputUrl.value = cleanText;
            switchTab('url');
          } else {
            nodes.inputText.value = cleanText;
            switchTab('text');
          }
          triggerRender();
          showToast('Loaded text into generator');
        }
      }
    });

    // 2. Global Drag & Drop Listener
    let dragCounter = 0;

    window.addEventListener('dragenter', (e) => {
      if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        e.preventDefault();
        dragCounter++;
        if (nodes.dropOverlay) nodes.dropOverlay.classList.add('active');
      }
    });

    window.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0 && nodes.dropOverlay) {
        nodes.dropOverlay.classList.remove('active');
        dragCounter = 0;
      }
    });

    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      if (nodes.dropOverlay) nodes.dropOverlay.classList.remove('active');

      const files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type && file.type.startsWith('image/')) {
          showToast('Decoding dropped image...');
          scanQrFile(file, file.name);
        } else {
          showToast('Please drop an image file', 'error');
        }
      }
    });

    if (nodes.dropOverlay) {
      nodes.dropOverlay.addEventListener('click', () => {
        nodes.dropOverlay.classList.remove('active');
        dragCounter = 0;
      });
    }
  }

  // --- SCANNER / DECODER ENGINE ---
  function scanQrFile(file, label = 'file') {
    if (typeof Html5Qrcode === 'undefined') {
      showToast('Scanner engine not ready', 'error');
      return;
    }

    const scanner = new Html5Qrcode('reader-container');
    scanner.scanFile(file, true)
      .then(decodedText => {
        handleScanSuccess(decodedText);
        switchTab('scanner');
      })
      .catch(() => {
        showToast('No QR code detected: ' + label, 'error');
      });
  }

  function handleScanSuccess(decodedText) {
    nodes.scannedPayloadText.textContent = decodedText;
    nodes.scannerResultBox.classList.remove('hidden');

    if (/^https?:\/\//i.test(decodedText)) {
      nodes.linkOpenScanned.href = decodedText;
      nodes.linkOpenScanned.classList.remove('hidden');
    } else {
      nodes.linkOpenScanned.classList.add('hidden');
    }

    showToast('QR code decoded successfully');
  }

  function initScanner() {
    if (!nodes.btnToggleCam) return;

    nodes.btnToggleCam.addEventListener('click', () => {
      if (typeof Html5Qrcode === 'undefined') {
        showToast('Scanner not ready', 'error');
        return;
      }

      if (state.scannerRunning) {
        if (state.html5QrCodeInstance) {
          state.html5QrCodeInstance.stop().then(() => {
            state.html5QrCodeInstance.clear();
            state.scannerRunning = false;
            nodes.btnToggleCam.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg><span>Start Camera</span>';
          });
        }
      } else {
        state.html5QrCodeInstance = new Html5Qrcode('reader-container');
        state.html5QrCodeInstance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            handleScanSuccess(decodedText);
            state.html5QrCodeInstance.stop().then(() => {
              state.scannerRunning = false;
              nodes.btnToggleCam.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg><span>Start Camera</span>';
            });
          },
          () => {}
        ).then(() => {
          state.scannerRunning = true;
          nodes.btnToggleCam.innerHTML = '<span>Stop Camera</span>';
          showToast('Camera active');
        }).catch(() => {
          showToast('Camera denied or unavailable', 'error');
        });
      }
    });

    nodes.scannerFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) scanQrFile(file, file.name);
    });

    nodes.btnCopyScanned.addEventListener('click', () => {
      const text = nodes.scannedPayloadText.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Payload copied to clipboard');
      });
    });

    nodes.btnSendToGen.addEventListener('click', () => {
      const text = nodes.scannedPayloadText.textContent;
      if (text) {
        applyPayloadToApp('text', text);
        showToast('Loaded into generator');
      }
    });
  }

  // --- THEME ENGINE ---
  function initTheme() {
    const savedTheme = localStorage.getItem('anything_to_qr_theme') || 'light';
    setTheme(savedTheme);

    if (nodes.btnThemeToggle) {
      nodes.btnThemeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
      });
    }
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('anything_to_qr_theme', 'dark');
      if (nodes.btnThemeToggle) {
        nodes.btnThemeToggle.setAttribute('title', 'Switch to Light Theme');
        nodes.btnThemeToggle.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg><span>Light</span>';
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('anything_to_qr_theme', 'light');
      if (nodes.btnThemeToggle) {
        nodes.btnThemeToggle.setAttribute('title', 'Switch to Dark Theme');
        nodes.btnThemeToggle.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg><span>Dark</span>';
      }
    }
  }

  // --- EVENTS SETUP ---
  function initEvents() {
    nodes.tabs.forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.mode));
    });

    const liveInputs = [
      nodes.inputUrl, nodes.inputText, nodes.wifiSsid, nodes.wifiEnc,
      nodes.wifiPass, nodes.wifiHidden, nodes.vcardFn, nodes.vcardLn,
      nodes.vcardPhone, nodes.vcardEmail, nodes.vcardOrg, nodes.vcardTitle,
      nodes.vcardUrl, nodes.emailTo, nodes.emailSubject, nodes.emailBody,
      nodes.smsPhone, nodes.smsMsg, nodes.inputTel, nodes.cryptoCoin,
      nodes.cryptoAmount, nodes.cryptoAddress
    ];

    liveInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', triggerRender);
        input.addEventListener('change', triggerRender);
      }
    });

    document.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        nodes.inputUrl.value = btn.dataset.fill;
        nodes.inputUrl.focus();
        triggerRender();
      });
    });

    if (nodes.btnToggleWifiPass) {
      nodes.btnToggleWifiPass.addEventListener('click', () => {
        const isPw = nodes.wifiPass.type === 'password';
        nodes.wifiPass.type = isPw ? 'text' : 'password';
        nodes.btnToggleWifiPass.textContent = isPw ? 'Hide' : 'Show';
      });
    }

    if (nodes.btnModeSms && nodes.btnModeWa) {
      nodes.btnModeSms.addEventListener('click', () => {
        state.isSmsMode = true;
        nodes.btnModeSms.classList.add('active');
        nodes.btnModeWa.classList.remove('active');
        triggerRender();
      });
      nodes.btnModeWa.addEventListener('click', () => {
        state.isSmsMode = false;
        nodes.btnModeWa.classList.add('active');
        nodes.btnModeSms.classList.remove('active');
        triggerRender();
      });
    }

    // Dot patterns
    document.querySelectorAll('#dots-style-group .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#dots-style-group .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.dotsStyle = btn.dataset.style;
        triggerRender();
      });
    });

    // Corners
    document.querySelectorAll('#corners-style-group .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#corners-style-group .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.cornersSquareStyle = btn.dataset.corner;
        triggerRender();
      });
    });

    // ECL
    document.querySelectorAll('#ecl-group .pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#ecl-group .pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.ecl = btn.dataset.ecl;
        triggerRender();
      });
    });

    // Colors
    nodes.fgColorInput.addEventListener('input', (e) => {
      state.fgColor = e.target.value;
      triggerRender();
    });
    nodes.bgColorInput.addEventListener('input', (e) => {
      state.bgColor = e.target.value;
      triggerRender();
    });

    document.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const target = swatch.dataset.target;
        const color = swatch.dataset.color;
        if (target === 'fg') {
          state.fgColor = color;
          nodes.fgColorInput.value = color;
        } else {
          state.bgColor = color;
          nodes.bgColorInput.value = color;
        }
        triggerRender();
      });
    });

    // Size Slider
    nodes.sizeRange.addEventListener('input', (e) => {
      state.size = parseInt(e.target.value, 10);
      nodes.sizeValDisplay.textContent = `${state.size} px`;
    });

    // Logo Presets
    document.querySelectorAll('.logo-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.logo-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.currentLogo = chip.dataset.logo;
        state.customLogoUrl = null;
        nodes.customLogoName.classList.add('hidden');
        nodes.btnRemoveLogo.classList.add('hidden');
        triggerRender();
      });
    });

    // Custom Logo File
    nodes.customLogoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        state.customLogoUrl = event.target.result;
        nodes.customLogoName.textContent = file.name;
        nodes.customLogoName.classList.remove('hidden');
        nodes.btnRemoveLogo.classList.remove('hidden');
        document.querySelectorAll('.logo-chip').forEach(c => c.classList.remove('active'));
        triggerRender();
        showToast('Logo attached');
      };
      reader.readAsDataURL(file);
    });

    nodes.btnRemoveLogo.addEventListener('click', () => {
      state.customLogoUrl = null;
      state.currentLogo = 'none';
      nodes.customLogoInput.value = '';
      nodes.customLogoName.classList.add('hidden');
      nodes.btnRemoveLogo.classList.add('hidden');
      const noneChip = document.querySelector('.logo-chip[data-logo="none"]');
      if (noneChip) noneChip.classList.add('active');
      triggerRender();
    });

    // Action Downloads
    nodes.btnDownloadPng.addEventListener('click', () => {
      if (!qrCode) return;
      qrCode.download({
        name: `QRCode_${state.currentMode}_${Date.now()}`,
        extension: 'png',
        width: state.size,
        height: state.size
      }).then(() => showToast(`PNG downloaded (${state.size}px)`));
    });

    nodes.btnDownloadSvg.addEventListener('click', () => {
      if (!qrCode) return;
      qrCode.download({
        name: `QRCode_${state.currentMode}_${Date.now()}`,
        extension: 'svg'
      }).then(() => showToast('Vector SVG downloaded'));
    });

    nodes.btnCopyImage.addEventListener('click', async () => {
      try {
        const canvas = nodes.qrContainer.querySelector('canvas');
        if (!canvas) {
          showToast('Canvas not ready', 'error');
          return;
        }

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast('QR code copied to clipboard');
          } catch (err) {
            showToast('Clipboard access denied', 'error');
          }
        }, 'image/png');
      } catch (e) {
        showToast('Clipboard not supported', 'error');
      }
    });

    nodes.btnPrintQr.addEventListener('click', () => window.print());

    nodes.btnCopyPayload.addEventListener('click', () => {
      navigator.clipboard.writeText(state.rawPayload).then(() => {
        showToast('Payload copied to clipboard');
      });
    });

    nodes.btnClearHistory.addEventListener('click', () => {
      state.history = [];
      localStorage.removeItem('anything_to_qr_history');
      renderHistoryUI();
      showToast('History cleared');
    });

    initScanner();
    initAutoPasteAndDrop();
  }

  // --- BOOTSTRAP ---
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initQrCode();
    initEvents();
    loadHistory();
  });

})();
