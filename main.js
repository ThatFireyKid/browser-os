(() => {
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');
  const desktop = document.getElementById('desktop');
  const taskButtons = document.getElementById('task-buttons');
  const clockEl = document.getElementById('clock');

  let topZ = 1000;

  // --- CLOCK ---
  function updateClock() {
    clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- START MENU TOGGLE ---
  startBtn.addEventListener('click', e => {
    e.stopPropagation();
    startMenu.classList.toggle('hidden');
  });

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

  // --- OPEN APP FUNCTION ---
  async function openApp(appId) {
    const winId = `win-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.left = `${60 + Math.random() * 120}px`;
    win.style.top = `${60 + Math.random() * 80}px`;
    win.style.zIndex = ++topZ;
    win.dataset.winId = winId;

    // HEADER + CONTROLS
    const header = document.createElement('div');
    header.className = 'win-header';
    const title = document.createElement('div');
    title.className = 'win-title';
    title.textContent = appId;
    const controls = document.createElement('div');
    controls.className = 'win-controls';
    const minBtn = document.createElement('span');
    minBtn.className = 'win-control-btn win-min';
    const closeBtn = document.createElement('span');
    closeBtn.className = 'win-control-btn win-close';
    controls.append(minBtn, closeBtn);
    header.append(title, controls);
    win.appendChild(header);

    // BODY
    const body = document.createElement('div');
    body.className = 'win-body';
    win.appendChild(body);

    // TASKBAR BUTTON
    const tbtn = document.createElement('button');
    tbtn.className = 'task-btn';
    tbtn.textContent = appId;
    tbtn.dataset.winId = winId;
    taskButtons.appendChild(tbtn);

    function focusWin() { win.style.zIndex = ++topZ; }
    win.addEventListener('mousedown', focusWin);

    tbtn.addEventListener('click', () => {
      win.style.display = (win.style.display === 'none') ? 'flex' : 'none';
      focusWin();
    });
    closeBtn.addEventListener('click', () => { win.remove(); tbtn.remove(); });
    minBtn.addEventListener('click', () => { win.style.display = 'none'; });

    // DRAG
    let dragging = false, dragOffsetX, dragOffsetY;
    header.addEventListener('mousedown', e => {
      dragging = true;
      dragOffsetX = e.clientX - win.offsetLeft;
      dragOffsetY = e.clientY - win.offsetTop;
      focusWin();
    });

    // RESIZE
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
      if (dragging) {
        win.style.left = Math.max(0, e.clientX - dragOffsetX) + 'px';
        win.style.top = Math.max(0, e.clientY - dragOffsetY) + 'px';
      }
      if (resizing) {
        win.style.width = Math.max(100, startWidth + (e.clientX - startX)) + 'px';
        win.style.height = Math.max(100, startHeight + (e.clientY - startY)) + 'px';
      }
    });
    document.addEventListener('mouseup', () => { dragging = false; resizing = false; });

    desktop.appendChild(win);
    focusWin();

    // LOAD APP CONTENT LAST
    try {
      const module = await import(`./apps/${appId}.js`);
      const appContent = await module.default({ desktop, body, win, topZ });
      if (appContent) body.appendChild(appContent);
    } catch (err) {
      body.textContent = `Failed to load app "${appId}"`;
      console.error(err);
    }
  }

  // --- KEYBIND FOR FILE EXPLORER ---
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      openApp('file-explorer');
    }
  });
})();

