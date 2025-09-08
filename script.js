(() => {
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');
  const desktop = document.getElementById('desktop');
  const taskButtons = document.getElementById('task-buttons');
  const clockEl = document.getElementById('clock');

  let topZ = 1000;
  let windowCount = 0;

  // --- APP REGISTRY SYSTEM ---
  window.appRegistry = {};

  window.registerApp = function(appData) {
    if (!appData.id) return console.error('App must have an id!');
    window.appRegistry[appData.id] = appData;
  };

  async function openApp(appId) {
    if (!window.appRegistry[appId]) {
      // Dynamically load app from apps folder
      try {
        await import(`./apps/${appId}.js`);
      } catch(e) {
        return alert(`App "${appId}" not found`);
      }
    }

    const appData = window.appRegistry[appId];
    const win = createWindow(appData.name, appData.icon);

    // If app exported a default function, run it
    if (appData.default) appData.default(win.body, win.id);
  }

  // --- CREATE WINDOW FUNCTION ---
  function createWindow(titleText, icon) {
    const winId = `win-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const win = document.createElement('div');
    win.className = 'window';
    win.style.left = `${60 + Math.random()*120}px`;
    win.style.top = `${60 + Math.random()*80}px`;
    win.style.zIndex = ++topZ;
    win.dataset.winId = winId;

    // Header
    const header = document.createElement('div');
    header.className = 'win-header';
    const title = document.createElement('div');
    title.className = 'win-title';
    title.textContent = titleText || 'App';
    const controls = document.createElement('div');
    controls.className = 'win-controls';
    const minBtn = document.createElement('span');
    minBtn.className = 'win-control-btn win-min';
    const closeBtn = document.createElement('span');
    closeBtn.className = 'win-control-btn win-close';
    controls.append(minBtn, closeBtn);
    header.append(title, controls);

    // Body
    const body = document.createElement('div');
    body.className = 'win-body';

    win.append(header, body);
    desktop.appendChild(win);

    // --- TASKBAR BUTTON ---
    const tbtn = document.createElement('button');
    tbtn.className = 'task-btn';
    tbtn.textContent = titleText;
    tbtn.dataset.winId = winId;
    taskButtons.appendChild(tbtn);

    function focusWin() { win.style.zIndex = ++topZ; }
    win.addEventListener('mousedown', focusWin);

    tbtn.addEventListener('click', () => {
      if (win.style.display === 'none') {
        win.style.display = 'flex'; 
        focusWin();
      } else {
        win.classList.toggle('minimized');
        win.style.display = win.classList.contains('minimized') ? 'none' : 'flex';
        if (!win.classList.contains('minimized')) focusWin();
      }
    });

    closeBtn.addEventListener('click', () => { win.remove(); tbtn.remove(); });
    minBtn.addEventListener('click', () => { win.style.display = 'none'; });

    // --- DRAGGING ---
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

    // --- RESIZING ---
    win.style.resize = 'both';
    win.style.overflow = 'hidden';

    windowCount++;
    return { id: winId, body, header };
  }

  // --- TOGGLE START MENU ---
  startBtn.addEventListener('click', e => {
    e.stopPropagation();
    startMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', e => {
    if (!startMenu.contains(e.target) && e.target !== startBtn) {
      startMenu.classList.add('hidden');
    }
  });

  document.querySelectorAll('.start-item').forEach(btn => {
    btn.addEventListener('click', () => {
      openApp(btn.dataset.app);
      startMenu.classList.add('hidden');
    });
  });

  // --- CLOCK ---
  function updateClock() {
    clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  // --- DOUBLE-CLICK DESKTOP ---
  desktop.addEventListener('dblclick', e => {
    if (!e.target.classList.contains('window')) openApp('file-explorer');
  });
})();
