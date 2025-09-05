// Basic TFK Browser-OS logic: start menu, spawn windows, drag, taskbar, simple apps (Notepad persists)

(() => {
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');
  const desktop = document.getElementById('desktop');
  const taskButtons = document.getElementById('task-buttons');
  const clockEl = document.getElementById('clock');

  // z-index manager
  let topZ = 1000;

  // Toggle start menu
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.classList.toggle('hidden');
  });

  // Close start menu if you click outside
  document.addEventListener('click', (e) => {
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
    clockEl.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
  setInterval(updateClock, 1000);
  updateClock();

  // App factory
  function openApp(appId) {
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
    title.textContent = appId === 'notepad' ? 'Notepad' : appId === 'browser' ? 'Mini Browser' : 'Settings';
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

    // App content
   let windowCount = 0;

function openApp(appId) {
  if (appId === 'notepad') {
    windowCount++;
    const winId = `notepad-${windowCount}`;
    const win = document.createElement('div');
    win.classList.add('notepad-window');
    win.id = winId;
    win.style.top = `${50 + windowCount * 30}px`;
    win.style.left = `${50 + windowCount * 30}px`;

    const header = document.createElement('div');
    header.classList.add('notepad-header');
    header.innerHTML = `
      <input type="text" class="np-filename" placeholder="File name">
      <button class="np-load">Load</button>
      <button class="np-save">Save</button>
      <button class="np-new">New</button>
    `;
    win.appendChild(header);

    const fileList = document.createElement('select');
    fileList.classList.add('np-file-list');
    win.appendChild(fileList);

    const ta = document.createElement('textarea');
    ta.classList.add('notepad-text');
    win.appendChild(ta);

    document.getElementById('desktop').appendChild(win);

    const filenameInput = win.querySelector('.np-filename');
    const loadBtn = win.querySelector('.np-load');
    const saveBtn = win.querySelector('.np-save');
    const newBtn = win.querySelector('.np-new');
    const fileListElement = win.querySelector('.np-file-list');

    function updateFileList() {
      fileListElement.innerHTML = '';
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('tfk_file_')) {
          const option = document.createElement('option');
          option.value = key;
          option.textContent = key.replace('tfk_file_', '');
          fileListElement.appendChild(option);
        }
      }
    }

    fileListElement.addEventListener('change', () => {
      const key = fileListElement.value;
      if (key) {
        const data = localStorage.getItem(key);
        ta.value = data;
        filenameInput.value = key.replace('tfk_file_', '');
      }
    });

    saveBtn.addEventListener('click', () => {
      const name = filenameInput.value.trim();
      if (!name) return alert("Enter a file name!");
      const key = `tfk_file_${name}`;
      localStorage.setItem(key, ta.value);
      alert(`Saved as ${name}.txt`);
      updateFileList();
    });

    loadBtn.addEventListener('click', () => {
      const name = filenameInput.value.trim();
      if (!name) return alert("Enter a file name!");
      const key = `tfk_file_${name}`;
      const data = localStorage.getItem(key);
      if (data === null) return alert("File not found!");
      ta.value = data;
      updateFileList();
    });

    newBtn.addEventListener('click', () => {
      filenameInput.value = '';
      ta.value = '';
    });

    updateFileList();
  }
}

document.querySelector('#start-menu button').addEventListener('click', () => openApp('notepad'));

    } else if (appId === 'browser') {
      // mini browser
      const form = document.createElement('form');
      form.style.display = 'flex';
      form.style.gap = '8px';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter URL (example.com) or search term';
      input.style.flex = '1';
      input.style.padding = '8px';
      const go = document.createElement('button');
      go.textContent = 'Go';
      go.type = 'submit';
      form.append(input, go);
      const frameWrap = document.createElement('div');
      frameWrap.style.height = 'calc(100% - 44px)';
      frameWrap.style.marginTop = '8px';
      const notice = document.createElement('div');
      notice.style.fontSize = '13px';
      notice.style.color = '#444';
      notice.textContent = 'Sites may block loading in iframes. If a page fails to load, try a different URL.';
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '1px solid #eee';
      iframe.src = 'about:blank';
      frameWrap.append(iframe);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let val = input.value.trim();
        if (!val) return;
        if (!/^https?:\/\//i.test(val)) val = 'https://' + val;
        iframe.src = val;
      });
      body.append(form, notice, frameWrap);
    } else if (appId === 'settings') {
      const label = document.createElement('div');
      label.style.marginBottom = '8px';
      label.textContent = 'Appearance';
      const btn = document.createElement('button');
      btn.textContent = 'Toggle Light/Dark';
      btn.style.padding = '8px';
      btn.addEventListener('click', () => document.body.classList.toggle('light-mode'));
      body.append(label, btn);

      // add a small style switcher effect
      const lightStyle = document.createElement('style');
      lightStyle.innerHTML = `
        body.light-mode { background: linear-gradient(180deg,#f3f4f6,#e7edf8); color:#0b1320; }
        body.light-mode .window .win-header { background: linear-gradient(180deg,#e8eefc,#dfe8ff); }
      `;
      document.head.appendChild(lightStyle);
    }

    win.append(header, body);
    desktop.appendChild(win);

    // add taskbar button
    const tbtn = document.createElement('button');
    tbtn.className = 'task-btn';
    tbtn.textContent = title.textContent;
    tbtn.dataset.winId = winId;
    taskButtons.appendChild(tbtn);

    // Focus handling
    function focusWin() { win.style.zIndex = ++topZ; }
    win.addEventListener('mousedown', focusWin);
    tbtn.addEventListener('click', () => {
      if (win.style.display === 'none') {
        win.style.display = 'flex';
        focusWin();
      } else {
        // toggle minimize
        const isMin = win.classList.toggle('minimized');
        win.style.display = isMin ? 'none' : 'flex';
        if (!isMin) focusWin();
      }
    });

    // Close logic
    closeBtn.addEventListener('click', () => {
      win.remove();
      tbtn.remove();
    });

    // Minimize logic
    minBtn.addEventListener('click', () => {
      win.style.display = 'none';
    });

    // Dragging
    let dragging = false, offsetX = 0, offsetY = 0;
    header.addEventListener('mousedown', (e) => {
      dragging = true;
      const rect = win.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      win.style.cursor = 'grabbing';
      focusWin();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      let nx = e.clientX - offsetX;
      let ny = e.clientY - offsetY;
      // simple bounds
      nx = Math.max(6, Math.min(window.innerWidth - win.offsetWidth - 6, nx));
      ny = Math.max(6, Math.min(window.innerHeight - win.offsetHeight - 54, ny)); // leave space for taskbar
      win.style.left = nx + 'px';
      win.style.top = ny + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (dragging) {
        dragging = false;
        win.style.cursor = 'grab';
      }
    });

    // Bring to front on open
    focusWin();
  }

  // For convenience: double click desktop to open notepad
  desktop.addEventListener('dblclick', () => openApp('notepad'));

})();
