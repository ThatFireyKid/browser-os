(() => {
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');
  const desktop = document.getElementById('desktop');
  const taskButtons = document.getElementById('task-buttons');
  const clockEl = document.getElementById('clock');

  let topZ = 1000;
  let windowCount = 0;

  // Toggle start menu
  startBtn.addEventListener('click', e => {
    e.stopPropagation();
    startMenu.classList.toggle('hidden');
  });

  // Close start menu if click outside
  document.addEventListener('click', e => {
    if (!startMenu.contains(e.target) && e.target !== startBtn) {
      startMenu.classList.add('hidden');
    }
  });

  // Start menu app clicks
  document.querySelectorAll('.start-item').forEach(btn => {
    btn.addEventListener('click', () => {
      openApp(btn.dataset.app);
      startMenu.classList.add('hidden');
    });
  });

  // Simple clock
  function updateClock() {
    clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- OPEN APP FUNCTION ---
  async function openApp(appId) {
    const winId = `win-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.left = `${60 + Math.random() * 120}px`;
    win.style.top = `${60 + Math.random() * 80}px`;
    win.style.zIndex = ++topZ;
    win.dataset.winId = winId;

    // Load app dynamically
    try {
      const module = await import(`./apps/${appId}.js`);
      const appContent = module.default({ desktop, topZ });
      win.appendChild(appContent);
    } catch (err) {
      const errorMsg = document.createElement('div');
      errorMsg.textContent = `App "${appId}" failed to load.`;
      win.appendChild(errorMsg);
      console.error(err);
    }

    // Header with title and controls
    const header = document.createElement('div');
    header.className = 'win-header';
    header.textContent = appId;
    const controls = document.createElement('div');
    controls.className = 'win-controls';
    const minBtn = document.createElement('span');
    minBtn.className = 'win-control-btn win-min';
    const closeBtn = document.createElement('span');
    closeBtn.className = 'win-control-btn win-close';
    controls.append(minBtn, closeBtn);
    header.appendChild(controls);
    win.insertBefore(header, win.firstChild);

    // TASKBAR BUTTON
    const tbtn = document.createElement('button');
    tbtn.className = 'task-btn';
    tbtn.textContent = appId;
    tbtn.dataset.winId = winId;
    taskButtons.appendChild(tbtn);

    function focusWin() { win.style.zIndex = ++topZ; }
    win.addEventListener('mousedown', focusWin);

    tbtn.addEventListener('click', () => {
      if (win.style.display === 'none') { win.style.display = 'flex'; focusWin(); }
      else { win.classList.toggle('minimized'); win.style.display = win.classList.contains('minimized') ? 'none' : 'flex'; if (!win.classList.contains('minimized')) focusWin(); }
    });

    closeBtn.addEventListener('click', () => { win.remove(); tbtn.remove(); });
    minBtn.addEventListener('click', () => { win.style.display = 'none'; });

    // Dragging
    let dragging = false, offsetX = 0, offsetY = 0;
    header.addEventListener('mousedown', e => {
      dragging = true;
      const rect = win.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      focusWin();
    });

    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      let nx = e.clientX - offsetX;
      let ny = e.clientY - offsetY;
      nx = Math.max(6, Math.min(window.innerWidth - win.offsetWidth - 6, nx));
      ny = Math.max(6, Math.min(window.innerHeight - win.offsetHeight - 54, ny));
      win.style.left = nx + 'px';
      win.style.top = ny + 'px';
    });

    document.addEventListener('mouseup', () => dragging = false);

    // Resizing
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    win.appendChild(resizeHandle);

    let resizing = false, startX, startY, startWidth, startHeight;
    resizeHandle.addEventListener('mousedown', e => {
      e.stopPropagation();
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = win.offsetWidth;
      startHeight = win.offsetHeight;
      focusWin();
    });

    document.addEventListener('mousemove', e => {
      if (!resizing) return;
      win.style.width = Math.max(100, startWidth + (e.clientX - startX)) + 'px';
      win.style.height = Math.max(100, startHeight + (e.clientY - startY)) + 'px';
    });

    document.addEventListener('mouseup', () => resizing = false);

    desktop.appendChild(win);
    focusWin();
  }

  // Double-click desktop to open notepad
  desktop.addEventListener('dblclick', e => {
    if (!e.target.classList.contains('window')) openApp('notepad');
  });

})();
