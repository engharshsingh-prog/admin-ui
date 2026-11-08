/**
 * CIRREL — GLASSY ADMIN DASHBOARD
 * Core Application Engine, Audio FX, 3D Tilt & Reactive Stream Simulator
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. APPLICATION STATE
  // --------------------------------------------------------------------------
  const state = {
    theme: localStorage.getItem('cirrel-theme') || 'dark',
    sidebarCollapsed: false,
    activeView: 'dashboard',
    currentRange: 'last-year',
    liveVisitors: 38,
    activeOrdersCount: 3,
    todaySales: 244,
    simulatorActive: true,
    audioEnabled: true,
    blurAmount: 28,
    glowAmount: 100,
    goal: {
      target: 24000,
      booked: 244,
      octoberFinished: 24677,
      daysLeft: 29
    },
    inventory: {
      bergamot: { name: 'Bergamot Grey', stock: 0, threshold: 40 },
      oolong: { name: 'Milk Oolong', stock: 9, threshold: 20 }
    },
    notifications: [
      { id: 1, text: 'New order KL-49960 received from Elena Vance', time: '2 mins ago', unread: true },
      { id: 2, text: 'Bergamot Grey reached 0 stock level', time: '18 mins ago', unread: true },
      { id: 3, text: 'Conversion rate reached 2.8% this morning', time: '1 hour ago', unread: true }
    ],
    // Chart datasets for different ranges
    chartData: {
      'last-year': {
        labels: ['Nov', 'Jan', 'Mar', 'May', 'Jul', 'Oct'],
        primary: [15000, 11000, 14000, 17500, 31000, 28000],
        comparison: [18000, 12000, 10500, 13000, 16000, 14500],
        totalSales: '$212,216',
        growth: '+28%'
      },
      '12m': {
        labels: ['Nov', 'Jan', 'Mar', 'May', 'Jul', 'Oct'],
        primary: [14000, 16500, 19000, 24000, 33500, 38000],
        comparison: [12000, 13500, 15000, 18000, 21000, 23000],
        totalSales: '$248,600',
        growth: '+34.5%'
      },
      '6m': {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        primary: [19000, 22000, 31000, 34500, 29000, 37500],
        comparison: [16000, 17500, 20000, 21500, 23000, 25000],
        totalSales: '$173,000',
        growth: '+22.1%'
      },
      '30d': {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'Now'],
        primary: [4800, 6200, 5900, 7100, 6413, 8200],
        comparison: [3900, 4400, 4900, 5200, 5800, 6100],
        totalSales: '$38,613',
        growth: '+18.4%'
      },
      '7d': {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        primary: [780, 890, 650, 940, 1120, 1789, 244],
        comparison: [640, 710, 800, 850, 910, 1200, 108],
        totalSales: '$6,413',
        growth: '+5.5%'
      }
    }
  };

  // --------------------------------------------------------------------------
  // 2. SYNTHESIZED WEB AUDIO API SOUND ENGINE
  // --------------------------------------------------------------------------
  const AudioEngine = {
    ctx: null,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    },
    playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.08) {
      if (!state.audioEnabled) return;
      try {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (err) {}
    },
    playPop() {
      this.playTone(740, 'sine', 0.04, 0.06);
    },
    playChime() {
      if (!state.audioEnabled) return;
      this.playTone(523.25, 'sine', 0.1, 0.06); // C5
      setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.06), 50); // E5
      setTimeout(() => this.playTone(783.99, 'sine', 0.16, 0.08), 100); // G5
    },
    playPack() {
      this.playTone(400, 'triangle', 0.05, 0.07);
      setTimeout(() => this.playTone(840, 'sine', 0.09, 0.08), 40);
    }
  };

  // --------------------------------------------------------------------------
  // 3. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  const DOM = {
    body: document.body,
    themeToggleCheckbox: document.getElementById('themeToggleCheckbox'),
    sidebar: document.getElementById('sidebar'),
    sidebarCollapseBtn: document.getElementById('sidebarCollapseBtn'),
    liveDateDisplay: document.getElementById('liveDateDisplay'),
    openSearchBtn: document.getElementById('openSearchBtn'),
    headerSearchBtn: document.getElementById('headerSearchBtn'),
    searchModal: document.getElementById('searchModal'),
    paletteInput: document.getElementById('paletteInput'),
    paletteResults: document.getElementById('paletteResults'),
    notificationsBtn: document.getElementById('notificationsBtn'),
    notificationsDropdown: document.getElementById('notificationsDropdown'),
    notifBadge: document.getElementById('notifBadge'),
    markAllReadBtn: document.getElementById('markAllReadBtn'),
    openCreateModalBtn: document.getElementById('openCreateModalBtn'),
    createModal: document.getElementById('createModal'),
    closeCreateModalBtn: document.getElementById('closeCreateModalBtn'),
    quickCreateForm: document.getElementById('quickCreateForm'),
    restockModal: document.getElementById('restockModal'),
    closeRestockModalBtn: document.getElementById('closeRestockModalBtn'),
    restockForm: document.getElementById('restockForm'),
    restockProductTitle: document.getElementById('restockProductTitle'),
    restockQuantityInput: document.getElementById('restockQuantityInput'),
    toastContainer: document.getElementById('toastContainer'),
    audioToggleBtn: document.getElementById('audioToggleBtn'),
    liveStreamToggleBtn: document.getElementById('liveStreamToggleBtn'),

    // Sales Studio & Chart
    valTodaySoFar: document.getElementById('valTodaySoFar'),
    valOrdersToday: document.getElementById('valOrdersToday'),
    filterPills: document.querySelectorAll('.filter-pill'),
    chartTotalSalesVal: document.getElementById('chartTotalSalesVal'),
    salesSvg: document.getElementById('salesSvg'),
    primaryLinePath: document.getElementById('primaryLinePath'),
    primaryAreaPath: document.getElementById('primaryAreaPath'),
    comparisonPath: document.getElementById('comparisonPath'),
    chartHoverGroup: document.getElementById('chartHoverGroup'),
    hoverCrosshair: document.getElementById('hoverCrosshair'),
    hoverPrimaryDot: document.getElementById('hoverPrimaryDot'),
    hoverCompDot: document.getElementById('hoverCompDot'),
    xAxisLabels: document.getElementById('xAxisLabels'),
    chartTooltip: document.getElementById('chartTooltip'),
    tooltipDate: document.getElementById('tooltipDate'),
    tooltipRevenue: document.getElementById('tooltipRevenue'),
    tooltipPrevRevenue: document.getElementById('tooltipPrevRevenue'),
    tooltipDelta: document.getElementById('tooltipDelta'),

    // Goal Radial Gauge
    goalProgressRing: document.getElementById('goalProgressRing'),
    goalPercentDisplay: document.getElementById('goalPercentDisplay'),
    editGoalBtn: document.getElementById('editGoalBtn'),

    // Live Store
    liveVisitorCounter: document.getElementById('liveVisitorCounter'),
    equalizerContainer: document.getElementById('equalizerContainer'),

    // Packing Queue & Stock
    orderQueueList: document.getElementById('orderQueueList'),
    packingQueueSubtitle: document.getElementById('packingQueueSubtitle'),
    sidebarOrdersBadge: document.getElementById('sidebarOrdersBadge'),
    sidebarProductsBadge: document.getElementById('sidebarProductsBadge'),

    // Settings Sliders
    sliderBlur: document.getElementById('sliderBlur'),
    blurValDisplay: document.getElementById('blurValDisplay'),
    sliderGlow: document.getElementById('sliderGlow'),
    glowValDisplay: document.getElementById('glowValDisplay'),
    toggleNoiseCheckbox: document.getElementById('toggleNoiseCheckbox'),
    toggleSoundCheckbox: document.getElementById('toggleSoundCheckbox'),
    toggleSimulatorCheckbox: document.getElementById('toggleSimulatorCheckbox')
  };

  // --------------------------------------------------------------------------
  // 4. TOAST NOTIFICATION SYSTEM
  // --------------------------------------------------------------------------
  function showToast(title, message, icon = '✨') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    DOM.toastContainer.appendChild(toast);
    AudioEngine.playPop();

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // --------------------------------------------------------------------------
  // 5. THEME CONTROLLER
  // --------------------------------------------------------------------------
  function initTheme() {
    if (state.theme === 'light') {
      DOM.body.classList.remove('dark-theme');
      DOM.body.classList.add('light-theme');
      DOM.themeToggleCheckbox.checked = false;
    } else {
      DOM.body.classList.add('dark-theme');
      DOM.body.classList.remove('light-theme');
      DOM.themeToggleCheckbox.checked = true;
    }

    DOM.themeToggleCheckbox.addEventListener('change', () => {
      const isDark = DOM.themeToggleCheckbox.checked;
      state.theme = isDark ? 'dark' : 'light';
      localStorage.setItem('cirrel-theme', state.theme);

      if (isDark) {
        DOM.body.classList.add('dark-theme');
        DOM.body.classList.remove('light-theme');
        showToast('Dark Mode Activated', 'Obsidian glass theme with neon highlights', '🌙');
      } else {
        DOM.body.classList.remove('dark-theme');
        DOM.body.classList.add('light-theme');
        showToast('Light Mode Activated', 'Luminous frost glass styling', '☀️');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 6. MULTI-VIEW NAVIGATION & SIDEBAR
  // --------------------------------------------------------------------------
  function switchView(viewName) {
    state.activeView = viewName;
    AudioEngine.playPop();

    const viewMap = {
      dashboard: 'view-dashboard',
      orders: 'view-orders',
      products: 'view-products',
      analytics: 'view-analytics',
      customers: 'view-customers',
      settings: 'view-settings'
    };

    const targetPanelId = viewMap[viewName] || 'view-dashboard';

    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-tab') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    showToast(`Navigated to ${viewName.toUpperCase()}`, `Displaying ${viewName} interface`, '📁');
  }

  function initSidebar() {
    DOM.sidebarCollapseBtn.addEventListener('click', () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      DOM.sidebar.classList.toggle('collapsed', state.sidebarCollapsed);
      AudioEngine.playPop();
    });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        DOM.sidebarCollapseBtn.click();
      }
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        switchView(tab);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 7. 3D CARD PARALLAX TILT & SPECULAR SPOTLIGHT
  // --------------------------------------------------------------------------
  function init3DTiltAndSpotlights() {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -2.8;
        const rotateY = ((x - centerX) / centerX) * 2.8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 8. INTERACTIVE SVG SALES CHART
  // --------------------------------------------------------------------------
  let currentChartPoints = [];

  function buildSmoothBezierPath(points) {
    if (!points || points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

    let path = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = i > 0 ? points[i - 1] : points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = i < points.length - 2 ? points[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }

    return path;
  }

  function renderChart(rangeKey) {
    const data = state.chartData[rangeKey] || state.chartData['last-year'];
    DOM.chartTotalSalesVal.textContent = data.totalSales;

    const minX = 55;
    const maxX = 775;
    const minY = 30;
    const maxY = 265;
    const maxVal = 40000;

    const count = data.primary.length;
    const stepX = (maxX - minX) / (count - 1);

    const primaryPoints = data.primary.map((val, idx) => {
      const x = minX + idx * stepX;
      const y = maxY - (val / maxVal) * (maxY - minY);
      return { x, y, val };
    });

    const compPoints = data.comparison.map((val, idx) => {
      const x = minX + idx * stepX;
      const y = maxY - (val / maxVal) * (maxY - minY);
      return { x, y, val };
    });

    currentChartPoints = primaryPoints.map((p, i) => ({
      ...p,
      compY: compPoints[i].y,
      compVal: compPoints[i].val,
      label: data.labels[i]
    }));

    const primaryLineStr = buildSmoothBezierPath(primaryPoints);
    const compLineStr = buildSmoothBezierPath(compPoints);

    const firstPt = primaryPoints[0];
    const lastPt = primaryPoints[primaryPoints.length - 1];
    const areaStr = `${primaryLineStr} L ${lastPt.x},${maxY} L ${firstPt.x},${maxY} Z`;

    DOM.primaryLinePath.setAttribute('d', primaryLineStr);
    DOM.primaryAreaPath.setAttribute('d', areaStr);
    DOM.comparisonPath.setAttribute('d', compLineStr);

    DOM.xAxisLabels.innerHTML = data.labels.map(l => `<span>${l}</span>`).join('');
  }

  function initChartInteraction() {
    renderChart(state.currentRange);

    DOM.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.currentRange = pill.getAttribute('data-range');
        renderChart(state.currentRange);
        AudioEngine.playPop();
      });
    });

    const svgRect = () => DOM.salesSvg.getBoundingClientRect();

    DOM.salesSvg.addEventListener('mousemove', (e) => {
      const rect = svgRect();
      const mouseX = e.clientX - rect.left;
      const svgX = (mouseX / rect.width) * 800;

      let closest = currentChartPoints[0];
      let minDistance = Infinity;

      currentChartPoints.forEach(pt => {
        const dist = Math.abs(pt.x - svgX);
        if (dist < minDistance) {
          minDistance = dist;
          closest = pt;
        }
      });

      if (closest) {
        DOM.chartHoverGroup.setAttribute('opacity', '1');
        DOM.hoverCrosshair.setAttribute('x1', closest.x);
        DOM.hoverCrosshair.setAttribute('x2', closest.x);

        DOM.hoverPrimaryDot.setAttribute('cx', closest.x);
        DOM.hoverPrimaryDot.setAttribute('cy', closest.y);

        DOM.hoverCompDot.setAttribute('cx', closest.x);
        DOM.hoverCompDot.setAttribute('cy', closest.compY);

        const tooltipX = (closest.x / 800) * rect.width;
        const tooltipY = (closest.y / 300) * rect.height;

        DOM.chartTooltip.style.left = `${tooltipX}px`;
        DOM.chartTooltip.style.top = `${tooltipY}px`;
        DOM.chartTooltip.classList.add('show');

        DOM.tooltipDate.textContent = `Period · ${closest.label}`;
        DOM.tooltipRevenue.textContent = `$${closest.val.toLocaleString()}`;
        DOM.tooltipPrevRevenue.textContent = `$${closest.compVal.toLocaleString()}`;

        const diff = ((closest.val - closest.compVal) / closest.compVal) * 100;
        const diffSign = diff >= 0 ? '+' : '';
        DOM.tooltipDelta.textContent = `${diffSign}${diff.toFixed(1)}%`;
        DOM.tooltipDelta.className = `tooltip-badge ${diff >= 0 ? 'positive' : 'negative'}`;
      }
    });

    DOM.salesSvg.addEventListener('mouseleave', () => {
      DOM.chartHoverGroup.setAttribute('opacity', '0');
      DOM.chartTooltip.classList.remove('show');
    });
  }

  // --------------------------------------------------------------------------
  // 9. GOAL PROGRESS GAUGE
  // --------------------------------------------------------------------------
  function updateGoalGauge(percent) {
    const circumference = 2 * Math.PI * 48;
    const offset = circumference - (percent / 100) * circumference;
    DOM.goalProgressRing.style.strokeDashoffset = offset;
    DOM.goalPercentDisplay.textContent = `${percent}%`;
  }

  function initGoalCard() {
    setTimeout(() => {
      updateGoalGauge(1);
    }, 400);

    DOM.editGoalBtn.addEventListener('click', () => {
      AudioEngine.playPop();
      const newPct = prompt('Enter new progress percentage (0-100):', '1');
      if (newPct !== null) {
        const val = Math.min(100, Math.max(0, parseInt(newPct, 10) || 1));
        updateGoalGauge(val);
        const booked = Math.round((val / 100) * state.goal.target);
        document.getElementById('goalBookedVal').textContent = `$${booked.toLocaleString()}`;
        showToast('Goal Updated', `Target reached ${val}% of $24k`, '🎯');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 10. LIVE STORE & VISITOR EQUALIZER
  // --------------------------------------------------------------------------
  function initLiveStore() {
    const barCount = 26;
    DOM.equalizerContainer.innerHTML = '';

    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'equalizer-bar';
      bar.style.setProperty('--i', i);
      const randomBase = 20 + Math.sin(i * 0.4) * 45 + Math.random() * 20;
      bar.style.height = `${Math.min(95, Math.max(15, randomBase))}%`;
      DOM.equalizerContainer.appendChild(bar);
    }

    setInterval(() => {
      const delta = (Math.random() > 0.45 ? 1 : -1) * (Math.floor(Math.random() * 3));
      state.liveVisitors = Math.max(24, Math.min(65, state.liveVisitors + delta));

      DOM.liveVisitorCounter.textContent = state.liveVisitors;
      DOM.liveVisitorCounter.style.transform = 'scale(1.1)';
      setTimeout(() => {
        DOM.liveVisitorCounter.style.transform = 'scale(1)';
      }, 250);

      const bars = DOM.equalizerContainer.querySelectorAll('.equalizer-bar');
      const randomIdx = Math.floor(Math.random() * bars.length);
      if (bars[randomIdx]) {
        bars[randomIdx].style.height = `${Math.floor(30 + Math.random() * 65)}%`;
      }
    }, 3200);

    document.getElementById('openVisitorsModal').addEventListener('click', (e) => {
      e.preventDefault();
      AudioEngine.playPop();
      showToast('Live Shoppers', `${state.liveVisitors} visitors currently browsing teas`, '🟢');
    });
  }

  // --------------------------------------------------------------------------
  // 11. PACKING QUEUE ACTIONS
  // --------------------------------------------------------------------------
  function initPackingQueue() {
    DOM.orderQueueList.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-pack-status');
      if (!btn) return;

      const item = btn.closest('.order-queue-item');
      const orderCode = item.querySelector('.order-code').textContent.split('·')[0].trim();
      const customer = item.querySelector('.customer-name').textContent;

      if (!btn.classList.contains('packed-done')) {
        btn.classList.add('packed-done');
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Shipped</span>
        `;
        state.activeOrdersCount = Math.max(0, state.activeOrdersCount - 1);
        DOM.packingQueueSubtitle.textContent = `${state.activeOrdersCount} orders paid and waiting`;
        DOM.sidebarOrdersBadge.textContent = state.activeOrdersCount;

        AudioEngine.playPack();
        showToast('Order Fulfilled', `${orderCode} for ${customer} ready for courier`, '📦');
      } else {
        btn.classList.remove('packed-done');
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m7.5 4.27 9 5.15"/>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          </svg>
          <span>Packed</span>
        `;
        state.activeOrdersCount++;
        DOM.packingQueueSubtitle.textContent = `${state.activeOrdersCount} orders paid and waiting`;
        DOM.sidebarOrdersBadge.textContent = state.activeOrdersCount;
        AudioEngine.playPop();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 12. RUNNING LOW & RESTOCK
  // --------------------------------------------------------------------------
  let selectedProductToRestock = null;

  function initRestockWorkflow() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-restock');
      if (!btn) return;

      const prodKey = btn.getAttribute('data-product');
      if (!prodKey || !state.inventory[prodKey]) return;

      selectedProductToRestock = prodKey;
      const prod = state.inventory[prodKey];

      DOM.restockProductTitle.textContent = `Restock ${prod.name}`;
      DOM.restockProductSubtitle.textContent = `Current: ${prod.stock} left (reorder threshold: ${prod.threshold})`;
      DOM.restockQuantityInput.value = prod.threshold;
      DOM.restockModal.classList.add('active');
      AudioEngine.playPop();
    });

    DOM.closeRestockModalBtn.addEventListener('click', () => {
      DOM.restockModal.classList.remove('active');
    });

    DOM.restockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const units = parseInt(DOM.restockQuantityInput.value, 10) || 40;
      if (selectedProductToRestock && state.inventory[selectedProductToRestock]) {
        const prod = state.inventory[selectedProductToRestock];
        prod.stock += units;

        if (selectedProductToRestock === 'bergamot') {
          const txt = document.getElementById('bergamotStockText');
          const bar = document.getElementById('bergamotStockBar');
          if (txt) {
            txt.textContent = `${prod.stock} in stock · healthy`;
            txt.className = 'stock-quantity-sub green-text';
          }
          if (bar) {
            bar.style.width = '100%';
            bar.className = 'stock-progress-fill green';
          }
          const pill = document.getElementById('bergamotCardPill');
          if (pill) {
            pill.textContent = `${prod.stock} in stock`;
            pill.className = 'stock-pill in-stock';
          }
        } else if (selectedProductToRestock === 'oolong') {
          const txt = document.getElementById('oolongStockText');
          const bar = document.getElementById('oolongStockBar');
          if (txt) {
            txt.textContent = `${prod.stock} in stock · healthy`;
            txt.className = 'stock-quantity-sub green-text';
          }
          if (bar) {
            bar.style.width = '95%';
            bar.className = 'stock-progress-fill green';
          }
          const pill = document.getElementById('oolongCardPill');
          if (pill) {
            pill.textContent = `${prod.stock} in stock`;
            pill.className = 'stock-pill in-stock';
          }
        }

        DOM.restockModal.classList.remove('active');
        AudioEngine.playChime();
        showToast('Restock Confirmed', `Added ${units} units of ${prod.name} to warehouse`, '📦');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 13. QUICK CREATE MODAL
  // --------------------------------------------------------------------------
  function initCreateModal() {
    DOM.openCreateModalBtn.addEventListener('click', () => {
      DOM.createModal.classList.add('active');
      AudioEngine.playPop();
    });

    DOM.closeCreateModalBtn.addEventListener('click', () => {
      DOM.createModal.classList.remove('active');
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.createModal.classList.remove('active');
        DOM.restockModal.classList.remove('active');
        DOM.searchModal.classList.remove('active');
      });
    });

    DOM.quickCreateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('inputCustomerName').value.trim();
      const product = document.getElementById('inputOrderProduct').value;
      const priceNum = parseFloat(document.getElementById('inputOrderPrice').value) || 42.00;
      const price = priceNum.toFixed(2);
      const qty = document.getElementById('inputOrderQty').value;

      const randomCode = `KL-${Math.floor(49960 + Math.random() * 90)}`;
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CU';

      const newItem = document.createElement('div');
      newItem.className = 'order-queue-item';
      newItem.innerHTML = `
        <div class="order-avatar avatar-blue">${initials}</div>
        <div class="order-details">
          <span class="customer-name">${name}</span>
          <span class="order-code">${randomCode} · ${qty} ${qty > 1 ? 'items' : 'item'} (${product})</span>
        </div>
        <div class="order-price">$${price}</div>
        <button class="btn-pack-status" data-action="pack">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m7.5 4.27 9 5.15"/>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          </svg>
          <span>Packed</span>
        </button>
      `;

      DOM.orderQueueList.prepend(newItem);

      state.activeOrdersCount++;
      state.todaySales += priceNum;
      DOM.packingQueueSubtitle.textContent = `${state.activeOrdersCount} orders paid and waiting`;
      DOM.sidebarOrdersBadge.textContent = state.activeOrdersCount;
      DOM.valTodaySoFar.textContent = `$${state.todaySales}`;

      const currentOrdersToday = parseInt(DOM.valOrdersToday.textContent, 10) || 6;
      DOM.valOrdersToday.textContent = currentOrdersToday + 1;

      DOM.createModal.classList.remove('active');
      DOM.quickCreateForm.reset();

      AudioEngine.playChime();
      showToast('Order Created', `${randomCode} for ${name} added to queue`, '🎉');
    });
  }

  // --------------------------------------------------------------------------
  // 14. COMMAND PALETTE SEARCH (⌘K / Ctrl+K)
  // --------------------------------------------------------------------------
  function initCommandPalette() {
    function openPalette() {
      DOM.searchModal.classList.add('active');
      DOM.paletteInput.value = '';
      DOM.paletteInput.focus();
      AudioEngine.playPop();
    }

    function closePalette() {
      DOM.searchModal.classList.remove('active');
    }

    DOM.openSearchBtn.addEventListener('click', openPalette);
    DOM.headerSearchBtn.addEventListener('click', openPalette);

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (DOM.searchModal.classList.contains('active')) {
          closePalette();
        } else {
          openPalette();
        }
      } else if (e.key === 'Escape') {
        closePalette();
        DOM.createModal.classList.remove('active');
        DOM.restockModal.classList.remove('active');
        DOM.notificationsDropdown.classList.remove('show');
      }
    });

    DOM.searchModal.addEventListener('click', (e) => {
      if (e.target === DOM.searchModal) closePalette();
    });

    DOM.paletteInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const items = DOM.paletteResults.querySelectorAll('.palette-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });

    DOM.paletteResults.addEventListener('click', (e) => {
      const item = e.target.closest('.palette-item');
      if (!item) return;

      const action = item.getAttribute('data-action');
      closePalette();

      if (action === 'create-order') {
        DOM.createModal.classList.add('active');
      } else if (action === 'restock-all') {
        selectedProductToRestock = 'bergamot';
        DOM.restockModal.classList.add('active');
      } else if (action === 'goto-dashboard') {
        switchView('dashboard');
      } else if (action === 'goto-orders') {
        switchView('orders');
      } else if (action === 'goto-products') {
        switchView('products');
      } else {
        const label = item.querySelector('.palette-item-title').textContent;
        showToast('Navigated', `Opened ${label}`, '🚀');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 15. NOTIFICATIONS DROPDOWN
  // --------------------------------------------------------------------------
  function initNotifications() {
    DOM.notificationsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.notificationsDropdown.classList.toggle('show');
      AudioEngine.playPop();
    });

    document.addEventListener('click', (e) => {
      if (!DOM.notificationsDropdown.contains(e.target) && e.target !== DOM.notificationsBtn) {
        DOM.notificationsDropdown.classList.remove('show');
      }
    });

    DOM.markAllReadBtn.addEventListener('click', () => {
      const unreadDots = DOM.notificationsDropdown.querySelectorAll('.notif-item.unread');
      unreadDots.forEach(i => i.classList.remove('unread'));
      DOM.notifBadge.textContent = '0';
      DOM.notifBadge.style.display = 'none';
      AudioEngine.playChime();
      showToast('Notifications Cleared', 'All 3 alerts marked as read', '✅');
    });
  }

  // --------------------------------------------------------------------------
  // 16. LIVE STREAM INFLUX SIMULATOR & AUDIO TOGGLE
  // --------------------------------------------------------------------------
  function initSimulatorAndAudio() {
    DOM.audioToggleBtn.addEventListener('click', () => {
      state.audioEnabled = !state.audioEnabled;
      const onIcon = DOM.audioToggleBtn.querySelector('.audio-on-icon');
      const offIcon = DOM.audioToggleBtn.querySelector('.audio-off-icon');

      if (state.audioEnabled) {
        onIcon.style.display = 'block';
        offIcon.style.display = 'none';
        DOM.audioToggleBtn.title = 'Sound Effects: ON';
        AudioEngine.playPop();
        showToast('Audio Enabled', 'Web Audio synthesized sound FX active', '🔊');
      } else {
        onIcon.style.display = 'none';
        offIcon.style.display = 'block';
        DOM.audioToggleBtn.title = 'Sound Effects: OFF';
        showToast('Audio Muted', 'Sound feedback muted', '🔇');
      }
      if (DOM.toggleSoundCheckbox) {
        DOM.toggleSoundCheckbox.checked = state.audioEnabled;
      }
    });

    DOM.liveStreamToggleBtn.addEventListener('click', () => {
      state.simulatorActive = !state.simulatorActive;
      DOM.liveStreamToggleBtn.classList.toggle('active', state.simulatorActive);
      DOM.liveStreamToggleBtn.classList.toggle('paused', !state.simulatorActive);
      const label = DOM.liveStreamToggleBtn.querySelector('.live-stream-label');

      if (state.simulatorActive) {
        label.textContent = 'Live Stream: ON';
        showToast('Stream Resumed', 'Real-time sales events enabled', '🟢');
      } else {
        label.textContent = 'Live Stream: PAUSED';
        showToast('Stream Paused', 'Sales simulation paused', '⏸️');
      }
      if (DOM.toggleSimulatorCheckbox) {
        DOM.toggleSimulatorCheckbox.checked = state.simulatorActive;
      }
    });

    const sampleBuyers = [
      { name: 'Koa Chen', item: 'Ceremonial Matcha (30g)', price: 42.00, initials: 'KC' },
      { name: 'Maya Sato', item: 'Milk Oolong High Mountain', price: 24.00, initials: 'MS' },
      { name: 'Oliver Finch', item: 'Hojicha Charcoal Roasted', price: 19.00, initials: 'OF' },
      { name: 'Seraphina Vale', item: 'Jasmine Dragon Pearls', price: 32.00, initials: 'SV' }
    ];

    setInterval(() => {
      if (!state.simulatorActive) return;

      const buyer = sampleBuyers[Math.floor(Math.random() * sampleBuyers.length)];
      state.todaySales += buyer.price;
      DOM.valTodaySoFar.textContent = `$${state.todaySales}`;

      const currentOrdersToday = parseInt(DOM.valOrdersToday.textContent, 10) || 6;
      DOM.valOrdersToday.textContent = currentOrdersToday + 1;

      const bars = DOM.equalizerContainer.querySelectorAll('.equalizer-bar');
      bars.forEach((b, i) => {
        b.style.height = `${Math.min(98, 30 + Math.sin(i) * 50 + Math.random() * 25)}%`;
      });

      AudioEngine.playChime();
      showToast(`🛍️ New Live Sale: ${buyer.name}`, `${buyer.item} · $${buyer.price.toFixed(2)}`, '💳');
    }, 14000);
  }

  // --------------------------------------------------------------------------
  // 17. GLASS STUDIO SLIDERS & SETTINGS
  // --------------------------------------------------------------------------
  function initGlassStudio() {
    if (DOM.sliderBlur) {
      DOM.sliderBlur.addEventListener('input', (e) => {
        const val = e.target.value;
        state.blurAmount = val;
        DOM.blurValDisplay.textContent = `${val}px`;
        document.documentElement.style.setProperty('--card-blur', `${val}px`);
        document.querySelectorAll('.glass-card, .glass-sidebar').forEach(c => {
          c.style.backdropFilter = `blur(${val}px) saturate(190%)`;
          c.style.webkitBackdropFilter = `blur(${val}px) saturate(190%)`;
        });
      });
    }

    if (DOM.sliderGlow) {
      DOM.sliderGlow.addEventListener('input', (e) => {
        const val = e.target.value;
        state.glowAmount = val;
        DOM.glowValDisplay.textContent = `${val}%`;
        const factor = val / 100;
        document.querySelectorAll('.glow-orb').forEach(orb => {
          orb.style.opacity = factor * 0.7;
        });
      });
    }

    if (DOM.toggleNoiseCheckbox) {
      DOM.toggleNoiseCheckbox.addEventListener('change', (e) => {
        const noise = document.querySelector('.glass-noise-overlay');
        if (noise) {
          noise.style.display = e.target.checked ? 'block' : 'none';
        }
      });
    }

    if (DOM.toggleSoundCheckbox) {
      DOM.toggleSoundCheckbox.addEventListener('change', (e) => {
        state.audioEnabled = e.target.checked;
        DOM.audioToggleBtn.click();
      });
    }

    if (DOM.toggleSimulatorCheckbox) {
      DOM.toggleSimulatorCheckbox.addEventListener('change', (e) => {
        state.simulatorActive = e.target.checked;
        DOM.liveStreamToggleBtn.click();
      });
    }
  }

  // --------------------------------------------------------------------------
  // 18. ORDERS TABLE INTERACTIONS & SEARCH
  // --------------------------------------------------------------------------
  function initOrdersTable() {
    const tableSearch = document.getElementById('orderTableSearch');
    if (tableSearch) {
      tableSearch.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#ordersTableBody tr');
        rows.forEach(r => {
          const text = r.textContent.toLowerCase();
          r.style.display = text.includes(q) ? '' : 'none';
        });
      });
    }

    const orderFilterTabs = document.getElementById('orderFilterTabs');
    if (orderFilterTabs) {
      orderFilterTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-pill');
        if (!btn) return;
        orderFilterTabs.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        AudioEngine.playPop();

        const rows = document.querySelectorAll('#ordersTableBody tr');
        rows.forEach(r => {
          const status = r.querySelector('.status-badge').textContent.toLowerCase();
          if (filter === 'all' || status.includes(filter)) {
            r.style.display = '';
          } else {
            r.style.display = 'none';
          }
        });
      });
    }

    const exportBtn = document.getElementById('exportOrdersBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        AudioEngine.playPop();
        showToast('Export Generated', 'orders-kilnandleaf-nov.csv downloaded', '📥');
      });
    }
  }

  // Global helper for inline table pack button
  window.handleTablePack = function(btn, orderCode) {
    btn.innerHTML = '✅ Shipped';
    btn.className = 'btn-ghost-sm';
    const row = btn.closest('tr');
    const badge = row.querySelector('.status-badge');
    badge.className = 'status-badge green';
    badge.textContent = 'Shipped';
    AudioEngine.playPack();
    showToast('Order Shipped', `${orderCode} marked dispatched`, '🚚');
  };

  window.quickRestockPrompt = function(productName) {
    const units = prompt(`Enter restock units for ${productName}:`, '30');
    if (units) {
      AudioEngine.playChime();
      showToast('Restocked', `Added ${units} units of ${productName}`, '📦');
    }
  };

  window.resetDemoState = function() {
    state.todaySales = 244;
    DOM.valTodaySoFar.textContent = '$244';
    DOM.valOrdersToday.textContent = '6';
    AudioEngine.playPop();
    showToast('Demo Reset', 'Default store telemetry restored', '🔄');
  };

  // --------------------------------------------------------------------------
  // 19. LIVE DATE DISPLAY
  // --------------------------------------------------------------------------
  function updateLiveClock() {
    const now = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateFormatted = now.toLocaleDateString('en-US', options);
    DOM.liveDateDisplay.textContent = `${dateFormatted} · Dashboard`;
  }

  // --------------------------------------------------------------------------
  // 20. INITIALIZATION
  // --------------------------------------------------------------------------
  function init() {
    initTheme();
    initSidebar();
    init3DTiltAndSpotlights();
    initChartInteraction();
    initGoalCard();
    initLiveStore();
    initPackingQueue();
    initRestockWorkflow();
    initCreateModal();
    initCommandPalette();
    initNotifications();
    initSimulatorAndAudio();
    initGlassStudio();
    initOrdersTable();
    updateLiveClock();

    setTimeout(() => {
      showToast('Cirrel Store Live', 'Welcome back Harsh! Real-time metrics streaming.', '✨');
    }, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
