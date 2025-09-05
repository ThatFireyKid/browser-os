(() => {
  const startBtn = document.getElementById('start-btn');
  const startMenu = document.getElementById('start-menu');
  const desktop = document.getElementById('desktop');
  const taskButtons = document.getElementById('task-buttons');
  const clockEl = document.getElementById('clock');

  // z-index manager
  let topZ = 1000;
  let windowCount = 0; // for Notepad multi-window IDs

  // Toggle start menu
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.classList.toggle('hidden');
  });

  // Close start menu if click outside
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

    // --- APP CONTENT ---
  if (appId === 'notepad') {
  windowCount++;
  win.id = `notepad-${windowCount}`;

  // Notepad header with all buttons
  const npHeader = document.createElement('div');
  npHeader.classList.add('notepad-header');
  npHeader.innerHTML = `
    <input type="text" class="np-filename" placeholder="File name">
    <select class="np-file-list"></select>
    <button class="np-load">Load</button>
    <button class="np-save">Save</button>
    <button class="np-new">New</button>
    <button class="np-export">Export</button>
    <button class="np-import">Import</button>
  `;

  const filenameInput = npHeader.querySelector('.np-filename');
  const fileListElement = npHeader.querySelector('.np-file-list');
  const loadBtn = npHeader.querySelector('.np-load');
  const saveBtn = npHeader.querySelector('.np-save');
  const newBtn = npHeader.querySelector('.np-new');
  const exportBtn = npHeader.querySelector('.np-export');
  const importBtn = npHeader.querySelector('.np-import');

  // Textarea
  const ta = document.createElement('textarea');
  ta.classList.add('notepad-text');

  // Append header + textarea to body
  body.append(npHeader, ta);

  // Update file list from LocalStorage
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

  // File list selection
  fileListElement.addEventListener('change', () => {
    const key = fileListElement.value;
    if (key) {
      const data = localStorage.getItem(key);
      ta.value = data;
      filenameInput.value = key.replace('tfk_file_', '');
    }
  });

  // Load button
  loadBtn.addEventListener('click', () => {
    const name = filenameInput.value.trim();
    if (!name) return alert("Enter a file name!");
    const key = `tfk_file_${name}`;
    const data = localStorage.getItem(key);
    if (data === null) return alert("File not found!");
    ta.value = data;
    updateFileList();
  });

  // Save button
  saveBtn.addEventListener('click', () => {
    const name = filenameInput.value.trim();
    if (!name) return alert("Enter a file name!");
    const key = `tfk_file_${name}`;
    localStorage.setItem(key, ta.value);
    alert(`Saved as ${name}.txt`);
    updateFileList();
  });

  // New file button
  newBtn.addEventListener('click', () => {
    filenameInput.value = '';
    ta.value = '';
  });

  // Export button
  exportBtn.addEventListener('click', () => {
    const name = filenameInput.value.trim();
    if (!name) return alert("Enter a file name!");
    const blob = new Blob([ta.value], { type: "text/plain" });
    const link = document.createElement('a');
    link.download = `${name}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  });

  // Import button
  importBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt';
    fileInput.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        ta.value = ev.target.result;
        filenameInput.value = file.name.replace('.txt','');
      };
      reader.readAsText(file);
    };
    fileInput.click();
  });

  updateFileList();
}

    }
    else if (appId === 'browser') {
      // Mini-browser code remains unchanged
      const form = document.createElement('form');
      form.style.display = 'flex';
      form.style.gap = '8px';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter URL or search term';
      input.style.flex = '1';
      input.style.padding = '8px';
      const go = document.createElement('button');
      go.textContent = 'Go';
      go.type = 'submit';
      form.append(input, go);
      const frameWrap = document.createElement('div');
      frameWrap.style.height = 'calc(100% - 44px)';
      frameWrap.style.marginTop = '8px';
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = '1px solid #eee';
      iframe.src = 'about:blank';
      frameWrap.append(iframe);
      form.addEventListener('submit', e => {
        e.preventDefault();
        let val = input.value.trim();
        if (!/^https?:\/\//i.test(val)) val = 'https://' + val;
        iframe.src = val;
      });
      body.append(form, frameWrap);
    }
    else if (appId === 'settings') {
      const label = document.createElement('div');
      label.textContent = 'Appearance';
      const btn = document.createElement('button');
      btn.textContent = 'Toggle Light/Dark';
      btn.addEventListener('click', () => document.body.classList.toggle('light-mode'));
      body.append(label, btn);
    }

    win.append(header, body);
    desktop.appendChild(win);

    // --- TASKBAR BUTTON ---
    const tbtn = document.createElement('button');
    tbtn.className = 'task-btn';
    tbtn.textContent = title.textContent;
    tbtn.dataset.winId = winId;
    taskButtons.appendChild(tbtn);

    // Focus & minimize/close logic
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

    focusWin();
  }

  // Double-click desktop to open notepad
  desktop.addEventListener('dblclick', () => openApp('notepad'));

})();
